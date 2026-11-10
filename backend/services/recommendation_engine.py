"""
Recommendation Engine for GadgetLens.

Two-stage deterministic recommendation and ranking pipeline:
- Stage 1: Hard Filtering (Budget max, Mandatory OS, Minimum RAM, Mandatory GPU, etc.)
- Stage 2: Priority-Based Ranking (Weighted normalized multi-factor scoring)
- Structured Explanation Generator (Why recommended / Why not recommended)
"""

PRIORITY_KEYS = ["performance", "battery", "price", "portability", "storage", "display", "gaming"]

PRIORITY_LABELS = {
    "performance": "Performance",
    "battery": "Battery life",
    "price": "Price",
    "portability": "Portability",
    "storage": "Storage",
    "display": "Display",
    "gaming": "Gaming"
}

def calculate_priority_weights(priority_order):
    """
    Converts user's ordered priority list into normalized weights that sum to 1.0.
    Uses rank-order weighting: weight_i = (N - rank_i + 1) / (N * (N + 1) / 2)
    """
    clean_order = []
    if isinstance(priority_order, list):
        for key in priority_order:
            if key in PRIORITY_KEYS and key not in clean_order:
                clean_order.append(key)
    
    # Append any remaining keys in default order
    for key in PRIORITY_KEYS:
        if key not in clean_order:
            clean_order.append(key)

    n = len(clean_order)
    total_rank_sum = n * (n + 1) / 2.0  # For 7 factors, 28
    
    weights = {}
    for rank_idx, key in enumerate(clean_order):
        rank = rank_idx + 1
        weights[key] = (n - rank + 1) / total_rank_sum
    
    return weights, clean_order

def compute_feature_scores(laptop, budget_min, budget_max):
    """
    Computes normalized 0-100 scores for each of the 7 factors based on laptop specifications.
    Handles missing values conservatively without inflating scores.
    """
    scores = {}
    
    # 1. Performance (Processor 65% + GPU 35%)
    proc_score = 50
    if laptop.processor and laptop.processor.performance_score:
        proc_score = laptop.processor.performance_score
    gpu_score = 50
    if laptop.gpu and laptop.gpu.performance_score:
        gpu_score = laptop.gpu.performance_score
    scores["performance"] = round(0.65 * proc_score + 0.35 * gpu_score, 1)

    # 2. Battery (Based on verified battery hours, reference 15 hours = 100)
    hours = float(laptop.battery_hours) if laptop.battery_hours is not None else 6.0
    battery_score = min(100.0, max(20.0, (hours / 15.0) * 100.0))
    scores["battery"] = round(battery_score, 1)

    # 3. Price (Lower price within budget scores higher)
    price = float(laptop.price)
    b_min = float(budget_min) if budget_min else 40000.0
    b_max = float(budget_max) if budget_max else 100000.0
    if price <= b_min:
        price_score = 100.0
    elif price <= b_max:
        # Interpolate between 100 and 65
        price_score = 100.0 - ((price - b_min) / max(1.0, (b_max - b_min))) * 35.0
    else:
        # Exceeds max budget, sharp penalty
        over = price - b_max
        price_score = max(10.0, 65.0 - (over / 20000.0) * 40.0)
    scores["price"] = round(price_score, 1)

    # 4. Portability (Lower weight scores higher, 1.0kg=100, 2.5kg=35)
    weight = float(laptop.weight) if laptop.weight is not None else 1.8
    portability_score = max(20.0, min(100.0, 100.0 - (weight - 1.0) * 43.0))
    scores["portability"] = round(portability_score, 1)

    # 5. Storage (Capacity and type)
    storage_gb = laptop.storage if laptop.storage else 256
    is_ssd = "ssd" in (laptop.storage_type or "ssd").lower()
    if storage_gb >= 1024:
        base_storage = 100.0
    elif storage_gb >= 512:
        base_storage = 85.0
    elif storage_gb >= 256:
        base_storage = 65.0
    else:
        base_storage = 45.0
    if not is_ssd:
        base_storage = max(20.0, base_storage - 25.0)
    scores["storage"] = round(base_storage, 1)

    # 6. Display (Display type, Resolution, Refresh rate)
    disp_type = (laptop.display_type or "IPS").lower()
    type_pts = 35.0 if "oled" in disp_type else (25.0 if "ips" in disp_type else 15.0)
    
    res = (laptop.resolution or "").lower()
    if any(q in res for q in ["2560", "3840", "4k", "qhd"]):
        res_pts = 35.0
    elif any(f in res for f in ["1920", "fhd"]):
        res_pts = 25.0
    else:
        res_pts = 15.0

    hz = laptop.refresh_rate or 60
    if hz >= 165:
        hz_pts = 30.0
    elif hz >= 144:
        hz_pts = 28.0
    elif hz >= 120:
        hz_pts = 24.0
    elif hz >= 90:
        hz_pts = 18.0
    else:
        hz_pts = 12.0
    scores["display"] = round(min(100.0, type_pts + res_pts + hz_pts), 1)

    # 7. Gaming (GPU performance 70% + Processor 30%)
    scores["gaming"] = round(0.70 * gpu_score + 0.30 * proc_score, 1)

    return scores

