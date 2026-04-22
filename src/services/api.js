import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      window.dispatchEvent(new CustomEvent("api-connection-error", { 
        detail: "No se pudo conectar con el servidor. ¿Está el backend encendido?" 
      }));
      return Promise.reject(err);
    }
    if (err.response.status >= 500) {
      window.dispatchEvent(new CustomEvent("api-server-error", { 
        detail: err.response.data?.message || "Error interno en el servidor (Posible fallo en Stripe o base de datos)." 
      }));
    }
    const isAuthRoute = err.config?.url?.includes("/api/auth/");
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/home/login";
    }
    return Promise.reject(err);
  },
);
export default api;
