# 백엔드 연동 — 기반 작업(테넌시 + 인증) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ChurchContext`가 실제 백엔드 `GET /api/tenant`를 호출하도록 바꾸고, 로그인·회원가입·가입완결·로그아웃·토큰갱신이 실제 백엔드 API(`/Users/myewon/Desktop/back`)와 연동되도록 만든다 — 이후 모든 도메인 사이클(공지·행사·갤러리·주보·...)의 선행 기반.

**Architecture:** `src/services/api.js`(공용 axios 클라이언트)에 도메인별 더미 전환 플래그(`isDummy`)와 테넌트 헤더(`X-Church-Id`) 부착, 401 시 refresh 재시도 로직을 추가한다. `ChurchContext`는 정적 `church.config.js`를 fallback 템플릿으로 유지하되 `/api/tenant` 응답을 얕게 병합해 덮어쓴다. `auth.jsx`는 하드코딩된 데모 계정 우회를 제거하고 실제 로그인/가입/가입완결/로그아웃 API를 호출하도록 재작성한다. `Register.jsx`/`SignupNext.jsx`는 로컬 페이크 지연·하드코딩 테스트 픽스처를 걷어내고 실제 API 응답(성공/409/404 에러코드)에 따라 분기한다. 마지막으로 로컬 백엔드에서 실제로 로그인해볼 수 있도록 `back` 저장소에 순수 시드 데이터 스크립트를 추가한다.

**Tech Stack:** React 19, React Router v7, Axios 1.x, Vitest + Testing Library, (백엔드) Spring Boot 3.4 + PostgreSQL + Flyway.

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-08-11-backend-integration-foundation-design.md`
- `VITE_USE_DUMMY`(전역 불리언)를 `VITE_DUMMY_DOMAINS`(콤마 구분 목록)로 교체한다. `tenant`와 `auth`는 이 플래그를 아예 쓰지 않고 이 사이클부터 항상 실제 API — `.env` 기본값은 `VITE_DUMMY_DOMAINS=notice,events,gallery,jubo,sermon,my,member,contact`(공지·행사·갤러리·주보·설교·마이페이지·교적부·문의는 각자의 후속 사이클까지 더미 유지).
- 기존 `src/services/*.js`(notice/events/gallery/jubo/sermon)의 `USE_DUMMY` import는 이번 계획에서 **건드리지 않는다** — `api.js`는 하위 호환을 위해 `USE_DUMMY`를 계속 export한다.
- `X-Church-Id` 헤더는 백엔드가 현재(단일 호스트 배포) 요구하는 실제 운영 메커니즘이다 — "로컬 전용" 취급하지 말고 항상 부착한다.
- 백엔드(`/Users/myewon/Desktop/back`)의 API 계약(엔드포인트·요청/응답 shape)은 고정 — 프론트가 적응한다. 유일한 예외는 로컬 개발용 시드 데이터 스크립트(코드/로직 아닌 순수 데이터 픽스처).
- 자동화 테스트(vitest)는 전부 `vi.mock("@/services/api", ...)`로 API 호출을 모킹해 결정론적으로 유지한다 — 실제 네트워크 호출 없음.
- 회원가입 이메일 요구사항: 백엔드가 "username에 '@'가 있으면 email로도 저장"하는 조건부 로직이라, `SignupNext.jsx`의 `username` 필드는 이메일 형식을 요구하도록 프론트에서 강제한다(백엔드 고정 원칙상 프론트 쪽 우회).
- 절대로 origin에 push하지 않는다 — 사용자의 명시적 승인 없이는 로컬 커밋까지만.

---

## 파일 구조

```
src/services/api.js                    — 수정: isDummy, setCurrentChurchId, X-Church-Id 헤더, 401 refresh 재시도
src/services/tenantService.js          — 신규: getTenant(domain)
src/contexts/ChurchContext.jsx         — 수정: /api/tenant 실연동 + fallback 병합
src/contexts/ChurchContext.test.jsx    — 신규
src/utils/apiErrors.js                 — 신규: getErrorMessage(err)
src/contexts/auth.jsx                  — 수정: login/register/completeRegistration/logout 실연동
src/contexts/auth.test.jsx             — 신규
src/pages/Register/Register.jsx        — 수정: 실제 register() 호출, 테스트 픽스처 분기 제거
src/pages/Register/Register.test.jsx   — 수정: 실 API 모드 기준으로 재작성
src/pages/Register/SignupNext.jsx      — 수정: verify/check-username 제거, 이메일형식 강제, completeRegistration 연동
src/pages/Register/SignupNext.test.jsx — 수정: 실 API 모드 기준으로 재작성
src/routes.test.jsx                    — 수정: Provider 트리 통합 확인 추가
.env                                   — 수정: VITE_DUMMY_DOMAINS, VITE_DEV_CHURCH_DOMAIN 추가

(별도 저장소 /Users/myewon/Desktop/back)
scripts/seed-local.sql                 — 신규: 로컬 개발용 교회/계정 시드
README.md                              — 수정: 로컬 실행 순서에 시드 적용 단계 추가
```

## Task 1: `api.js` — 도메인별 더미 플래그, 테넌트 헤더, 401 refresh 재시도

**Files:**
- Modify: `src/services/api.js`

**Interfaces:**
- Produces: `isDummy(domain: string): boolean`, `setCurrentChurchId(id: number|string): void`. 기존 `USE_DUMMY`(boolean), `api`(default export, axios 인스턴스)는 시그니처 변경 없이 유지.

- [ ] **Step 1: `api.js`를 아래 내용으로 전체 교체**

```js
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

// 응답 인터셉터 — 401 시 refresh token으로 한 번 갱신 재시도, 실패하면 로그아웃
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const refreshToken = localStorage.getItem("refreshToken");
    if (err.response?.status === 401 && !original._retried && refreshToken) {
      original._retried = true;
      try {
        const { data } = await api.post("/church/auth/token/refresh", { refreshToken });
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
```

- [ ] **Step 2: `.env`에 신규 변수 추가**

`.env` 파일 끝에 추가:

```
# 도메인별 더미 데이터 전환 목록 (콤마 구분). 여기 없는 도메인(tenant/auth)은 항상 실제 API.
VITE_DUMMY_DOMAINS=notice,events,gallery,jubo,sermon,my,member,contact

# 로컬 개발용 교회 도메인 (localhost는 어떤 교회에도 안 매핑되므로 override)
VITE_DEV_CHURCH_DOMAIN=algok.togather.local
```

- [ ] **Step 3: 빌드로 문법 확인**

Run: `pnpm run build`
Expected: 에러 없이 완료(이 태스크는 아직 아무도 `isDummy`/`setCurrentChurchId`를 안 쓰므로 별도 단위 테스트는 없음 — Task 2에서 소비되면서 함께 검증됨).

- [ ] **Step 4: 커밋**

```bash
git add src/services/api.js .env
git commit -m "feat: api.js에 도메인별 더미 플래그·테넌트 헤더·401 refresh 재시도 추가"
```

---

## Task 2: 테넌시 실연동 — `tenantService.js` + `ChurchContext.jsx`

**Files:**
- Create: `src/services/tenantService.js`
- Modify: `src/contexts/ChurchContext.jsx`
- Test: `src/contexts/ChurchContext.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `api`(default export), `setCurrentChurchId`.
- Produces: `getTenant(domain: string): Promise<object>`. `ChurchProvider`가 반환하는 컨텍스트 값 `{church, status: "loading"|"ready"|"error"}` — `useChurch()`는 여전히 `{church, loading}` 형태로 반환(하위 호환, `loading = status === "loading"`).

- [ ] **Step 1: `tenantService.js` 생성**

```js
import api from "./api";

/**
 * 테넌트(교회) 식별 + 설정 조회
 * @param {string} domain - 교회 도메인(호스트명)
 * @returns {Promise<object>} { id(숫자 PK), name, ...church.config.js와 동일한 나머지 필드 }
 */
