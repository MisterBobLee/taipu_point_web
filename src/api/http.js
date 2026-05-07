import axios from "axios";
import { ElMessage } from "element-plus";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

function normalizeData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return data;
}

http.interceptors.response.use(
  (response) => {
    if (response.config.method === "get") {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest.url.includes("/api/auth/token/");
    if (isLoginRequest) {
      ElMessage.error('帳號或密碼錯誤');
    } else if (error.response?.status !== 401) {
      ElMessage.error(error.response?.data?.detail || "系統錯誤");
    }
    if (
      !isLoginRequest &&
      error.response?.status === 401
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          localStorage.setItem("access_token", data.access);
          if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return http(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);