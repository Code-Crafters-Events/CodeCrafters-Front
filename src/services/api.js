import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith("/api/auth/");

    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    return Promise.reject(err);
  },
);
export default api;
