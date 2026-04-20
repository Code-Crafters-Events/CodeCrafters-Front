import api from "./api";

export const eventsApi = {
  getAll: (page = 0, size = 15) =>
    api.get("/api/v1/events", { params: { page, size } }),

  getById: (id) => api.get(`/api/v1/events/${id}`),

  getByUser: (userId, page = 0, size = 15) =>
    api.get(`/api/v1/events/user/${userId}`, { params: { page, size } }),

  search: (filters, page = 0, size = 15) =>
    api.get("/api/v1/events/search", { params: { ...filters, page, size } }),

  create: (dto) => 
    api.post("/api/v1/events", dto),

  update: (id, dto) => 
    api.put(`/api/v1/events/${id}`, dto),

  delete: (id) => 
    api.delete(`/api/v1/events/${id}`),
};
