import axios from 'axios';
import { useLoadingStore } from '../store/useLoadingStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7200/api', 
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

    // TODO: Adicionar o token JWT aqui
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

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

