# 행사(Events) 실연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 행사(Events) 도메인을 실제 백엔드 API와 연동한다. 백엔드에 정원/신청기간/신청인원/등록일 필드가 없으므로, 이 기능들에 의존하던 프론트 UI를 백엔드가 실제로 지원하는 범위로 축소한다.

**Architecture:** `eventsService.js`의 실API 분기 URL은 이미 정확하다(이전 핫픽스 사이클에서 고쳐짐) — 이번엔 `isDummy("events")` 전환과 신청 관련 기능 축소가 핵심이다. 신청 상태는 `canRegister`+행사일만으로 판단(`NONE`/`OPEN`/`CLOSED` 3단계)하고, "이미 신청했는지"는 백엔드 조회 API가 없어 브라우저 localStorage로만 추적한다.

**Tech Stack:** React 19, Axios(`src/services/api.js`), `useFetch`(`src/hooks/useFetch.js`), Vitest(`vite-plus/test`), `@testing-library/react` + `@testing-library/user-event`.

## Global Constraints

- 백엔드 행사 CRUD(`GET/POST/PATCH/DELETE`)는 `{id,title,department,date,startTime,endTime,location,description,canRegister,imageUrl}` 필드만 주고받는다 — `capacity`/`registrationStart`/`registrationEnd`/`registeredCount`/`createdAt`은 스키마에 없다.
- `POST /api/churches/{churchId}/events/{eventId}/register`는 요청 바디가 없다(아무 값도 안 받음) — 응답은 `{registered:true}` 고정값, 멱등(중복 호출 안전).
- `DELETE /api/church/admin/events/{id}`는 신청 이력이 있는 행사를 삭제하려 하면 500 에러를 반환한다(백엔드 버그, back 저장소는 수정하지 않음 — 프론트에서 에러를 잡아 안내만 한다).
- 테스트는 `"vite-plus/test"`에서 `describe/it/expect/vi/beforeEach`를 import한다.
- `@/services/api`를 모킹할 때는 `{ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, isDummy: () => false }` 형태로 모킹해 실 API 분기를 강제한다.
- 로그인한 사용자를 시뮬레이션하는 테스트는 렌더 전에 `localStorage.setItem("user", JSON.stringify({ email: "..." }))`를 호출한 뒤 `renderWithChurch(ui, { withAuth: true })`로 렌더한다(이 프로젝트 기존 관례, `Gyojeokbu.test.jsx` 등에서 이미 쓰임).
- 경로 별칭 `@/` → `src/`. `react-router-dom`이 아닌 `react-router`에서 훅 import.
- `.env`는 gitignore 대상이라 git으로 추적되지 않는다 — 이 파일을 고치는 단계에서는 `git add`를 하지 않는다.

---

### Task 1: `eventsService.js` — `isDummy("events")` 전환 + `registerForEvent` 시그니처 단순화 + `id` 기반 정렬

**Files:**
- Modify: `src/services/eventsService.js`
- Modify: `src/services/eventsService.test.js`
- Modify: `.env` (워크트리에 파일이 있는 경우에만, gitignore 대상이라 커밋하지 않음)

**Interfaces:**
- Produces:
  - `registerForEvent(churchId, eventId)` → `Promise<{success:true, registration:{...}}>` (더미) 또는 `Promise<{registered:true}>` (실API) — **시그니처가 바뀜(기존엔 세 번째 인자로 payload를 받았음)**. Task 3이 이 새 시그니처로 호출한다.
  - `getRecentEvents(churchId, limit)`, `searchEvents(churchId, {q,sort})` — 시그니처는 그대로, 내부적으로 `createdAt` 대신 `id` 내림차순으로 정렬한다는 점만 바뀜.
  - `getEvents`/`getEventById`/`createEvent`/`updateEvent`/`deleteEvent` — 시그니처·URL 변경 없음(이미 핫픽스에서 정확한 경로로 고쳐짐), `isDummy("events")` 참조로만 전환.

- [ ] **Step 1: `eventsService.test.js`를 새 계약에 맞게 갱신 — 실패 확인용**

`src/services/eventsService.test.js` 전체 내용을 아래로 교체한다(기존 5개 테스트의 모킹 방식과 `getRecentEvents` 테스트를 갱신하고, `registerForEvent` 테스트를 추가):

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getRecentEvents,
  registerForEvent,
} from "./eventsService";

const EVENTS = [
  {
    id: 1,
    title: "여름 수련회",
    department: "청년부",
    date: "2026-01-10",
    startTime: null,
    endTime: null,
    location: "본당",
    description: "청년부 여름 수련회 안내",
    imageUrl: null,
    canRegister: true,
  },
  {
    id: 2,
    title: "가을 바자회",
    department: "여전도회",
    date: "2026-02-05",
    startTime: null,
    endTime: null,
    location: "교육관",
    description: "알뜰 바자회",
    imageUrl: null,
    canRegister: false,
  },
];

