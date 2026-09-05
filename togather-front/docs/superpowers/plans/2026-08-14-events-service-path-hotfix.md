# 행사 API 경로 핫픽스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/services/eventsService.js`의 5개 함수(`createEvent`/`updateEvent`/`deleteEvent`/`searchEvents`/`getRecentEvents`)가 실제로 존재하는 백엔드 엔드포인트를 부르도록 고친다.

**Architecture:** `USE_DUMMY` 분기는 그대로 두고, 실 API 분기(`if (USE_DUMMY) {...}` 이후 코드)만 교체한다. `createEvent`/`updateEvent`/`deleteEvent`는 URL·HTTP 메서드만 실제 백엔드 경로로 바꾸고, `searchEvents`/`getRecentEvents`는 백엔드에 대응 엔드포인트가 없어 전체 목록 조회 후 기존에 이미 정의된 `normalize()`/`sortEvents()` 헬퍼로 클라이언트 필터링·정렬한다.

**Tech Stack:** Axios, Vitest + `vite-plus/test`.

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-08-14-events-service-path-hotfix-design.md`
- `getEvents`, `getEventById`, `registerForEvent`는 이미 올바른 경로라 손대지 않는다.
- `USE_DUMMY` → `isDummy("events")` 전환은 이번 범위 아니다(행사 사이클로 이관) — `if (USE_DUMMY)` 분기 자체와 그 안의 더미 로직은 절대 건드리지 않는다.
- 백엔드 응답 envelope은 `{success, data}` — 기존처럼 `res.data.data`로 언랩한다.
- 정확한 백엔드 경로: `POST /church/admin/events`(생성), `PATCH /church/admin/events/{eventId}`(수정), `DELETE /church/admin/events/{eventId}`(삭제) — 전부 `churchId`가 URL에 없다(host/`X-Church-Id` 헤더로 테넌트 식별, 기반작업 사이클에서 이미 구현됨).
- 절대로 origin에 push하지 않는다 — 로컬 커밋까지만.

---

## 파일 구조

```
src/services/eventsService.js       — 수정: 5개 함수의 실 API 분기만
src/services/eventsService.test.js  — 신규: 이 파일 전체를 검증하는 첫 테스트
```

## Task 1: `eventsService.js` 경로 수정 (TDD)

**Files:**
- Modify: `src/services/eventsService.js`
- Test: `src/services/eventsService.test.js` (신규)

**Interfaces:**
- Consumes: `src/services/api.js`의 `api`(default export), `USE_DUMMY`(기존 그대로, 변경 없음).
- Produces: 없음(이 계획의 유일한 태스크 — 함수 시그니처는 전부 기존과 동일하게 유지되므로 호출부인 `EventsManage.jsx`/`EventSearch.jsx` 수정 불필요).

- [ ] **Step 1: `eventsService.test.js` 작성**

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  USE_DUMMY: false,
}));

import api from "@/services/api";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getRecentEvents,
} from "./eventsService";

const EVENTS = [
  {
    id: "e1",
    title: "여름 수련회",
    department: "청년부",
    date: "2026-01-10",
    startTime: null,
    endTime: null,
    location: "본당",
    description: "청년부 여름 수련회 안내",
    imageUrl: null,
    createdAt: "2026-01-01",
    canRegister: true,
    registeredCount: 0,
  },
  {
    id: "e2",
    title: "가을 바자회",
    department: "여전도회",
    date: "2026-02-05",
    startTime: null,
    endTime: null,
    location: "교육관",
    description: "알뜰 바자회",
    imageUrl: null,
    createdAt: "2026-01-15",
    canRegister: false,
    registeredCount: 0,
  },
];

describe("eventsService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEvent는 POST /church/admin/events를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 행사", date: "2026-03-01" };
    api.post.mockResolvedValue({ data: { data: { id: "e3", ...payload } } });

    const result = await createEvent("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/events", payload);
    expect(result).toEqual({ id: "e3", ...payload });
  });

  it("updateEvent는 PATCH /church/admin/events/{eventId}를 호출한다", async () => {
    const payload = { title: "수정된 제목" };
    api.patch.mockResolvedValue({ data: { data: { id: "e1", ...payload } } });

    const result = await updateEvent("1", "e1", payload);

    expect(api.patch).toHaveBeenCalledWith("/church/admin/events/e1", payload);
    expect(result).toEqual({ id: "e1", ...payload });
  });

  it("deleteEvent는 DELETE /church/admin/events/{eventId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    const result = await deleteEvent("1", "e1");

    expect(api.delete).toHaveBeenCalledWith("/church/admin/events/e1");
    expect(result).toEqual({ success: true });
  });

  it("searchEvents는 전체 목록을 조회해 검색어로 클라이언트 필터링한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await searchEvents("1", { q: "바자회", sort: "date" });

    expect(api.get).toHaveBeenCalledWith("/churches/1/events");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e2");
  });

  it("searchEvents는 검색어가 없으면 전체 목록을 정렬만 해서 반환한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await searchEvents("1", { q: "", sort: "date" });

    expect(result).toHaveLength(2);
  });

  it("getRecentEvents는 전체 목록을 createdAt 기준 정렬해 limit만큼 반환한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await getRecentEvents("1", 1);

    expect(api.get).toHaveBeenCalledWith("/churches/1/events");
    expect(result).toHaveLength(1);
    // createdAt이 더 최근인 e2(2026-01-15)가 e1(2026-01-01)보다 먼저 와야 한다
    expect(result[0].id).toBe("e2");
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/services/eventsService.test.js`
Expected: FAIL — 지금 코드는 `api.post("/churches/1/events", ...)`, `api.put(...)`, `/events/search`, `/events/recent`를 호출하므로 mock된 `api.patch`/정확한 URL 검증에서 전부 실패해야 한다.

