import api from "./api";

export const ticketsApi = {
  register: (eventId) =>
    api.post("/api/v1/tickets", null, { params: { eventId } }),

  unregister: (eventId) =>
    api.delete("/api/v1/tickets", { params: { eventId } }),

  getByUser: (userId, page = 0, size = 15) =>
    api.get(`/api/v1/tickets/user/${userId}`, { params: { page, size } }),

  getByEvent: (eventId, page = 0, size = 15) =>
    api.get(`/api/v1/tickets/event/${eventId}`, { params: { page, size } }),

  verify: (verificationCode) =>
    api.get(`/api/v1/tickets/verify/${verificationCode}`),

  getCount: () =>
    api.get("/api/v1/tickets/count"),
};
