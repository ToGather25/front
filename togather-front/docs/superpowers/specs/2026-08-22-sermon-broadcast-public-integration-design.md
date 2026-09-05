# 설교/방송 공개 화면 백엔드 연동 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 다음 사이클. 2026-08-14 전체 API 감사에서 "화면-백엔드 설계 충돌"로 분류돼 27건 배치에서 제외됐던 항목이다. 지금까지 `WordBroadcast.jsx`(실시간 예배), `WordSermon.jsx`(설교 목록/검색), `WordSermonDetail.jsx`(설교 상세) 3개 공개 화면은 `sermonService.js`의 `getLiveSermon`/`getPastSermons`를 통해 **YouTube Data API v3를 프론트에서 직접 호출**하고 있었다(`VITE_YOUTUBE_API_KEY` 사용). 반면 같은 세션의 앞선 사이클에서 만든 관리자 설교/방송 CRUD(`WorshipManage.jsx`)는 이미 백엔드의 설교(`sermon`)·방송(`broadcast`) 도메인에 연결돼 있어, 관리자가 등록한 설교/방송 데이터가 공개 화면에 전혀 반영되지 않는 상태였다.

사용자 지시: "백엔드 유튜브로 해줘. 프론트 없애고" — 공개 화면을 백엔드의 설교 도메인 데이터로 전환하고, 프론트의 YouTube API 직접 호출을 제거한다.

## 백엔드 계약 (실제 컨트롤러 소스로 확인)

`ChurchSermonController` (`/api/church/sermons`, 테넌시는 `X-Church-Id` 헤더 — 기존 `/church/admin/...` 엔드포인트들과 동일한 관례):

| 동작 | 엔드포인트 | 응답 |
|---|---|---|
| 실시간 화면 조회 | `GET /api/church/sermons/live` | `LiveScreenResponse` |
| 설교 검색/목록 | `GET /api/church/sermons?keyword&worshipType&page(0-based, 기본 0)&size(기본 12)` | `PageResponse<SermonResponse>` |
| 설교 상세 | `GET /api/church/sermons/{publicId}` | `SermonResponse` |

```java
record SermonResponse(UUID id, String title, String scripture, String preacher,
    String worshipType, String youtubeVideoId, LocalDate sermonDate) {}

record LiveScreenResponse(
    String state,              // "LIVE" | "BEFORE" | "ENDED" | "NONE"
    String youtubeLiveUrl,     // 전체 URL (embed용 videoId 파싱 필요)
    SermonResponse sermon,     // nullable
    boolean bulletinAvailable,
    List<SermonResponse> recentSermons) {}
```

이 컨트롤러는 이미 관리자 CRUD 사이클에서 만든 `createSermon`/`updateSermon`/`deleteSermon`/`scheduleBroadcast`/`startBroadcast`/`endBroadcast`(`sermonService.js`)와 같은 도메인을 공유한다 — 즉 관리자가 등록·예약·시작·종료한 데이터가 그대로 이 3개 응답에 반영된다.

**기존 프론트 상태 모델과의 차이**: 기존 `WordBroadcast.jsx`는 LIVE/ENDED/NONE 3가지 상태만 다뤘다. 백엔드는 **BEFORE(방송 예약됨, 아직 시작 전)** 상태가 추가로 있다 — 새 UI 트리트먼트가 필요하다.

**필드명 불일치**: 관리자 등록 폼(`WorshipManage.jsx`)의 예배구분 목록 `["전체", "주일 1부", "주일 2부", "수요 예배", "청년 예배"]`과 공개 검색 필터(`WordSermon.jsx`)의 목록 `["주일예배", "새벽기도회", "수요기도회", "금요기도회"]`이 서로 다르다 — `worshipType`은 백엔드 자유 텍스트라 이 두 목록이 갈라져 있으면 검색 필터가 관리자가 실제 입력하는 값과 절대 매치되지 않는다. 하나로 통일해야 한다.

## 확정된 설계 결정

### 1. `sermonService.js` — YouTube 직접 호출 제거, 백엔드 함수로 교체

제거: `YOUTUBE_API_BASE`, `YOUTUBE_API_KEY`, `toUploadsPlaylistId`, `getLiveSermon`, `getPastSermons`.

추가 (모두 `isDummy("sermon")` 게이트 — 기존 관리자 CRUD와 같은 도메인 플래그 재사용):

