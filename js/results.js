/* =========================================================
   results.js — Renders "Your Laptop Matches": mock
   recommendation cards, filter sidebar, technical term
   tooltips, compare tray + table, laptop detail view,
   "why (not) recommended" modals, save/favorite (with guest
   gating), website feedback (with guest gating), and the AI
   chatbot shell.

   PROTOTYPE ONLY. Every piece of "intelligence" on this page —
   match percentages, per-priority breakdown bars, "why (not)
   recommended" reasoning, and the chatbot's replies — is
   hardcoded mock data or simple keyword matching, clearly
   labeled DEMO/prototype throughout. None of it is calculated
   from the user's actual preferences by a real ranking engine.

   The chatbot is a FRONTEND PLACEHOLDER ONLY: it explains
   specs and answers general questions, and must never be
   extended to decide, rank, or influence which laptop is
   recommended. That decision belongs entirely to the
   deterministic backend engine, designed separately and
   implemented in Flask.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- Access guard ---------------- */
  const session = GadgetLens.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }
  const isSignedIn = session.type === "user";

  document.getElementById("edit-preferences-link").addEventListener("click", () => {
    window.location.href = "preferences.html";
  });

  const savedPreferences = JSON.parse(localStorage.getItem("gadgetlens_preferences") || "null");

  /* ---------------- Results summary bar ---------------- */
  const PURPOSE_LABELS = {
    education: "Education", work: "Work / Job", gaming: "Gaming",
    general: "General Everyday Use", creative: "Creative Work",
  };
  const PRIORITY_LABELS = {
    performance: "Performance", battery: "Battery Life", price: "Price",
    portability: "Portability", storage: "Storage", display: "Display", gaming: "Gaming Capability",
  };

  function renderResultsSummary() {
    const el = document.getElementById("results-summary");
    if (!savedPreferences) {
      el.innerHTML = `<p style="margin:0;">No saved preferences found — showing a general set of laptops. <a href="preferences.html">Answer the questionnaire</a> for a personalized match.</p>`;
      return;
    }

    const budget = `₹${savedPreferences.budgetMin.toLocaleString("en-IN")} – ₹${savedPreferences.budgetMax.toLocaleString("en-IN")}`;
    const purpose = PURPOSE_LABELS[savedPreferences.purpose] || "Not specified";
    const topPriorities = (savedPreferences.priorityOrder || [])
      .slice(0, 3)
      .map((key) => PRIORITY_LABELS[key] || key)
      .join(", ") || "Not specified";

    el.innerHTML = `
      <div class="results-summary__item"><span class="results-summary__label">Budget</span><span class="results-summary__value">${budget}</span></div>
      <div class="results-summary__item"><span class="results-summary__label">Main purpose</span><span class="results-summary__value">${purpose}</span></div>
      <div class="results-summary__item"><span class="results-summary__label">Top priorities</span><span class="results-summary__value">${topPriorities}</span></div>
    `;
  }
  renderResultsSummary();

  /* =========================================================
     MOCK DATA — resembles the future LAPTOPS/PROCESSORS/GPUS
     tables described in the data model, flattened for the
     frontend prototype. Names are believable but demonstration-
     only; they do not represent real current retail listings.
     FUTURE: this array is replaced entirely by:
         GET /api/recommendations?...
     which will return laptops already filtered (Stage 1) and
     ranked (Stage 2) by the deterministic Flask engine.
     ========================================================= */
  const MOCK_LAPTOPS = [
    {
      id: "l1", brand: "Nordic", model: "Slate 14", price: 74999,
      processor: "Mid-range, 8-core", gpu: "Integrated Graphics", ram: "16 GB", storage: "512 GB", storageType: "SSD",
      displaySize: "14\"", resolution: "1920×1200", displayType: "IPS", refreshRate: "144 Hz",
      battery: "Up to 12 hours", weight: "1.3 kg", os: "Windows", upgradeability: "RAM upgradeable",
      connectivity: "2× USB-C, 1× USB-A, Wi-Fi 6",
      matchScore: 92,
      breakdown: [{ label: "Battery life", value: 92 }, { label: "Performance", value: 88 }, { label: "Portability", value: 84 }, { label: "Price", value: 80 }, { label: "Display", value: 86 }],
      whyText: "Battery life and performance were among your highest priorities, and this laptop scores strongly on both while remaining within your budget.",
    },
    {
      id: "l2", brand: "Atlas", model: "Book Air 13", price: 68999,
      processor: "Mid-range, 6-core", gpu: "Integrated Graphics", ram: "16 GB", storage: "256 GB", storageType: "SSD",
      displaySize: "13.3\"", resolution: "1920×1080", displayType: "IPS", refreshRate: "60 Hz",
      battery: "Up to 15 hours", weight: "1.1 kg", os: "Windows", upgradeability: "Not upgradeable",
      connectivity: "2× USB-C, Wi-Fi 6",
      matchScore: 88,
      breakdown: [{ label: "Battery life", value: 95 }, { label: "Performance", value: 70 }, { label: "Portability", value: 96 }, { label: "Price", value: 84 }, { label: "Display", value: 78 }],
      whyText: "Portability and battery life were your top priorities, and this model leads the shortlist on both while staying comfortably within budget.",
    },
    {
      id: "l3", brand: "Forge", model: "Ryzen Studio 15", price: 89999,
      processor: "High-performance, 8-core", gpu: "Dedicated Graphics", ram: "32 GB", storage: "1 TB", storageType: "SSD",
      displaySize: "15.6\"", resolution: "2560×1440", displayType: "OLED", refreshRate: "120 Hz",
      battery: "Up to 7 hours", weight: "1.9 kg", os: "Windows", upgradeability: "RAM and storage upgradeable",
      connectivity: "1× USB-C (Thunderbolt), 2× USB-A, HDMI, Wi-Fi 6E",
      matchScore: 81,
      breakdown: [{ label: "Battery life", value: 62 }, { label: "Performance", value: 95 }, { label: "Portability", value: 58 }, { label: "Price", value: 65 }, { label: "Display", value: 97 }],
      whyText: "Strong performance and display quality push this into your shortlist, though it trades off some battery life and portability compared to the top pick.",
    },
    {
      id: "l4", brand: "Kestrel", model: "Edge 15", price: 61999,
      processor: "Entry-level, 4-core", gpu: "Integrated Graphics", ram: "8 GB", storage: "512 GB", storageType: "SSD",
      displaySize: "15.6\"", resolution: "1920×1080", displayType: "IPS", refreshRate: "60 Hz",
      battery: "Up to 6 hours", weight: "1.7 kg", os: "Windows", upgradeability: "RAM upgradeable",
      connectivity: "2× USB-A, 1× USB-C, Wi-Fi 5",
      matchScore: 64,
      breakdown: [{ label: "Battery life", value: 55 }, { label: "Performance", value: 60 }, { label: "Portability", value: 70 }, { label: "Price", value: 90 }, { label: "Display", value: 50 }],
      whyNotReasons: ["Lower battery suitability — battery life was your highest priority", "Lower performance for a demanding use case than higher-ranked options"],
    },
    {
      id: "l5", brand: "Pioneer", model: "GameFrame 16", price: 118999,
      processor: "High-performance, 8-core", gpu: "High-Performance Dedicated Graphics", ram: "32 GB", storage: "1 TB", storageType: "SSD",
      displaySize: "16\"", resolution: "2560×1600", displayType: "IPS", refreshRate: "165 Hz",
      battery: "Up to 4 hours", weight: "2.4 kg", os: "Windows", upgradeability: "RAM and storage upgradeable",
      connectivity: "1× USB-C (Thunderbolt), 3× USB-A, HDMI, Ethernet, Wi-Fi 6E",
      matchScore: 58,
      breakdown: [{ label: "Battery life", value: 40 }, { label: "Performance", value: 98 }, { label: "Portability", value: 35 }, { label: "Price", value: 45 }, { label: "Display", value: 90 }],
      whyNotReasons: ["Near the top of your maximum budget", "Heavier than your stated portability preference", "Lower battery suitability — battery life was your highest priority"],
    },
    {
      id: "l6", brand: "Willow", model: "Everyday 14", price: 52999,
      processor: "Entry-level, 4-core", gpu: "Integrated Graphics", ram: "8 GB", storage: "256 GB", storageType: "SSD",
      displaySize: "14\"", resolution: "1920×1080", displayType: "IPS", refreshRate: "60 Hz",
      battery: "Up to 10 hours", weight: "1.4 kg", os: "Linux", upgradeability: "Not upgradeable",
      connectivity: "2× USB-A, 1× USB-C, Wi-Fi 5",
      matchScore: 71,
      breakdown: [{ label: "Battery life", value: 78 }, { label: "Performance", value: 55 }, { label: "Portability", value: 80 }, { label: "Price", value: 95 }, { label: "Display", value: 60 }],
      whyNotReasons: ["Lower performance suitability relative to your selected purpose", "Lower match to your priority order compared to higher-ranked options"],
    },
  ];

  /* ---------------- Controlled glossary ----------------
     Only these exact keys ever become an interactive chip/
     tooltip. Ordinary words are never scanned or made clickable.
     FUTURE: served from the TECH_GLOSSARY database table instead. */
  const GLOSSARY = {
    RAM: "Short-term memory that helps your laptop keep active programs and data readily available.",
    SSD: "The laptop's storage drive. SSDs are the fast, modern standard for storing files and programs.",
    CPU: "The processor — the laptop's main 'brain' that determines general speed and responsiveness.",
    GPU: "The graphics processor. Matters most for gaming, video editing, and other visual workloads.",
    OLED: "A display type known for very deep blacks and vivid color, at a higher price than typical screens.",
    IPS: "A common, reliable display type known for accurate colors and wide viewing angles.",
    "Refresh Rate": "How many times per second the screen updates. Higher numbers look smoother, especially in games.",
    Storage: "Where your files, apps, and operating system live long-term, even when the laptop is off.",
    Processor: "Another name for the CPU — the component that carries out the laptop's calculations.",
    "Wi-Fi": "How the laptop connects to wireless networks. Newer standards are generally faster and more reliable.",
    Upgradeability: "Whether you can add more RAM or storage yourself later, instead of being stuck with what you bought.",
    "Battery Capacity": "How much charge the battery can hold — a rough indicator of how long it can run between charges.",
  };

  /* ---------------- Save/favorite (per signed-in user, prototype only) ---------------- */
  function savedKey() {
    return `gadgetlens_saved_${session.username}`;
  }
  function getSavedIds() {
    if (!isSignedIn) return [];
    try {
      return JSON.parse(localStorage.getItem(savedKey())) || [];
    } catch (e) {
      return [];
    }
  }
  function setSavedIds(ids) {
    if (!isSignedIn) return;
    localStorage.setItem(savedKey(), JSON.stringify(ids));
  }

  /* ---------------- Persistent compare selection (guests included) ---------------- */
  const COMPARE_KEY = "gadgetlens_compare_ids";
  const MAX_COMPARE = 4;

  function getCompareIds() {
    try {
      return JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function setCompareIds(ids) {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  }
  let compareIds = getCompareIds().filter((id) => MOCK_LAPTOPS.some((l) => l.id === id));

  /* ---------------- Render laptop cards ---------------- */
  const grid = document.getElementById("laptop-grid");

  function matchClass(score) {
    if (score >= 80) return "is-high";
    if (score >= 60) return "is-medium";
    return "is-low";
  }

  function renderSpecChips(laptop) {
    const chips = [
      { label: laptop.ram, term: "RAM" },
      { label: `${laptop.storage} ${laptop.storageType}`, term: "SSD" },
      { label: laptop.gpu, term: "GPU" },
      { label: laptop.refreshRate, term: "Refresh Rate" },
    ];
    return chips.map((c) => `<button type="button" class="spec-chip" data-term="${c.term}">${c.label}</button>`).join("");
  }

  function renderCard(laptop) {
    const hasPositiveMatch = laptop.matchScore >= 80;
    const actionLabel = hasPositiveMatch ? "Why this laptop?" : "Why wasn't this recommended?";
    const isSaved = getSavedIds().includes(laptop.id);
    const isComparing = compareIds.includes(laptop.id);

    return `
      <article class="laptop-card" data-id="${laptop.id}">
        <button type="button" class="laptop-card__image detail-trigger" data-id="${laptop.id}" aria-label="View details for ${laptop.brand} ${laptop.model}">💻</button>
        <div class="laptop-card__body">
          <div class="laptop-card__name-row">
            <button type="button" class="laptop-card__name detail-trigger" data-id="${laptop.id}">${laptop.brand} ${laptop.model}</button>
            <button type="button" class="save-btn ${isSaved ? "is-saved" : ""}" data-id="${laptop.id}" aria-label="Save laptop" aria-pressed="${isSaved}">${isSaved ? "★" : "☆"}</button>
          </div>
          <div class="laptop-card__price">₹${laptop.price.toLocaleString("en-IN")}</div>
          <div class="spec-chip-row">${renderSpecChips(laptop)}</div>
          <span class="match-score ${matchClass(laptop.matchScore)}" title="Prototype placeholder — not a calculated result">★ ${laptop.matchScore} Match<span class="demo-badge">Demo</span></span>

          <div class="laptop-card__actions">
            <div class="laptop-card__actions-row">
              <button type="button" class="btn btn-secondary why-btn" data-id="${laptop.id}">${actionLabel}</button>
            </div>
            <label class="compare-check">
              <input type="checkbox" class="compare-checkbox" data-id="${laptop.id}" ${isComparing ? "checked" : ""} />
              Add to compare
            </label>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid() {
    grid.innerHTML = MOCK_LAPTOPS.map(renderCard).join("");
    document.getElementById("results-count").textContent = `${MOCK_LAPTOPS.length} laptops matched`;
  }
  renderGrid();

  /* ---------------- Technical term tooltips ---------------- */
  const tooltip = document.getElementById("term-tooltip");

  function showTooltip(target) {
    const term = target.dataset.term;
    const definition = GLOSSARY[term];
    if (!definition) return; // Unknown terms never become clickable/tooltipped.
    tooltip.textContent = definition;
    const rect = target.getBoundingClientRect();
    tooltip.style.left = Math.max(8, rect.left) + "px";
    tooltip.style.top = rect.bottom + 8 + "px";
    tooltip.classList.add("is-visible");
  }
  function hideTooltip() { tooltip.classList.remove("is-visible"); }

  grid.addEventListener("mouseover", (e) => { const c = e.target.closest(".spec-chip"); if (c) showTooltip(c); });
  grid.addEventListener("mouseout", (e) => { if (e.target.closest(".spec-chip")) hideTooltip(); });
  grid.addEventListener("focusin", (e) => { const c = e.target.closest(".spec-chip"); if (c) showTooltip(c); });
  grid.addEventListener("focusout", (e) => { if (e.target.closest(".spec-chip")) hideTooltip(); });

  /* ---------------- Generic modal helpers ---------------- */
  const modalOverlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-content");

  function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.add("is-open");
  }
  function closeModal() { modalOverlay.classList.remove("is-open"); }

  document.getElementById("modal-close").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

  /* ---------------- "Why (not)" modal ---------------- */
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".why-btn");
    if (!btn) return;
    const laptop = MOCK_LAPTOPS.find((l) => l.id === btn.dataset.id);
    if (!laptop) return;
    openWhyModal(laptop);
  });

  function openWhyModal(laptop) {
    const isPositive = laptop.matchScore >= 80;

    if (isPositive) {
      const bars = laptop.breakdown
        .map((b) => `
          <div>
            <div class="priority-bar__label"><span>${b.label}</span><span>${b.value}/100 <span class="demo-badge">Demo</span></span></div>
            <div class="priority-bar__track"><div class="priority-bar__fill" style="width:${b.value}%"></div></div>
          </div>`)
        .join("");

      openModal(`
        <h2 id="modal-title">Why this laptop?</h2>
        <p>${laptop.whyText}</p>
        <p style="font-size:0.82rem; font-weight:600; color:var(--color-ink); margin-top:var(--space-5);">Factor breakdown</p>
        <div class="priority-bars">${bars}</div>
        <div class="ai-note">
          This explanation and these scores are prototype/demo values, not a calculated result. In the real system, structured facts computed by the deterministic backend ranking engine will be converted into natural language by an AI explanation layer — the AI will never decide the ranking itself.
        </div>
      `);
    } else {
      const reasons = (laptop.whyNotReasons || []).map((r) => `<li>${r}</li>`).join("");
      openModal(`
        <h2 id="modal-title">Why wasn't this recommended?</h2>
        <p>Compared to higher-ranked laptops in your results, this one scored lower for reasons like:</p>
        <ul class="reason-list">${reasons}</ul>
        <div class="ai-note">
          These reasons are prototype/demo content for this frontend. The real system will generate this list from structured facts the backend actually calculates — not from an AI's own judgment.
        </div>
      `);
    }
  }

  /* ---------------- Laptop detail modal ---------------- */
  grid.addEventListener("click", (e) => {
    const trigger = e.target.closest(".detail-trigger");
    if (!trigger) return;
    const laptop = MOCK_LAPTOPS.find((l) => l.id === trigger.dataset.id);
    if (laptop) openDetailModal(laptop);
  });

  function openDetailModal(laptop) {
    openModal(`
      <h2 id="modal-title">${laptop.brand} ${laptop.model}</h2>
      <p class="laptop-card__price" style="margin-bottom:var(--space-5);">₹${laptop.price.toLocaleString("en-IN")}</p>

      <div class="spec-category">
        <h3>Performance</h3>
        <dl>
          <dt>Processor</dt><dd>${laptop.processor}</dd>
          <dt>GPU</dt><dd>${laptop.gpu}</dd>
          <dt>RAM</dt><dd>${laptop.ram}</dd>
          <dt>Storage</dt><dd>${laptop.storage} (${laptop.storageType})</dd>
        </dl>
      </div>
      <div class="spec-category">
        <h3>Display</h3>
        <dl>
          <dt>Size</dt><dd>${laptop.displaySize}</dd>
          <dt>Resolution</dt><dd>${laptop.resolution}</dd>
          <dt>Type</dt><dd>${laptop.displayType}</dd>
          <dt>Refresh rate</dt><dd>${laptop.refreshRate}</dd>
        </dl>
      </div>
      <div class="spec-category">
        <h3>Battery &amp; Mobility</h3>
        <dl>
          <dt>Battery</dt><dd>${laptop.battery}</dd>
          <dt>Weight</dt><dd>${laptop.weight}</dd>
        </dl>
      </div>
      <div class="spec-category">
        <h3>Software</h3>
        <dl><dt>Operating system</dt><dd>${laptop.os}</dd></dl>
      </div>
      <div class="spec-category">
        <h3>Upgradeability</h3>
        <dl><dt>Options</dt><dd>${laptop.upgradeability}</dd></dl>
      </div>
      <div class="spec-category">
        <h3>Connectivity</h3>
        <dl><dt>Ports &amp; Wi-Fi</dt><dd>${laptop.connectivity}</dd></dl>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="detail-why-btn" data-id="${laptop.id}">Why this laptop?</button>
      </div>
    `);

    const whyBtn = document.getElementById("detail-why-btn");
    if (whyBtn) {
      whyBtn.addEventListener("click", () => openWhyModal(laptop));
    }
  }

  /* ---------------- Save / favorite (gated for guests) ---------------- */
  const saveGateOverlay = document.getElementById("save-gate-overlay");
  document.getElementById("save-gate-close").addEventListener("click", () => saveGateOverlay.classList.remove("is-open"));
  document.getElementById("continue-comparing-btn").addEventListener("click", () => saveGateOverlay.classList.remove("is-open"));
  saveGateOverlay.addEventListener("click", (e) => { if (e.target === saveGateOverlay) saveGateOverlay.classList.remove("is-open"); });

  grid.addEventListener("click", (e) => {
    const saveBtn = e.target.closest(".save-btn");
    if (!saveBtn) return;

    if (!isSignedIn) {
      saveGateOverlay.classList.add("is-open");
      return;
    }

    const id = saveBtn.dataset.id;
    let savedIds = getSavedIds();
    const nowSaved = !savedIds.includes(id);

    savedIds = nowSaved ? [...savedIds, id] : savedIds.filter((sid) => sid !== id);
    setSavedIds(savedIds);

    saveBtn.classList.toggle("is-saved", nowSaved);
    saveBtn.setAttribute("aria-pressed", String(nowSaved));
    saveBtn.textContent = nowSaved ? "★" : "☆";

    // ---- FUTURE: POST/DELETE /api/saved-laptops/{laptopId} ----
  });

  /* ---------------- Saved laptops list ---------------- */
  document.getElementById("saved-link").addEventListener("click", () => {
    if (!isSignedIn) {
      saveGateOverlay.classList.add("is-open");
      return;
    }

    const savedIds = getSavedIds();
    const savedLaptops = MOCK_LAPTOPS.filter((l) => savedIds.includes(l.id));

    const listHtml = savedLaptops.length
      ? `<ul class="saved-list">${savedLaptops
          .map((l) => `<li>${l.brand} ${l.model} <button type="button" class="remove-saved-btn" data-id="${l.id}">Remove</button></li>`)
          .join("")}</ul>`
      : `<p class="saved-empty">You haven't saved any laptops yet. Click the ☆ on a laptop card to save it.</p>`;

    openModal(`<h2 id="modal-title">Saved laptops</h2>${listHtml}`);

    document.querySelectorAll(".remove-saved-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const remaining = getSavedIds().filter((id) => id !== btn.dataset.id);
        setSavedIds(remaining);
        renderGrid();
        document.getElementById("saved-link").click();
      });
    });
  });

  /* ---------------- Compare tray + compare modal ---------------- */
  const compareTray = document.getElementById("compare-tray");
  const compareTrayLabel = document.getElementById("compare-tray-label");
  const compareTrayBtn = document.getElementById("compare-tray-btn");

  function refreshCompareTray() {
    const count = compareIds.length;
    compareTrayLabel.textContent = `${count} selected (max ${MAX_COMPARE})`;
    compareTray.classList.toggle("is-visible", count >= 1);
    compareTrayBtn.disabled = count < 2;
  }
  refreshCompareTray();

  grid.addEventListener("change", (e) => {
    const checkbox = e.target.closest(".compare-checkbox");
    if (!checkbox) return;

    if (checkbox.checked) {
      if (compareIds.length >= MAX_COMPARE) {
        checkbox.checked = false;
        return;
      }
      compareIds.push(checkbox.dataset.id);
    } else {
      compareIds = compareIds.filter((id) => id !== checkbox.dataset.id);
    }

    // Persisted for both guests and signed-in users — comparison
    // never requires an account.
    setCompareIds(compareIds);
    refreshCompareTray();
  });

  compareTrayBtn.addEventListener("click", () => {
    if (compareIds.length < 2) return;
    const selected = MOCK_LAPTOPS.filter((l) => compareIds.includes(l.id));
    const rows = ["Price", "Processor", "GPU", "RAM", "Storage", "Display", "Refresh rate", "Battery", "Weight", "OS", "Upgradeability", "Connectivity"];

    const getValue = (laptop, row) => {
      switch (row) {
        case "Price": return `₹${laptop.price.toLocaleString("en-IN")}`;
        case "Processor": return laptop.processor;
        case "GPU": return laptop.gpu;
        case "RAM": return laptop.ram;
        case "Storage": return `${laptop.storage} (${laptop.storageType})`;
        case "Display": return `${laptop.displaySize}, ${laptop.resolution}, ${laptop.displayType}`;
        case "Refresh rate": return laptop.refreshRate;
        case "Battery": return laptop.battery;
        case "Weight": return laptop.weight;
        case "OS": return laptop.os;
        case "Upgradeability": return laptop.upgradeability;
        case "Connectivity": return laptop.connectivity;
        default: return "—";
      }
    };

    const headerCells = selected.map((l) => `<th>${l.brand} ${l.model}</th>`).join("");
    const bodyRows = rows.map((row) => `<tr><th>${row}</th>${selected.map((l) => `<td>${getValue(l, row)}</td>`).join("")}</tr>`).join("");

    openModal(`
      <h2 id="modal-title" class="modal-card--wide">Compare laptops</h2>
      <table class="compare-table"><thead><tr><th></th>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
    `);
    document.getElementById("modal-card").classList.add("modal-card--wide");
  });

  modalOverlay.addEventListener("transitionend", () => {
    if (!modalOverlay.classList.contains("is-open")) {
      document.getElementById("modal-card").classList.remove("modal-card--wide");
    }
  });

  /* ---------------- Filters sidebar ---------------- */
  const filtersPanel = document.getElementById("dash-filters");
  document.getElementById("filters-toggle").addEventListener("click", () => filtersPanel.classList.add("is-open"));
  document.getElementById("filters-close").addEventListener("click", () => filtersPanel.classList.remove("is-open"));

  document.getElementById("reset-filters-btn").addEventListener("click", () => {
    filtersPanel.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  });
  document.getElementById("apply-filters-btn").addEventListener("click", () => {
    // FUTURE: send checked filter values to GET /api/recommendations.
    // For this prototype the mock dataset isn't actually filtered —
    // applying just closes the drawer on mobile.
    filtersPanel.classList.remove("is-open");
  });

  /* ---------------- Website feedback (gated for guests) ---------------- */
  const feedbackOverlay = document.getElementById("feedback-overlay");
  const feedbackGateOverlay = document.getElementById("feedback-gate-overlay");

  document.getElementById("feedback-link").addEventListener("click", () => {
    if (isSignedIn) {
      feedbackOverlay.classList.add("is-open");
    } else {
      feedbackGateOverlay.classList.add("is-open");
    }
  });
  document.getElementById("feedback-gate-close").addEventListener("click", () => feedbackGateOverlay.classList.remove("is-open"));
  feedbackGateOverlay.addEventListener("click", (e) => { if (e.target === feedbackGateOverlay) feedbackGateOverlay.classList.remove("is-open"); });

  document.getElementById("feedback-close").addEventListener("click", () => feedbackOverlay.classList.remove("is-open"));
  feedbackOverlay.addEventListener("click", (e) => { if (e.target === feedbackOverlay) feedbackOverlay.classList.remove("is-open"); });

  const feedbackAnswers = {};
  document.querySelectorAll(".feedback-question").forEach((question) => {
    const key = question.dataset.question;
    const scale = question.querySelector(".feedback-scale");
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = i;
      btn.addEventListener("click", () => {
        scale.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        feedbackAnswers[key] = i;
      });
      scale.appendChild(btn);
    }
  });

  document.getElementById("feedback-form").addEventListener("submit", (e) => {
    e.preventDefault();
    // ---- SIMULATION ONLY ----
    // FUTURE: POST /api/feedback  { ...feedbackAnswers, comment }
    // Website usability feedback only — never a laptop review, and
    // never used as an input to the recommendation ranking engine.
    document.getElementById("feedback-success").classList.add("is-visible");
  });

  /* ---------------- AI chatbot (frontend shell, mock replies) ---------------- */
  const chatbotLauncher = document.getElementById("chatbot-launcher");
  const chatbotPanel = document.getElementById("chatbot-panel");
  const chatbotBody = document.getElementById("chatbot-body");
  const chatbotForm = document.getElementById("chatbot-form");
  const chatbotInput = document.getElementById("chatbot-input");

  chatbotLauncher.addEventListener("click", () => {
    chatbotPanel.classList.add("is-open");
    chatbotInput.focus();
  });
  document.getElementById("chatbot-close").addEventListener("click", () => chatbotPanel.classList.remove("is-open"));

  function addChatMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `chat-msg chat-msg--${sender}`;
    msg.textContent = text;
    chatbotBody.appendChild(msg);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  // FUTURE: replace with POST /api/chatbot { question }, calling an
  // AI model restricted to explaining specs/answering general
  // questions from structured backend facts — never to rank laptops.
  function mockChatbotReply(question) {
    const q = question.toLowerCase();
    for (const term of Object.keys(GLOSSARY)) {
      if (q.includes(term.toLowerCase())) return GLOSSARY[term];
    }
    if (q.includes("best") || q.includes("which laptop") || q.includes("recommend")) {
      return "I can't pick a laptop for you — that's handled by GadgetLens's ranking results, based on your priorities. I can explain any spec you see on a card, though!";
    }
    return "I can explain terms like RAM, SSD, CPU, GPU, OLED, IPS, or refresh rate. Try asking about one of those!";
  }

  chatbotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = chatbotInput.value.trim();
    if (!question) return;
    addChatMessage(question, "user");
    chatbotInput.value = "";
    setTimeout(() => addChatMessage(mockChatbotReply(question), "bot"), 400);
  });

  /* ---------------- Escape closes any open modal ---------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal();
    feedbackOverlay.classList.remove("is-open");
    feedbackGateOverlay.classList.remove("is-open");
    saveGateOverlay.classList.remove("is-open");
    filtersPanel.classList.remove("is-open");
  });
});
