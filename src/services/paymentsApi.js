import api from "./api";

export const paymentsApi = {
  createIntent: (dto) => api.post("/api/v1/payments/create-intent", dto),
};
