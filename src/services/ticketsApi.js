import api from "./api";

export const ticketsApi = {
  register: (userId, eventId) =>
    api.post("/api/v1/tickets", null, { params: { userId, eventId } }),

  unregister: (userId, eventId) =>
    api.delete("/api/v1/tickets", { params: { userId, eventId } }),

  getByUser: (userId, page = 0, size = 10) =>
    api.get(`/api/v1/tickets/user/${userId}`, { params: { page, size } }),

  getByEvent: (eventId, page = 0, size = 10) =>
    api.get(`/api/v1/tickets/event/${eventId}`, { params: { page, size } }),

  verify: (verificationCode) =>
    api.get(`/api/v1/tickets/verify/${verificationCode}`),
};
