import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

let accessToken = null;
export function setAccessToken(token) {
  accessToken = token || null;
}
export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;
let onAuthFailure = null;
export function registerAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 15000 }
      )
      .then((res) => {
        const token = res.data?.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isRefresh = original?.url?.includes("/auth/refresh");
    const isLogin = original?.url?.includes("/auth/login");
    const isSignup = original?.url?.includes("/auth/signup");

    if (status === 401 && !original?._retry && !isRefresh && !isLogin && !isSignup) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        if (!token) throw new Error("No access token after refresh");
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshErr) {
        setAccessToken(null);
        onAuthFailure?.();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
