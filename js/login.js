/* =========================================================
   login.js — Handles the login page (username + password).
   Integrates directly with Flask backend POST /api/auth/login.
   Validates credentials, establishes real session, and handles
   guest bypass.
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
  const submitBtn = form.querySelector('button[type="submit"]');

  function clearErrors() {
    usernameField.classList.remove("has-error");
    usernameError.classList.remove("is-visible");
    usernameError.textContent = "Please enter your username.";
    passwordField.classList.remove("has-error");
    passwordError.classList.remove("is-visible");
    passwordError.textContent = "Please enter your password.";
  }

  usernameInput.addEventListener("input", clearErrors);
  passwordInput.addEventListener("input", clearErrors);

  form.addEventListener("submit", async (event) => {
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

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in...";

      const res = await GadgetLensAPI.auth.login(username, password);
      GadgetLens.setSession({ type: "user", username: res.user.username, id: res.user.id });
      window.location.href = "preferences.html";
    } catch (err) {
      passwordField.classList.add("has-error");
      passwordError.textContent = err.message || "Invalid username or password.";
      passwordError.classList.add("is-visible");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });

  guestBtn.addEventListener("click", () => {
    GadgetLens.startGuestSession();
    window.location.href = "preferences.html";
  });
});
