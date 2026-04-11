import axios from "axios";

/**
 * Base API client
 *
 * 환경변수:
 *   VITE_API_BASE_URL  — 백엔드 URL (e.g. https://api.togather.church)
 *   VITE_USE_DUMMY     — "true"이면 모든 서비스가 더미 데이터 반환
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 — JWT 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터 — 401 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/** 더미 모드 여부. .env에서 VITE_USE_DUMMY=false 로 끄면 실제 API 호출 */
export const USE_DUMMY = import.meta.env.VITE_USE_DUMMY !== "false";

export default api;