```js
/**
 * 전체 YouTube URL(watch/live/youtu.be/embed 형식)에서 embed용 videoId만 추출한다.
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function extractYoutubeVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:live|embed)\/)([\w-]{11})/,
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * 실시간 예배 화면 조회
 * @param {string} churchId
 * @returns {Promise<{state:string, youtubeLiveUrl:string|null, sermon:object|null,
 *   bulletinAvailable:boolean, recentSermons:object[]}>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getLiveScreen(churchId) {
  if (isDummy("sermon")) return DUMMY_LIVE_SCREEN;
  const res = await api.get(`/church/sermons/live`);
  return res.data.data;
}

/**
 * 설교 검색/목록 조회
 * @param {string} churchId
 * @param {{ keyword?:string, worshipType?:string, page?:number, size?:number }} params - page는 1-based(프론트 관례)
 * @returns {Promise<{ sermons:object[], pageInfo:object }>}
 */
export async function searchSermons(churchId, { keyword, worshipType, page = 1, size = 12 } = {}) {
  if (isDummy("sermon")) {
    let list = DUMMY_ADMIN_SERMONS;
    if (worshipType) list = list.filter((s) => s.worshipType === worshipType);
    if (keyword?.trim()) {
      const q = keyword.trim().toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q));
    }
    const start = (page - 1) * size;
    const content = list.slice(start, start + size);
    return {
      sermons: content,
      pageInfo: {
        page: page - 1,
        size,
        totalElements: list.length,
        totalPages: Math.max(1, Math.ceil(list.length / size)),
        hasNext: start + size < list.length,
        hasPrevious: page > 1,
      },
    };
  }
  const res = await api.get(`/church/sermons`, {
    params: { keyword: keyword || undefined, worshipType: worshipType || undefined, page: page - 1, size },
  });
  return { sermons: res.data.data.content, pageInfo: res.data.data.pageInfo };
}

/**
 * 설교 상세 조회
 * @param {string} churchId
 * @param {string} publicId
 * @returns {Promise<object|null>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getSermonDetail(churchId, publicId) {
  if (isDummy("sermon")) return DUMMY_ADMIN_SERMONS.find((s) => s.id === publicId) ?? null;
  const res = await api.get(`/church/sermons/${publicId}`);
  return res.data.data;
}
```

기존 관리자 CRUD 함수(`createSermon`/`updateSermon`/`deleteSermon`/`getAdminSermons`/`scheduleBroadcast`/`startBroadcast`/`endBroadcast`)는 그대로 유지 — 이번 사이클 범위 밖.

### 2. 더미 데이터 (`src/data/dummy/sermons.js`)

`DUMMY_LIVE_SERMON`, `DUMMY_PAST_SERMONS`(YouTube shape) 삭제 — 더 이상 아무 화면도 참조하지 않게 된다. `DUMMY_ADMIN_SERMONS`는 그대로 유지하고 공개 화면의 더미 데이터로도 재사용한다(이미 `SermonResponse`와 같은 필드 shape). 신규 추가:

```js
/** @type {import('@/services/sermonService').LiveScreenResponse} */
export const DUMMY_LIVE_SCREEN = {
  state: "NONE",
  youtubeLiveUrl: null,
  sermon: null,
  bulletinAvailable: false,
  recentSermons: DUMMY_ADMIN_SERMONS.slice(0, 6),
};
```

기본 상태를 "NONE"으로 두는 이유: 기존 `DUMMY_LIVE_SERMON = null`도 "라이브 없음"이 기본값이었다 — 없는 것을 있는 것처럼 꾸미지 않는다는 기존 관례를 유지.

### 3. `src/config/sermon.config.js` (신규) — 예배구분 목록 통일

```js
export const SERVICE_TYPES = ["주일 1부", "주일 2부", "수요 예배", "청년 예배"];
```

`WorshipManage.jsx`의 로컬 `SERVICE_TYPES` 상수를 이 파일 import로 교체(내용 동일, 위치만 이동 — `["전체", ...SERVICE_TYPES]`로 관리자 필터 칩에 사용). `WordSermon.jsx`의 기존 불일치 목록을 삭제하고 같은 상수를 import해서 검색 필터 `<select>`에 사용.

### 4. `WordBroadcast.jsx` 재작성

