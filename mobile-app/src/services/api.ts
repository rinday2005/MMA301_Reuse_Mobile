import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NativeModules, Platform } from 'react-native';
import { storage } from '../utils/storage';

const DEFAULT_DEV_IP = '192.168.1.23';
const BE_PORT = 5000;

/**
 * Nhận diện Android Emulator (Android Studio AVD).
 * Emulator luôn truy cập máy host qua 10.0.2.2, không phụ thuộc Wi-Fi/IP/firewall.
 */
const isAndroidEmulator = (): boolean => {
  if (Platform.OS !== 'android') return false;
  const c: any = (Platform as any).constants || {};
  const text = `${c.Fingerprint || ''} ${c.Model || ''} ${c.Brand || ''} ${c.Manufacturer || ''}`.toLowerCase();
  return /generic|emulator|sdk_gphone|android sdk|ranchu|goldfish/.test(text);
};

/**
 * Thứ tự ưu tiên:
 * 1. Android Emulator  -> http://10.0.2.2:5000/api
 * 2. Điện thoại thật   -> IP máy tính lấy từ URL bundle của Metro
 * 3. EXPO_PUBLIC_API_URL (.env)
 * 4. IP Wi-Fi mặc định
 */
export const getBaseApiUrl = (): string => {
  if (isAndroidEmulator()) {
    return `http://10.0.2.2:${BE_PORT}/api`;
  }

  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
      const match = scriptURL.match(/(?:https?|exp|exps):\/\/([^:/]+)/i);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:${BE_PORT}/api`;
      }
    }
  } catch {
    // ignore
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  return `http://${DEFAULT_DEV_IP}:${BE_PORT}/api`;
};

export const API_BASE_URL = getBaseApiUrl();

if (__DEV__) {
  // Giúp chẩn đoán nhanh: xem app đang gọi tới địa chỉ nào
  console.log(`[API] Base URL = ${API_BASE_URL}`);
}

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

// Request Interceptor: Dynamic host check + auto-attach Bearer token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Luôn dùng cùng một logic chọn địa chỉ BE (emulator -> 10.0.2.2, máy thật -> IP Metro)
    config.baseURL = getBaseApiUrl();
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
