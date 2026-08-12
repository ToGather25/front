import axios from "axios";

/**
 * Base API client
 *
 * 환경변수:
 *   VITE_API_BASE_URL   — 백엔드 URL (e.g. https://api.togather.church)
 *   VITE_USE_DUMMY       — "true"이면 모든 서비스가 더미 데이터 반환 (레거시, VITE_DUMMY_DOMAINS로 점진 대체 중)
 *   VITE_DUMMY_DOMAINS   — 콤마 구분 도메인 목록. 이 목록에 있는 도메인만 더미 데이터 사용,
 *                          없는 도메인(tenant/auth 등)은 항상 실제 API 호출.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

let currentChurchId = null;

/** ChurchProvider가 /api/tenant 조회 성공 시 호출 — 이후 모든 요청에 X-Church-Id로 실린다. */
export function setCurrentChurchId(id) {
  currentChurchId = id;
}

// 요청 인터셉터 — JWT 자동 첨부 + 테넌트 헤더
// X-Church-Id는 로컬 개발 전용이 아니다 — 백엔드가 현재 단일 호스트로 배포되어 있어
// host 기반 테넌트 식별이 불가능한 동안 이 헤더가 실제 운영 메커니즘이다
// (global/tenant/ChurchContextFilter.java 참고, 도메인 연결 시 host 기반으로 대체 예정).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (currentChurchId) config.headers["X-Church-Id"] = currentChurchId;
  return config;
});

const REFRESH_URL = "/church/auth/token/refresh";

// 응답 인터셉터 — 401 시 refresh token으로 한 번 갱신 재시도, 실패하면 로그아웃
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const refreshToken = localStorage.getItem("refreshToken");
    const isRefreshRequest = original?.url === REFRESH_URL;
    if (
      err.response?.status === 401 &&
      !isRefreshRequest &&
      !original._retried &&
      refreshToken
    ) {
      original._retried = true;
      try {
        const { data } = await api.post(REFRESH_URL, { refreshToken });
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        return api(original);
      } catch {
        // refresh도 실패 — 아래 로그아웃 처리로 진행
      }
    }
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

/** 더미 모드 여부(레거시 전역 플래그). .env에서 VITE_USE_DUMMY=false 로 끄면 실제 API 호출 */
export const USE_DUMMY = import.meta.env.VITE_USE_DUMMY !== "false";

const dummyDomains = new Set(
  (import.meta.env.VITE_DUMMY_DOMAINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

/** domain(예: "notice", "events")이 아직 더미 데이터를 쓰는지 여부 */
export const isDummy = (domain) => dummyDomains.has(domain);

export default api;