export async function getTenant(domain) {
  const res = await api.get("/tenant", { params: { domain } });
  return res.data.data;
}
```

- [ ] **Step 2: `ChurchContext.test.jsx` 작성 (실패 확인용)**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import { ChurchProvider, useChurch } from "./ChurchContext";
import defaultConfig from "@/config/church.config";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn() },
  setCurrentChurchId: vi.fn(),
}));

import api, { setCurrentChurchId } from "@/services/api";

function Probe() {
  const { church, loading } = useChurch();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="name">{church.name}</span>
      <span data-testid="tel">{church.tel}</span>
    </div>
  );
}

describe("ChurchContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기 렌더 시 defaultConfig로 즉시 보여준다(로딩 중에도 화면이 비지 않음)", () => {
    api.get.mockReturnValue(new Promise(() => {})); // 영구 대기 — 아직 응답 없음
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("name").textContent).toBe(defaultConfig.name);
  });

  it("tenant 조회 성공 시 응답 데이터로 교체되고 setCurrentChurchId가 호출된다", async () => {
    api.get.mockResolvedValue({
      data: { data: { id: 42, name: "테스트교회", tel: "02-0000-0000" } },
    });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("테스트교회"));
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(setCurrentChurchId).toHaveBeenCalledWith(42);
  });

  it("tenant 응답에 없는 필드는 defaultConfig 값으로 fallback된다", async () => {
    // API가 nav 필드를 안 내려줘도(예: address 등 일부 필드 누락) church.nav는 defaultConfig 값을 유지해야 한다
    api.get.mockResolvedValue({ data: { data: { id: 1, name: "부분응답교회" } } });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("부분응답교회"));
    // tel은 응답에 없었으므로 defaultConfig.tel 그대로여야 한다
    expect(screen.getByTestId("tel").textContent).toBe(defaultConfig.tel);
  });

  it("tenant 조회 실패 시 에러 화면을 보여준다", async () => {
    api.get.mockRejectedValue(new Error("network error"));
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByText("교회 정보를 찾을 수 없습니다.")).toBeInTheDocument());
    expect(screen.queryByTestId("name")).not.toBeInTheDocument();
  });

  it("initialChurch가 주어지면 fetch를 생략하고 즉시 ready 상태다(테스트 주입용)", () => {
    render(
      <ChurchProvider initialChurch={{ ...defaultConfig, name: "주입교회" }}>
        <Probe />
      </ChurchProvider>,
    );
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("name").textContent).toBe("주입교회");
    expect(api.get).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/contexts/ChurchContext.test.jsx`
Expected: FAIL — 지금 `ChurchContext.jsx`는 `/api/tenant`를 아예 호출하지 않고 `loading`이 항상 `false`, 에러 화면도 없으므로 대부분의 케이스가 실패해야 한다.

- [ ] **Step 4: `ChurchContext.jsx` 전체 교체**

```jsx
import { createContext, useContext, useState, useEffect } from "react";
import defaultConfig from "@/config/church.config";
import { getTenant } from "@/services/tenantService";
import { setCurrentChurchId } from "@/services/api";

const ChurchContext = createContext(null);

function TenantErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-1 px-6">
      <p className="text-body-2 text-grey-8">교회 정보를 찾을 수 없습니다.</p>
    </div>
  );
}

/**
 * ChurchProvider
 *
 * /api/tenant를 호출해 테넌트(교회) 설정을 가져온다. 응답을 church.config.js(defaultConfig) 위에
 * 얕게 병합하므로, 백엔드가 일부 필드를 안 내려줘도 화면이 깨지지 않는다.
 *
 * initialChurch: 테스트에서 커스텀 config를 주입할 때만 사용(실제 앱에서는 전달하지 않음) —
 * 주어지면 fetch 자체를 생략한다.
 */
export function ChurchProvider({ children, initialChurch }) {
  const [state, setState] = useState({
    church: initialChurch ?? defaultConfig,
    status: initialChurch ? "ready" : "loading",
  });

  useEffect(() => {
    if (initialChurch) return;
    const domain = import.meta.env.VITE_DEV_CHURCH_DOMAIN || window.location.hostname;
    getTenant(domain)
      .then((data) => {
        setCurrentChurchId(data.id);
        setState({ church: { ...defaultConfig, ...data }, status: "ready" });
      })
      .catch(() => setState((s) => ({ ...s, status: "error" })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChurchContext.Provider value={state}>
      {state.status === "error" ? <TenantErrorScreen /> : children}
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used inside ChurchProvider");
  return { church: ctx.church, loading: ctx.status === "loading" };
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `pnpm test:run src/contexts/ChurchContext.test.jsx`
Expected: PASS (5개 전부)

- [ ] **Step 6: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 기존 모든 테스트 통과 + 신규 5개 포함 증가. `useChurch()`의 `loading` 반환값을 실제로 참조하는 기존 코드가 없음을 계획 수립 시 이미 grep으로 확인했으므로(스펙 문서 "확인 필요" 항목 해소), 회귀 없어야 한다.

Run: `pnpm run build`
Expected: 에러 없이 완료.

- [ ] **Step 7: 커밋**

```bash
git add src/services/tenantService.js src/contexts/ChurchContext.jsx src/contexts/ChurchContext.test.jsx
git commit -m "feat: ChurchContext가 /api/tenant를 실제로 호출하도록 연동

