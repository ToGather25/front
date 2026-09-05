# 설교·방송 관리자 CRUD 실연동 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 "화면은 있는데 API 미연동 24건" 배치 중 다섯 번째 서브프로젝트. 대상은 `WorshipManage.jsx`(관리자 예배·설교 관리) 하나뿐이다 — 설교/방송 "공개" 페이지(`WordSermon.jsx`/`WordBroadcast.jsx`)는 YouTube API를 직접 호출하는 별도 설계 충돌 건으로 사용자 지시에 따라 이 배치에서 완전히 제외하고 손대지 않는다.

앞선 두 서브프로젝트(교적부, 주보)와 달리 이번엔 백엔드 필드가 프론트 데이터 모델과 크게 어긋나지 않는다 — 다만 방송(라이브) 쪽은 **조회 API가 아예 없어서** 예약/시작/종료 상태를 백엔드에 물어볼 방법이 없다는 제약이 있다.

## 백엔드 계약 (실제 컨트롤러 소스로 확인, `ChurchAdminSermonController.java`)

| 동작 | 엔드포인트 | 필드 |
|---|---|---|
| 설교 등록 | `POST /api/church/admin/sermons` | 요청/응답: `title, scripture, preacher, worshipType, youtubeVideoId, sermonDate` (title/sermonDate만 필수) |
| 설교 수정 | `PATCH /api/church/admin/sermons/{publicId}` | 위와 동일 |
| 설교 삭제 | `DELETE /api/church/admin/sermons/{publicId}` | 응답 없음(204) |
| 방송 예약 | `POST /api/church/admin/broadcasts` | 요청: `sermonId(UUID), youtubeLiveUrl, scheduledStartAt(ISO datetime)`. 응답: `{id, status}` — `status`는 `BEFORE`\|`LIVE`\|`ENDED` |
| 방송 시작 | `POST /api/church/admin/broadcasts/{id}/start` | 응답: `{id, status:"LIVE"}`. `BEFORE` 상태가 아니면 에러 |
| 방송 종료 | `POST /api/church/admin/broadcasts/{id}/end` | 응답: `{id, status:"ENDED"}`. `LIVE` 상태가 아니면 에러 |

- **방송 조회 API가 없다** — 목록/상세 GET이 전혀 없다. 이미 예약된 방송이 있는지, 지금 상태가 뭔지 백엔드에 물어볼 방법이 자체가 없다. `POST /broadcasts` 응답으로 받는 `{id, status}`를 저장해두는 것만이 유일한 방법.
- `sermonId`는 설교의 `publicId`(UUID)다.
- `SermonResponse`에는 조회수(`views`) 필드가 없다 — 지금 `WorshipManage.jsx`의 "조회" 컬럼은 완전히 가짜 데이터.

## 확정된 설계 결정

### 1. `sermonService.js`에 관리자 CRUD + 방송 라이프사이클 함수 추가

기존 `getLiveSermon`/`getPastSermons`(YouTube API 직접 호출, `USE_DUMMY` 게이트)는 이번 사이클과 무관하므로 건드리지 않는다. 새로 추가하는 함수만 `isDummy("sermon")`을 쓴다.

```js
/**
 * 설교 등록 (관리자)
 * @param {string} churchId
 * @param {{ title:string, scripture?:string, preacher?:string, worshipType?:string, youtubeVideoId?:string, sermonDate:string }} payload
 */
export async function createSermon(churchId, payload) {
  if (isDummy("sermon")) {
    const created = { id: `dummy-${Date.now()}`, ...payload };
    DUMMY_ADMIN_SERMONS.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/sermons`, payload);
  return res.data.data;
}

