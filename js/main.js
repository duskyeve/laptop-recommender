/* =========================================================
   main.js — Landing page logic. Both primary CTAs start the
   recommendation flow without requiring an account: if the
   visitor already has a session (guest or signed-in), it's
   left alone; otherwise a guest session is started.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  function goToPreferences() {
    if (!GadgetLens.getSession()) {
      GadgetLens.startGuestSession();
    }
    window.location.href = "preferences.html";
  }

  document.getElementById("find-laptop-btn").addEventListener("click", goToPreferences);
  document.getElementById("continue-guest-btn").addEventListener("click", goToPreferences);
});
