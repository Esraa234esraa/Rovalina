import axios from 'axios';
import { useAuthStore, useUserStore } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const adminToken = useAuthStore.getState().token;
  const userToken = useUserStore.getState().token;
  const token = adminToken || userToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      useUserStore.getState().logoutUser();
    }
    return Promise.reject(error);
  }
);

export default api;