def stage1_hard_filter(laptop, preferences):
    """
    Stage 1: Mandatory hard filtering.
    Returns (passes: bool, reasons_if_failed: list of str).
    """
    failed_reasons = []
    
    budget_max = preferences.get("budgetMax") or preferences.get("budget_max")
    if budget_max:
        budget_max = float(budget_max)
        if laptop.price > budget_max:
            failed_reasons.append(
                f"Priced at ₹{laptop.price:,}, which exceeds your maximum budget of ₹{int(budget_max):,}"
            )

    # OS Filter
    os_pref = (preferences.get("os") or "no-preference").lower()
    if os_pref != "no-preference":
        lap_os = (laptop.os or "").lower()
        if os_pref not in lap_os:
            failed_reasons.append(
                f"Runs {laptop.os or 'another OS'}, while your preference is {os_pref.capitalize()}"
            )

    # Advanced filters
    adv = preferences.get("advanced") or preferences.get("advanced_preferences") or {}

    # Minimum RAM requirement
    ram_pref = adv.get("ram", "no-preference")
    if ram_pref == "16gb" and laptop.ram < 16:
        failed_reasons.append(f"Has {laptop.ram} GB RAM, which is below your selected minimum of 16 GB")
    elif ram_pref == "32gb-plus" and laptop.ram < 32:
        failed_reasons.append(f"Has {laptop.ram} GB RAM, which is below your selected minimum of 32 GB")

    # Graphics mandatory requirement
    gfx_pref = adv.get("graphics", "no-preference")
    if gfx_pref == "high-dedicated":
        category = laptop.gpu.category.lower() if laptop.gpu else ""
        if "high" not in category and "dedicated" not in category:
            failed_reasons.append("Does not have high-performance dedicated graphics")
    elif gfx_pref == "basic-dedicated":
        category = laptop.gpu.category.lower() if laptop.gpu else ""
        if "dedicated" not in category:
            failed_reasons.append("Requires dedicated graphics hardware")

    # Purpose mandatory baseline
    purpose = (preferences.get("purpose") or "").lower()
    gaming_level = (preferences.get("gamingLevel") or preferences.get("gaming_level") or "").lower()
    if purpose == "gaming" and gaming_level == "heavy":
        category = laptop.gpu.category.lower() if laptop.gpu else ""
        if "high" not in category:
            failed_reasons.append("Integrated or entry graphics is insufficient for heavy gaming demands")

    passes = len(failed_reasons) == 0
    return passes, failed_reasons

