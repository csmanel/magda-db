import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  getOne: (id) => api.get(`/tables/${id}`),
  create: (data) => api.post('/tables', { table: data }),
  update: (id, data) => api.put(`/tables/${id}`, { table: data }),
  delete: (id) => api.delete(`/tables/${id}`),
};

export const rowsAPI = {
  getAll: (tableId) => api.get(`/tables/${tableId}/rows`),
  getOne: (tableId, rowId) => api.get(`/tables/${tableId}/rows/${rowId}`),
  create: (tableId, data) => api.post(`/tables/${tableId}/rows`, { row: data }),
  update: (tableId, rowId, data) => api.put(`/tables/${tableId}/rows/${rowId}`, { row: data }),
  delete: (tableId, rowId) => api.delete(`/tables/${tableId}/rows/${rowId}`),
};

export default api;
