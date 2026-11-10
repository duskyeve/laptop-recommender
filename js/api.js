/* =========================================================
   api.js — Centralized API Client for GadgetLens.
   Provides reusable GET, POST, PUT, DELETE request helpers,
   manages session credentials, handles HTTP & network errors,
   supports multiple dev hosts (localhost & 127.0.0.1), and
   defines typed endpoint services.
   ========================================================= */

const GadgetLensAPI = (() => {
  const isDirectBackend = window.location.port === "5000" || window.location.pathname.startsWith("/api");
  
  // Build fallback host candidates based on current location
  const currentHost = window.location.hostname || "127.0.0.1";
  const primaryHost = currentHost === "localhost" ? "localhost" : "127.0.0.1";
  const altHost = primaryHost === "localhost" ? "127.0.0.1" : "localhost";

  let activeBaseUrl = isDirectBackend ? "" : `http://${primaryHost}:5000`;
  const candidateBaseUrls = isDirectBackend ? [""] : [`http://${primaryHost}:5000`, `http://${altHost}:5000`];

  async function executeFetch(url, options) {
    const defaultHeaders = {
      "Accept": "application/json",
    };

    try {
      const stored = localStorage.getItem("gadgetlens_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          defaultHeaders["X-User-Id"] = String(parsed.id);
        }
      }
    } catch (e) {}

    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      credentials: "include", // Ensures session cookies are included in CORS requests
    };

    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMessage = (data && data.message) || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async function request(endpoint, options = {}) {
    if (endpoint.startsWith("http")) {
      return executeFetch(endpoint, options);
    }

    // Try with currently active base URL
    const primaryUrl = `${activeBaseUrl}${endpoint}`;
    try {
      return await executeFetch(primaryUrl, options);
    } catch (err) {
      // If error has status (e.g. 400, 401, 404, 409, 500), the server responded! Do not retry.
      if (err.status) {
        throw err;
      }

      // If network failure and we have alternative candidate URLs, try the alternate host
      for (const candidate of candidateBaseUrls) {
        if (candidate === activeBaseUrl) continue;
        try {
          const altUrl = `${candidate}${endpoint}`;
          const result = await executeFetch(altUrl, options);
          activeBaseUrl = candidate; // Successfully connected on alternate host, remember it
          return result;
        } catch (retryErr) {
          if (retryErr.status) throw retryErr;
        }
      }

      // Both primary and candidate failed to connect
      console.error(`[GadgetLens API] Connection failure communicating with backend endpoints on port 5000.`);
      const netErr = new Error("Unable to connect to the GadgetLens backend server. Please verify the Flask server is running at http://127.0.0.1:5000 (run 'python app.py' inside backend/ or run start.bat).");
      netErr.isNetworkError = true;
      throw netErr;
    }
  }

  return {
    get BASE_URL() {
      return activeBaseUrl;
    },
    request,

    checkHealth() {
      return request("/api/health", { method: "GET" });
    },

    get(endpoint, params = {}) {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${endpoint}?${query}` : endpoint;
      return request(url, { method: "GET" });
    },

    post(endpoint, body = {}) {
      return request(endpoint, { method: "POST", body });
    },

    put(endpoint, body = {}) {
      return request(endpoint, { method: "PUT", body });
    },

    delete(endpoint) {
      return request(endpoint, { method: "DELETE" });
    },

    // Endpoint modules
    auth: {
      register: (username, password) => request("/api/auth/register", { method: "POST", body: { username, password } }),
      login: (username, password) => request("/api/auth/login", { method: "POST", body: { username, password } }),
      logout: () => request("/api/auth/logout", { method: "POST" }),
      me: () => request("/api/auth/me", { method: "GET" }),
    },

    laptops: {
      getAll: (params = {}) => request(`/api/laptops?${new URLSearchParams(params).toString()}`, { method: "GET" }),
      getById: (id) => request(`/api/laptops/${id}`, { method: "GET" }),
      compare: (laptopIds) => request("/api/laptops/compare", { method: "POST", body: { laptop_ids: laptopIds } }),
    },

    recommendations: {
      generate: (preferences) => request("/api/recommendations", { method: "POST", body: preferences }),
      getSaved: () => request("/api/recommendations", { method: "GET" }),
    },

    preferences: {
      save: (preferences) => request("/api/preferences", { method: "POST", body: preferences }),
      get: () => request("/api/preferences", { method: "GET" }),
    },

    savedLaptops: {
      getAll: () => request("/api/saved-laptops", { method: "GET" }),
      save: (laptopId) => request("/api/saved-laptops", { method: "POST", body: { laptop_id: laptopId } }),
      remove: (laptopId) => request(`/api/saved-laptops/${laptopId}`, { method: "DELETE" }),
    },

    feedback: {
      submit: (feedbackData) => request("/api/feedback", { method: "POST", body: feedbackData }),
    },

    chatbot: {
      send: (question) => request("/api/chatbot", { method: "POST", body: { question } }),
    },

    glossary: {
      getAll: () => request("/api/glossary", { method: "GET" }),
      getTerm: (term) => request(`/api/glossary/${encodeURIComponent(term)}`, { method: "GET" }),
    },
  };
})();
