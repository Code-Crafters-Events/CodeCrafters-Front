import api from "./api";

export const eventsApi = {
  getAll: (page = 0, size = 15) =>
    api.get("/api/v1/events", { params: { page, size } }),

  getById: (id) => api.get(`/api/v1/events/${id}`),

  getByUser: (userId, page = 0, size = 15) =>
    api.get(`/api/v1/events/user/${userId}`, { params: { page, size } }),

  search: (filters, page = 0, size = 15) =>
    api.get("/api/v1/events/search", { params: { ...filters, page, size } }),

  create: (dto, userId) =>
    api.post("/api/v1/events", dto, { params: { userId } }),

  update: (id, dto, userId) =>
    api.put(`/api/v1/events/${id}`, dto, { params: { userId } }),

  delete: (id, userId) =>
    api.delete(`/api/v1/events/${id}`, { params: { userId } }),
};
