# 백엔드 연동 — 기반 작업(테넌시 + 인증) 설계

## 배경

지금까지 `togather-front`는 전부 목업 데이터로 구현되어 있었다(방금 완료된 "명세서 기반 페이지 정비" 8사이클 전부 mock 기반). `/Users/myewon/Desktop/back`(Spring Boot 3.4 + Java 21, 헥사고날 아키텍처 + schema-per-tenant 멀티테넌시)에 실제 백엔드가 이미 상당 부분 구현돼 있어, 이를 프론트에 실제로 연동하는 작업을 시작한다.

백엔드는 자체적으로 `docs/front-contract-analysis.md`로 프론트의 `src/services/*.js` 실제 호출부·더미데이터 필드를 전수 분석해 **프론트 계약을 기준으로** API를 맞춰뒀다(`docs/api-spec-v2.md`가 기준 계약). 인증·테넌시·공지·행사·갤러리·주보·설교·마이페이지·교적부·회원가입 완결·토큰 갱신까지 대부분 구현 완료(develop 브랜치 커밋 이력 확인, `af5aa4a`/`4708736` 등).

프론트도 이미 `USE_DUMMY` 플래그로 준비돼 있다 — `src/services/*.js`의 각 함수가 `if (USE_DUMMY) return 더미; else await api.get(...)` 구조로, 실제 API 호출 코드가 이미 절반쯤 쓰여 있다(`.env`의 `VITE_USE_DUMMY=true`로 꺼져있을 뿐).

## 전체 범위와 이번 사이클의 위치

이 통합 작업은 도메인이 8개 이상 걸친 큰 프로젝트라 사이클 단위로 나눈다(사용자 확인 완료, 2026-08-11):

1. **기반 작업(이 사이클)** — 테넌시(`ChurchContext` 실연동) + 인증(로그인/로그아웃/토큰갱신/회원가입+가입완결)
2. 공지사항
3. 행사(+참가신청)
4. 갤러리
5. 스마트 주보(jubo)
6. 설교·방송 — 프론트는 현재 YouTube API 직접 호출, 백엔드는 관리자가 수동으로 BEFORE→LIVE→ENDED 전환하는 DB 상태 기반. 별도 설계 필요(이 사이클 범위 아님).
7. 마이페이지(일정/기도/문의/탈퇴)
8. 교적부(PII, 권한 설계 필요)
9. 교회 문의(Contact)

관리자 화면(`EventsManage.jsx`, `MembersManage.jsx` 등 이미 존재하는 관리자 CRUD 페이지)은 각 도메인 사이클 안에서 일반 사용자용과 함께 연동한다(사용자 확인 완료).

성경 읽기/필사는 백엔드가 의도적으로 범위 제외(외부 Bible API 키 대기 중, `backend-completion-plan.md` §2) — 계속 로컬로 남으며 사이클 대상이 아니다.

**백엔드 수정 범위**: 백엔드(`/Users/myewon/Desktop/back`)의 API 계약(엔드포인트, 요청/응답 shape)은 **고정으로 놓고 프론트가 적응**한다(사용자 확인 완료). 단, 로컬 개발용 시드 데이터 스크립트(순수 데이터 픽스처, 코드/로직 변경 아님)는 이 원칙에 걸리지 않는 예외로 이 사이클에 포함한다.

## 개발/검증 방식

로컬에서 실제 백엔드를 함께 띄운다(`docker compose up -d`로 PostgreSQL+Redis, `./gradlew bootRun`)(docker 데몬 확인 완료, 로컬 실행 가능). 각 사이클을 진짜 API에 대고 테스트해가며 진행 — 문서(`api-spec-v2.md` 등)와 실제 백엔드 코드 간 계약 드리프트가 있으면(이번 조사에서 이미 SignupNext.jsx 관련 드리프트 발견, 아래 참고) 즉시 잡을 수 있다.

단, **자동화 테스트(vitest)는 계속 API 호출을 모킹**해서 결정론적으로 유지한다(실제 네트워크 의존 없음 — 프로젝트 기존 관례와 동일). 로컬 백엔드는 개발 중 수동 검증 용도다.

## 아키텍처

### 1. 도메인별 점진적 전환 — `VITE_DUMMY_DOMAINS`

전역 `VITE_USE_DUMMY` 불리언을 도메인별 목록식 플래그로 교체한다.

```js
// src/services/api.js
const dummyDomains = new Set(
  (import.meta.env.VITE_DUMMY_DOMAINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
export const isDummy = (domain) => dummyDomains.has(domain);
```

