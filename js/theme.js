/* =========================================================
   theme.js — Shared light/dark theme toggle, included on every
   page. Persists the choice in localStorage and applies it via
   a data-theme attribute on <html>, which style.css reads.

   There are exactly TWO themes: light (default/no attribute) and
   dark. No third "neon" mode exists anywhere in this project.

   This file also renders the small session badge ("Guest" or a
   signed-in username) found in the header of every page other
   than the landing page, since both concerns are simple, global
   UI state that every page needs.
   ========================================================= */

const GadgetLens = {
  THEME_KEY: "gadgetlens_theme",
  SESSION_KEY: "gadgetlens_session",

  /* ---------------- Theme ---------------- */
  getTheme() {
    return localStorage.getItem(this.THEME_KEY) || "light";
  },

  applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(this.THEME_KEY, theme);

    document.querySelectorAll(".theme-toggle button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.theme === theme);
    });
  },

  initThemeToggle() {
    // Apply saved/default theme immediately (before paint where possible).
    this.applyTheme(this.getTheme());

    document.querySelectorAll(".theme-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => this.applyTheme(btn.dataset.theme));
    });
  },

  /* ---------------- Session (guest vs. signed-in user) ----------------
     PROTOTYPE ONLY. This is not a real session/token — just a small
     localStorage flag so the demo can distinguish "Guest" from
     "signed in" behavior (save/feedback gating, etc.). The future
     Flask backend will issue and validate real sessions. */
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY));
    } catch (e) {
      return null;
    }
  },

  setSession(session) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  startGuestSession() {
    this.setSession({ type: "guest" });
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isSignedIn() {
    const session = this.getSession();
    return !!session && session.type === "user";
  },

  /* Renders the small "Guest" / "username" indicator + sign-out
     control into any element with id="session-badge" on the page. */
  renderSessionBadge() {
    const el = document.getElementById("session-badge");
    if (!el) return;

    const session = this.getSession();

    if (!session) {
      el.innerHTML = `<a href="login.html" style="font-size:0.9rem;">Sign in</a>`;
      return;
    }

    if (session.type === "guest") {
      el.innerHTML = `
        <span class="session-badge">
          <span class="session-badge__avatar is-guest">G</span>
          Guest
        </span>
        <a href="login.html" style="font-size:0.85rem;">Sign in</a>
      `;
      return;
    }

    const initial = (session.username || "U").charAt(0).toUpperCase();
    el.innerHTML = `
      <span class="session-badge">
        <span class="session-badge__avatar">${initial}</span>
        ${session.username}
      </span>
      <button type="button" class="btn-text" id="sign-out-btn" style="font-size:0.85rem;">Sign out</button>
    `;

    const signOutBtn = document.getElementById("sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        this.clearSession();
        window.location.href = "index.html";
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  GadgetLens.initThemeToggle();
  GadgetLens.renderSessionBadge();
});