export async function updateSermon(churchId, publicId, payload) {
  if (isDummy("sermon")) {
    const idx = DUMMY_ADMIN_SERMONS.findIndex((s) => s.id === publicId);
    if (idx !== -1) DUMMY_ADMIN_SERMONS[idx] = { ...DUMMY_ADMIN_SERMONS[idx], ...payload };
    return DUMMY_ADMIN_SERMONS[idx] ?? null;
  }
  const res = await api.patch(`/church/admin/sermons/${publicId}`, payload);
  return res.data.data;
}

export async function deleteSermon(churchId, publicId) {
  if (isDummy("sermon")) {
    const idx = DUMMY_ADMIN_SERMONS.findIndex((s) => s.id === publicId);
    if (idx !== -1) DUMMY_ADMIN_SERMONS.splice(idx, 1);
    return;
  }
  await api.delete(`/church/admin/sermons/${publicId}`);
}

export async function getAdminSermons(churchId) {
  if (isDummy("sermon")) return [...DUMMY_ADMIN_SERMONS];
  // 목록 조회 API가 없다 — 관리자 화면은 등록/수정/삭제 직후 로컬 state로만 목록을 유지한다(아래 3번 참고).
  return [];
}

/**
 * 방송 예약
 * @returns {Promise<{id:number|string, status:"BEFORE"}>}
 */
export async function scheduleBroadcast(churchId, { sermonId, youtubeLiveUrl, scheduledStartAt }) {
  if (isDummy("sermon")) return { id: `dummy-bc-${Date.now()}`, status: "BEFORE" };
  const res = await api.post(`/church/admin/broadcasts`, {
    sermonId,
    youtubeLiveUrl,
    scheduledStartAt,
  });
  return res.data.data;
}