기존 정적 church.config.js는 fallback 템플릿으로 유지하고, 테넌트
응답을 그 위에 얕게 병합한다. 로딩 중에는 기존처럼 기본값을 바로
보여주고, 실패(T001)일 때만 전체 화면 에러로 전환한다."
```

---

## Task 3: 인증 실연동 — `apiErrors.js` + `auth.jsx`

**Files:**
- Create: `src/utils/apiErrors.js`
- Modify: `src/contexts/auth.jsx`
- Test: `src/contexts/auth.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `api`(default export).
- Produces: `getErrorMessage(err): string`. `useAuth()`가 반환하는 `{currentUser, setCurrentUser, login, logout, register, completeRegistration}` — `login({email,password}): Promise<void>`(성공 시 currentUser 세팅+navigate), `register(payload): Promise<{requestId,status}>`(currentUser 세팅도 navigate도 안 함, 실패 시 throw), `completeRegistration({token,username,password}): Promise<void>`(성공 시 currentUser/navigate 없음, 실패 시 throw — 로그인은 호출부가 별도로 `login()`을 호출해야 함), `logout(): void`.

- [ ] **Step 1: `apiErrors.js` 생성**

```js
const ERROR_MESSAGES = {
  A006: "이메일 또는 비밀번호가 올바르지 않습니다.",
  SU001: "이미 존재하거나 승인 처리 중인 계정입니다. 관리팀에 문의해 주세요.",
  SU004: "개인정보 수집·이용에 동의해 주세요.",
  SU005: "유효하지 않거나 만료된 링크입니다. 관리팀에 문의해 주세요.",
  T001: "교회 정보를 찾을 수 없습니다.",
};

/**
 * axios 에러에서 백엔드 에러코드({success:false, code, message})를 읽어
 * 사용자에게 보여줄 한국어 메시지로 변환한다. 매핑에 없는 코드는 범용 메시지로 폴백.
 */
export function getErrorMessage(err) {
  const code = err.response?.data?.code;
  return ERROR_MESSAGES[code] ?? "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
```

- [ ] **Step 2: `auth.test.jsx` 작성 (실패 확인용)**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthProvider, useAuth } from "./auth";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

// 렌더 중 useAuth() 반환값을 모듈 변수에 캡처해서, 테스트가 버튼 클릭 시뮬레이션 대신
// login/register/completeRegistration/logout을 직접 호출하고 await할 수 있게 한다
// (클릭 이벤트 핸들러는 내부에서 에러를 안 잡으므로, 실패 케이스를 클릭으로 검증하면
// unhandled rejection이 생겨 테스트가 불안정해진다).
let authRef;
function Probe() {
  authRef = useAuth();
  return <span data-testid="user">{authRef.currentUser ? authRef.currentUser.email : "none"}</span>;
}