- `.env` 기본값: `VITE_DUMMY_DOMAINS=notice,events,gallery,jubo,sermon,my,member,contact` — tenant/auth는 이 플래그를 아예 쓰지 않고 이 사이클부터 항상 실제 API. 이후 사이클마다 완료된 도메인 이름을 이 목록에서 지운다(목록이 줄어드는 게 진행 상황 지표).
- 기존 `src/services/*.js`(notice/events/gallery/jubo/sermon)의 `USE_DUMMY` import는 **이 사이클에서 건드리지 않는다** — 각 서비스 파일을 `isDummy("도메인명")`으로 바꾸는 건 해당 도메인 사이클의 몫이다. 이 사이클은 `api.js`에 `isDummy` 함수를 추가하고 export만 해둔다(`USE_DUMMY`는 하위 호환을 위해 당분간 병행 export — 기존 서비스 파일들이 계속 참조 중이므로 깨뜨리지 않는다).

### 2. 테넌트 헤더 — `X-Church-Id`

백엔드 `ChurchContextFilter`(`global/tenant/ChurchContextFilter.java`)를 보면, 경로 기반(`/api/churches/{id}/**`)이 아닌 요청(로그인·회원가입·토큰갱신 등)은 host 기반 식별에 실패할 경우 `X-Church-Id` 헤더로 폴백한다. 백엔드 주석에 따르면 이건 "로컬 개발 전용"이 아니라 **현재 배포 자체가 단일 호스트(Vercel)라 지금 당장 필요한 메커니즘**이다(도메인 연결 전까지).

`api.js`에 모듈 전역 변수로 현재 churchId를 저장하고, 요청 인터셉터가 매 요청에 `X-Church-Id` 헤더를 붙인다:

```js
let currentChurchId = null;
export function setCurrentChurchId(id) {
  currentChurchId = id;
}
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (currentChurchId) config.headers["X-Church-Id"] = currentChurchId;
  return config;
});
```

`ChurchProvider`가 `/api/tenant` 조회 성공 시 `setCurrentChurchId(data.id)`를 호출해 채운다.

### 3. 401 처리 — refresh 재시도

기존 응답 인터셉터는 401 시 바로 로그아웃했다. 이제 refresh token이 있으면 한 번 갱신을 시도하고, 성공하면 원 요청을 재시도, 실패하면 기존처럼 로그아웃한다.

```js
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retried && localStorage.getItem("refreshToken")) {
      original._retried = true;
      try {
        const { data } = await api.post("/church/auth/token/refresh", {
          refreshToken: localStorage.getItem("refreshToken"),
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        return api(original);
      } catch {
        // fall through to logout
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
```

`/api/church/auth/token/refresh`는 v1 host 기반 경로(경로에 churchId 없음, `X-Church-Id` 헤더로 커버됨).

## 테넌시 연동 — `ChurchContext` 재설계

`church.config.js`(453줄)의 최상위 필드는 `/api/tenant` 응답 스키마와 거의 1:1 일치(`id/name/shortName/address/tel/fax/email/pastor/denomination/logoUrl/social/nav/features/mainBanner/greeting/vision/worshipSchedule/staff/history/floorGuide/communities/parking/transportGuide`). 다만 `slug`, `location`(카카오맵 확대수준)은 API 명세서에 없어 백엔드가 안 내려줄 가능성 있음(확인 필요, 아래 참고).

정적 config를 완전히 버리지 않고 **fallback 템플릿**으로 남긴다. `/api/tenant` 응답을 그 위에 얕게 병합해서 쓰면, 백엔드가 어떤 필드를 빠뜨려도 화면이 깨지지 않는다.

```js
// src/services/tenantService.js (신규)
import api from "./api";

export async function getTenant(domain) {
  const res = await api.get("/tenant", { params: { domain } });
  return res.data.data;
}
```

