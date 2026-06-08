import axios from 'axios';

/**
 * Centralized Axios instance.
 * In dev:  Vite proxy forwards /api/* → http://localhost:5000
 * In prod: set VITE_API_URL in frontend .env
 */
const api = axios.create({
  baseURL: 'https://tour-planning-agency-3.onrender.com/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tg_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Request failed';

    // ⚠️  CRITICAL FIX: Never do window.location.href redirect here.
    // That causes a hard page reload that React Router cannot handle,
    // resulting in a blank white screen.
    // Instead, just clear stale tokens silently — AuthContext handles routing.
    if (status === 401) {
      const token = localStorage.getItem('tg_token');
      // Only clear if it's a real backend token (not a demo/local token)
      if (token && !token.startsWith('demo_') && !token.startsWith('local_')) {
        localStorage.removeItem('tg_token');
        localStorage.removeItem('tg_user');
      }
    }

    // Return a rejected promise with a clean Error object
    const err = new Error(message);
    err.status = status;
    err.isApiError = true;
    return Promise.reject(err);
  }
);

export default api;
