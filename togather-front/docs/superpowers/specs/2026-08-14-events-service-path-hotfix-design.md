# 행사 API 경로 핫픽스 설계

## 배경

백엔드 전체 API 전수조사(2026-08-14) 중 `src/services/eventsService.js`가 실제로 존재하지 않는 백엔드 경로를 호출 중임을 발견했다. `events` 도메인은 아직 `VITE_DUMMY_DOMAINS`에 남아있어(백엔드 연동 기반작업 사이클, Cycle 1 결정) 지금은 `USE_DUMMY=true`일 때만 드러나지 않고 있지만, `USE_DUMMY=false`(현재 사용자 로컬 설정)이거나 향후 행사 사이클에서 실연동하면 그대로 404가 난다.

## 문제 정리

백엔드 OpenAPI 스펙(`http://localhost:8080/v3/api-docs`)을 직접 조회해 확인:

| 함수 | 현재 프론트가 호출하는 경로 | 실제 백엔드 상태 |
|---|---|---|
| `createEvent` | `POST /churches/{churchId}/events` | 존재하지 않음. 실제: `POST /api/church/admin/events`(호스트 기반 v1, churchId 경로에 없음) |
| `updateEvent` | `PUT /churches/{churchId}/events/{eventId}` | 존재하지 않음. 실제: `PATCH /api/church/admin/events/{eventId}` |
| `deleteEvent` | `DELETE /churches/{churchId}/events/{eventId}` | 존재하지 않음. 실제: `DELETE /api/church/admin/events/{eventId}` |
| `searchEvents` | `GET /churches/{churchId}/events/search?q&sort` | **엔드포인트 자체가 없음** — 목록 API(`GET /churches/{churchId}/events`)는 `year`/`month` 필터만 지원, 검색/정렬 파라미터 없음 |
| `getRecentEvents` | `GET /churches/{churchId}/events/recent?limit` | **엔드포인트 자체가 없음** |

`EventUpsertRequest`(백엔드 스키마)는 `{title, department, date, startTime, endTime, location, description, canRegister, imageUrl}` — 프론트의 기존 `Event` payload 필드와 이름이 정확히 일치한다. payload 형태는 그대로 두고 URL/메서드만 고치면 된다.

## 설계

### 1. `createEvent`/`updateEvent`/`deleteEvent` — 진짜 경로 오타 수정

실제 존재하는 엔드포인트로 URL·HTTP 메서드만 교체한다(payload 구조 변경 없음):

```js
export async function createEvent(churchId, payload) {
  if (USE_DUMMY) { /* 기존 그대로 */ }
  const res = await api.post(`/church/admin/events`, payload);
  return res.data.data;
}

export async function updateEvent(churchId, eventId, payload) {
  if (USE_DUMMY) { /* 기존 그대로 */ }
  const res = await api.patch(`/church/admin/events/${eventId}`, payload);
  return res.data.data;
}

export async function deleteEvent(churchId, eventId) {
  if (USE_DUMMY) { /* 기존 그대로 */ }
  const res = await api.delete(`/church/admin/events/${eventId}`);
  return res.data;
}
```

`churchId` 파라미터는 호출부(`EventsManage.jsx`) 시그니처를 안 바꾸려고 그대로 유지하되(더 이상 URL에 안 쓰임), 실제 테넌트 식별은 `api.js`가 이미 붙이는 `X-Church-Id` 헤더가 담당한다(백엔드 연동 기반작업 사이클에서 이미 구현됨) — `/api/church/admin/**`는 host 또는 이 헤더로 테넌트를 식별하는 v1 계약과 일치한다.

### 2. `searchEvents`/`getRecentEvents` — 백엔드에 없는 기능이므로 클라이언트 필터링으로 대체

백엔드가 검색/최근순 전용 엔드포인트를 제공하지 않으므로, 더미 모드에서 이미 쓰던 것과 동일한 클라이언트 필터링 로직(`normalize()`, `sortEvents()` — 파일에 이미 정의돼 있음)을 실 API 모드에도 그대로 적용한다: 목록 전체를 `GET /churches/{churchId}/events`(연도/월 필터 없이 전체 조회)로 가져온 뒤 클라이언트에서 검색어 매칭·정렬한다.

```js
export async function searchEvents(churchId, { q = "", sort = "date" } = {}) {
  if (USE_DUMMY) { /* 기존 그대로 */ }
  const res = await api.get(`/churches/${churchId}/events`);
  const key = normalize(q);
  const list = key
    ? res.data.data.filter((e) =>
        [e.title, e.description, e.location, e.department].some((f) => normalize(f).includes(key)),
      )
    : res.data.data;
  return sortEvents(list, sort);
}

export async function getRecentEvents(churchId, limit = 5) {
  if (USE_DUMMY) { /* 기존 그대로 */ }
  const res = await api.get(`/churches/${churchId}/events`);
  return sortEvents(res.data.data, "createdAt").slice(0, limit);
}
```

이 방식은 행사 수가 많아지면 매번 전체 목록을 내려받는 비효율이 있지만, 지금 규모(교회 행사 목록)에서는 실용적이고, 백엔드에 서버사이드 검색이 추가되면 그때 다시 서버 호출로 바꾸면 된다(행사 사이클에서 재검토 대상으로 남긴다).

### 비목표

- `getEvents`, `getEventById`, `registerForEvent`는 이미 올바른 경로(`/churches/{churchId}/events`, `/churches/{churchId}/events/{eventId}`, `/churches/{churchId}/events/{eventId}/register`)를 쓰고 있어 손대지 않는다.
- `USE_DUMMY` → `isDummy("events")` 전환은 이번 핫픽스 범위가 아니다(행사 사이클에서 처리).
- 백엔드에 검색 전용 엔드포인트를 새로 만드는 것도 범위 밖(백엔드는 건드리지 않는다는 사용자 방침).

## 테스트 계획

`src/services/eventsService.test.js`(신규, 기존 테스트 없음) — `vi.mock("@/services/api", ...)`로 API 호출을 모킹:
- `createEvent`가 `POST /church/admin/events`를 정확한 payload로 호출하는지
- `updateEvent`가 `PATCH /church/admin/events/{eventId}`를 호출하는지
- `deleteEvent`가 `DELETE /church/admin/events/{eventId}`를 호출하는지
- `searchEvents`가 `GET /churches/{churchId}/events`(쿼리 없이 전체)를 호출하고, 검색어로 클라이언트 필터링·정렬 결과를 반환하는지
- `getRecentEvents`가 같은 목록 API를 호출하고 `createdAt` 기준 정렬 후 `limit`만큼 잘라 반환하는지

## 확인 필요

없음 — 백엔드 OpenAPI 스펙 직접 조회로 전부 검증됨.