- [ ] **Step 3: `eventsService.js`의 5개 함수 실 API 분기 수정**

`searchEvents` 함수 전체(기존 61~81행 상당)를 아래로 교체:

```js
/**
 * 행사 검색
 * @param {string} churchId
 * @param {{ q?:string, sort?:"date"|"createdAt" }} params
 * @returns {Promise<Event[]>}
 */
export async function searchEvents(churchId, { q = "", sort = "date" } = {}) {
  if (USE_DUMMY) {
    const key = normalize(q);
    const list = key
      ? DUMMY_EVENTS.filter((e) =>
          [e.title, e.description, e.location, e.department].some((f) =>
            normalize(f).includes(key),
          ),
        )
      : [...DUMMY_EVENTS];
    return sortEvents(list, sort);
  }
  // 백엔드에 검색 전용 엔드포인트가 없어 전체 목록을 받아 클라이언트에서 필터링한다.
  const res = await api.get(`/churches/${churchId}/events`);
  const key = normalize(q);
  const list = key
    ? res.data.data.filter((e) =>
        [e.title, e.description, e.location, e.department].some((f) => normalize(f).includes(key)),
      )
    : res.data.data;
  return sortEvents(list, sort);
}
```

`getRecentEvents` 함수 전체(기존 83~95행 상당)를 아래로 교체:

```js
/**
 * 최근 등록된 행사 조회 (검색 결과 없음 상태에서 사용)
 * @param {string} churchId
 * @param {number} limit
 * @returns {Promise<Event[]>}
 */
export async function getRecentEvents(churchId, limit = 5) {
  if (USE_DUMMY) {
    return sortEvents(DUMMY_EVENTS, "createdAt").slice(0, limit);
  }
  // 백엔드에 최근순 전용 엔드포인트가 없어 전체 목록을 받아 클라이언트에서 정렬한다.
  const res = await api.get(`/churches/${churchId}/events`);
  return sortEvents(res.data.data, "createdAt").slice(0, limit);
}
```

`createEvent` 함수의 마지막 줄(기존 `const res = await api.post(...)` 부분)을 교체:

```js
  const res = await api.post(`/church/admin/events`, payload);
  return res.data.data;
}
```

`updateEvent` 함수의 마지막 줄을 교체:

```js
  const res = await api.patch(`/church/admin/events/${eventId}`, payload);
  return res.data.data;
}
```

`deleteEvent` 함수의 마지막 줄을 교체:

```js
  const res = await api.delete(`/church/admin/events/${eventId}`);
  return res.data;
}
```

(각 함수의 `if (USE_DUMMY) { ... }` 블록과 JSDoc 주석, 함수 시그니처는 전혀 건드리지 않는다 — 마지막 실 API 호출부만 바꾼다.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test:run src/services/eventsService.test.js`
Expected: PASS (6개 전부)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 기존 테스트 전부 통과 + 신규 6개 포함 증가. `EventsManage.jsx`/`EventSearch.jsx`를 실제로 사용하는 기존 테스트가 있다면(있는지 확인 후) 그 결과도 확인 — 함수 시그니처가 안 바뀌었으므로 영향 없어야 한다.

Run: `pnpm run build`
Expected: 에러 없이 완료.

Run: `pnpm run lint`
Expected: 무경고.

- [ ] **Step 6: 커밋**

```bash
git add src/services/eventsService.js src/services/eventsService.test.js
git commit -m "fix: eventsService.js가 실제 존재하는 백엔드 경로를 호출하도록 수정

createEvent/updateEvent/deleteEvent가 존재하지 않는 /churches/{id}/events
경로를 호출하고 있었다 — 실제로는 /church/admin/events(POST/PATCH/DELETE,
호스트+X-Church-Id 기반, 경로에 churchId 없음)가 맞는 경로다.
searchEvents/getRecentEvents가 부르던 /events/search, /events/recent는
백엔드에 아예 없어서, 전체 목록을 받아와 기존 normalize()/sortEvents()로
클라이언트에서 필터링·정렬하도록 바꿨다."
```

---

## Self-Review 결과

**스펙 커버리지**: 스펙의 5개 함수 수정 사항(§1 진짜 경로 오타 3개, §2 클라이언트 필터링 대체 2개) 전부 Task 1의 Step 3 코드에 반영됨. 테스트 계획 5개 항목(각 함수의 정확한 URL/메서드 검증 + 클라이언트 필터링·정렬 결과 검증)이 Step 1의 6개 테스트로 커버됨(searchEvents는 검색어 있음/없음 두 케이스로 분리).

**플레이스홀더 스캔**: 없음 — 모든 스텝에 실제 코드/명령어 포함.

**타입 일관성**: 5개 함수 모두 기존 시그니처(`(churchId, ...)`)를 그대로 유지하므로 교차 태스크 참조 문제 없음(단일 태스크). 반환값 형태(`res.data.data` 또는 `res.data`)도 기존 각 함수의 관례를 그대로 따름.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-14-events-service-path-hotfix.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