def generate_explanations(laptop, factor_scores, priority_order, budget_max, passes_hard, hard_reasons):
    """
    Generates deterministic explanation text:
    - why_text: plain-language explanation for high scoring laptops
    - why_not_reasons: list of specific reasons for lower scoring or filtered-out laptops
    - breakdown: list of factor scores in user priority order
    """
    weights, sorted_keys = calculate_priority_weights(priority_order)
    
    breakdown = [
        {"label": PRIORITY_LABELS.get(key, key.capitalize()), "value": int(round(factor_scores[key]))}
        for key in sorted_keys[:5]
    ]

    why_not_reasons = list(hard_reasons)
    
    # Identify top 2 user priority factors
    top_priority_1 = sorted_keys[0] if len(sorted_keys) > 0 else "performance"
    top_priority_2 = sorted_keys[1] if len(sorted_keys) > 1 else "battery"
    
    label_1 = PRIORITY_LABELS.get(top_priority_1, top_priority_1)
    label_2 = PRIORITY_LABELS.get(top_priority_2, top_priority_2)
    score_1 = factor_scores.get(top_priority_1, 50)
    score_2 = factor_scores.get(top_priority_2, 50)

    # Why text for recommended
    if score_1 >= 75 and score_2 >= 70:
        why_text = f"{label_1} and {label_2.lower()} were among your highest priorities, and this laptop scores strongly on both while remaining within your budget."
    elif score_1 >= 80:
        why_text = f"{label_1} was your top priority, and this model delivers excellent technical capability in that category while staying within your budget."
    else:
        why_text = f"Offers a well-balanced combination of technical specifications that matches your stated priorities and budget."

    # Additional why not reasons if score is low on top priorities
    if score_1 < 60:
        why_not_reasons.append(f"Lower {label_1.lower()} suitability — {label_1.lower()} was your highest priority")
    if score_2 < 55:
        why_not_reasons.append(f"Lower {label_2.lower()} rating compared to higher-ranked alternatives")

    if laptop.weight and laptop.weight > 2.2:
        why_not_reasons.append(f"Heavier ({laptop.weight} kg) than typical portable recommendations")

    if laptop.battery_hours and laptop.battery_hours < 5.0:
        why_not_reasons.append("Shorter battery runtime under standard workloads")

    return why_text, why_not_reasons, breakdown

def recommend_laptops(all_laptops, preferences):
    """
    Main recommendation engine entry point.
    Takes list of Laptop ORM models and preferences dict.
    Returns:
    - recommended: list of laptops passing hard filter, sorted descending by matchScore
    - excluded: list of laptops that did not pass hard filter, with why_not_reasons
    """
    priority_order = preferences.get("priorityOrder") or preferences.get("priority_order") or []
    weights, _ = calculate_priority_weights(priority_order)

    budget_min = preferences.get("budgetMin") or preferences.get("budget_min") or 30000
    budget_max = preferences.get("budgetMax") or preferences.get("budget_max") or 150000

    recommended_list = []
    excluded_list = []

    for laptop in all_laptops:
        factor_scores = compute_feature_scores(laptop, budget_min, budget_max)
        
        # Calculate Final Weighted Score: Σ (Weight_i * FactorScore_i)
        final_score = sum(weights[key] * factor_scores[key] for key in PRIORITY_KEYS)
        match_score = int(round(final_score))
        match_score = max(10, min(99, match_score))

        passes_hard, hard_reasons = stage1_hard_filter(laptop, preferences)
        
        why_text, why_not_reasons, breakdown = generate_explanations(
            laptop, factor_scores, priority_order, budget_max, passes_hard, hard_reasons
        )

        lap_dict = laptop.to_dict()
        lap_dict["matchScore"] = match_score
        lap_dict["match_score"] = match_score
        lap_dict["breakdown"] = breakdown
        lap_dict["factor_scores"] = factor_scores
        lap_dict["whyText"] = why_text
        lap_dict["why_text"] = why_text
        lap_dict["whyNotReasons"] = why_not_reasons
        lap_dict["why_not_reasons"] = why_not_reasons
        lap_dict["passes_hard_filter"] = passes_hard

        if passes_hard:
            recommended_list.append(lap_dict)
        else:
            excluded_list.append(lap_dict)

    # Sort recommended descending by matchScore
    recommended_list.sort(key=lambda x: x["matchScore"], reverse=True)
    # Sort excluded descending by matchScore as well
    excluded_list.sort(key=lambda x: x["matchScore"], reverse=True)

    return recommended_list, excluded_list