function renderAuth() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authRef = undefined;
  });

  it("login 성공 시 currentUser를 세팅하고 토큰을 저장한다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: { email: "hong@example.com", name: "홍길동", isAdmin: false },
        token: "access-token",
        refreshToken: "refresh-token",
      },
    });
    renderAuth();

    await authRef.login({ email: "hong@example.com", password: "pw1234!" });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "hong@example.com",
      password: "pw1234!",
    });
    expect(localStorage.getItem("token")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("hong@example.com"));
  });

  it("login 실패(A006) 시 에러를 던지고 currentUser는 세팅되지 않는다", async () => {
    api.post.mockRejectedValue({ response: { status: 401, data: { code: "A006" } } });
    renderAuth();

    await expect(
      authRef.login({ email: "hong@example.com", password: "wrong" }),
    ).rejects.toBeTruthy();

    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("register 성공 시 currentUser를 세팅하지 않는다(승인 대기, 자동 로그인 없음)", async () => {
    api.post.mockResolvedValue({
      data: { success: true, data: { requestId: 1, status: "PENDING" }, token: null },
    });
    renderAuth();

    const result = await authRef.register({
      name: "홍길동",
      birthdate: "2000-01-01",
      phone: "010-1234-5678",
      isNewcomer: true,
      agreePrivacy: true,
    });

    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      name: "홍길동",
      birthdate: "2000-01-01",
      phone: "010-1234-5678",
      isNewcomer: true,
      agreePrivacy: true,
    });
    expect(result).toEqual({ requestId: 1, status: "PENDING" });
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("completeRegistration 성공 시 register/complete만 호출하고 로그인/currentUser 세팅은 하지 않는다", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderAuth();

    await authRef.completeRegistration({
      token: "tok",
      username: "hong@example.com",
      password: "pw1234!",
    });

    expect(api.post).toHaveBeenCalledWith("/auth/register/complete", {
      token: "tok",
      username: "hong@example.com",
      password: "pw1234!",
    });
    // login은 별도로 호출부가 해야 하므로 여기선 /auth/login이 호출되지 않는다
    expect(api.post).not.toHaveBeenCalledWith("/auth/login", expect.anything());
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("logout은 로그아웃 API를 시도하고 로컬 상태를 정리한다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    localStorage.setItem("token", "t");
    localStorage.setItem("refreshToken", "r");
    api.post.mockResolvedValue({ data: { success: true } });
    renderAuth();

    await authRef.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("logout은 API 호출이 실패해도 로컬 상태 정리는 진행한다(best-effort)", async () => {
    localStorage.setItem("token", "t");
    api.post.mockRejectedValue(new Error("network down"));
    renderAuth();

    await authRef.logout();

    expect(localStorage.getItem("token")).toBeNull();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/contexts/auth.test.jsx`
Expected: FAIL — 지금 `auth.jsx`는 raw `axios`를 상대경로(`/auth/login`)로 호출하고(공용 `api` 클라이언트 미사용, 모킹 대상과 다름), `register`가 즉시 `currentUser`를 세팅하며, `completeRegistration` 함수 자체가 없고, `logout`이 API를 호출하지 않는다.

- [ ] **Step 4: `auth.jsx` 전체 교체**

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/services/api";

export const authContext = createContext(null);

export function useAuth() {
  return useContext(authContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  async function login({ email, password }) {
    const res = await api.post("/auth/login", { email, password });
    const user = res.data.data;
    setCurrentUser(user);
    localStorage.setItem("token", res.data.token);
    if (res.data.refreshToken) localStorage.setItem("refreshToken", res.data.refreshToken);
    void navigate(user.isAdmin ? "/admin" : "/");
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    return res.data.data;
  }

  async function completeRegistration({ token, username, password }) {
    const res = await api.post("/auth/register/complete", { token, username, password });
    return res.data;
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/church/auth/logout", { refreshToken });
    } catch {
      // best-effort — 실패해도 로컬 상태 정리는 진행한다
    }
    setCurrentUser(null);
    localStorage.clear();
    void navigate("/login");
  }

  return (
    <authContext.Provider
      value={{ currentUser, setCurrentUser, login, logout, register, completeRegistration }}
    >
      {children}
    </authContext.Provider>
  );
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `pnpm test:run src/contexts/auth.test.jsx`
Expected: PASS (7개 전부)

- [ ] **Step 6: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 기존 테스트 전부 통과 + 신규 7개. **주의**: `logout()`이 이제 `/login`으로 이동한다(기존엔 `/`) — 기존 테스트 중 로그아웃 후 `/`로 이동함을 가정한 게 있는지 실행 결과에서 확인하고, 있다면 실제 기대 동작(로그아웃 후 로그인 페이지로 보내는 게 더 안전한 UX)에 맞춰 그 테스트를 수정한다.

Run: `pnpm run build`
Expected: 에러 없이 완료.

- [ ] **Step 7: 커밋**

```bash
git add src/utils/apiErrors.js src/contexts/auth.jsx src/contexts/auth.test.jsx
git commit -m "feat: auth.jsx가 실제 로그인/회원가입/가입완결/로그아웃 API와 연동

하드코딩된 DUMMY_USER/DUMMY_ADMIN 데모 계정 우회를 제거했다. register는
승인 대기 모델이라 더 이상 자동 로그인하지 않고, completeRegistration은
신규 함수로 추가했다(가입완결 자체는 토큰을 안 주므로 로그인은 호출부가
별도로 해야 한다). logout은 실제 로그아웃 API를 best-effort로 시도한다."
```

---

## Task 4: `Register.jsx` 실연동

**Files:**
- Modify: `src/pages/Register/Register.jsx`
- Test: `src/pages/Register/Register.test.jsx`

**Interfaces:**
- Consumes: Task 3의 `useAuth().register`, `getErrorMessage`.

- [ ] **Step 1: `Register.test.jsx`를 아래 내용으로 전체 교체 (TDD — 먼저 실패 확인)**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Register from "./Register";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

function renderRegister() {
  return renderWithChurch(<Register />, { withRouter: true, withAuth: true });
}

async function fillBasicFields(user, container, { name = "김철수", phone = "010-1111-2222" } = {}) {
  await user.type(screen.getByPlaceholderText("홍길동"), name);
  await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1995");
  await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "5");
  await user.selectOptions(container.querySelector('select[name="birthDay"]'), "10");
  await user.type(screen.getByPlaceholderText("010-0000-0000"), phone);
  await user.click(screen.getByLabelText("새신자입니다"));
  await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
}

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("개인정보 동의 전에는 제출 버튼이 비활성화된다", () => {
    renderRegister();
    expect(screen.getByRole("button", { name: "가입 신청하기" })).toBeDisabled();
  });

  it("필수 정보를 입력하고 동의하면 제출 버튼이 활성화되고, 제출 성공 시 완료 화면으로 전환된다", async () => {
    api.post.mockResolvedValue({ data: { data: { requestId: 1, status: "PENDING" }, token: null } });
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container);
    const submitBtn = screen.getByRole("button", { name: "가입 신청하기" });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    await waitFor(
      () => expect(screen.getByText("가입 신청이 완료되었습니다")).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(api.post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({ name: "김철수", phone: "010-1111-2222", isNewcomer: true, agreePrivacy: true }),
    );
  });

  it("이미 승인 처리 중인 정보로 제출하면(409 SU001) 중복 신청 모달을 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 409, data: { code: "SU001" } } });
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container, { name: "이영희", phone: "010-9999-8888" });
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    await waitFor(
      () => expect(screen.getByText("신청을 확인해 주세요")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("네트워크 오류 등 SU001이 아닌 실패는 화면에 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 500, data: { code: "UNKNOWN" } } });
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container);
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    await waitFor(() =>
      expect(
        screen.getByText("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
      ).toBeInTheDocument(),
    );
    // 중복 모달은 뜨지 않아야 한다 — SU001 전용
    expect(screen.queryByText("신청을 확인해 주세요")).not.toBeInTheDocument();
  });

  it("중복 신청 모달에서 연락처를 클릭하면 클립보드에 복사되고 문구가 바뀐다", async () => {
    api.post.mockRejectedValue({ response: { status: 409, data: { code: "SU001" } } });
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const { container } = renderRegister();

    await fillBasicFields(user, container, { name: "박민수", phone: "010-5555-4444" });
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    const contactButton = await screen.findByRole("button", { name: "02-2615-4067" }, { timeout: 2000 });
    await user.click(contactButton);

    expect(writeText).toHaveBeenCalledWith("02-2615-4067");
    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Register/Register.test.jsx`
Expected: FAIL — 지금 `Register.jsx`는 `useAuth()`를 아예 안 쓰고 로컬 `setTimeout` + 하드코딩 이름/생년월일 대조로만 동작하므로, `api.post` 호출을 검증하는 단언들이 실패해야 한다.

- [ ] **Step 3: `Register.jsx` 수정**

`Register.jsx` 1~97행(import부터 handleSubmit 끝)을 아래로 교체한다:

```jsx
import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { getErrorMessage } from "@/utils/apiErrors";
import IcoPhone from "@/assets/icon-svg/main-phone.svg";

const ADMIN_CONTACT = "02-2615-4067";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

export default function Register() {
  const { church } = useChurch();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    phone: "",
    isNewcomer: false,
    agreePrivacy: false,
  });
  const [status, setStatus] = useState("idle");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleCopyContact() {
    try {
      await navigator.clipboard.writeText(ADMIN_CONTACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 조용히 무시(연락처는 여전히 화면에 보임)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBirthSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      const maxDay = daysInMonth(next.birthYear, next.birthMonth);
      if (next.birthDay && Number(next.birthDay) > maxDay) next.birthDay = "";
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setSubmitError("");
    try {
      const birthdate = `${form.birthYear}-${String(form.birthMonth).padStart(2, "0")}-${String(form.birthDay).padStart(2, "0")}`;
      await register({
        name: form.name,
        birthdate,
        phone: form.phone,
        isNewcomer: form.isNewcomer,
        agreePrivacy: form.agreePrivacy,
      });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      if (err.response?.data?.code === "SU001") {
        setShowDuplicateModal(true);
      } else {
        setSubmitError(getErrorMessage(err));
      }
    }
  };
```

이 아래(98행부터 끝까지)는 대부분 그대로 두되, 두 곳만 추가로 바꾼다:

1. 완료 화면(`status === "done"` 분기, 기존 104~143행)에서 "테스트: 승인 후 계정 생성 화면 보기" 링크(기존 134~139행, `test-token` 하드코딩)를 삭제한다 — 실제 흐름에선 그 화면에 관리자가 보낸 진짜 링크로만 진입하므로 이 테스트용 지름길은 더 이상 맞지 않는다. 기존 104~143행 블록 전체를 아래로 교체:

```jsx
  if (status === "done") {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-grey-1 px-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-bluegrey-2 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3B5280"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">가입 신청이 완료되었습니다</h2>
          <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
            성도 확인을 위해 관리자 승인 대기 중입니다.
            <br />
            승인이 완료되면 입력하신 번호로 가입 링크가 발송됩니다.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
```

(`"테스트: 승인 후 계정 생성 화면 보기"` `<Link>`만 제거되고 나머지는 원본과 동일 — `useNavigate` import는 이 파일에서 더 이상 안 쓰이므로 `import { Link, useNavigate } from "react-router";`도 `import { Link } from "react-router";`로 이미 위 Step 3의 새 import 목록에 반영돼 있다.)

2. 제출 버튼(기존 358~364행) 바로 아래에 에러 메시지 영역을 추가한다:

```jsx
              <button
                type="submit"
                disabled={status === "submitting" || !form.agreePrivacy}
                className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
              >
                {status === "submitting" ? "신청 중..." : "가입 신청하기"}
              </button>
              {submitError && (
                <p className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test:run src/pages/Register/Register.test.jsx`
Expected: PASS (5개 전부)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 기존 전부 통과 + 신규 반영.

Run: `pnpm run build`
Expected: 에러 없이 완료.

- [ ] **Step 6: 커밋**

```bash
git add src/pages/Register/Register.jsx src/pages/Register/Register.test.jsx
git commit -m "feat: Register.jsx가 실제 회원가입 API와 연동

로컬 setTimeout 가짜 지연과 PENDING_TEST_MEMBER/APPROVED_TEST_MEMBER
하드코딩 이름·생년월일 대조 분기를 제거했다. 이제 실제 register() 호출
결과(성공/409 SU001/기타 오류)에 따라 완료 화면·중복 모달·인라인
에러 메시지로 분기한다."
```

---

## Task 5: `SignupNext.jsx` 실연동

**Files:**
- Modify: `src/pages/Register/SignupNext.jsx`
- Test: `src/pages/Register/SignupNext.test.jsx`

**Interfaces:**
- Consumes: Task 3의 `useAuth().completeRegistration`, `useAuth().login`, `getErrorMessage`.

- [ ] **Step 1: `SignupNext.test.jsx`를 아래 내용으로 전체 교체 (TDD — 먼저 실패 확인)**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import churchConfig from "@/config/church.config";
import { renderWithChurch } from "@/test/renderWithChurch";
import SignupNext from "./SignupNext";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

function renderSignupNext(initialEntry) {
  return renderWithChurch(<SignupNext />, { initialEntries: [initialEntry], withAuth: true });
}

async function fillCredentials(user, { username = "hong@example.com" } = {}) {
  await user.type(screen.getByPlaceholderText(/이메일 형식/), username);
  await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "Passw0rd!");
  await user.type(screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"), "Passw0rd!");
}

describe("SignupNext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("URL에 token 파라미터가 없으면 잘못된 접근 화면을 보여준다", () => {
    renderSignupNext("/register/next");
    expect(screen.getByText("잘못된 접근입니다")).toBeInTheDocument();
  });

  it("아이디가 이메일 형식이 아니면 제출 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText(/이메일 형식/), "notanemail");
    await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "Passw0rd!");
    await user.type(screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"), "Passw0rd!");

    expect(screen.getByRole("button", { name: "가입하기" })).toBeDisabled();
  });

  it("비밀번호 규칙을 지키지 않으면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "abc");

    expect(
      screen.getByText("영문·숫자·특수문자 조합 8자 이상이어야 합니다."),
    ).toBeInTheDocument();
  });

  it("비밀번호와 비밀번호 확인이 다르면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "Passw0rd!");
    await user.type(screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"), "Different1!");

    expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
  });

  it("이메일형식 아이디로 정상 제출하면 register/complete를 호출하고 완료 모달을 보여준다", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    await waitFor(
      () =>
        expect(
          screen.getByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(api.post).toHaveBeenCalledWith("/auth/register/complete", {
      token: "test-token",
      username: "hong@example.com",
      password: "Passw0rd!",
    });
    // 이 시점엔 아직 로그인 API가 호출되지 않아야 한다 — "시작하기" 클릭 시에만 호출됨
    expect(api.post).not.toHaveBeenCalledWith("/auth/login", expect.anything());
  });

  it("완료 모달의 시작하기를 클릭하면 그때 로그인 API를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "가입하기" }));
    await screen.findByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`, {}, { timeout: 2000 });

    api.post.mockResolvedValue({
      data: { data: { email: "hong@example.com", name: "홍길동" }, token: "t", refreshToken: "r" },
    });
    await user.click(screen.getByRole("button", { name: "시작하기" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "hong@example.com",
        password: "Passw0rd!",
      }),
    );
  });

  it("만료되거나 무효한 토큰(404 SU005)이면 에러 메시지를 보여주고 완료 모달은 뜨지 않는다", async () => {
    api.post.mockRejectedValue({ response: { status: 404, data: { code: "SU005" } } });
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=expired-token&name=홍길동");

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    await waitFor(() =>
      expect(screen.getByText("유효하지 않거나 만료된 링크입니다. 관리팀에 문의해 주세요.")).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Register/SignupNext.test.jsx`
Expected: FAIL — 지금 코드엔 "중복 확인" 버튼·`idChecked` 게이트가 있고 이메일 형식 검증도 없으며, 제출 시 `setTimeout`만 쓰고 `api.post`를 호출하지 않는다.

- [ ] **Step 3: `SignupNext.jsx` 수정**

전체 파일을 아래로 교체한다:

```jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { getErrorMessage } from "@/utils/apiErrors";

const PW_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupNext() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { church } = useChurch();
  const { completeRegistration, login } = useAuth();

  const memberName = searchParams.get("name") ?? null;

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done | invalid
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) setStatus("invalid");
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (name === "username") {
      setErrors((prev) => ({
        ...prev,
        username: value && !EMAIL_RULE.test(value) ? "이메일 형식으로 입력해 주세요 (예: hong@example.com)." : "",
      }));
      return;
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password:
          value && !PW_RULE.test(value) ? "영문·숫자·특수문자 조합 8자 이상이어야 합니다." : "",
        confirm:
          nextForm.confirm && nextForm.confirm !== value ? "비밀번호가 일치하지 않습니다." : "",
      }));
      return;
    }

    if (name === "confirm") {
      setErrors((prev) => ({
        ...prev,
        confirm: value && value !== nextForm.password ? "비밀번호가 일치하지 않습니다." : "",
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!EMAIL_RULE.test(form.username))
      errs.username = "이메일 형식으로 입력해 주세요 (예: hong@example.com).";
    if (!PW_RULE.test(form.password))
      errs.password = "영문·숫자·특수문자 조합 8자 이상이어야 합니다.";
    if (form.password !== form.confirm) errs.confirm = "비밀번호가 일치하지 않습니다.";
    return errs;
  };

  const canSubmit =
    EMAIL_RULE.test(form.username) &&
    form.password.length >= 8 &&
    form.password === form.confirm &&
    status === "idle";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setStatus("submitting");
    try {
      await completeRegistration({ token, username: form.username, password: form.password });
      setStatus("done");
      setShowModal(true);
    } catch (err) {
      setErrors({ submit: getErrorMessage(err) });
      setStatus("idle");
    }
  };

  const handleComplete = async () => {
    setShowModal(false);
    await login({ email: form.username, password: form.password });
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 border rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all ${
      errors[field] ? "border-red-400 bg-red-50" : "border-bluegrey-2"
    }`;

  if (status === "invalid") {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-grey-1 px-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-bluegrey-2 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">잘못된 접근입니다</h2>
          <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
            이 페이지는 관리자의 승인 링크를 통해서만 접근할 수 있습니다.
          </p>
          <Link
            to="/register"
            className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
          >
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-72px)] flex">
        {/* 왼쪽 브랜드 패널 */}
        <div className="hidden lg:flex lg:w-[45%] bg-blue-9 flex-col justify-between p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-10 via-blue-9 to-blue-7 opacity-90" />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute bottom-40 right-8 w-40 h-40 rounded-full bg-blue-7/40" />

          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h1 className="text-headline-4 font-bold text-white mb-3">
              {church?.name ?? "ToGather"}
            </h1>
            <p className="text-body-2 text-white/70 leading-relaxed">
              교회 성도님들을 위한
              <br />
              커뮤니티 서비스 회원가입
            </p>
          </div>

          <div className="relative">
            <div className="border-t border-white/20 pt-8">
              <p className="text-body-4 text-white/50 mb-5">가입 절차</p>
              <ol className="flex flex-col gap-4">
                {[
                  { step: "01", text: "정보 입력 및 가입 신청" },
                  { step: "02", text: "관리자 승인 후 가입 링크 발송" },
                  { step: "03", text: "링크를 통해 계정 생성 완료" },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="text-body-5 font-bold text-blue-4 w-8 shrink-0">{step}</span>
                    <span className="text-body-4 text-white/80">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* 오른쪽 폼 영역 */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* 단계 표시 */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-body-4 text-grey-6">정보 입력</span>
              </div>
              <div className="flex-1 h-px bg-blue-7 mx-1" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-body-4 font-semibold text-blue-7">계정 생성</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-headline-5 font-bold text-grey-11 mb-2">계정 만들기</h2>
              {memberName ? (
                <p className="text-body-3 text-grey-6">
                  <span className="font-semibold text-blue-7">{memberName}</span> 성도님,
                  환영합니다! 로그인에 사용할 계정 정보를 설정해 주세요.
                </p>
              ) : (
                <p className="text-body-3 text-grey-6">사용할 아이디와 비밀번호를 설정해 주세요.</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 아이디(이메일) */}
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  아이디(이메일) <span className="text-red-400">*</span>
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="이메일 형식으로 입력해 주세요 (예: hong@example.com)"
                  className={inputCls("username")}
                />
                <p className="mt-1 h-[18px] text-body-5 text-red-500">{errors.username}</p>
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  비밀번호 <span className="text-red-400">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="영문·숫자·특수문자 조합 8자 이상"
                  className={inputCls("password")}
                />
                <p className="mt-1 h-[18px] text-body-5 text-red-500">{errors.password}</p>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  비밀번호 확인 <span className="text-red-400">*</span>
                </label>
                <input
                  name="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  className={inputCls("confirm")}
                />
                <p className="mt-1 h-[18px] text-body-5 text-red-500">{errors.confirm}</p>
              </div>

              {errors.submit && (
                <p className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {errors.submit}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
              >
                {status === "submitting" ? "처리 중..." : "가입하기"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 완료 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center mx-auto mb-6">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B5280"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">
              {church?.name ?? "교회"}의 일원이 된 것을 축하합니다!
            </h2>
            <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
              이제 모든 교회 서비스를 이용할 수 있습니다.
            </p>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

(참고: `navigate` import는 더 이상 이 파일 안에서 직접 쓰이지 않는다 — `login()`이 내부적으로 navigate를 수행하므로. 다만 lint가 미사용 import로 걸릴 수 있으니, `useNavigate`/`navigate` 관련 줄을 제거했는지 위 코드와 실제 diff를 대조해 확인할 것.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test:run src/pages/Register/SignupNext.test.jsx`
Expected: PASS (7개 전부)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 기존 전부 통과 + 신규 반영.

Run: `pnpm run build`
Expected: 에러 없이 완료 — 특히 미사용 `useNavigate`/`navigate` import가 남아있지 않은지 lint 결과로 확인.

- [ ] **Step 6: 커밋**

```bash
git add src/pages/Register/SignupNext.jsx src/pages/Register/SignupNext.test.jsx
git commit -m "feat: SignupNext.jsx가 실제 가입완결 API와 연동

이름 사전조회(verify)·아이디 중복확인(check-username) TODO 두 단계는
백엔드에 대응 엔드포인트가 없어 제거했다. 아이디 필드는 이메일 형식을
강제한다(백엔드가 '@' 포함 여부로만 email 저장 여부를 판단하기 때문).
가입완결 성공 후에도 자동 로그인하지 않고, '시작하기' 클릭 시에만
로그인 API를 호출해 기존 축하 모달 UX를 그대로 유지한다."
```

---

## Task 6: `.env` 정리 + Provider 트리 통합 확인

**Files:**
- Modify: `src/routes.test.jsx`

**Interfaces:**
- Consumes: 없음(Task 1~5 전체가 실제로 맞물려 크래시 없이 렌더되는지 확인하는 통합 테스트).

- [ ] **Step 1: `src/routes.test.jsx`에 아래 describe 블록 추가**

파일 끝에 추가한다(기존 `describe` 블록들과 같은 레벨):

```jsx
/**
 * 회귀 방지 테스트: /register, /register/next는 RootLayout(AuthProvider 제공처) 하위이므로
 * useAuth()가 정상 동작해야 한다. 이 테스트는 실제 routes 배열을 createMemoryRouter에 그대로
 * 꽂아 렌더링함으로써, Provider 트리 구성이 실제로 맞는지 확인한다(개별 컴포넌트 테스트는
 * renderWithChurch로 Provider를 직접 감싸므로 이 문제를 못 잡는다 — 이전 사이클들에서
 * 반복적으로 나온 함정).
 */
describe("routes — /register, /register/next의 Provider 트리 확인", () => {
  it("/register 진입 시 크래시 없이 회원가입 폼이 렌더된다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/register"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByRole("heading", { name: "회원가입" })).toBeInTheDocument();
  });

  it("/register/next?token=... 진입 시 크래시 없이 계정 생성 폼이 렌더된다", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/register/next?token=test-token"],
    });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByRole("heading", { name: "계정 만들기" })).toBeInTheDocument();
  });
});
```

파일 상단 import에 이미 `createMemoryRouter`, `RouterProvider`, `routes`, `ChurchProvider`, `SearchProvider`, `render`, `screen`이 있는지 확인하고(기존 "routes — /말씀 리다이렉트 + 예배 안내 라우트" 블록에서 이미 쓰고 있음), 없는 것만 추가한다.

- [ ] **Step 2: 테스트 실행**

Run: `pnpm test:run src/routes.test.jsx`
Expected: PASS — 이 저장소는 `/api/tenant`를 실제로 호출하지 않는 `ChurchProvider`(기본 config로 즉시 `ready`)를 쓰므로, `VITE_DUMMY_DOMAINS`나 백엔드 없이도 통과해야 한다. 만약 `api.js`가 모킹 없이 실제 axios 인스턴스를 그대로 써서 `/api/tenant` 호출 시도로 인해 테스트가 불안정하면(예: 네트워크 에러로 콘솔 경고만 나고 fallback은 되지만 act() 경고가 뜨는 경우), 이 테스트 파일에도 `vi.mock("@/services/api", ...)`을 추가해 `api.get`이 즉시 resolve하도록 만든다.

- [ ] **Step 3: 전체 스위트 + 빌드 최종 확인**

Run: `pnpm test:run`
Expected: 전체 통과.

Run: `pnpm run build`
Expected: 에러 없이 완료.

Run: `pnpm run lint`
Expected: 무경고.

- [ ] **Step 4: 커밋**

```bash
git add src/routes.test.jsx
git commit -m "test: /register, /register/next 라우트의 Provider 트리 확인 추가"
```

---

## Task 7: 백엔드 로컬 시드 데이터

**Files:** (별도 저장소 `/Users/myewon/Desktop/back`)
- Create: `scripts/seed-local.sql`
- Modify: `README.md`

**Interfaces:** 없음(프론트 코드와 무관, 로컬 수동 검증을 위한 데이터 픽스처).

- [ ] **Step 1: `back` 저장소의 스키마 확인**

이 태스크를 시작하기 전에 아래를 확인한다(백엔드 코드가 이번 계획 작성 이후 바뀌었을 수 있으므로):

```bash
cd /Users/myewon/Desktop/back
cat src/main/resources/db/migration/V2__init_core.sql | grep -A 30 "CREATE TABLE.*church\b"
cat src/main/resources/db/migration/V5__front_alignment.sql
```

`church`, `church_domain`, `account` 테이블의 정확한 컬럼명·타입을 파악한 뒤 Step 2를 작성한다(아래 예시 스키마는 계획 작성 시점 기준이므로, 실제 컬럼명이 다르면 그에 맞춰 조정한다).

- [ ] **Step 2: `scripts/seed-local.sql` 작성**

```sql
-- ============================================================================
-- scripts/seed-local.sql
-- 로컬 개발용 시드 데이터 — Flyway 버전 체인 밖의 순수 픽스처.
-- 절대 프로덕션에 적용하지 말 것.
--
-- 적용 방법:
--   docker compose up -d
--   ./gradlew bootRun   (최초 1회 기동해 Flyway 마이그레이션 적용)
--   psql "postgresql://togather:togather@localhost:5432/togather" -f scripts/seed-local.sql
-- ============================================================================

-- 교회 1곳 (church.config.js의 알곡교회 설정을 근접하게 반영)
INSERT INTO church (name, status, settings, created_at, updated_at)
VALUES (
  '알곡교회',
  'ACTIVE',
  '{
    "shortName": "알곡",
    "address": "서울 관악구 난곡로24길 42 (신림동)",
    "tel": "02) 2615-4067",
    "fax": "02) 2683-4326",
    "email": "algok@gmail.com",
    "pastor": "유상현",
    "denomination": "대한예수교장로회 고신교단",
    "logoUrl": null,
    "social": { "youtube": null, "youtubeChannelId": null, "instagram": null, "facebook": null },
    "nav": [],
    "features": { "jubo": true, "events": true, "gallery": true, "bible": true, "mypage": true }
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- 위에서 만든 교회의 id를 변수로 잡아 나머지 INSERT에 재사용
DO $$
DECLARE
  v_church_id BIGINT;
BEGIN
  SELECT id INTO v_church_id FROM church WHERE name = '알곡교회' LIMIT 1;

  -- 로컬 개발용 도메인 (프론트 .env의 VITE_DEV_CHURCH_DOMAIN과 일치해야 함)
  INSERT INTO church_domain (church_id, domain, created_at)
  VALUES (v_church_id, 'algok.togather.local', now())
  ON CONFLICT DO NOTHING;

  -- 승인된 성도 계정 (비밀번호: local1234! — BCrypt 해시는 미리 생성한 값)
  -- 해시 생성: back 저장소에서 `./gradlew bootRun` 후 아무 BCryptPasswordEncoder로 인코딩하거나,
  -- 아래 해시가 이미 "local1234!"에 대응하는 BCrypt 값이다.
  INSERT INTO account (church_id, email, login_id, password, name, role, status, created_at, updated_at)
  VALUES (
    v_church_id,
    'member@algok.local',
    'member_local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOa1Vlv8DhFm.hQ9L5zL9K8b8v1H8dOuG', -- local1234!
    '테스트성도',
    'MEMBER',
    'APPROVED',
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;

  -- 승인된 교회 관리자 계정 (다음 사이클들에서 필요)
  INSERT INTO account (church_id, email, login_id, password, name, role, status, created_at, updated_at)
  VALUES (
    v_church_id,
    'admin@algok.local',
    'admin_local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOa1Vlv8DhFm.hQ9L5zL9K8b8v1H8dOuG', -- local1234!
    '테스트관리자',
    'CHURCH_ADMIN',
    'APPROVED',
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;
END $$;
```

**중요**: 위 BCrypt 해시 값은 예시 자리표시자다 — Step 1에서 확인한 실제 `account` 테이블 컬럼명에 맞춰 조정한 뒤, 실제로 `local1234!`를 BCrypt로 인코딩한 값으로 교체해야 한다(예: 백엔드 프로젝트에 이미 있는 `PasswordEncoder` 빈을 임시 테스트 코드나 `bootRun` 콘솔에서 한 번 실행해 얻는다). 이 계획 문서만으로 정확한 해시를 생성할 수 없으므로, 이 스텝을 실행하는 사람이 반드시 실제 해시로 교체할 것.

- [ ] **Step 3: 로컬에서 실제로 적용해보고 로그인 확인**

```bash
cd /Users/myewon/Desktop/back
docker compose up -d
./gradlew bootRun &
# Flyway 마이그레이션 적용 대기 후
psql "postgresql://togather:togather@localhost:5432/togather" -f scripts/seed-local.sql
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Church-Id: 1" \
  -d '{"email":"member@algok.local","password":"local1234!"}'
```

Expected: `{"success":true,"data":{...},"token":"...","refreshToken":"..."}` 형태 응답. 실패하면(비밀번호 불일치 등) BCrypt 해시를 재생성해 스크립트를 수정한다.

- [ ] **Step 4: `README.md`에 로컬 실행 순서 문서화**

`back/README.md`의 "🚀 로컬 실행" 섹션에 시드 적용 단계를 추가한다:

```markdown
```bash
# 1. 인프라(PostgreSQL + Redis) 실행
docker compose up -d

# 2. 애플리케이션 실행
./gradlew bootRun

# 3. (최초 1회) 로컬 개발용 시드 데이터 적용 — 교회/계정
psql "postgresql://togather:togather@localhost:5432/togather" -f scripts/seed-local.sql

# 4. 동작 확인
open http://localhost:8080/swagger-ui.html
curl http://localhost:8080/actuator/health
```
```

- [ ] **Step 5: 커밋 (back 저장소)**

```bash
cd /Users/myewon/Desktop/back
git add scripts/seed-local.sql README.md
git commit -m "chore: 로컬 개발용 시드 데이터 스크립트 추가"
```

절대로 origin에 push하지 않는다.

---

## Self-Review 결과

**스펙 커버리지**: 스펙의 아키텍처 3개 절(도메인별 플래그/테넌트 헤더/401 refresh)은 Task 1, 테넌시 연동은 Task 2, 인증 연동(login/register/completeRegistration/logout)은 Task 3, `Register.jsx`/`SignupNext.jsx`는 Task 4·5, 로컬 시드는 Task 7에서 전부 커버. "확인 필요" 항목 중 `useChurch().loading` 참조 여부는 계획 수립 시 이미 grep으로 확인(참조 없음, Task 2 Step 6에 명시). `slug`/`location` 필드 여부는 Task 7의 실제 로그인 검증 단계에서 자연히 드러나지만, 코드 자체는 fallback 병합으로 이미 방어됨(Task 2).

**플레이스홀더 스캔**: Task 7의 BCrypt 해시만 예외적으로 자리표시자를 남겼다(계획 문서만으로 실제 해시를 생성할 도구가 없어 불가피 — Step 3에서 실제 값으로 교체하도록 명시적으로 지시했고, "TBD" 방치가 아니라 검증 가능한 절차를 줬으므로 계획 실패로 보지 않음). 그 외 모든 스텝에 실제 코드/명령어 포함.

**타입 일관성**: `useAuth()`가 반환하는 함수 시그니처(`login/register/completeRegistration/logout`)는 Task 3에서 정의된 대로 Task 4·5·6에서 정확히 동일하게 소비됨. `isDummy`/`setCurrentChurchId`(Task 1) → `ChurchContext.jsx`(Task 2)의 소비 시그니처 일치. `getErrorMessage`(Task 3) → Task 4·5에서 동일 시그니처로 소비.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-11-backend-integration-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
