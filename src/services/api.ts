import axios from "axios";

/**
 * Tự động xác định API Base URL theo địa chỉ trình duyệt hiện tại:
 * - Mở web tại localhost / 127.0.0.1 -> gọi thẳng http://localhost:5000/api
 * - Mở web qua IP mạng LAN (VD: http://192.168.1.83:5173) -> gọi thẳng http://192.168.1.83:5000/api
 * Giúp không bao giờ bị lỗi net::ERR_CONNECTION_TIMED_OUT khi đổi mạng Wi-Fi.
 */
const resolveInitialBaseUrl = (): string => {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
    return `http://${host}:5000/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

let activeBaseUrl = resolveInitialBaseUrl();

const api = axios.create({
  baseURL: activeBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn baseURL hiện hành và token vào request nếu đã đăng nhập
api.interceptors.request.use(
  (config) => {
    config.baseURL = activeBaseUrl;
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response/error chung + Tự động Failover nếu gặp lỗi kết nối
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as any;
    const isNetworkError =
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("timeout"));

    if (isNetworkError && config && !config._retriedFailover) {
      config._retriedFailover = true;
      const fallbackUrl =
        activeBaseUrl !== "http://localhost:5000/api"
          ? "http://localhost:5000/api"
          : "/api";
      activeBaseUrl = fallbackUrl;
      api.defaults.baseURL = fallbackUrl;
      config.baseURL = fallbackUrl;
      return api(config);
    }

    const requestUrl = error.config?.url || "";
    const isLoginRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/login");

    // Nếu token hết hạn / không hợp lệ ở các API khác và hiện tại chưa ở trang login
    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
