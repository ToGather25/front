# 서비스 레이어 & 데이터

---

## 개요

컴포넌트는 서비스 함수를 직접 호출하거나 `useFetch` 훅을 통해 데이터를 가져옵니다.  
서비스 함수는 `USE_DUMMY` 플래그에 따라 더미 데이터 또는 실제 API를 반환합니다.

```
컴포넌트
  └── useFetch(서비스함수, deps, initialData)
        └── 서비스함수()
              ├── USE_DUMMY === true  → 더미 데이터 반환
              └── USE_DUMMY === false → Axios API 호출
```

---

## Axios 인스턴스 (`src/services/api.js`)

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
});
```

### 인터셉터

**요청**: `localStorage.getItem("token")`이 있으면 `Authorization: Bearer {token}` 자동 첨부.

**응답**: 401 응답 시 토큰 삭제 후 `/login`으로 리다이렉트.

### 더미 모드 플래그

```js
export const USE_DUMMY = import.meta.env.VITE_USE_DUMMY !== "false";
```

- 기본값: `true` (환경변수 미설정 시 더미 모드)
- 실제 API 사용: `.env`에 `VITE_USE_DUMMY=false` 설정

---

## useFetch 훅 (`src/hooks/useFetch.js`)

```js
const { data, loading, error, refetch } = useFetch(fetchFn, deps, initialData);
```

| 파라미터 | 설명 |
|---------|------|
| `fetchFn` | 서비스 함수 (Promise 반환) |
| `deps` | 의존성 배열 — 변경 시 재요청 |
| `initialData` | 로딩 중 표시할 기본값 |

```jsx
// 사용 예시
const { data: events = [], loading } = useFetch(
  () => getEvents(church.id, { year, month }),
  [church.id, year, month],
  []
);
```

---

## 서비스 함수 목록

### eventsService (`src/services/eventsService.js`)

| 함수 | 설명 |
|------|------|
| `getEvents(churchId, { year, month })` | 월별 행사 목록 |
| `getEventById(churchId, id)` | 행사 상세 |
| `registerForEvent(churchId, id)` | 행사 신청 |

**더미 데이터**: `src/data/dummy/events.js`
- `DUMMY_EVENTS` — 5개 행사 (날짜, 제목, 부서, 장소, 설명, 신청 가능 여부)
- `DUMMY_EVENT_DETAIL` — 행사 상세 (단일 객체)

---

### noticeService (`src/services/noticeService.js`)

| 함수 | 설명 |
|------|------|
| `getNotices(churchId, params)` | 공지/소식 목록 |

**더미 데이터**: `src/data/dummy/notices.js`
- `DUMMY_NOTICES` — 5개 공지 (`featured` 플래그 포함)

홈 화면에서 `featured: true`인 항목은 메인 카드로, 나머지는 사이드 카드 목록으로 표시.

---

### galleryService (`src/services/galleryService.js`)

| 함수 | 설명 |
|------|------|
| `getCommunities(churchId)` | 공동체 목록 (갤러리 그룹) |
| `getPhotos(churchId, { communityId })` | 공동체별 사진 목록 |

더미 모드에서 `getPhotos`는 `communityId`로 클라이언트 사이드 필터링.

**더미 데이터**: `src/data/dummy/gallery.js`
- `DUMMY_COMMUNITIES` — 6개 공동체
- `DUMMY_PHOTOS` — 5개 사진

---

### juboService (`src/services/juboService.js`)

| 함수 | 설명 |
|------|------|
| `getJuboInfo(churchId)` | 주보 메타 (호수, 날짜) |
| `getWorshipServices(churchId)` | 예배 종류 목록 |
| `getWorshipOrder(churchId, serviceType)` | 예배 순서 |
| `getVolunteer(churchId)` | 봉사자 목록 |
| `getOffering(churchId)` | 헌금 내역 |
| `getSupport(churchId)` | 후원 현황 |
| `getDistricts(churchId)` | 구역 목록 |
| `getMinisters(churchId)` | 섬기는 분들 |

**더미 데이터**: `src/data/dummy/jubo.js`

---

## API 응답 규격 (실제 API 연동 시)

모든 API는 다음 형식을 따릅니다:

```json
{
  "data": { ... }
}
```

서비스 함수는 `res.data.data`를 반환합니다:

```js
const res = await api.get(`/churches/${churchId}/events`);
return res.data.data;
```

---

## 더미 → 실제 API 전환 방법

1. 백엔드 서버 준비
2. `.env` 파일 생성:
   ```env
   VITE_API_BASE_URL=https://api.your-domain.com
   VITE_USE_DUMMY=false
   ```
3. 각 서비스 함수의 더미 데이터 분기(`if (USE_DUMMY) return …`)가 자동으로 우회되어 실제 Axios 호출로 전환됩니다.
