import api from "./api";

export const locationsApi = {
  create: (dto) => api.post("/api/v1/locations", dto),
};