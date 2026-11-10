/* =========================================================
   results.js — Connected to GadgetLens Backend API.
   Renders deterministic recommendations, specification filters,
   search, compare table, details modal, "why (not)" explanations,
   backend saved laptops, feedback submission, chatbot, and
   database-driven technical term tooltips.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  /* ---------------- Access guard ---------------- */
  const session = GadgetLens.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }
  const isSignedIn = GadgetLens.isSignedIn();

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
      el.innerHTML = `<p style="margin:0;">No saved preferences found — showing default recommendations. <a href="preferences.html">Answer the questionnaire</a> for a personalized match.</p>`;
      return;
    }

    const bMin = savedPreferences.budgetMin ? Number(savedPreferences.budgetMin).toLocaleString("en-IN") : "40,000";
    const bMax = savedPreferences.budgetMax ? Number(savedPreferences.budgetMax).toLocaleString("en-IN") : "1,00,000";
    const budget = `₹${bMin} – ₹${bMax}`;
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

  /* ---------------- State ---------------- */
  let recommendedLaptops = [];
  let excludedLaptops = [];
  let currentLaptops = [];
  let serverSavedIds = [];
  let glossaryMap = {};

  const COMPARE_KEY = "gadgetlens_compare_ids";
  const MAX_COMPARE = 4;

  function getCompareIds() {
    try {
      return (JSON.parse(localStorage.getItem(COMPARE_KEY)) || []).map(Number);
    } catch (e) {
      return [];
    }
  }
  function setCompareIds(ids) {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids.map(Number)));
  }
  let compareIds = getCompareIds();

  /* ---------------- Load Glossary from Backend ---------------- */
  async function loadGlossary() {
    try {
      const res = await GadgetLensAPI.glossary.getAll();
      if (res && res.glossary_map) {
        glossaryMap = res.glossary_map;
      }
    } catch (err) {
      console.warn("Using local fallback glossary:", err);
      glossaryMap = {
        RAM: "Short-term memory that helps your laptop keep active programs and data readily available.",
        SSD: "The laptop's storage drive. SSDs are the fast, modern standard for storing files and programs.",
        CPU: "The processor — the laptop's main 'brain' that determines general speed and responsiveness.",
        GPU: "The graphics processor. Matters most for gaming, video editing, and other visual workloads.",
        OLED: "A display type known for very deep blacks and vivid color, at a higher price than typical screens.",
        IPS: "A common, reliable display type known for accurate colors and wide viewing angles.",
        "Refresh Rate": "How many times per second the screen updates. Higher numbers look smoother, especially in games.",
        Storage: "Where your files, apps, and operating system live long-term, even when the laptop is off.",
      };
    }
  }

  /* ---------------- Load Saved Laptops for Signed-In Users ---------------- */
  async function loadSavedLaptops() {
    if (!isSignedIn) {
      serverSavedIds = [];
      return;
    }
    try {
      const res = await GadgetLensAPI.savedLaptops.getAll();
      if (res && res.saved_laptops) {
        serverSavedIds = res.saved_laptops.map((s) => s.laptop_id);
      }
    } catch (err) {
      console.warn("Could not fetch saved laptops from backend:", err);
    }
  }

  /* ---------------- Fetch Recommendations from Backend ---------------- */
  async function fetchRecommendations() {
    const grid = document.getElementById("laptop-grid");
    grid.innerHTML = `<p style="padding:var(--space-6); text-align:center; color:var(--color-ink-muted);">Calculating personalized recommendations based on technical specifications...</p>`;

    try {
      let res;
      if (savedPreferences) {
        res = await GadgetLensAPI.recommendations.generate(savedPreferences);
      } else {
        res = await GadgetLensAPI.recommendations.getSaved();
      }

      if (res && res.recommended) {
        recommendedLaptops = res.recommended;
        excludedLaptops = res.excluded || [];
        // Combine passing and excluded (passing first)
        currentLaptops = [...recommendedLaptops, ...excludedLaptops];
      } else {
        // Fallback to laptop list if recommendations endpoint format differs
        const listRes = await GadgetLensAPI.laptops.getAll();
        currentLaptops = (listRes && listRes.laptops) || [];
      }
    } catch (err) {
      console.error("Backend recommendations request failed:", err);
      grid.innerHTML = `<p style="padding:var(--space-6); text-align:center; color:var(--color-danger);">Unable to connect to GadgetLens backend. Please ensure the Flask backend is running on port 5000.</p>`;
      return;
    }

    renderGrid(currentLaptops);
  }

  /* ---------------- Render Laptop Cards ---------------- */
  const grid = document.getElementById("laptop-grid");

  function matchClass(score) {
    if (score >= 80) return "is-high";
    if (score >= 60) return "is-medium";
    return "is-low";
  }

  function renderSpecChips(laptop) {
    const chips = [
      { label: laptop.ram || `${laptop.ram_gb} GB`, term: "RAM" },
      { label: `${laptop.storage || laptop.storage_gb + ' GB'} ${laptop.storageType || laptop.storage_type || 'SSD'}`, term: "SSD" },
      { label: laptop.gpu || "Integrated GPU", term: "GPU" },
      { label: laptop.refreshRate || `${laptop.refresh_rate} Hz`, term: "Refresh Rate" },
    ];
    return chips.map((c) => `<button type="button" class="spec-chip" data-term="${c.term}">${c.label}</button>`).join("");
  }

  function renderCard(laptop) {
    const score = laptop.matchScore !== undefined ? laptop.matchScore : (laptop.match_score || 75);
    const hasPositiveMatch = score >= 80 && laptop.passes_hard_filter !== false;
    const actionLabel = hasPositiveMatch ? "Why this laptop?" : "Why wasn't this recommended?";
    const isSaved = serverSavedIds.includes(Number(laptop.id));
    const isComparing = compareIds.includes(Number(laptop.id));

    return `
      <article class="laptop-card" data-id="${laptop.id}">
        <button type="button" class="laptop-card__image detail-trigger" data-id="${laptop.id}" aria-label="View details for ${laptop.brand} ${laptop.model}">💻</button>
        <div class="laptop-card__body">
          <div class="laptop-card__name-row">
            <button type="button" class="laptop-card__name detail-trigger" data-id="${laptop.id}">${laptop.brand} ${laptop.model}</button>
            <button type="button" class="save-btn ${isSaved ? "is-saved" : ""}" data-id="${laptop.id}" aria-label="Save laptop" aria-pressed="${isSaved}">${isSaved ? "★" : "☆"}</button>
          </div>
          <div class="laptop-card__price">₹${Number(laptop.price).toLocaleString("en-IN")}</div>
          <div class="spec-chip-row">${renderSpecChips(laptop)}</div>
          <span class="match-score ${matchClass(score)}" title="Deterministic Specification Score">★ ${score} Match</span>

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

  function renderGrid(laptopsToRender) {
    if (!laptopsToRender || laptopsToRender.length === 0) {
      grid.innerHTML = `<p style="padding:var(--space-6); text-align:center; color:var(--color-ink-muted);">No laptops match your selected filters. Try broadening your criteria or clicking Reset Filters.</p>`;
      document.getElementById("results-count").textContent = "0 laptops matched";
      return;
    }

    grid.innerHTML = laptopsToRender.map(renderCard).join("");
    document.getElementById("results-count").textContent = `${laptopsToRender.length} laptops matched`;
    refreshCompareTray();
  }

  /* ---------------- Technical term tooltips ---------------- */
  const tooltip = document.getElementById("term-tooltip");

  function showTooltip(target) {
    const term = target.dataset.term;
    const definition = glossaryMap[term];
    if (!definition) return;
    tooltip.textContent = definition;
    const rect = target.getBoundingClientRect();
    tooltip.style.left = Math.max(8, rect.left) + "px";
    tooltip.style.top = rect.bottom + 8 + "px";
    tooltip.classList.add("is-visible");
  }
  function hideTooltip() {
    tooltip.classList.remove("is-visible");
  }

  grid.addEventListener("mouseover", (e) => {
    const c = e.target.closest(".spec-chip");
    if (c) showTooltip(c);
  });
  grid.addEventListener("mouseout", (e) => {
    if (e.target.closest(".spec-chip")) hideTooltip();
  });
  grid.addEventListener("focusin", (e) => {
    const c = e.target.closest(".spec-chip");
    if (c) showTooltip(c);
  });
  grid.addEventListener("focusout", (e) => {
    if (e.target.closest(".spec-chip")) hideTooltip();
  });

  /* ---------------- Generic Modal Helpers ---------------- */
  const modalOverlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-content");

  function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.add("is-open");
  }
  function closeModal() {
    modalOverlay.classList.remove("is-open");
  }

  document.getElementById("modal-close").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  /* ---------------- "Why (not)" modal ---------------- */
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".why-btn");
    if (!btn) return;
    const laptopId = Number(btn.dataset.id);
    const laptop = currentLaptops.find((l) => Number(l.id) === laptopId);
    if (!laptop) return;
    openWhyModal(laptop);
  });

  function openWhyModal(laptop) {
    const score = laptop.matchScore !== undefined ? laptop.matchScore : (laptop.match_score || 75);
    const isPositive = score >= 80 && laptop.passes_hard_filter !== false;

    if (isPositive) {
      const breakdown = laptop.breakdown || [
        { label: "Performance", value: 85 },
        { label: "Battery life", value: 80 },
        { label: "Price", value: 78 },
        { label: "Portability", value: 82 },
        { label: "Display", value: 84 },
      ];

      const bars = breakdown
        .map(
          (b) => `
          <div>
            <div class="priority-bar__label"><span>${b.label}</span><span>${b.value}/100</span></div>
            <div class="priority-bar__track"><div class="priority-bar__fill" style="width:${b.value}%"></div></div>
          </div>`
        )
        .join("");

      const whyText = laptop.whyText || laptop.why_text || "Ranked highly based on your technical priorities and objective specifications.";

      openModal(`
        <h2 id="modal-title">Why this laptop?</h2>
        <p>${whyText}</p>
        <p style="font-size:0.82rem; font-weight:600; color:var(--color-ink); margin-top:var(--space-5);">Factor breakdown (0–100)</p>
        <div class="priority-bars">${bars}</div>
        <div class="ai-note">
          This ranking and score breakdown are calculated deterministically by the GadgetLens recommendation engine using normalized feature scores and your assigned priority weights.
        </div>
      `);
    } else {
      const reasonsList = laptop.whyNotReasons || laptop.why_not_reasons || [
        "Lower match against your top-ranked priority factors",
        "Higher trade-offs relative to other shortlisted models",
      ];
      const reasons = reasonsList.map((r) => `<li>${r}</li>`).join("");

      openModal(`
        <h2 id="modal-title">Why wasn't this recommended?</h2>
        <p>Compared to higher-ranked laptops in your results, this model scored lower for reasons like:</p>
        <ul class="reason-list">${reasons}</ul>
        <div class="ai-note">
          These reasons reflect objective technical mismatches identified by the deterministic engine against your stated priorities and budget.
        </div>
      `);
    }
  }

  /* ---------------- Laptop Detail Modal ---------------- */
  grid.addEventListener("click", (e) => {
    const trigger = e.target.closest(".detail-trigger");
    if (!trigger) return;
    const laptopId = Number(trigger.dataset.id);
    const laptop = currentLaptops.find((l) => Number(l.id) === laptopId);
    if (laptop) openDetailModal(laptop);
  });

  function openDetailModal(laptop) {
    const dispSize = laptop.displaySize || (laptop.display_size ? `${laptop.display_size}"` : "14\"");
    const storageType = laptop.storageType || laptop.storage_type || "SSD";
    const refreshRate = laptop.refreshRate || `${laptop.refresh_rate || 60} Hz`;

    openModal(`
      <h2 id="modal-title">${laptop.brand} ${laptop.model}</h2>
      <p class="laptop-card__price" style="margin-bottom:var(--space-5);">₹${Number(laptop.price).toLocaleString("en-IN")}</p>

      <div class="spec-category">
        <h3>Performance</h3>
        <dl>
          <dt>Processor</dt><dd>${laptop.processor || "Standard Processor"}</dd>
          <dt>GPU</dt><dd>${laptop.gpu || "Integrated Graphics"}</dd>
          <dt>RAM</dt><dd>${laptop.ram || laptop.ram_gb + " GB"}</dd>
          <dt>Storage</dt><dd>${laptop.storage || laptop.storage_gb + " GB"} (${storageType})</dd>
        </dl>
      </div>
      <div class="spec-category">
        <h3>Display</h3>
        <dl>
          <dt>Size</dt><dd>${dispSize}</dd>
          <dt>Resolution</dt><dd>${laptop.resolution || "1920×1080"}</dd>
          <dt>Type</dt><dd>${laptop.displayType || laptop.display_type || "IPS"}</dd>
          <dt>Refresh rate</dt><dd>${refreshRate}</dd>
        </dl>
      </div>
      <div class="spec-category">
        <h3>Battery &amp; Mobility</h3>
        <dl>
          <dt>Battery</dt><dd>${laptop.battery || "Up to 8 hours"}</dd>
          <dt>Weight</dt><dd>${laptop.weight || (laptop.weight_kg ? laptop.weight_kg + " kg" : "1.5 kg")}</dd>
        </dl>
      </div>
      <div class="spec-category">
        <h3>Software</h3>
        <dl><dt>Operating system</dt><dd>${laptop.os || "Windows"}</dd></dl>
      </div>
      <div class="spec-category">
        <h3>Upgradeability</h3>
        <dl><dt>Options</dt><dd>${laptop.upgradeability || "Not specified"}</dd></dl>
      </div>
      <div class="spec-category">
        <h3>Connectivity</h3>
        <dl><dt>Ports &amp; Wi-Fi</dt><dd>${laptop.connectivity || "USB-C, USB-A, Wi-Fi"}</dd></dl>
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

  /* ---------------- Save / Favorite (Backend integrated) ---------------- */
  const saveGateOverlay = document.getElementById("save-gate-overlay");
  document.getElementById("save-gate-close").addEventListener("click", () => saveGateOverlay.classList.remove("is-open"));
  document.getElementById("continue-comparing-btn").addEventListener("click", () => saveGateOverlay.classList.remove("is-open"));
  saveGateOverlay.addEventListener("click", (e) => {
    if (e.target === saveGateOverlay) saveGateOverlay.classList.remove("is-open");
  });

  grid.addEventListener("click", async (e) => {
    const saveBtn = e.target.closest(".save-btn");
    if (!saveBtn) return;

    if (!isSignedIn) {
      saveGateOverlay.classList.add("is-open");
      return;
    }

    const id = Number(saveBtn.dataset.id);
    const nowSaved = !serverSavedIds.includes(id);

    try {
      if (nowSaved) {
        await GadgetLensAPI.savedLaptops.save(id);
        serverSavedIds.push(id);
      } else {
        await GadgetLensAPI.savedLaptops.remove(id);
        serverSavedIds = serverSavedIds.filter((sid) => sid !== id);
      }

      saveBtn.classList.toggle("is-saved", nowSaved);
      saveBtn.setAttribute("aria-pressed", String(nowSaved));
      saveBtn.textContent = nowSaved ? "★" : "☆";
    } catch (err) {
      console.error("Failed to update saved laptop on backend:", err);
    }
  });

  /* ---------------- Saved Laptops Modal ---------------- */
  document.getElementById("saved-link").addEventListener("click", async () => {
    if (!isSignedIn) {
      saveGateOverlay.classList.add("is-open");
      return;
    }

    let savedList = [];
    try {
      const res = await GadgetLensAPI.savedLaptops.getAll();
      if (res && res.saved_laptops) {
        savedList = res.saved_laptops;
        serverSavedIds = savedList.map((s) => s.laptop_id);
      }
    } catch (err) {
      console.error("Could not fetch saved list:", err);
    }

    const listHtml = savedList.length
      ? `<ul class="saved-list">${savedList
          .map((s) => {
            const lap = s.laptop || {};
            return `<li>${lap.brand || "Laptop"} ${lap.model || ""} <button type="button" class="remove-saved-btn" data-id="${lap.id || s.laptop_id}">Remove</button></li>`;
          })
          .join("")}</ul>`
      : `<p class="saved-empty">You haven't saved any laptops yet. Click the ☆ on any laptop card to save it to your account.</p>`;

    openModal(`<h2 id="modal-title">Saved laptops</h2>${listHtml}`);

    document.querySelectorAll(".remove-saved-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        try {
          await GadgetLensAPI.savedLaptops.remove(id);
          serverSavedIds = serverSavedIds.filter((sid) => sid !== id);
          renderGrid(currentLaptops);
          document.getElementById("saved-link").click();
        } catch (err) {
          console.error("Could not remove laptop:", err);
        }
      });
    });
  });

  /* ---------------- Compare Tray + Compare Modal ---------------- */
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

    const id = Number(checkbox.dataset.id);

    if (checkbox.checked) {
      if (compareIds.length >= MAX_COMPARE) {
        checkbox.checked = false;
        return;
      }
      if (!compareIds.includes(id)) compareIds.push(id);
    } else {
      compareIds = compareIds.filter((cid) => cid !== id);
    }

    setCompareIds(compareIds);
    refreshCompareTray();
  });

  compareTrayBtn.addEventListener("click", async () => {
    if (compareIds.length < 2) return;

    let selected = [];
    try {
      const res = await GadgetLensAPI.laptops.compare(compareIds);
      if (res && res.laptops && res.laptops.length) {
        selected = res.laptops;
      }
    } catch (e) {
      selected = currentLaptops.filter((l) => compareIds.includes(Number(l.id)));
    }

    if (!selected.length) {
      selected = currentLaptops.filter((l) => compareIds.includes(Number(l.id)));
    }

    const rows = [
      "Price", "Processor", "GPU", "RAM", "Storage", "Display", "Refresh rate",
      "Battery", "Weight", "OS", "Upgradeability", "Connectivity"
    ];

    const getValue = (laptop, row) => {
      switch (row) {
        case "Price": return `₹${Number(laptop.price).toLocaleString("en-IN")}`;
        case "Processor": return laptop.processor || "Standard Processor";
        case "GPU": return laptop.gpu || "Integrated Graphics";
        case "RAM": return laptop.ram || `${laptop.ram_gb} GB`;
        case "Storage": return `${laptop.storage || laptop.storage_gb + ' GB'} (${laptop.storageType || laptop.storage_type || 'SSD'})`;
        case "Display": return `${laptop.displaySize || laptop.display_size + '"'}, ${laptop.resolution || '1080p'}, ${laptop.displayType || laptop.display_type || 'IPS'}`;
        case "Refresh rate": return laptop.refreshRate || `${laptop.refresh_rate} Hz`;
        case "Battery": return laptop.battery || "Up to 8 hours";
        case "Weight": return laptop.weight || `${laptop.weight_kg} kg`;
        case "OS": return laptop.os || "Windows";
        case "Upgradeability": return laptop.upgradeability || "—";
        case "Connectivity": return laptop.connectivity || "—";
        default: return "—";
      }
    };

    const headerCells = selected.map((l) => `<th>${l.brand} ${l.model}</th>`).join("");
    const bodyRows = rows
      .map((row) => `<tr><th>${row}</th>${selected.map((l) => `<td>${getValue(l, row)}</td>`).join("")}</tr>`)
      .join("");

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

  /* ---------------- Filters Sidebar ---------------- */
  const filtersPanel = document.getElementById("dash-filters");
  document.getElementById("filters-toggle").addEventListener("click", () => filtersPanel.classList.add("is-open"));
  document.getElementById("filters-close").addEventListener("click", () => filtersPanel.classList.remove("is-open"));

  document.getElementById("reset-filters-btn").addEventListener("click", () => {
    filtersPanel.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    renderGrid(currentLaptops);
  });

  document.getElementById("apply-filters-btn").addEventListener("click", () => {
    const checkedFilters = {};
    filtersPanel.querySelectorAll(".filter-group").forEach((group) => {
      const heading = group.querySelector("h3").textContent.trim();
      const selected = Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).map((cb) =>
        cb.parentElement.textContent.trim().toLowerCase()
      );
      if (selected.length > 0) {
        checkedFilters[heading] = selected;
      }
    });

    // Client-side filtering over recommendation results
    const filtered = currentLaptops.filter((laptop) => {
      for (const [groupName, values] of Object.entries(checkedFilters)) {
        if (groupName === "Brand") {
          if (!values.some((v) => laptop.brand.toLowerCase().includes(v))) return false;
        }
        if (groupName === "Processor") {
          const procCategory = (laptop.processor_category || laptop.processor || "").toLowerCase();
          if (!values.some((v) => procCategory.includes(v))) return false;
        }
        if (groupName === "RAM") {
          const ramVal = (laptop.ram || laptop.ram_gb + " gb").toLowerCase();
          if (!values.some((v) => ramVal.includes(v))) return false;
        }
        if (groupName === "Storage") {
          const storVal = (laptop.storage || laptop.storage_gb + " gb").toLowerCase();
          if (!values.some((v) => storVal.includes(v.replace("+", "")))) return false;
        }
        if (groupName === "GPU") {
          const gpuCategory = (laptop.gpu_category || laptop.gpu || "").toLowerCase();
          if (!values.some((v) => gpuCategory.includes(v))) return false;
        }
        if (groupName === "Display type") {
          const dispType = (laptop.displayType || laptop.display_type || "").toLowerCase();
          if (!values.some((v) => dispType.includes(v))) return false;
        }
        if (groupName === "Refresh rate") {
          const hz = laptop.refresh_rate || 60;
          const matchHz = values.some((v) => {
            if (v.includes("60")) return hz === 60;
            if (v.includes("90")) return hz >= 90;
            if (v.includes("120")) return hz >= 120;
            if (v.includes("144")) return hz >= 144;
            return false;
          });
          if (!matchHz) return false;
        }
        if (groupName === "Operating system") {
          const os = (laptop.os || "").toLowerCase();
          if (!values.some((v) => os.includes(v))) return false;
        }
        if (groupName === "Weight") {
          const w = laptop.weight_kg || parseFloat(laptop.weight) || 1.8;
          const matchWeight = values.some((v) => {
            if (v.includes("lightweight")) return w <= 1.4;
            if (v.includes("standard")) return w > 1.4 && w <= 2.0;
            if (v.includes("heavy")) return w > 2.0;
            return true;
          });
          if (!matchWeight) return false;
        }
        if (groupName === "Upgradeability") {
          const up = (laptop.upgradeability || "").toLowerCase();
          if (!values.some((v) => up.includes(v.replace(" upgradeable", "")))) return false;
        }
      }
      return true;
    });

    renderGrid(filtered);
    filtersPanel.classList.remove("is-open");
  });

  /* ---------------- Real-Time Search ---------------- */
  const searchInput = document.querySelector(".dash-search input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderGrid(currentLaptops);
        return;
      }
      const filtered = currentLaptops.filter((lap) => {
        const text = `${lap.brand} ${lap.model} ${lap.processor} ${lap.gpu} ${lap.os}`.toLowerCase();
        return text.includes(q);
      });
      renderGrid(filtered);
    });
  }

  /* ---------------- Website Feedback (Backend integrated) ---------------- */
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
  feedbackGateOverlay.addEventListener("click", (e) => {
    if (e.target === feedbackGateOverlay) feedbackGateOverlay.classList.remove("is-open");
  });

  document.getElementById("feedback-close").addEventListener("click", () => feedbackOverlay.classList.remove("is-open"));
  feedbackOverlay.addEventListener("click", (e) => {
    if (e.target === feedbackOverlay) feedbackOverlay.classList.remove("is-open");
  });

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

  const feedbackForm = document.getElementById("feedback-form");
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const comment = document.getElementById("feedback-comment").value.trim();
    const payload = { ...feedbackAnswers, comment };

    try {
      await GadgetLensAPI.feedback.submit(payload);
      document.getElementById("feedback-success").classList.add("is-visible");
      setTimeout(() => {
        feedbackOverlay.classList.remove("is-open");
        document.getElementById("feedback-success").classList.remove("is-visible");
        feedbackForm.reset();
      }, 2000);
    } catch (err) {
      alert("Failed to submit feedback: " + (err.message || "Please try again."));
    }
  });

  /* ---------------- AI Chatbot (Backend integrated) ---------------- */
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

  chatbotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = chatbotInput.value.trim();
    if (!question) return;

    addChatMessage(question, "user");
    chatbotInput.value = "";

    try {
      const res = await GadgetLensAPI.chatbot.send(question);
      if (res && res.reply) {
        addChatMessage(res.reply, "bot");
      } else {
        addChatMessage("I can explain terms like RAM, SSD, CPU, GPU, OLED, IPS, or refresh rate. Ask away!", "bot");
      }
    } catch (err) {
      // Safe fallback if network error
      const q = question.toLowerCase();
      let fallbackReply = "I can explain technical hardware specs (RAM, SSD, CPU, GPU, OLED, refresh rate).";
      for (const [term, def] of Object.entries(glossaryMap)) {
        if (q.includes(term.toLowerCase())) {
          fallbackReply = `${term}: ${def}`;
          break;
        }
      }
      addChatMessage(fallbackReply, "bot");
    }
  });

  /* ---------------- Escape Closes Modals ---------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal();
    feedbackOverlay.classList.remove("is-open");
    feedbackGateOverlay.classList.remove("is-open");
    saveGateOverlay.classList.remove("is-open");
    filtersPanel.classList.remove("is-open");
  });

  /* ---------------- Initialize ---------------- */
  await loadGlossary();
  await loadSavedLaptops();
  await fetchRecommendations();
});
