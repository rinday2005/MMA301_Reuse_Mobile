import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// Smart Base API configuration for Mobile App
export const getBaseApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // Mobile physical devices / emulators cannot connect to phone's "localhost"
  // Default to developer machine's Wi-Fi LAN IP on port 5000
  return 'http://192.168.100.22:5000/api';
};

export const API_BASE_URL = getBaseApiUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storage.setSync('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    storage.removeSync('token');
  }
};

export const getAuthToken = (): string | null => {
  return inMemoryToken || storage.getSync('token');
};

// Request Interceptor: Auto-attach Bearer token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = inMemoryToken;
    if (!token) {
      token = (await storage.getItem('token')) || (await storage.getItem('accessToken'));
      if (token) {
        inMemoryToken = token;
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle unauthenticated & session expiration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      setAuthToken(null);
      await storage.removeItem('token');
      await storage.removeItem('accessToken');
      await storage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