- `getLiveSermon`/`getPastSermons` → `getLiveScreen`, `extractYoutubeVideoId`로 교체.
- `channelId`는 더 이상 필요 없음(삭제). `channelUrl = church.social?.youtube`는 폴백 링크용으로 유지.
- `useEffect`에서 마운트 시 `getLiveScreen(church.id)` 호출 + 기존과 동일한 60초 폴링(`setInterval`)으로 상태 갱신.
- `status`는 `screen?.state`를 그대로 사용(`"LIVE"|"BEFORE"|"ENDED"|"NONE"`), 최초 로딩 중엔 `"loading"`.
- **LIVE**: `extractYoutubeVideoId(screen.youtubeLiveUrl)`로 videoId 파싱 → 있으면 autoplay iframe embed, 없으면 `LivePlaceholder`(문구: "실시간 영상 정보를 불러올 수 없습니다"). `SermonInfoBlock`은 `screen.sermon`(`title`/`scripture`/`preacher`/`worshipType`/`sermonDate`)을 사용하도록 prop 매핑 변경(기존 `service`/`speaker`/`date` 필드명에서 변경). "스마트 주보 보기" 버튼은 `screen.bulletinAvailable`일 때만 노출(모달 내용 자체는 기존 TODO 플레이스홀더 그대로 유지 — 주보 실연동은 별도 사이클).
- **BEFORE(신규)**: 영상 자리에 "곧 예배가 시작됩니다" 안내 카드(정적, iframe 없음). `screen.sermon`이 있으면 그 정보(`SermonInfoBlock`, `isLive=false`)를 함께 보여준다.
- **ENDED**: `extractYoutubeVideoId(screen.youtubeLiveUrl)`로 다시보기 embed(라이브 배지 없이) — 파싱 실패 시 NONE과 동일한 안내 카드로 폴백(백엔드가 종료된 방송의 URL을 계속 내려주는지 확정 안 됨, 방어적으로 처리 — "확인 필요" 참고).
- **NONE**: 기존 안내 카드 그대로.
- 지난 설교 가로 스크롤: `screen?.recentSermons ?? []`. 백엔드 `SermonResponse`엔 썸네일 필드가 없으므로 항상 `YouTubeIcon` 플레이스홀더 사용. 각 카드는 더 이상 유튜브로 바로 나가지 않고 `/말씀/설교/${s.id}`(내부 상세 페이지)로 이동. 채널 URL이 있으면 "더 많은 설교는 유튜브 채널에서" 링크는 유지.

### 5. `WordSermon.jsx` 재작성 — 서버 검색/페이지네이션 전환

- `getPastSermons` → `searchSermons` + `SERVICE_TYPES`(config) 로 교체.
- 클라이언트 측 `sermons`/`filtered`(useMemo) 상태 제거. `page`, `submittedKeyword`, `worshipType` 상태로 `useEffect([church.id, page, submittedKeyword, worshipType])`에서 `searchSermons(church.id, { keyword: submittedKeyword || undefined, worshipType: worshipType || undefined, page, size: 12 })` 호출.
- 응답 `{ sermons, pageInfo }` → `sermons`를 그리드에 렌더, `pageInfo.totalPages`로 기존 `PageBtn` 페이지네이션 UI 그대로 재사용.
- 카드: 썸네일 없음 → 항상 아이콘 플레이스홀더, 정보 줄은 `${s.sermonDate} · ${s.worshipType}`. 클릭 시 `/말씀/설교/${s.id}`.
- 검색/필터 변경 시 `page`를 1로 리셋(기존 로직 유지).
- 조회 실패 시 "불러오지 못했습니다. 다시 시도해 주세요." + 재시도 버튼 추가(이번 세션에서 확립된 표준 패턴).

### 6. `WordSermonDetail.jsx` 재작성 — publicId 직접 조회 + 인접 목록으로 이전/다음 유지