describe("eventsService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEvent는 POST /church/admin/events를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 행사", date: "2026-03-01" };
    api.post.mockResolvedValue({ data: { data: { id: 3, ...payload } } });

    const result = await createEvent("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/events", payload);
    expect(result).toEqual({ id: 3, ...payload });
  });

  it("updateEvent는 PATCH /church/admin/events/{eventId}를 호출한다", async () => {
    const payload = { title: "수정된 제목" };
    api.patch.mockResolvedValue({ data: { data: { id: 1, ...payload } } });

    const result = await updateEvent("1", 1, payload);

    expect(api.patch).toHaveBeenCalledWith("/church/admin/events/1", payload);
    expect(result).toEqual({ id: 1, ...payload });
  });

  it("deleteEvent는 DELETE /church/admin/events/{eventId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    const result = await deleteEvent("1", 1);

    expect(api.delete).toHaveBeenCalledWith("/church/admin/events/1");
    expect(result).toEqual({ success: true });
  });

  it("searchEvents는 전체 목록을 조회해 검색어로 클라이언트 필터링한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await searchEvents("1", { q: "바자회", sort: "date" });

    expect(api.get).toHaveBeenCalledWith("/churches/1/events");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("searchEvents는 검색어가 없으면 전체 목록을 정렬만 해서 반환한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await searchEvents("1", { q: "", sort: "date" });

    expect(result).toHaveLength(2);
  });

  it("getRecentEvents는 전체 목록을 id 내림차순으로 정렬해 limit만큼 반환한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await getRecentEvents("1", 1);

    expect(api.get).toHaveBeenCalledWith("/churches/1/events");
    expect(result).toHaveLength(1);
    // id가 더 큰(=더 나중에 등록된) 이벤트가 먼저 와야 한다
    expect(result[0].id).toBe(2);
  });

  it("registerForEvent는 payload 없이 POST /churches/{churchId}/events/{eventId}/register를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { registered: true } });

    const result = await registerForEvent("1", 1);

    expect(api.post).toHaveBeenCalledWith("/churches/1/events/1/register");
    expect(result).toEqual({ registered: true });
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/eventsService.test.js`
Expected: FAIL — 현재 `eventsService.js`는 아직 `USE_DUMMY`를 참조하고(모킹된 모듈에 `USE_DUMMY`가 없어 `undefined`가 되어 실제로는 실API 분기를 타긴 하지만, `isDummy` export 자체가 없어 import 시 문제가 생기지는 않음 — 대신 `registerForEvent`가 여전히 3개 인자를 받는 옛 시그니처라 마지막 테스트가 실패한다), `getRecentEvents`도 아직 `createdAt` 기준으로 정렬해서 다섯 번째 테스트가 실패한다.

- [ ] **Step 3: `eventsService.js`의 상단 import와 `sortEvents` 함수 수정**

`src/services/eventsService.js`의 20번째 줄:

```js
// 변경 전
import api, { USE_DUMMY } from "./api";
import { DUMMY_EVENTS } from "@/data/dummy/events";
```

```js
// 변경 후
import api, { isDummy } from "./api";
import { DUMMY_EVENTS } from "@/data/dummy/events";
```

30-43번째 줄의 `sortEvents` 함수 전체를 아래로 교체(`"createdAt"` 정렬 키가 이제 `id` 내림차순을 쓰도록):

```js
// 변경 전
function sortEvents(list, sort) {
  const arr = [...list];
  if (sort === "createdAt") {
    arr.sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.date < b.date ? -1 : 1,
    );
    return arr;
  }
  // "date" (일정 빠른순): 오늘 이후를 오름차순으로 먼저, 지난 행사는 내림차순으로 뒤에
  const today = todayIso();
  const upcoming = arr.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
  const past = arr.filter((e) => e.date < today).sort((a, b) => (a.date < b.date ? 1 : -1));
  return [...upcoming, ...past];
}
```

```js
// 변경 후
function sortEvents(list, sort) {
  const arr = [...list];
  if (sort === "createdAt") {
    // 백엔드에 createdAt 필드가 없어, 자동증가 id 내림차순을 "최근 등록순"의 근사치로 쓴다.
    arr.sort((a, b) => (b.id > a.id ? 1 : b.id < a.id ? -1 : 0));
    return arr;
  }
  // "date" (일정 빠른순): 오늘 이후를 오름차순으로 먼저, 지난 행사는 내림차순으로 뒤에
  const today = todayIso();
  const upcoming = arr.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
  const past = arr.filter((e) => e.date < today).sort((a, b) => (a.date < b.date ? 1 : -1));
  return [...upcoming, ...past];
}
```

- [ ] **Step 4: 8개 함수의 `if (USE_DUMMY)`를 `if (isDummy("events"))`로 전환**

`src/services/eventsService.js` 안의 아래 8곳을 전부 `if (USE_DUMMY) {` → `if (isDummy("events")) {`로 바꾼다(각 함수 내부 로직은 그대로 둔다): `getEvents`, `searchEvents`, `getRecentEvents`, `getEventById`, `registerForEvent`(다음 스텝에서 별도로 더 손봄), `createEvent`, `updateEvent`, `deleteEvent`.

- [ ] **Step 5: `registerForEvent` 시그니처 단순화**

`src/services/eventsService.js`의 `registerForEvent` 함수 전체(현재 119-133번째 줄 부근)를 아래로 교체:

```js
// 변경 전
/**
 * 행사 신청
 * @param {string} churchId
 * @param {number|string} eventId
 * @param {{ name?:string, phone?:string, attendeeCount?:number, note?:string }} payload
 */
export async function registerForEvent(churchId, eventId, payload = {}) {
  if (USE_DUMMY) {
    const event = DUMMY_EVENTS.find((e) => String(e.id) === String(eventId));
    if (event) event.registeredCount = (event.registeredCount ?? 0) + (payload.attendeeCount ?? 1);
    return { success: true, registration: { ...payload, eventId, status: "PENDING" } };
  }
  const res = await api.post(`/churches/${churchId}/events/${eventId}/register`, payload);
  return res.data;
}
```

```js
// 변경 후
/**
 * 행사 신청 — 백엔드가 요청 바디를 받지 않는다(로그인한 사용자 식별만으로 처리).
 * @param {string} churchId
 * @param {number|string} eventId
 * @returns {Promise<{registered:boolean}>}
 */
export async function registerForEvent(churchId, eventId) {
  if (isDummy("events")) {
    return { registered: true };
  }
  const res = await api.post(`/churches/${churchId}/events/${eventId}/register`);
  return res.data;
}
```

- [ ] **Step 6: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/eventsService.test.js`
Expected: PASS (7 tests)

- [ ] **Step 7: 커밋**

```bash
git add src/services/eventsService.js src/services/eventsService.test.js
git commit -m "feat: eventsService가 isDummy로 전환하고 registerForEvent가 백엔드 계약에 맞게 단순화됨"
```

- [ ] **Step 8: `.env`에서 `events`를 더미 도메인 목록에서 제거 (있는 경우에만)**

이 저장소의 `.env`는 gitignore 대상이라 워크트리마다 따로 존재하지 않을 수 있다.

- 이 워크트리에 `.env` 파일이 있다면 열어서 `VITE_DUMMY_DOMAINS` 값에서 `events`를 제거한다(예: `VITE_DUMMY_DOMAINS=events,gallery,jubo,...` → `VITE_DUMMY_DOMAINS=gallery,jubo,...`). 이 파일은 `git add`하지 않는다(gitignore 대상).
- `.env` 파일 자체가 없다면 이 단계는 건너뛴다.

이 단계는 커밋 대상이 아니므로 git 커밋 없음.

---

### Task 2: `eventStatus.js` — 3단계로 축소 + 로컬 신청 기록 헬퍼 추가

**Files:**
- Modify: `src/utils/eventStatus.js`
- Test: `src/utils/eventStatus.test.js` (신규)

**Interfaces:**
- Produces:
  - `REG_STATUS = { NONE, OPEN, CLOSED }` (기존 `UPCOMING` 제거)
  - `REG_BTN_TONE` — `NONE`/`OPEN`/`CLOSED` 3개 키만 (기존 `UPCOMING` 키 제거)
  - `getRegistrationState(event, now?)` → `{ status, label, disabled }` (기존 `reason`/`remaining`/`opensAt`/`closesAt` 필드 제거)
  - `getRegistrationMessage(state)` → `string`
  - `isLocallyRegistered(churchId, eventId, userEmail)` → `boolean`
  - `markLocallyRegistered(churchId, eventId, userEmail)` → `void`
  - Task 3(`RegistrationButton.jsx`)과 Task 5(`EventsManage.jsx`)가 이 인터페이스를 그대로 소비한다.

- [ ] **Step 1: `eventStatus.test.js` 작성(실패 확인용)**

`src/utils/eventStatus.test.js` 전체 내용:

```js
import { describe, it, expect, beforeEach } from "vite-plus/test";
import {
  getRegistrationState,
  getRegistrationMessage,
  isLocallyRegistered,
  markLocallyRegistered,
  REG_STATUS,
} from "./eventStatus";

const baseEvent = { date: "2026-06-15", canRegister: true };

describe("getRegistrationState", () => {
  it("canRegister가 false면 NONE을 반환한다", () => {
    const state = getRegistrationState(
      { ...baseEvent, canRegister: false },
      new Date("2026-06-01"),
    );
    expect(state.status).toBe(REG_STATUS.NONE);
    expect(state.disabled).toBe(true);
  });

  it("행사일이 아직 지나지 않았으면 OPEN을 반환한다", () => {
    const state = getRegistrationState(baseEvent, new Date("2026-06-01"));
    expect(state.status).toBe(REG_STATUS.OPEN);
    expect(state.disabled).toBe(false);
  });

  it("행사일 당일에는 아직 OPEN이다", () => {
    const state = getRegistrationState(baseEvent, new Date("2026-06-15"));
    expect(state.status).toBe(REG_STATUS.OPEN);
  });

  it("행사일이 지났으면 CLOSED를 반환한다", () => {
    const state = getRegistrationState(baseEvent, new Date("2026-06-16"));
    expect(state.status).toBe(REG_STATUS.CLOSED);
    expect(state.disabled).toBe(true);
  });

  it("event가 없으면 NONE을 반환한다", () => {
    const state = getRegistrationState(null);
    expect(state.status).toBe(REG_STATUS.NONE);
  });
});

describe("getRegistrationMessage", () => {
  it("CLOSED 상태면 종료 안내 문구를 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.CLOSED })).toBe("이미 종료된 행사입니다.");
  });

  it("OPEN 상태면 빈 문자열을 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.OPEN })).toBe("");
  });

  it("state가 없으면 빈 문자열을 반환한다", () => {
    expect(getRegistrationMessage(null)).toBe("");
  });
});

describe("로컬 신청 기록", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("기록이 없으면 isLocallyRegistered는 false를 반환한다", () => {
    expect(isLocallyRegistered("1", "e1", "hong@example.com")).toBe(false);
  });

  it("markLocallyRegistered로 기록하면 isLocallyRegistered가 true를 반환한다", () => {
    markLocallyRegistered("1", "e1", "hong@example.com");
    expect(isLocallyRegistered("1", "e1", "hong@example.com")).toBe(true);
  });

  it("다른 이벤트/사용자 조합에는 영향을 주지 않는다", () => {
    markLocallyRegistered("1", "e1", "hong@example.com");
    expect(isLocallyRegistered("1", "e2", "hong@example.com")).toBe(false);
    expect(isLocallyRegistered("1", "e1", "other@example.com")).toBe(false);
  });

  it("userEmail이 없으면 항상 false를 반환하고 기록하지 않는다", () => {
    markLocallyRegistered("1", "e1", undefined);
    expect(isLocallyRegistered("1", "e1", undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/utils/eventStatus.test.js`
Expected: FAIL — `isLocallyRegistered`/`markLocallyRegistered`가 아직 정의돼 있지 않고, `getRegistrationState`가 아직 `capacity`/`registrationStart`/`registrationEnd` 기반 로직을 쓰고 있어 `disabled` 등 반환 형태가 다르다.

- [ ] **Step 3: `eventStatus.js` 전체를 아래 내용으로 교체**

```js
import { parseLocalDate, startOfDay } from "./date";

/** 행사 신청 상태. 백엔드에 정원/신청기간 개념이 없어 3단계로만 구분한다. */
export const REG_STATUS = {
  NONE: "none", // 신청을 받지 않는 행사 → 버튼 미노출
  OPEN: "open", // 신청하기 (행사일이 아직 지나지 않음)
  CLOSED: "closed", // 신청 마감 (행사일 경과)
};

const LABEL = {
  [REG_STATUS.NONE]: "",
  [REG_STATUS.OPEN]: "신청하기",
  [REG_STATUS.CLOSED]: "신청 마감",
};

/** 버튼 톤 클래스 (배경/글자/테두리) */
export const REG_BTN_TONE = {
  [REG_STATUS.OPEN]: "bg-blue-7 text-white border-blue-7 hover:bg-blue-8",
  [REG_STATUS.CLOSED]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.NONE]: "hidden",
};

/**
 * 행사의 신청 상태를 계산한다 (순수 함수 — now를 주입받아 테스트 가능).
 * 백엔드에 정원/신청기간 필드가 없어 canRegister와 행사일만으로 판단한다.
 * @param {import('@/services/eventsService').Event|null} event
 * @param {Date} [now]
 * @returns {{ status: "none"|"open"|"closed", label: string, disabled: boolean }}
 */
export function getRegistrationState(event, now = new Date()) {
  if (!event || event.canRegister !== true) {
    return { status: REG_STATUS.NONE, label: LABEL[REG_STATUS.NONE], disabled: true };
  }

  const today = startOfDay(now);
  const eventDay = parseLocalDate(event.date);

  if (eventDay && eventDay < today) {
    return { status: REG_STATUS.CLOSED, label: LABEL[REG_STATUS.CLOSED], disabled: true };
  }

  return { status: REG_STATUS.OPEN, label: LABEL[REG_STATUS.OPEN], disabled: false };
}

/** 신청 불가 사유를 사용자 안내 문구로 변환 */
export function getRegistrationMessage(state) {
  if (!state) return "";
  if (state.status === REG_STATUS.CLOSED) return "이미 종료된 행사입니다.";
  return "";
}

const registeredKey = (churchId, eventId, userEmail) =>
  `event_registered_${churchId}_${eventId}_${userEmail}`;

/** 이 브라우저에서 이미 신청 완료로 기록됐는지 (백엔드에 조회 API가 없어 로컬로만 추적) */
export function isLocallyRegistered(churchId, eventId, userEmail) {
  if (!userEmail) return false;
  return localStorage.getItem(registeredKey(churchId, eventId, userEmail)) === "true";
}

/** 신청 성공 후 이 브라우저에 신청 완료를 기록한다 */
export function markLocallyRegistered(churchId, eventId, userEmail) {
  if (!userEmail) return;
  localStorage.setItem(registeredKey(churchId, eventId, userEmail), "true");
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/utils/eventStatus.test.js`
Expected: PASS (13 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/utils/eventStatus.js src/utils/eventStatus.test.js
git commit -m "feat: eventStatus를 3단계로 축소하고 로컬 신청 기록 헬퍼 추가"
```

---

### Task 3: `RegistrationButton.jsx` 재작성 — 신청 액션을 직접 수행

**Files:**
- Modify: `src/components/events/RegistrationButton.jsx`
- Modify: `src/pages/Events/EventDetail.jsx`
- Test: `src/components/events/RegistrationButton.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `registerForEvent(churchId, eventId)`, Task 2의 `getRegistrationState`/`getRegistrationMessage`/`isLocallyRegistered`/`markLocallyRegistered`/`REG_BTN_TONE`/`REG_STATUS`.
- Produces: `<RegistrationButton event={event} size?="sm"|"lg" className? />` — **`showRemaining` prop 제거됨**. 다른 태스크가 이 컴포넌트를 더 소비하지 않는다.

- [ ] **Step 1: `RegistrationButton.test.jsx` 작성**

`src/components/events/RegistrationButton.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import RegistrationButton from "./RegistrationButton";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const OPEN_EVENT = { id: "e1", date: "2999-01-01", canRegister: true };
const CLOSED_EVENT = { id: "e2", date: "2000-01-01", canRegister: true };
const NO_REGISTER_EVENT = { id: "e3", date: "2999-01-01", canRegister: false };

describe("RegistrationButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("canRegister가 false인 행사는 아무것도 렌더링하지 않는다", () => {
    renderWithChurch(<RegistrationButton event={NO_REGISTER_EVENT} />, { withAuth: true });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("행사일이 지났으면 비활성화된 '신청 마감' 버튼을 보여준다", () => {
    renderWithChurch(<RegistrationButton event={CLOSED_EVENT} />, { withAuth: true });
    expect(screen.getByRole("button", { name: "신청 마감" })).toBeDisabled();
  });

  it("로그인하지 않은 상태에서 클릭하면 로그인 안내 모달이 뜨고 API는 호출되지 않는다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));

    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("로그인한 상태에서 클릭하면 신청 API를 호출하고 버튼이 신청완료로 바뀐다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockResolvedValue({ data: { registered: true } });
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(`/churches/${expect.any(String)}/events/e1/register`),
    );
    expect(await screen.findByRole("button", { name: "신청완료" })).toBeDisabled();
  });

  it("이미 로컬에 신청 기록이 있으면 처음부터 신청완료로 렌더링된다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    localStorage.setItem("event_registered_togather-church_e1_hong@example.com", "true");
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    expect(screen.getByRole("button", { name: "신청완료" })).toBeDisabled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("신청 API가 실패하면 에러 메시지를 보여준다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));

    expect(
      await screen.findByText("신청에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
```

`renderWithChurch`가 기본으로 주입하는 `church.id`는 `@/config/church.config`의 `id: "togather-church"`다(다섯 번째 테스트의 localStorage 키에 그대로 반영돼 있다).

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/events/RegistrationButton.test.jsx`
Expected: FAIL — 현재 `RegistrationButton.jsx`는 클릭 시 `/교회행사/:id/신청`으로 네비게이션만 하고 API를 직접 호출하지 않으므로, "신청완료" 전환·로그인 모달·에러 메시지 관련 테스트가 전부 실패한다.

- [ ] **Step 3: `RegistrationButton.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { registerForEvent } from "@/services/eventsService";
import {
  getRegistrationState,
  getRegistrationMessage,
  isLocallyRegistered,
  markLocallyRegistered,
  REG_BTN_TONE,
  REG_STATUS,
} from "@/utils/eventStatus";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

/**
 * 행사 신청 버튼. canRegister:false인 행사는 아무것도 렌더링하지 않는다.
 * 클릭 시 신청 API를 직접 호출하고, 성공하면 이 브라우저에 로컬로 "신청완료"를 기록한다
 * (백엔드에 신청 여부 조회 API가 없어 다른 기기/브라우저에서는 초기화됨).
 * @param {{
 *   event: import('@/services/eventsService').Event,
 *   size?: "sm"|"lg",       // sm: 캘린더 사이드바(flex-1 pill) / lg: 상세페이지·sticky bar
 *   className?: string,
 * }} props
 */
export default function RegistrationButton({ event, size = "lg", className = "" }) {
  const { church } = useChurch();
  const { currentUser } = useAuth();
  const state = getRegistrationState(event);
  const [registered, setRegistered] = useState(
    () => !!event && isLocallyRegistered(church.id, event.id, currentUser?.email),
  );
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(null);

  if (!event || state.status === REG_STATUS.NONE) return null;

  const handleClick = async () => {
    if (state.disabled || registered || submitting) return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await registerForEvent(church.id, event.id);
      markLocallyRegistered(church.id, event.id, currentUser.email);
      setRegistered(true);
    } catch {
      setError("신청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = registered ? "신청완료" : submitting ? "신청 중..." : state.label;
  const disabled = state.disabled || registered || submitting;
  const tone = registered ? REG_BTN_TONE[REG_STATUS.CLOSED] : REG_BTN_TONE[state.status];
  const message = registered ? "" : getRegistrationMessage(state);

  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={
        size === "sm"
          ? `flex-1 py-2.5 rounded-full text-body-5 font-semibold border transition-colors ${tone} ${className}`
          : `px-16 py-3 rounded-full text-btn-normal font-semibold transition-colors ${tone} ${className}`
      }
    >
      {label}
    </button>
  );

  const loginModal = showLoginModal && (
    <LoginRequiredModal
      message="행사 신청은 로그인 후 이용하실 수 있습니다."
      onCancel={() => setShowLoginModal(false)}
    />
  );

  if (size === "sm") {
    return (
      <>
        {button}
        {loginModal}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {button}
      {error && <span className="text-body-5 text-red-500">{error}</span>}
      {!error && message && <span className="text-body-5 text-grey-6">{message}</span>}
      {loginModal}
    </div>
  );
}
```

- [ ] **Step 4: `EventDetail.jsx`에서 `showRemaining` prop 제거**

`src/pages/Events/EventDetail.jsx`의 90번째 줄:

```jsx
// 변경 전
        <RegistrationButton event={event} size="lg" showRemaining />
```

```jsx
// 변경 후
        <RegistrationButton event={event} size="lg" />
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/events/RegistrationButton.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 6: 커밋**

```bash
git add src/components/events/RegistrationButton.jsx src/components/events/RegistrationButton.test.jsx src/pages/Events/EventDetail.jsx
git commit -m "feat: RegistrationButton이 신청 API를 직접 호출하고 로컬로 신청완료를 추적"
```

---

### Task 4: `EventApply.jsx` 삭제 + 라우트 정리 + `Events.jsx` 없는 필드 참조 제거

**Files:**
- Delete: `src/pages/Events/EventApply.jsx`
- Modify: `src/routes.jsx`
- Modify: `src/pages/Events/Events.jsx`

**Interfaces:**
- Consumes: 없음(파일 삭제 + 두 곳의 단순 편집).
- Produces: 없음.

- [ ] **Step 1: `EventApply.jsx` 파일 삭제**

```bash
rm src/pages/Events/EventApply.jsx
```

- [ ] **Step 2: `routes.jsx`에서 `EventApply` import와 라우트 항목 제거**

`src/routes.jsx`의 11번째 줄(import):

```js
// 삭제
import EventApply from "@/pages/Events/EventApply";
```

`src/routes.jsx`의 64번째 줄(라우트 배열 안):

```js
// 삭제
      { path: "교회행사/:id/신청", element: <EventApply /> },
```

- [ ] **Step 3: `Events.jsx`에서 `evt.createdAt` 표시 제거**

`src/pages/Events/Events.jsx`의 250-258번째 줄:

```jsx
// 변경 전
                  <div key={evt.id} className="px-6 py-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-body-5 font-semibold px-2 py-0.5 rounded-full ${ds.chip}`}
                      >
                        {evt.department}
                      </span>
                      <span className="text-body-5 text-bluegrey-4">등록일 {evt.createdAt}</span>
                    </div>
```

```jsx
// 변경 후
                  <div key={evt.id} className="px-6 py-5 flex flex-col gap-3">
                    <div className="flex items-center">
                      <span
                        className={`text-body-5 font-semibold px-2 py-0.5 rounded-full ${ds.chip}`}
                      >
                        {evt.department}
                      </span>
                    </div>
```

- [ ] **Step 4: 개발 서버가 정상적으로 빌드되는지 확인**

Run: `pnpm vitest run src/routes.test.jsx`
Expected: PASS — 이 파일은 `교회행사/:id/신청` 라우트를 직접 검증하지 않으므로 삭제로 인해 깨지는 기존 테스트는 없다.

- [ ] **Step 5: 커밋**

```bash
git add -A src/pages/Events/EventApply.jsx src/routes.jsx src/pages/Events/Events.jsx
git commit -m "refactor: EventApply 폼 페이지 제거 및 없는 createdAt 필드 참조 정리"
```

---

### Task 5: `EventsManage.jsx` — 관리자 화면을 백엔드 계약에 맞게 재설계

**Files:**
- Modify: `src/pages/admin/EventsManage.jsx`
- Test: `src/pages/admin/EventsManage.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `isDummy("events")`로 전환된 `getEvents`/`createEvent`/`updateEvent`/`deleteEvent`, Task 2의 `getRegistrationState`.
- Produces: 없음(리프 페이지 컴포넌트).

- [ ] **Step 1: `EventsManage.test.jsx` 작성**

`src/pages/admin/EventsManage.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import EventsManage from "./EventsManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const EVENT = {
  id: 1,
  title: "여름 수련회",
  department: "청년부",
  date: "2999-01-01",
  startTime: null,
  endTime: null,
  location: "본당",
  description: "설명",
  canRegister: true,
  imageUrl: null,
};

describe("EventsManage — 관리자 CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [EVENT] } });
  });

  it("목록을 불러와 렌더링하고 더미 모드 안내 문구는 표시하지 않는다", async () => {
    renderWithChurch(<EventsManage />);
    expect(await screen.findByText("여름 수련회")).toBeInTheDocument();
    expect(screen.queryByText(/더미 모드/)).not.toBeInTheDocument();
  });

  it("신청현황 컬럼은 인원수 없이 '신청가능' 배지만 표시한다", async () => {
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");
    expect(screen.getByText("신청가능")).toBeInTheDocument();
  });

  it("등록/수정 폼에 정원·신청기간 입력 필드가 없다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "행사 등록" }));

    expect(screen.queryByText("정원")).not.toBeInTheDocument();
    expect(screen.queryByText("신청 시작일")).not.toBeInTheDocument();
    expect(screen.queryByText("신청 마감일")).not.toBeInTheDocument();
  });

  it("삭제가 실패하면(신청 이력이 있는 행사) 에러 안내를 보여주고 목록은 유지된다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockRejectedValue({ response: { status: 500, data: { code: "C004" } } });
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      await screen.findByText("삭제할 수 없습니다. 이미 신청 내역이 있는 행사일 수 있습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("여름 수련회")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/admin/EventsManage.test.jsx`
Expected: FAIL — 현재 `EventsManage.jsx`는 여전히 "더미 모드: 새로고침 시 초기화됩니다" 문구를 보여주고, 정원/신청기간 입력 필드가 여전히 있으며(단, `canRegister` 체크박스를 켜야 나타나므로 이 테스트만으로는 등록 모달 초기 상태에서는 안 보일 수 있음 — 실제로는 `emptyForm()`의 기본값 `canRegister:false`라 폼을 처음 열면 그 필드들이 안 보이는 상태이므로 이 테스트는 통과할 수도 있다. 다만 신청현황 배지("신청가능")와 삭제 에러 처리 테스트는 확실히 실패한다), `handleDelete`에 에러 처리가 없어 삭제 실패 테스트가 확실히 실패한다.

- [ ] **Step 3: `EventsManage.jsx`를 아래와 같이 수정 — `emptyForm`/`toFormState`에서 정원·신청기간 필드 제거**

`src/pages/admin/EventsManage.jsx`의 14-42번째 줄:

```js
// 변경 전
function emptyForm() {
  return {
    title: "",
    department: EVENT_CATEGORIES[0],
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    imageUrl: "",
    canRegister: false,
    registrationStart: "",
    registrationEnd: "",
    capacity: "",
  };
}

function toFormState(event) {
  if (!event) return emptyForm();
  return {
    ...event,
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    imageUrl: event.imageUrl ?? "",
    registrationStart: event.registrationStart ?? "",
    registrationEnd: event.registrationEnd ?? "",
    capacity: event.capacity ?? "",
  };
}
```

```js
// 변경 후
function emptyForm() {
  return {
    title: "",
    department: EVENT_CATEGORIES[0],
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    imageUrl: "",
    canRegister: false,
  };
}

function toFormState(event) {
  if (!event) return emptyForm();
  return {
    ...event,
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    imageUrl: event.imageUrl ?? "",
  };
}
```

- [ ] **Step 4: `handleSubmit`에서 정원·신청기간 payload 조립 제거**

`src/pages/admin/EventsManage.jsx`의 `EventFormModal` 안 `handleSubmit`(현재 54-65번째 줄):

```js
// 변경 전
  const handleSubmit = () => {
    if (!form.title.trim() || !form.date) return;
    onSave({
      ...form,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      imageUrl: form.imageUrl || null,
      capacity: form.canRegister && form.capacity !== "" ? Number(form.capacity) : null,
      registrationStart: form.canRegister && form.registrationStart ? form.registrationStart : null,
      registrationEnd: form.canRegister && form.registrationEnd ? form.registrationEnd : null,
    });
  };
```

```js
// 변경 후
  const handleSubmit = () => {
    if (!form.title.trim() || !form.date) return;
    onSave({
      ...form,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      imageUrl: form.imageUrl || null,
    });
  };
```

- [ ] **Step 5: 폼 모달에서 정원·신청기간 입력 블록 제거**

`src/pages/admin/EventsManage.jsx`의 `EventFormModal` JSX 안, "신청 받기" 체크박스 바로 다음(현재 158-200번째 줄):

```jsx
// 변경 전
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.canRegister}
              onChange={set("canRegister")}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-body-4 text-grey-8">신청 받기</span>
          </label>

          {form.canRegister && (
            <div className="grid grid-cols-3 gap-4 bg-grey-1 rounded-xl p-4">
              <div>
                <label className={labelCls}>신청 시작일</label>
                <input
                  type="date"
                  className={`${inputCls} bg-white`}
                  value={form.registrationStart}
                  onChange={set("registrationStart")}
                />
              </div>
              <div>
                <label className={labelCls}>신청 마감일</label>
                <input
                  type="date"
                  className={`${inputCls} bg-white`}
                  value={form.registrationEnd}
                  onChange={set("registrationEnd")}
                />
              </div>
              <div>
                <label className={labelCls}>정원</label>
                <input
                  type="number"
                  min={1}
                  className={`${inputCls} bg-white`}
                  value={form.capacity}
                  onChange={set("capacity")}
                  placeholder="비워두면 무제한"
                />
              </div>
            </div>
          )}
        </div>
```

```jsx
// 변경 후
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.canRegister}
              onChange={set("canRegister")}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-body-4 text-grey-8">신청 받기</span>
          </label>
        </div>
```

- [ ] **Step 6: `EventsManage` 컴포넌트 — 더미 모드 문구 제거, 삭제 에러 처리, 신청현황 컬럼 축소**

import는 이미 필요한 것만 있어 이 스텝에서 변경하지 않는다.

`STATUS_BADGE` 정의(현재 225-229번째 줄)와 그 아래 새 `ADMIN_STATUS_LABEL` 상수 추가:

```js
// 변경 전
const STATUS_BADGE = {
  open: "bg-blue-1 text-blue-8",
  upcoming: "bg-grey-2 text-grey-7",
  closed: "bg-grey-2 text-grey-6",
};
```

```js
// 변경 후
const STATUS_BADGE = {
  open: "bg-blue-1 text-blue-8",
  closed: "bg-grey-2 text-grey-6",
};

const ADMIN_STATUS_LABEL = {
  open: "신청가능",
  closed: "신청마감",
};
```

`EventsManage` 함수 본문의 state 선언부(현재 232-241번째 줄)에 `deleteError` state 추가:

```js
// 변경 전
export default function EventsManage() {
  const { church } = useChurch();
  const {
    data: events = [],
    loading,
    refetch,
  } = useFetch(() => getEvents(church.id), [church.id], []);
  const [tab, setTab] = useState("전체");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | event
  const [saving, setSaving] = useState(false);
```

```js
// 변경 후
export default function EventsManage() {
  const { church } = useChurch();
  const {
    data: events = [],
    loading,
    refetch,
  } = useFetch(() => getEvents(church.id), [church.id], []);
  const [tab, setTab] = useState("전체");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | event
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
```

`handleDelete` 함수(현재 262-266번째 줄):

```js
// 변경 전
  async function handleDelete(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteEvent(church.id, id);
    await refetch();
  }
```

```js
// 변경 후
  async function handleDelete(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    setDeleteError(null);
    try {
      await deleteEvent(church.id, id);
      await refetch();
    } catch {
      setDeleteError("삭제할 수 없습니다. 이미 신청 내역이 있는 행사일 수 있습니다.");
    }
  }
```

더미 모드 안내 문구(현재 299번째 줄)와 그 위 헤더 부분(279-299번째 줄) — `deleteError` 렌더링 추가:

```jsx
// 변경 전
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-headline-5 font-bold text-grey-11">교회행사 관리</h1>
        <button
          onClick={() => setModal("new")}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          행사 등록
        </button>
      </div>
      <p className="text-body-5 text-grey-5 mb-6">더미 모드: 새로고침 시 초기화됩니다.</p>
```

```jsx
// 변경 후
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">교회행사 관리</h1>
        <button
          onClick={() => setModal("new")}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          행사 등록
        </button>
      </div>
      {deleteError && <p className="text-body-4 text-red-500 mb-4">{deleteError}</p>}
```

**중요 — "신청기간" 컬럼 자체를 제거한다.** "신청현황"과 별개로, 테이블에는 `e.registrationStart`/`e.registrationEnd`를 보여주는 "신청기간" 컬럼이 하나 더 있다(백엔드에 이 필드들이 없으므로 값이 항상 빈 문자열로 표시될 것). `GRID_COLS`도 컬럼 하나가 줄어드는 만큼 7개로 조정한다.

`GRID_COLS` 정의(현재 223번째 줄):

```js
// 변경 전
const GRID_COLS = "48px 90px 1fr 130px 120px 150px 100px 110px";
```

```js
// 변경 후
const GRID_COLS = "48px 90px 1fr 130px 120px 100px 110px";
```

테이블 헤더(현재 339-346번째 줄):

```jsx
// 변경 전
          <span className="text-center">No</span>
          <span className="text-center">부서</span>
          <span className="pl-2">행사명</span>
          <span>장소</span>
          <span className="text-center">행사일시</span>
          <span className="text-center">신청기간</span>
          <span className="text-center">신청현황</span>
          <span className="text-center">관리</span>
```

```jsx
// 변경 후
          <span className="text-center">No</span>
          <span className="text-center">부서</span>
          <span className="pl-2">행사명</span>
          <span>장소</span>
          <span className="text-center">행사일시</span>
          <span className="text-center">신청현황</span>
          <span className="text-center">관리</span>
```

"신청기간" 행 셀(현재 382-404번째 줄, "신청현황" 셀까지 함께 교체):

```jsx
// 변경 전
                <span className="text-body-5 text-grey-6 text-center">
                  {e.canRegister
                    ? `${formatDotDate(e.registrationStart)} ~ ${formatDotDate(e.registrationEnd)}`
                    : "-"}
                </span>
                <span className="text-center">
                  {e.canRegister ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-body-5 text-grey-7">
                        {e.capacity != null
                          ? `${e.registeredCount}/${e.capacity}`
                          : `${e.registeredCount}명`}
                      </span>
                      <span
                        className={`text-body-5 font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[regState.status] ?? STATUS_BADGE.closed}`}
                      >
                        {regState.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-body-5 text-grey-4">-</span>
                  )}
                </span>
```

```jsx
// 변경 후
                <span className="text-center">
                  {e.canRegister ? (
                    <span
                      className={`text-body-5 font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[regState.status] ?? STATUS_BADGE.closed}`}
                    >
                      {ADMIN_STATUS_LABEL[regState.status] ?? "-"}
                    </span>
                  ) : (
                    <span className="text-body-5 text-grey-4">-</span>
                  )}
                </span>
```

- [ ] **Step 7: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/admin/EventsManage.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 8: 전체 스위트 + lint 확인**

Run: `pnpm test:run && pnpm run lint`
Expected: 모든 테스트 통과, lint 경고 없음.

(로컬 `.env`에 `VITE_USE_DUMMY=false`가 설정돼 있으면 이 사이클과 무관한 도메인 테스트가 실패할 수 있다 — 그 경우 `VITE_USE_DUMMY=true pnpm test:run`으로 override해서 재확인한다.)

- [ ] **Step 9: 커밋**

```bash
git add src/pages/admin/EventsManage.jsx src/pages/admin/EventsManage.test.jsx
git commit -m "feat: EventsManage가 백엔드 계약에 맞게 정원/신청기간 필드를 제거하고 삭제 에러를 처리"
```
