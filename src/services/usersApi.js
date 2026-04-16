import api from "./api";

export const usersApi = {
  getAll: () => api.get("/api/v1/users"),
  getById: (id) => api.get(`/api/v1/users/${id}`),
  update: (id, dto) => api.put(`/api/v1/users/${id}`, dto),
  delete: (id) => api.delete(`/api/v1/users/${id}`),
  updateProfile: (id, dto) => api.patch(`/api/v1/users/${id}/profile`, dto),
};
