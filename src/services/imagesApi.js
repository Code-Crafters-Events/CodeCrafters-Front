import api from "./api";

export const imagesApi = {
  uploadEventImage: (eventId, userId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/api/v1/images/events/${eventId}`, form, {
      params: { userId },
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadProfileImage: (userId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/api/v1/images/users/${userId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