```js
// src/contexts/ChurchContext.jsx
export function ChurchProvider({ children, initialChurch }) {
  const [state, setState] = useState({
    church: initialChurch ?? defaultConfig,
    status: initialChurch ? "ready" : "loading",
  });

  useEffect(() => {
    if (initialChurch) return; // 테스트에서 주입된 경우 fetch 생략
    const domain = import.meta.env.VITE_DEV_CHURCH_DOMAIN || window.location.hostname;
    getTenant(domain)
      .then((data) => {
        setCurrentChurchId(data.id);
        setState({ church: { ...defaultConfig, ...data }, status: "ready" });
      })
      .catch(() => setState((s) => ({ ...s, status: "error" })));
  }, [initialChurch]);

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

- `status: "loading"` 동안은 `defaultConfig`(즉시 렌더 가능)가 먼저 보이다가 실제 데이터로 교체된다 — 전체를 로딩 화면으로 막지 않는다.
- `status: "error"`(교회를 못 찾음, 404 `T001`)일 때만 `<TenantErrorScreen />`으로 전체 화면 전환.
- `useChurch()`가 반환하는 `loading` 값의 의미가 바뀐다(기존엔 항상 `false`) — `loading`을 참조하는 기존 코드가 있는지 확인 필요(계획 수립 시 grep).

### 로컬 개발용 도메인

`localhost`는 어떤 교회에도 안 매핑되므로, `.env`에 `VITE_DEV_CHURCH_DOMAIN=algok.togather.local`을 추가하고 아래 시드 데이터의 `church_domain`을 이 값과 맞춘다.

## 인증 연동

### `auth.jsx` 재작성

- `login({email,password})` → `POST /api/auth/login`(공용 `api` 클라이언트 사용 — 지금처럼 raw `axios`/상대경로 아님) → `token`/`refreshToken`을 localStorage에 저장, `currentUser`는 응답 데이터(`isAdmin` 필드로 관리자 여부 판단, 기존처럼 `/admin`으로 분기). **하드코딩된 `DUMMY_USER`/`DUMMY_ADMIN` 데모 계정 우회 로직은 제거** — 대신 아래 로컬 시드 계정을 문서화해서 대체한다.
- `register(payload)` → `POST /api/auth/register`({name,birthdate,phone,isNewcomer,agreePrivacy}) → 성공 시 `{requestId,status:"PENDING"}`, `token:null` — **자동 로그인 안 함**. 409 `SU001`(중복)은 에러로 던져 호출부(Register.jsx)가 처리.
- `completeRegistration({token,username,email,password})`(신규 함수) → `POST /api/auth/register/complete` → 이 엔드포인트는 토큰을 반환하지 않으므로, 성공 후 별도로 `login({email:username,password})` 호출.
- `logout()` → `POST /api/church/auth/logout`(refreshToken 포함) best-effort 시도(실패해도 로컬 정리는 진행) 후 localStorage 정리 + `/login`으로 이동.

### `Register.jsx`

현재 `setTimeout` 가짜 딜레이 + `PENDING_TEST_MEMBER`/`APPROVED_TEST_MEMBER` 하드코딩 이름·생년월일 대조 분기가 있다. 실제 `register()` 호출로 교체한다:
- 성공(201) → 기존 "제출 완료" 상태(`status:"done"`)로 전환.
- 409 `SU001` → 기존 중복 안내 모달(`showDuplicateModal`) 표시 — UX 변경 없음, 트리거만 실제 API 응답으로 교체.
- **`APPROVED_TEST_MEMBER`(재제출 시 `/register/next`로 바로 이동하는 분기)는 실제 백엔드 흐름에 대응하는 것이 없다** — 실제로는 관리자가 승인 후 완결 토큰이 포함된 링크를 성도에게 직접 전달하는 구조라(`docs/api-spec-v2.md` §10.1, `POST .../signup-requests/{id}/approve` 응답의 `completionToken`), 가입 폼 재제출로 그 화면에 도달할 방법이 없다. `auth`는 `VITE_DUMMY_DOMAINS` 플래그를 쓰지 않고 이 사이클부터 항상 실제 API이므로(위 아키텍처 절 참고), 이 분기는 데모 모드 보존 없이 **완전히 제거**한다. `/register/next?token=...` 화면은 실제로는 관리자가 보낸 링크를 클릭해서만 진입하게 된다.

### `SignupNext.jsx`

이름 사전조회(`GET /api/register/verify`)·아이디 중복확인(`GET /api/register/check-username`) TODO 두 단계는 백엔드에 대응 엔드포인트가 없어 **제거**한다(제출 후 에러로 처리하는 방식으로 재설계). `username` 입력 필드는 이메일 형식을 요구하도록 안내 문구/검증을 추가한다 — 백엔드가 "username에 '@'가 있으면 email로도 저장"하는 조건부 로직이라, 이메일 형식이 아니면 이후 `/api/auth/login`(email 기준)으로 로그인할 방법이 없어지기 때문(백엔드 고정 원칙상 프론트에서 강제).

완료(`POST .../register/complete` 성공) 후 `completeRegistration()`이 내부적으로 `login()`까지 호출하므로, 기존 TODO의 "자동 로그인" 요구사항이 그대로 충족된다.

## 로컬 개발 환경 — 시드 데이터

`back`의 Flyway 마이그레이션엔 초기 데이터가 전혀 없다(`V2__init_core.sql`에 INSERT 없음, 교회/계정 0건). `back/scripts/seed-local.sql`(신규, Flyway 버전 체인 밖 — 코드/로직 변경 아닌 순수 개발용 픽스처)을 만든다:

- 교회 1곳(`church` 행 + `church.settings` JSONB — `church.config.js` 참고해 채움) + `church_domain`(`algok.togather.local`)
- 승인된 성도 계정 1개(`account`, role=MEMBER, 알려진 비밀번호의 BCrypt 해시)
- 승인된 관리자 계정 1개(role=CHURCH_ADMIN) — 이후 관리자 화면 연동 사이클에서 필요

`back/README.md`(또는 `front`의 개발 가이드)에 로컬 실행 순서를 문서화: `docker compose up -d` → `./gradlew bootRun` → `psql`로 시드 스크립트 적용 → 프론트 `.env`에 `VITE_DEV_CHURCH_DOMAIN` 설정 → `pnpm run dev`.

## 에러 처리

`src/utils/apiErrors.js`(신규) — 백엔드 에러코드를 한국어 사용자 메시지로 매핑하는 유틸:

```js
const ERROR_MESSAGES = {
  A006: "이메일 또는 비밀번호가 올바르지 않습니다.", // 자격오류/미승인/거부 통일 메시지
  SU001: "이미 존재하거나 승인 처리 중인 계정입니다. 관리팀에 문의해 주세요.",
  SU004: "개인정보 수집·이용에 동의해 주세요.",
  SU005: "유효하지 않거나 만료된 링크입니다. 관리팀에 문의해 주세요.",
  T001: "교회 정보를 찾을 수 없습니다.",
};
export function getErrorMessage(err) {
  const code = err.response?.data?.code;
  return ERROR_MESSAGES[code] ?? "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
```

로그인/회원가입/가입완결 3곳에서 공통 사용.

## 테스트 계획

전부 API 호출을 모킹(`vi.mock`)해서 결정론적으로 검증(실제 네트워크 의존 없음):

- `auth.test.jsx`(신규 또는 확장): 로그인 성공/실패(`A006`)/관리자 분기, 회원가입 성공(대기)/중복(`SU001`), 로그아웃, `completeRegistration` 성공 후 자동 로그인.
- `ChurchContext.test.jsx`(신규): tenant 조회 성공(fallback 병합 확인 — 일부 필드 누락 시에도 정상 렌더) / 실패(`T001`, 에러 화면) / `initialChurch` 주입 시 fetch 생략.
- `Register.test.jsx`: 기존 테스트를 실제 API 모드 기준으로 갱신(더미모드 테스트는 `isDummy` 목킹으로 별도 유지), `APPROVED_TEST_MEMBER` 분기 제거 반영.
- `SignupNext.test.jsx`: verify/check-username 단계 제거 반영, 이메일 형식 검증, `register/complete` 성공 후 로그인 호출 검증.
- `routes.test.jsx`: `ChurchProvider`+`AuthProvider` 실제 트리에서 렌더 확인(이전 사이클들에서 반복 확인된 "컴포넌트 테스트는 통과했는데 실제 라우트 트리엔 Provider가 없어 크래시" 함정 예방).

## 비목표 (이 사이클 제외)

- 공지·행사·갤러리·주보·설교·마이페이지·교적부·문의 — 각각 후속 사이클.
- 설교·방송의 YouTube 직접호출 ↔ 백엔드 상태기반 전환 결정 — 별도 설계 필요.
- 관리자 어드민(운영사) 로그인/화면 연동 — 후속.
- 백엔드 API 계약 자체의 수정(verify/check-username 엔드포인트 추가, username/email 로그인 불일치 해소) — 백엔드 고정 원칙에 따라 프론트가 우회.

## 확인 필요

- `/api/tenant` 응답에 `slug`, `location`(카카오맵 확대수준) 필드가 실제로 포함되는지 — fallback 병합으로 방어하지만, 백엔드 시드 데이터 작성 시 실제 응답 shape을 확인해 필요하면 `church.settings` JSONB에 채워 넣는다.
- `useChurch()`의 `loading` 값이 실제로 참조되는 곳이 있는지(계획 수립 시 grep) — 있다면 동작 변화 영향 검토.
- 로컬 개발용 관리자 계정의 실제 활용은 이 사이클엔 없음(다음 사이클들 대비 시드만 미리 준비) — 당장 검증 대상 아님.
