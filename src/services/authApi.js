import api from "./api";

export const authApi = {
  register: (dto) => api.post("/api/auth/register", dto),
  login: (dto) => api.post("/api/auth/login", dto),
};
