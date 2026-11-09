/* =========================================================
   register.js — Handles account creation: username, password
   strength meter + requirements, and confirm-password matching.

   PROTOTYPE ONLY — NO ACCOUNT IS ACTUALLY CREATED.
   This file never sends the password anywhere, hashes it, or
   persists it — not in localStorage, not anywhere. It only
   starts a local "signed in" session (username only) so the
   rest of the prototype can demonstrate signed-in behavior.

   FUTURE BACKEND INTEGRATION POINT:
       POST /api/auth/register   { username, password }
   Flask will hash the password (e.g. bcrypt/argon2) and store
   { username, password_hash, created_at } — matching the future
   USERS table, which intentionally has NO role/admin column,
   since GadgetLens has only one account type.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  const usernameField = document.getElementById("username-field");
  const usernameInput = document.getElementById("username");
  const usernameError = document.getElementById("username-error");

  const passwordInput = document.getElementById("password");
  const confirmField = document.getElementById("confirm-field");
  const confirmInput = document.getElementById("confirm-password");
  const confirmError = document.getElementById("confirm-error");

  const strengthFill = document.getElementById("pw-strength-fill");
  const strengthLabel = document.getElementById("pw-strength-label");
  const requirementItems = document.querySelectorAll("#pw-requirements li");
  const guestBtn = document.getElementById("guest-btn");

  function evaluatePassword(value) {
    const rules = {
      length: value.length >= 8,
      number: /[0-9]/.test(value),
      uppercase: /[A-Z]/.test(value),
    };
    const metCount = Object.values(rules).filter(Boolean).length;
    let level = "weak";
    if (metCount === 3 && value.length >= 12) level = "strong";
    else if (metCount >= 2) level = "moderate";
    return { rules, level };
  }

  function renderStrength(value) {
    if (!value) {
      strengthFill.style.width = "0%";
      strengthFill.style.backgroundColor = "var(--color-border)";
      strengthLabel.textContent = "Password strength";
      requirementItems.forEach((li) => li.classList.remove("met"));
      return;
    }
    const { rules, level } = evaluatePassword(value);
    requirementItems.forEach((li) => {
      const rule = li.getAttribute("data-rule");
      li.classList.toggle("met", !!rules[rule]);
    });
    const levelMap = {
      weak: { width: "33%", color: "var(--color-danger)", label: "Weak" },
      moderate: { width: "66%", color: "var(--color-accent)", label: "Moderate" },
      strong: { width: "100%", color: "var(--color-good)", label: "Strong" },
    };
    const cfg = levelMap[level];
    strengthFill.style.width = cfg.width;
    strengthFill.style.backgroundColor = cfg.color;
    strengthLabel.textContent = `Password strength: ${cfg.label}`;
  }

  passwordInput.addEventListener("input", () => renderStrength(passwordInput.value));

  function clearUsernameError() {
    usernameField.classList.remove("has-error");
    usernameError.classList.remove("is-visible");
  }
  function clearConfirmError() {
    confirmField.classList.remove("has-error");
    confirmError.classList.remove("is-visible");
  }
  usernameInput.addEventListener("input", clearUsernameError);
  confirmInput.addEventListener("input", clearConfirmError);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (username.length < 3) {
      usernameField.classList.add("has-error");
      usernameError.classList.add("is-visible");
      usernameInput.focus();
      return;
    }
    clearUsernameError();

    const { rules } = evaluatePassword(password);
    const meetsMinimum = rules.length && rules.number && rules.uppercase;
    if (!meetsMinimum) {
      renderStrength(password);
      passwordInput.focus();
      return;
    }

    if (password !== confirm) {
      confirmField.classList.add("has-error");
      confirmError.classList.add("is-visible");
      confirmInput.focus();
      return;
    }
    clearConfirmError();

    // ---- SIMULATION ONLY ----
    // No password is stored anywhere — only the username, so the
    // header/session badge can show who is "signed in" for the demo.
    GadgetLens.setSession({ type: "user", username });

    // ---- FUTURE: replace the line above with -----------------
    // await fetch("/api/auth/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username, password }),
    // });
    // ------------------------------------------------------------

    window.location.href = "preferences.html";
  });

  guestBtn.addEventListener("click", () => {
    GadgetLens.startGuestSession();
    window.location.href = "preferences.html";
  });
});
