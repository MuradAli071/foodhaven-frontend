import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  let token = null;
  try {
    token = localStorage.getItem('foodhavenToken');
  } catch (e) {}

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;
