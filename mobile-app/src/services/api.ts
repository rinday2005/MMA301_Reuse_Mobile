import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NativeModules, Platform } from 'react-native';
import { storage } from '../utils/storage';
import serverIpConfig from './serverIp.json';

const BE_PORT = serverIpConfig.port || 5000;
const PRIMARY_LAN_IP = serverIpConfig.lanIp || '192.168.1.83';

/**
 * Nhận diện Android Emulator (Android Studio AVD).
 */
export const isAndroidEmulator = (): boolean => {
  if (Platform.OS !== 'android') return false;
  const c: any = (Platform as any).constants || {};
  const text = `${c.Fingerprint || c.fingerprint || ''} ${c.Model || c.model || ''} ${c.Brand || c.brand || ''} ${c.Manufacturer || c.manufacturer || ''} ${c.Hardware || c.hardware || ''}`.toLowerCase();
  return /generic|emulator|sdk_gphone|android sdk|ranchu|goldfish|vbox|qemu/.test(text);
};

/**
 * Tự động lấy IP thời gian thực của máy tính chạy Metro Bundler / Expo Go.
 * Khi điện thoại kết nối vào Expo Go qua Wi-Fi nào, scriptURL / experienceUrl sẽ luôn chứa đúng IP Wi-Fi đó!
 */
const getMetroHostIp = (): string | null => {
  try {
    const candidates = [
      NativeModules?.SourceCode?.scriptURL,
      NativeModules?.ExponentConstants?.experienceUrl,
      NativeModules?.ExponentConstants?.linkingUri,
    ];
    for (const raw of candidates) {
      if (raw && typeof raw === 'string') {
        const match = raw.match(/(?:https?|exp|exps):\/\/([^:/]+)/i);
        const host = match?.[1];
        if (
          host &&
          host !== 'localhost' &&
          host !== '127.0.0.1' &&
          !host.endsWith('.exp.direct') &&
          !host.endsWith('.expo.dev')
        ) {
          return host;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
};

/**
 * Xác định endpoint khởi tạo tối ưu cho từng nền tảng (Web / Android Studio AVD / Điện thoại thật)
 */
const resolveInitialMobileBaseUrl = (): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const webHost = window.location.hostname;
    if (webHost === 'localhost' || webHost === '127.0.0.1') {
      return `http://localhost:${BE_PORT}/api`;
    }
    return `http://${webHost}:${BE_PORT}/api`;
  }

  if (isAndroidEmulator()) {
    return `http://10.0.2.2:${BE_PORT}/api`;
  }

  const metroIp = getMetroHostIp();
  const initialLanIp = metroIp || PRIMARY_LAN_IP;
  return `http://${initialLanIp}:${BE_PORT}/api`;
};

let activeBaseUrl = resolveInitialMobileBaseUrl();

export const getBaseApiUrl = (): string => {
  return activeBaseUrl;
};

export const getServerHost = (): string => {
  return activeBaseUrl.replace(/\/api\/?$/, '');
};

export const API_BASE_URL = activeBaseUrl;

export const api = axios.create({
  baseURL: activeBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storage.setItem('token', token).catch(() => {});
  } else {
    delete api.defaults.headers.common['Authorization'];
    storage.removeItem('token').catch(() => {});
  }
};

export const getAuthToken = (): string | null => {
  return inMemoryToken;
};

/**
 * Tạo danh sách toàn bộ các địa chỉ Backend ứng viên để dò tìm song song
 */
const getCandidateApiUrls = (): string[] => {
  const detectedMetro = getMetroHostIp();
  const webHost =
    Platform.OS === 'web' && typeof window !== 'undefined' ? window.location?.hostname : null;

  return Array.from(
    new Set(
      [
        webHost ? `http://${webHost}:${BE_PORT}/api` : null,
        Platform.OS === 'web' ? `http://localhost:${BE_PORT}/api` : null,
        isAndroidEmulator() ? `http://10.0.2.2:${BE_PORT}/api` : null,
        detectedMetro ? `http://${detectedMetro}:${BE_PORT}/api` : null,
        serverIpConfig.apiUrl,
        serverIpConfig.lanIp ? `http://${serverIpConfig.lanIp}:${BE_PORT}/api` : null,
        ...(serverIpConfig.fallbackIps || []).map((ip: string) => `http://${ip}:${BE_PORT}/api`),
        `http://10.0.2.2:${BE_PORT}/api`,
        `http://localhost:${BE_PORT}/api`,
      ].filter(Boolean) as string[]
    )
  );
};

/**
 * Kiểm tra kết nối song song siêu tốc (Parallel Fast Healthcheck)
 * Dò đồng thời tất cả candidate endpoints qua Promise.any; endpoint nào phản hồi nhanh nhất sẽ được khóa ngay lập tức!
 */
export const checkAndLockWorkingApi = async (): Promise<string> => {
  try {
    const candidateUrls = getCandidateApiUrls();

    const fastestUrl = await Promise.any(
      candidateUrls.map(async (url) => {
        await axios.get(`${url}/health`, { timeout: 1800 });
        return url;
      })
    );

    if (fastestUrl) {
      activeBaseUrl = fastestUrl;
      api.defaults.baseURL = fastestUrl;
      storage.setItem('last_working_api_url', fastestUrl).catch(() => {});
      if (__DEV__) {
        console.log(`[API Ready] Đã khóa kết nối Backend siêu tốc: ${activeBaseUrl}`);
      }
      return fastestUrl;
    }
  } catch {
    // Giữ activeBaseUrl hiện tại nếu chưa dò được
  }
  return activeBaseUrl;
};

// Request Interceptor: Luôn gán baseURL hiện tại và token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = activeBaseUrl;
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

    // Khi gửi multipart FormData trong React Native, xóa Content-Type cố định để engine tự sinh boundary
    if (config.data instanceof FormData && config.headers) {
      delete (config.headers as any)['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Tự động dò tìm lại host sống và gửi lại request ngay lập tức nếu phát hiện timeout hoặc lỗi mạng
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryHost?: boolean };

    const isNetworkError =
      !error.response &&
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout'));

    if (isNetworkError && config && !config._retryHost) {
      config._retryHost = true;
      const previousHost = activeBaseUrl;
      const discoveredUrl = await checkAndLockWorkingApi();

      if (discoveredUrl && discoveredUrl !== previousHost) {
        console.log(`[API Auto-Failover] Chuyển đổi từ ${previousHost} sang ${discoveredUrl}...`);
        config.baseURL = discoveredUrl;
        return api(config);
      }

      // Nếu healthcheck chưa kịp trả về khác biệt, thử luân chuyển sang candidate kế tiếp
      const candidates = getCandidateApiUrls().filter((u) => u !== previousHost);
      if (candidates.length > 0) {
        const nextUrl = candidates[0];
        activeBaseUrl = nextUrl;
        api.defaults.baseURL = nextUrl;
        config.baseURL = nextUrl;
        return api(config);
      }
    }

    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      setAuthToken(null);
      await storage.removeItem('token');
      await storage.removeItem('accessToken');
      await storage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

// Gọi ngầm kiểm tra kết nối song song ngay khi app khởi động
checkAndLockWorkingApi();

export default api;
