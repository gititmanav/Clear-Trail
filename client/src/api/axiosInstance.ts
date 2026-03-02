import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor: global error handling ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Something went wrong";

    // Auto-redirect on 401 (session expired)
    if (error.response?.status === 401) {
      // Don't toast on /auth/me — that's just a session check
      if (!error.config?.url?.includes("/auth/me")) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