export async function startBroadcast(churchId, broadcastId) {
  if (isDummy("sermon")) return { id: broadcastId, status: "LIVE" };
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/start`);
  return res.data.data;
}

export async function endBroadcast(churchId, broadcastId) {
  if (isDummy("sermon")) return { id: broadcastId, status: "ENDED" };
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/end`);
  return res.data.data;
}
```

**설교 목록 조회에 대한 중요한 제약**: `ChurchAdminSermonController`에 목록/상세 GET이 없다(POST/PATCH/DELETE 3개뿐). 즉 관리자가 "지금까지 등록한 설교 목록"을 백엔드에서 다시 불러올 방법이 없다 — 새로고침하면 사라진다. 이는 행사 신청의 "신청 여부 로컬 추적"과 같은 종류의 제약이지만 더 심각하다(전체 목록 자체가 휘발성). `getAdminSermons`는 더미 모드에서만 의미 있는 목록을 반환하고, 실API 모드에서는 항상 빈 배열을 반환한다 — `WorshipManage.jsx`는 등록/수정/삭제 결과를 컴포넌트 로컬 state에 누적해서 같은 세션 안에서만 목록을 유지한다(아래 3번).

### 2. 더미 데이터 — `src/data/dummy/sermons.js`에 관리자용 배열 추가

기존 `src/data/dummy/sermons.js`(YouTube용 `DUMMY_LIVE_SERMON`/`DUMMY_PAST_SERMONS`)는 그대로 두고, 새 배열 `DUMMY_ADMIN_SERMONS`를 추가한다. 백엔드 필드(`id,title,scripture,preacher,worshipType,youtubeVideoId,sermonDate`)만 가진 6개 항목으로 `WorshipManage.jsx`의 기존 `DUMMY_SERMONS`를 대체(조회수 `views` 필드 제거).

### 3. `WorshipManage.jsx` 재설계

- "조회" 컬럼 제거(백엔드에 `views` 필드 없음).
- 설교 등록/수정 모달에 "유튜브 영상 ID" 입력 필드 추가(`youtubeVideoId`, optional).
- 목록은 컴포넌트 마운트 시 `getAdminSermons(church.id)`로 초기화(더미 모드에서만 항목이 채워짐, 실API 모드에서는 빈 배열로 시작 — 새로고침 시 초기화된다는 안내 문구를 화면에 추가한다: "새로고침하면 등록한 설교 목록이 초기화됩니다. 백엔드에 목록 조회 API가 추가되면 개선됩니다." 이런 종류의 안내는 이 프로젝트에서 실데이터 없는 기능을 있는 것처럼 보여주지 않는다는 원칙과 일치한다).
- 등록/수정/삭제는 실제로 `createSermon`/`updateSermon`/`deleteSermon`을 호출하고, 성공하면 로컬 `sermons` state를 낙관적으로 갱신한다(백엔드가 응답으로 준 실제 필드로 갱신 — 특히 `id`는 백엔드가 생성한 UUID를 써야 이후 수정/삭제/방송예약이 가능하다).
- 각 설교 행의 "관리" 컬럼에 "방송" 버튼을 추가한다. 클릭하면 그 설교에 대한 방송 상태를 보여주는 작은 패널/모달이 뜬다:
  - 아직 방송 기록이 없으면(컴포넌트 로컬 state에 없으면) "방송 예약" 폼(유튜브 라이브 URL + 예정 시각)을 보여준다. 제출하면 `scheduleBroadcast`를 호출하고, 응답의 `{id, status}`를 그 설교 행의 로컬 state(`broadcastBySermon: {[sermonId]: {id, status}}`)에 저장한다.
  - 로컬 state에 방송 기록이 있으면 현재 `status`를 배지로 보여주고, `BEFORE`면 "방송 시작" 버튼(→`startBroadcast`), `LIVE`면 "방송 종료" 버튼(→`endBroadcast`), `ENDED`면 버튼 없이 배지만.
  - 이 방송 상태는 페이지를 새로고침하면 사라진다(조회 API가 없어 서버에서 복구 불가) — 모달 안에 이 사실을 한 줄로 안내한다.

## 백엔드 요청 목록 (사용자가 별도 이슈로 등록 예정)

1. **설교 목록/상세 조회(관리자) API** — 지금은 등록/수정/삭제뿐이라 새로고침하면 관리자가 등록한 목록이 전부 사라진다.
2. **방송(라이브) 조회 API** — 지금은 예약/시작/종료뿐이라 특정 설교에 방송이 예약/진행 중인지 백엔드에 물어볼 방법이 없다.

## 비목표

- 백엔드 스키마 변경 — back 저장소는 건드리지 않는다.
- 설교/방송 "공개" 페이지(`WordSermon.jsx`/`WordBroadcast.jsx`) 연동 — YouTube ↔ 백엔드 상태기반 설계 충돌은 별도 브레인스토밍으로 분리하기로 이미 확정됨, 이번 계획에서 손대지 않는다.
- 목록/방송 상태의 서버 영속화 우회 구현(예: 별도 스토리지에 저장) — 범위 밖, 로컬 state 임시 방편으로 충분하다고 판단.

## 테스트 계획

- `src/services/sermonService.test.js`(기존 확장): `createSermon`/`updateSermon`/`deleteSermon`이 정확한 엔드포인트를 호출하는지, `scheduleBroadcast`/`startBroadcast`/`endBroadcast`가 정확한 엔드포인트와 payload로 호출되는지. `isDummy` 모킹은 기존 사이클과 동일 패턴. 기존 `getLiveSermon`/`getPastSermons` 테스트는 그대로 둔다(수정 없음).
- `src/pages/admin/WorshipManage.test.jsx`(신규): "조회" 컬럼이 없는지, 등록 모달에 "유튜브 영상 ID" 필드가 있는지, 등록/수정/삭제가 실제로 서비스 함수를 호출하고 로컬 목록이 갱신되는지, "방송" 버튼 클릭 시 예약 폼이 뜨고 제출하면 상태 배지+시작 버튼으로 바뀌는지, 시작 클릭 시 종료 버튼으로 바뀌는지.

## 확인 필요

없음 — 위 결정 전부 사용자와 직접 확인(짧은 설계 제시 후 승인)을 거쳤다.
