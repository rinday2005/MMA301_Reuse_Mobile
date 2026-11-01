import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NativeModules, Platform } from 'react-native';
import { storage } from '../utils/storage';

const DEFAULT_DEV_IP = '192.168.100.22';
const BE_PORT = 5000;

/**
 * Nhận diện Android Emulator (Android Studio AVD).
 * Hỗ trợ cả property chữ hoa và chữ thường trong React Native Platform.constants.
 */
export const isAndroidEmulator = (): boolean => {
  if (Platform.OS !== 'android') return false;
  const c: any = (Platform as any).constants || {};
  const text = `${c.Fingerprint || c.fingerprint || ''} ${c.Model || c.model || ''} ${c.Brand || c.brand || ''} ${c.Manufacturer || c.manufacturer || ''} ${c.Hardware || c.hardware || ''}`.toLowerCase();
  return /generic|emulator|sdk_gphone|android sdk|ranchu|goldfish|vbox|qemu/.test(text);
};

/**
 * Lấy IP của máy chủ chạy Metro Bundler từ scriptURL
 */
const getMetroHostIp = (): string | null => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
      const match = scriptURL.match(/(?:https?|exp|exps):\/\/([^:/]+)/i);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch {
    // ignore
  }
  return null;
};

// Khởi tạo danh sách các URL ứng viên kết nối
const metroIp = getMetroHostIp();
const primaryLanIp = metroIp || DEFAULT_DEV_IP;

// Nếu là Android Emulator: ưu tiên 10.0.2.2 trước, LAN IP làm fallback
// Nếu là Điện thoại thật (Physical Device): ưu tiên LAN IP (từ Metro hoặc 192.168.100.22), 10.0.2.2 làm fallback
let activeBaseUrl = isAndroidEmulator()
  ? `http://10.0.2.2:${BE_PORT}/api`
  : `http://${primaryLanIp}:${BE_PORT}/api`;

export const getBaseApiUrl = (): string => {
  return activeBaseUrl;
};

export const getServerHost = (): string => {
  return activeBaseUrl.replace(/\/api\/?$/, '');
};

export const API_BASE_URL = activeBaseUrl;

if (__DEV__) {
  console.log(`[API] Initial Base URL = ${activeBaseUrl} (IsEmulator: ${isAndroidEmulator()})`);
}

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
    storage.setSync('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    storage.removeSync('token');
  }
};

export const getAuthToken = (): string | null => {
  return inMemoryToken || storage.getSync('token');
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

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * 1. Xử lý 401 hết phiên đăng nhập
 * 2. TỰ ĐỘNG CHUYỂN ĐỔI HOST (AUTO-FAILOVER):
 *    Nếu gặp Network Error trên 10.0.2.2 (điện thoại thật) -> tự động chuyển sang LAN IP (192.168.100.22) và thử lại.
 *    Nếu gặp Network Error trên LAN IP (giả lập Android Studio bị firewall) -> tự động chuyển sang 10.0.2.2 và thử lại.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryHost?: boolean };

    // Kiểm tra lỗi mạng (Network Error / connection refused / timeout)
    const isNetworkError =
      !error.response &&
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout'));

    if (isNetworkError && config && !config._retryHost) {
      config._retryHost = true;

      // Xác định host thay thế
      const currentHost = activeBaseUrl;
      let nextBaseUrl = '';

      if (currentHost.includes('10.0.2.2')) {
        // Đang dùng emulator loopback nhưng thất bại -> chuyển sang LAN IP (cho điện thoại thật)
        const currentMetro = getMetroHostIp();
        const lanIp = currentMetro || DEFAULT_DEV_IP;
        nextBaseUrl = `http://${lanIp}:${BE_PORT}/api`;
      } else {
        // Đang dùng LAN IP nhưng thất bại -> chuyển sang 10.0.2.2 (cho Android Studio Emulator)
        nextBaseUrl = `http://10.0.2.2:${BE_PORT}/api`;
      }

      if (nextBaseUrl && nextBaseUrl !== currentHost) {
        console.log(`[API Auto-Failover] Chuyển kết nối từ ${currentHost} sang ${nextBaseUrl} để tương thích thiết bị...`);
        activeBaseUrl = nextBaseUrl;
        config.baseURL = nextBaseUrl;
        return api(config);
      }
    }

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

// Khởi chạy ping ngầm siêu nhẹ khi ứng dụng khởi động để chọn ngay địa chỉ tối ưu nhất
(async () => {
  try {
    const detectedMetro = getMetroHostIp();
    const lan = detectedMetro || DEFAULT_DEV_IP;
    const candidates = [
      `http://10.0.2.2:${BE_PORT}/api`,
      `http://${lan}:${BE_PORT}/api`,
    ];

    // Thử kết nối nhanh song song với timeout 1.2s
    const pingPromises = candidates.map((url) =>
      axios
        .get(`${url}/thrift/public?limit=1`, { timeout: 1200 })
        .then(() => url)
        .catch(() => null)
    );

    const fastestWorking = await Promise.race(pingPromises);
    if (fastestWorking) {
      activeBaseUrl = fastestWorking;
      if (__DEV__) {
        console.log(`[API Ping] Đã tự động kết nối thành công tới máy chủ: ${activeBaseUrl}`);
      }
    }
  } catch {
    // Bỏ qua nếu chưa bật BE
  }
})();

export default api;
