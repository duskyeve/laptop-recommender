/* =========================================================
   preferences.js — Handles the 5-step preference questionnaire:
   step navigation, purpose selection, conditional gaming
   question, budget slider, pill-choice groups, and drag/arrow
   priority ranking.

   FUTURE BACKEND INTEGRATION POINT:
   On submit, this file bundles everything into one object and
   stores it in localStorage so results.html can render a
   preview. The real system will instead call:

       POST /api/preferences   { ...preferences }

   Flask will use this payload (purpose, budget, basic
   preferences, priority order, advanced specs) to run the
   deterministic filtering + ranking engine — designed
   separately, before backend integration. Nothing here decides
   which laptops are good, and priorityOrder is stored exactly
   as the user arranged it (an ordered list of factor keys) —
   this file never converts that order into weights or a score.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // ---- Access guard: guests AND signed-in users may both take the
  // questionnaire; only a visitor with no session at all (who
  // skipped the landing page's guest/sign-in entry points) is sent
  // back to sign in or continue as guest properly. ----
  if (!GadgetLens.getSession()) {
    window.location.href = "login.html";
    return;
  }

  const preferences = {
    purpose: null,
    gamingLevel: null,
    budgetMin: 50000,
    budgetMax: 80000,
    screenSize: "no-preference",
    displayQuality: "no-preference",
    os: "no-preference",
    portability: "no-preference",
    batteryLife: "no-preference",
    priorityOrder: [],
    advanced: {
      processor: "no-preference",
      ram: "no-preference",
      storage: "no-preference",
      graphics: "no-preference",
      refreshRate: "no-preference",
      displayType: "no-preference",
      upgradeability: "no-preference",
      weight: "no-preference",
    },
  };

  /* ---------------- Step navigation ---------------- */
  const TOTAL_STEPS = 5;
  let currentStep = 1;

  const steps = document.querySelectorAll(".pref-step");
  const progressDots = document.querySelectorAll(".pref-progress__step");
  const progressLabel = document.getElementById("pref-progress-label");

  function showStep(stepNumber) {
    currentStep = stepNumber;

    steps.forEach((step) => {
      step.classList.toggle("is-active", Number(step.dataset.step) === stepNumber);
    });

    progressDots.forEach((dot) => {
      const dotStep = Number(dot.dataset.step);
      dot.classList.toggle("is-active", dotStep === stepNumber);
      dot.classList.toggle("is-done", dotStep < stepNumber);
    });

    progressLabel.textContent = `Step ${stepNumber} of ${TOTAL_STEPS}`;

    // Move focus to the step heading for keyboard/screen-reader users.
    const heading = steps[stepNumber - 1]?.querySelector("h2");
    if (heading) heading.setAttribute("tabindex", "-1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".next-step").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep === 1 && !preferences.purpose) {
        document.getElementById("purpose-grid").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
    });
  });

  document.querySelectorAll(".prev-step").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 1) showStep(currentStep - 1);
    });
  });

  /* ---------------- Step 1: Purpose cards ---------------- */
  const purposeGrid = document.getElementById("purpose-grid");
  const gamingSubgroup = document.getElementById("gaming-subgroup");
  const gamingLevelGrid = document.getElementById("gaming-level-grid");

  purposeGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".option-card");
    if (!card) return;

    purposeGrid.querySelectorAll(".option-card").forEach((c) => c.classList.remove("is-selected"));
    card.classList.add("is-selected");
    preferences.purpose = card.dataset.value;

    const isGaming = preferences.purpose === "gaming";
    gamingSubgroup.hidden = !isGaming;
    if (!isGaming) {
      preferences.gamingLevel = null;
      gamingLevelGrid.querySelectorAll(".pill-choice").forEach((p) => p.classList.remove("is-selected"));
    }
  });

  gamingLevelGrid.addEventListener("click", (event) => {
    const pill = event.target.closest(".pill-choice");
    if (!pill) return;
    gamingLevelGrid.querySelectorAll(".pill-choice").forEach((p) => p.classList.remove("is-selected"));
    pill.classList.add("is-selected");
    preferences.gamingLevel = pill.dataset.value;
  });

  /* ---------------- Step 2: Budget dual-range slider ---------------- */
  const minSlider = document.getElementById("budget-min");
  const maxSlider = document.getElementById("budget-max");
  const budgetFill = document.getElementById("budget-fill");
  const budgetReadout = document.getElementById("budget-readout");
  const MIN_GAP = 5000;

  function formatRupees(value) {
    return "₹" + Number(value).toLocaleString("en-IN");
  }

  function updateBudgetUI() {
    let min = parseInt(minSlider.value, 10);
    let max = parseInt(maxSlider.value, 10);

    if (max - min < MIN_GAP) {
      if (document.activeElement === minSlider) {
        min = max - MIN_GAP;
        minSlider.value = min;
      } else {
        max = min + MIN_GAP;
        maxSlider.value = max;
      }
    }

    preferences.budgetMin = min;
    preferences.budgetMax = max;
    budgetReadout.textContent = `${formatRupees(min)} – ${formatRupees(max)}`;

    const rangeMin = parseInt(minSlider.min, 10);
    const rangeMax = parseInt(minSlider.max, 10);
    const leftPct = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
    const rightPct = ((max - rangeMin) / (rangeMax - rangeMin)) * 100;
    budgetFill.style.left = leftPct + "%";
    budgetFill.style.width = (rightPct - leftPct) + "%";
  }

  minSlider.addEventListener("input", updateBudgetUI);
  maxSlider.addEventListener("input", updateBudgetUI);
  updateBudgetUI();

  /* ---------------- Step 3 & 5: Generic single-select pill groups ---------------- */
  document.querySelectorAll(".pill-grid[data-group]").forEach((grid) => {
    const groupName = grid.dataset.group;

    grid.addEventListener("click", (event) => {
      const pill = event.target.closest(".pill-choice");
      if (!pill) return;

      grid.querySelectorAll(".pill-choice").forEach((p) => p.classList.remove("is-selected"));
      pill.classList.add("is-selected");

      if (groupName in preferences.advanced) {
        preferences.advanced[groupName] = pill.dataset.value;
      } else {
        preferences[groupName] = pill.dataset.value;
      }
    });
  });

  /* ---------------- Step 4: Priority ranking ----------------
     IMPORTANT: this ONLY collects the order the user drags/arrows
     the factors into. It does NOT turn that order into numeric
     weights, scores, or a ranking formula of any kind. */
  const priorityList = document.getElementById("priority-list");

  function refreshPriorityRanks() {
    const items = Array.from(priorityList.querySelectorAll(".priority-item"));
    items.forEach((item, index) => {
      item.querySelector(".priority-item__rank").textContent = index + 1;
      item.querySelector(".move-up").disabled = index === 0;
      item.querySelector(".move-down").disabled = index === items.length - 1;
    });
    preferences.priorityOrder = items.map((item) => item.dataset.key);
  }

  priorityList.addEventListener("click", (event) => {
    const item = event.target.closest(".priority-item");
    if (!item) return;

    if (event.target.closest(".move-up") && item.previousElementSibling) {
      priorityList.insertBefore(item, item.previousElementSibling);
      refreshPriorityRanks();
    } else if (event.target.closest(".move-down") && item.nextElementSibling) {
      priorityList.insertBefore(item.nextElementSibling, item);
      refreshPriorityRanks();
    }
  });

  let draggedItem = null;
  priorityList.querySelectorAll(".priority-item").forEach((item) => {
    item.addEventListener("dragstart", () => {
      draggedItem = item;
      item.classList.add("is-dragging");
    });
    item.addEventListener("dragend", () => {
      draggedItem = null;
      item.classList.remove("is-dragging");
      refreshPriorityRanks();
    });
  });

  priorityList.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (!draggedItem) return;
    const afterElement = getDragAfterElement(priorityList, event.clientY);
    if (afterElement == null) {
      priorityList.appendChild(draggedItem);
    } else {
      priorityList.insertBefore(draggedItem, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const items = [...container.querySelectorAll(".priority-item:not(.is-dragging)")];
    return items.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  refreshPriorityRanks();

  /* ---------------- Submit ---------------- */
  const form = document.getElementById("preferences-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!preferences.purpose) {
      showStep(1);
      return;
    }

    // ---- SIMULATION ONLY ----
    localStorage.setItem("gadgetlens_preferences", JSON.stringify(preferences));

    // ---- FUTURE: replace the line above with -----------------
    // await fetch("/api/preferences", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(preferences),
    // });
    // The response would contain the ranked laptop list that
    // results.html currently renders from mock data instead.
    // ------------------------------------------------------------

    window.location.href = "results.html";
  });

  showStep(1);
});
