import axios from 'axios';
import { useLoadingStore } from '../store/useLoadingStore';
import { useAuthStore } from '@/store/useAuthStore';

export const api = axios.create({
  baseURL: 'https://localhost:7052/', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequests = 0;

api.interceptors.request.use(
  (config) => {
    if (activeRequests === 0) {
      useLoadingStore.getState().setLoading(true);
    }
    activeRequests++;

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) {
      useLoadingStore.getState().setLoading(false);
    }
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      useLoadingStore.getState().setLoading(false);
    }
    
    
    return Promise.reject(error);
  }
);