- `getPastSermons` → `getSermonDetail` + `searchSermons`로 교체.
- 메인 조회: `getSermonDetail(church.id, id)`로 현재 설교를 직접 가져온다("50개 받아서 find" 안티패턴 제거).
- 이전/다음 내비게이션은 유지하기로 이미 사용자에게 안내한 대로, `searchSermons(church.id, { page: 1, size: 50 })`(필터 없음)로 최근 50건을 함께 조회해 `currentIdx`를 찾고 인접 항목으로 계산 — 기존 인덱스 계산 로직 그대로, 데이터 소스만 교체.
- 영상: `SermonResponse.youtubeVideoId`는 이미 순수 videoId 문자열이라 파싱 불필요 — `https://www.youtube.com/embed/${sermon.youtubeVideoId}` 그대로 사용. 없으면 기존 폴백(채널 링크).
- 정보 영역: `sermon.sermonDate`, `sermon.title` 아래에 `scripture`/`preacher`/`worshipType`(백엔드가 주는데 기존 화면엔 없던 필드) 한 줄 추가 — `WordBroadcast.jsx`의 `SermonInfoBlock` 표시 패턴과 통일.
- 설교를 찾을 수 없는 경우(`getSermonDetail`이 `null` 반환) 처리는 기존 "설교를 찾을 수 없습니다" 블록 그대로 유지.

### 7. 영향 없음으로 확인된 파일

- `WordInfo.jsx` — `church.worshipSchedule`(교회 테넌트 설정)만 사용, `sermonService`와 무관.
- `WordTabBar.jsx` — 순수 네비게이션, 데이터 의존 없음.

둘 다 변경하지 않는다.

## 비목표

- 주보(jubo) 실제 연동 — "스마트 주보 보기" 모달 내용은 계속 TODO 플레이스홀더. `bulletinAvailable`로 노출 여부만 제어.
- `.env`의 `VITE_YOUTUBE_API_KEY` 제거 — 더 이상 코드에서 참조하지 않게 되지만 무해하므로 이번 사이클에서 건드리지 않는다.
- 방송 폴링 전략 변경 — 기존 60초 간격 그대로 유지.
- 관리자 CRUD(`WorshipManage.jsx`, `sermonService.js`의 CRUD 함수들) 로직 변경 — `SERVICE_TYPES` import 위치만 이동.

## 확인 필요

- **ENDED 상태에서 `youtubeLiveUrl`/`sermon`이 계속 채워지는지**: 컨트롤러 레코드 정의만으로는 100% 확정 불가. 프론트는 방어적으로, videoId 파싱에 실패하면 NONE과 동일한 안내 카드로 자동 폴백하도록 구현한다(런타임에서 실제 응답 보고 조정 가능).
- **`GET /church/sermons`의 기본 정렬 순서가 `sermonDate desc`인지**: `WordSermonDetail`의 이전/다음 화살표 방향이 이 가정에 의존한다. 다르면 방향이 바뀌는 정도의 UX 이슈로, 치명적이지 않음 — 실제 연동 후 확인.

## 테스트 계획

- `src/services/sermonService.test.js`: 기존 `getLiveSermon`/`getPastSermons` fetch-mock 테스트 제거. `extractYoutubeVideoId`(watch/live/youtu.be/embed 4형식 + null/미매치 케이스), `getLiveScreen`(더미/실API 엔드포인트), `searchSermons`(더미 키워드·예배구분 필터+페이지 변환, 실API 파라미터/1→0-based 변환), `getSermonDetail`(더미 find, 실API 엔드포인트) 추가.
- `src/pages/WordBroadcast/WordBroadcast.test.jsx`: `getLiveScreen` 모킹으로 교체. LIVE/BEFORE(신규)/ENDED/NONE 4상태 렌더 확인. `recentSermons` 카드가 내부 라우트로 링크되는지. `bulletinAvailable=false`일 때 주보 버튼 미노출 확인.
- `src/pages/WordSermon/WordSermon.test.jsx`: `searchSermons` 모킹으로 교체. 검색/필터 변경 시 서버 호출 파라미터 확인, 페이지네이션이 `pageInfo.totalPages` 기반으로 동작하는지, 조회 실패 시 재시도 버튼 확인.
- `src/pages/WordSermon/WordSermonDetail.test.jsx`: `getSermonDetail`+`searchSermons` 모킹으로 교체. 상세 정보(scripture/preacher/worshipType 추가 표시) 확인, 이전/다음 내비게이션이 인접 리스트 기반으로 동작하는지, 설교 없음 케이스 유지 확인.
- `src/pages/admin/WorshipManage.test.jsx`: `SERVICE_TYPES` import 경로만 바뀌므로 기존 테스트는 변경 없이 통과해야 함 — 회귀 확인만 수행.
