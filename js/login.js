/* =========================================================
   login.js — Handles the login page (username + password).

   PROTOTYPE ONLY — NOT REAL AUTHENTICATION.
   There is no backend yet, so this file cannot actually verify
   a username/password against stored credentials. It only
   checks that both fields are filled in, then starts a local
   "signed in" session so the rest of the prototype (save,
   feedback, saved-laptops view) can demonstrate what happens
   once a user IS signed in.

   The password is validated for presence only — it is never
   stored, compared, or persisted anywhere, in localStorage or
   otherwise.

   FUTURE BACKEND INTEGRATION POINT:
       POST /api/auth/login   { username, password }
   Flask will hash-compare the password against the stored
   password_hash and issue a real session/token. This file's
   local "any non-empty credentials succeed" behavior will be
   replaced entirely by that response.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const usernameField = document.getElementById("username-field");
  const usernameInput = document.getElementById("username");
  const usernameError = document.getElementById("username-error");
  const passwordField = document.getElementById("password-field");
  const passwordInput = document.getElementById("password");
  const passwordError = document.getElementById("password-error");
  const guestBtn = document.getElementById("guest-btn");

  function clearErrors() {
    usernameField.classList.remove("has-error");
    usernameError.classList.remove("is-visible");
    passwordField.classList.remove("has-error");
    passwordError.classList.remove("is-visible");
  }

  usernameInput.addEventListener("input", clearErrors);
  passwordInput.addEventListener("input", clearErrors);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    let hasError = false;

    if (!username) {
      usernameField.classList.add("has-error");
      usernameError.classList.add("is-visible");
      hasError = true;
    }
    if (!password) {
      passwordField.classList.add("has-error");
      passwordError.classList.add("is-visible");
      hasError = true;
    }
    if (hasError) return;

    // ---- SIMULATION ONLY: no real credential check happens here ----
    GadgetLens.setSession({ type: "user", username });

    // ---- FUTURE: replace the line above with -----------------
    // const res = await fetch("/api/auth/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username, password }),
    // });
    // Flask returns a real session/token on success.
    // ------------------------------------------------------------

    window.location.href = "preferences.html";
  });

  guestBtn.addEventListener("click", () => {
    GadgetLens.startGuestSession();
    window.location.href = "preferences.html";
  });
});
