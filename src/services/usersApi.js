import api from './api';

export const usersApi = {
  getAll:  ()       => api.get('/api/v1/users'),
  getById: (id)     => api.get(`/api/v1/users/${id}`),
  create:  (dto)    => api.post('/api/v1/users', dto),
  update:  (id, dto)=> api.put(`/api/v1/users/${id}`, dto),
  delete:  (id)     => api.delete(`/api/v1/users/${id}`),
};