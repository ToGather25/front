# 설교/방송 공개 화면 백엔드 연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `WordBroadcast.jsx`(실시간 예배)/`WordSermon.jsx`(설교 목록)/`WordSermonDetail.jsx`(설교 상세) 3개 공개 화면을 백엔드 설교 도메인(`GET /church/sermons/live`, `GET /church/sermons`, `GET /church/sermons/{publicId}`)에 연결하고, 프론트에서 YouTube Data API v3를 직접 호출하던 코드(`sermonService.js`의 `getLiveSermon`/`getPastSermons`)를 제거한다.

**Architecture:** `sermonService.js`에 `isDummy("sermon")` 게이트를 쓰는 3개 공개 조회 함수(`getLiveScreen`/`searchSermons`/`getSermonDetail`)와 순수 URL 파서(`extractYoutubeVideoId`)를 추가하고, 3개 공개 페이지가 이를 소비하도록 재작성한다. 관리자 예배구분 목록을 공유 상수(`src/config/sermon.config.js`)로 뽑아 공개 검색 필터와 통일한다. 기존 YouTube 직접 호출 코드와 관련 더미 데이터는 3개 페이지 전환이 모두 끝난 마지막 태스크에서 일괄 제거한다(중간 태스크에서 조기 삭제하면 아직 전환 안 된 페이지의 import가 깨진다).

**Tech Stack:** React 19, Vite, Axios, React Router v7(`react-router` import), Vitest(`vite-plus/test`), Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-22-sermon-broadcast-public-integration-design.md`

## Global Constraints

- React Router v7: `useNavigate`/`useParams` 등은 `react-router`에서 import(`react-router-dom` 아님).
- 새 서비스 함수는 모두 `isDummy("sermon")` 게이트를 쓴다(레거시 `USE_DUMMY` 전역 플래그 사용 금지).
- `churchId`가 유일한 파라미터라 사용되지 않는 함수는 `// oxlint-disable-next-line no-unused-vars`를 함수 선언 바로 위에 붙인다(테넌시는 `X-Church-Id` 헤더 인터셉터가 처리 — `getLiveScreen(churchId)`만 해당, `getSermonDetail(churchId, publicId)`는 뒤 파라미터가 쓰이므로 불필요).
- 백엔드 응답 언박싱은 `res.data.data` 관례를 따른다.
- 목록 조회 함수의 `page` 파라미터는 프론트에서 1-based로 받고 백엔드 호출 시 0-based로 변환한다(`noticeService`/`memberService`와 동일 관례) — `searchSermons`에 적용.
- 페이지 테스트는 `@/services/api`를 `vi.mock`으로 전체 모킹(`isDummy: () => false`)하고 `api.get`에 백엔드 shape 그대로의 fixture를 `mockResolvedValue`하는 방식을 쓴다(`MyPage.test.jsx`/`GalleryManage.test.jsx`와 동일 관례) — 더미 데이터(`DUMMY_*`)에 의존하는 방식은 쓰지 않는다. 테스트 환경에서 `isDummy(domain)`은 `@/services/api`를 명시적으로 모킹하지 않으면 기본값이 무엇인지 보장되지 않으므로, 반드시 명시적으로 모킹한다.
- 커밋은 각 태스크(또는 태스크 내 하위 단계)가 끝날 때마다 수행한다.

---

## Task 1: 예배구분 목록 공유 설정 + 더미 데이터 준비

**Files:**
- Create: `src/config/sermon.config.js`
- Modify: `src/pages/admin/WorshipManage.jsx`
- Modify: `src/data/dummy/sermons.js`

**Interfaces:**
- Produces: `SERVICE_TYPES: string[]` (예배구분 4종, "전체" 미포함 — 각 소비처가 필요하면 자기 쪽에서 "전체"를 붙인다). `DUMMY_LIVE_SCREEN: LiveScreenResponse` (Task 2에서 `sermonService.js`가 소비).
- Consumes: 없음(둘 다 신규 데이터).

이 태스크는 기존 `DUMMY_LIVE_SERMON`/`DUMMY_PAST_SERMONS`를 아직 삭제하지 않는다 — `WordBroadcast.jsx` 등 아직 전환 안 된 페이지가 계속 참조 중이며, 삭제는 Task 5에서 모든 소비처 전환이 끝난 뒤 일괄 수행한다.

- [ ] **Step 1: `src/config/sermon.config.js` 생성**

```js
/** 설교 예배구분 — 관리자 등록 폼과 공개 검색 필터가 공유한다(값이 어긋나면 필터가 매치되지 않는다). */
export const SERVICE_TYPES = ["주일 1부", "주일 2부", "수요 예배", "청년 예배"];
```

- [ ] **Step 2: `WorshipManage.jsx`가 공유 상수를 쓰도록 수정**

`src/pages/admin/WorshipManage.jsx` 상단 import 블록에 추가:

```js
import { SERVICE_TYPES } from "@/config/sermon.config";
```

기존 로컬 상수 선언 줄

```js
const SERVICE_TYPES = ["전체", "주일 1부", "주일 2부", "수요 예배", "청년 예배"];
```

을 삭제하고 그 자리에 필터 칩 전용 목록을 추가:

```js
const FILTER_TYPES = ["전체", ...SERVICE_TYPES];
```

`emptyForm()`에서 `SERVICE_TYPES[1]`(기존 배열은 인덱스0이 "전체"였음)을 `SERVICE_TYPES[0]`으로 수정:

```js
function emptyForm() {
  return { sermonDate: "", worshipType: SERVICE_TYPES[0], title: "", preacher: "", scripture: "", youtubeVideoId: "" };
}
```

설교 등록/수정 모달의 `<select>` 옵션 목록에서 `.filter((s) => s !== "전체")`가 더 이상 필요 없다 — `SERVICE_TYPES`에 이미 "전체"가 없으므로:

```js
              <select
                className={`${inputCls} bg-white`}
                value={form.worshipType}
                onChange={set("worshipType")}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
```

필터 칩 렌더 부분(`{SERVICE_TYPES.map((t) => (`)을 `FILTER_TYPES.map`으로 교체:

```js
      <div className="flex gap-2 mb-4">
        {FILTER_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-body-5 font-medium transition-colors ${t === filter ? "bg-primary text-white" : "bg-white border border-grey-3 text-grey-7 hover:border-primary hover:text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>
```

나머지 로직(`filter`/`filtered` state, `"전체"` 비교)은 변경 없음 — `FILTER_TYPES`에 여전히 "전체"가 포함되므로 그대로 동작한다.

- [ ] **Step 3: 회귀 확인 — 기존 `WorshipManage.test.jsx` 그대로 통과하는지 실행**

Run: `pnpm vitest run src/pages/admin/WorshipManage.test.jsx`
Expected: 기존 7개 테스트 모두 PASS(테스트가 "전체"/개별 예배구분 값의 배열 위치를 하드코딩하지 않으므로 동작 변화 없음).

- [ ] **Step 4: `src/data/dummy/sermons.js`에 `DUMMY_LIVE_SCREEN` 추가**

파일 맨 끝(`DUMMY_ADMIN_SERMONS` 선언 뒤)에 추가:

```js
/**
 * @typedef {{ state:string, youtubeLiveUrl:string|null, sermon:object|null,
 *   bulletinAvailable:boolean, recentSermons:object[] }} LiveScreenResponse
 */

/** @type {LiveScreenResponse} */
export const DUMMY_LIVE_SCREEN = {
  state: "NONE",
  youtubeLiveUrl: null,
  sermon: null,
  bulletinAvailable: false,
  recentSermons: DUMMY_ADMIN_SERMONS.slice(0, 6),
};
```

`DUMMY_LIVE_SERMON`/`DUMMY_PAST_SERMONS`는 이 태스크에서 건드리지 않는다(아직 소비처가 있음).

- [ ] **Step 5: Commit**

```bash
git add src/config/sermon.config.js src/pages/admin/WorshipManage.jsx src/data/dummy/sermons.js
git commit -m "refactor: 설교 예배구분 목록을 공유 설정으로 분리, 실시간 화면용 더미 데이터 추가"
```

---

## Task 2: `sermonService.js` — 공개 조회 함수 추가(구 함수는 유지)

**Files:**
- Modify: `src/services/sermonService.js`
- Modify: `src/services/sermonService.test.js`

**Interfaces:**
- Consumes: `src/config/sermon.config.js`의 `SERVICE_TYPES`는 이 태스크에서 쓰지 않는다(서비스 레이어는 값 목록에 무관심 — worshipType은 단순 문자열 파라미터). `src/data/dummy/sermons.js`의 `DUMMY_LIVE_SCREEN`, `DUMMY_ADMIN_SERMONS`(Task 1에서 이미 존재).
- Produces:
  - `extractYoutubeVideoId(url: string|null|undefined): string|null`
  - `getLiveScreen(churchId: string): Promise<LiveScreenResponse>`
  - `searchSermons(churchId: string, { keyword?, worshipType?, page?, size? }): Promise<{ sermons: object[], pageInfo: object }>`
  - `getSermonDetail(churchId: string, publicId: string): Promise<object|null>`
  - Task 3~5가 이 4개 함수를 소비한다.

기존 `getLiveSermon`/`getPastSermons`/`YOUTUBE_API_BASE`/`YOUTUBE_API_KEY`/`toUploadsPlaylistId`는 이 태스크에서 그대로 둔다(Task 3~4가 아직 이걸 쓰는 페이지를 갖고 있음). 관리자 CRUD 함수(`createSermon` 등)도 변경 없음.

- [ ] **Step 1: 실패하는 테스트 작성 — `sermonService.test.js`에 추가**

파일 최상단 `vi.mock` 블록을 아래로 교체(`isDummy`를 `vi.fn()`으로 바꿔 테스트별로 override 가능하게 함):

```js
vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: vi.fn(() => false),
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import api, { isDummy } from "@/services/api";
import {
  createSermon,
  updateSermon,
  deleteSermon,
  scheduleBroadcast,
  startBroadcast,
  endBroadcast,
  extractYoutubeVideoId,
  getLiveScreen,
  searchSermons,
  getSermonDetail,
} from "./sermonService";
import { DUMMY_LIVE_SCREEN, DUMMY_ADMIN_SERMONS } from "@/data/dummy/sermons";
```

기존 `describe("sermonService — 관리자 CRUD + 방송 (실 API 경로)", ...)` 블록의 `beforeEach`를 아래로 교체(다른 describe가 `isDummy.mockReturnValue(true)`로 override한 뒤에도 이 블록이 항상 실 API 경로로 동작하도록 명시적으로 고정):

```js
  beforeEach(() => {
    vi.clearAllMocks();
    isDummy.mockReturnValue(false);
  });
```

그 블록의 개별 테스트 코드는 변경하지 않는다. 그 뒤에 아래 4개 describe를 새로 추가:

```js
describe("extractYoutubeVideoId", () => {
  it("watch URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("live URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://youtube.com/live/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("youtu.be 단축 URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("embed URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("null/undefined는 null을 반환한다", () => {
    expect(extractYoutubeVideoId(null)).toBeNull();
    expect(extractYoutubeVideoId(undefined)).toBeNull();
  });

  it("매치되지 않는 URL은 null을 반환한다", () => {
    expect(extractYoutubeVideoId("https://example.com/video")).toBeNull();
  });
});

describe("getLiveScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("더미 모드면 DUMMY_LIVE_SCREEN을 반환한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await getLiveScreen("1");
    expect(result).toEqual(DUMMY_LIVE_SCREEN);
  });

  it("실 API 모드면 GET /church/sermons/live를 호출한다", async () => {
    isDummy.mockReturnValue(false);
    const responseData = {
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc",
      sermon: null,
      bulletinAvailable: true,
      recentSermons: [],
    };
    api.get.mockResolvedValue({ data: { data: responseData } });

    const result = await getLiveScreen("1");

    expect(api.get).toHaveBeenCalledWith("/church/sermons/live");
    expect(result).toEqual(responseData);
  });
});

describe("searchSermons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("더미 모드면 keyword로 제목을 필터링한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await searchSermons("1", { keyword: "부활" });
    expect(result.sermons).toEqual(DUMMY_ADMIN_SERMONS.filter((s) => s.title.includes("부활")));
  });

  it("더미 모드면 worshipType으로 필터링한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await searchSermons("1", { worshipType: "수요 예배" });
    expect(result.sermons.length).toBeGreaterThan(0);
    expect(result.sermons.every((s) => s.worshipType === "수요 예배")).toBe(true);
  });

  it("더미 모드면 page/size로 페이지네이션한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await searchSermons("1", { page: 1, size: 2 });
    expect(result.sermons).toHaveLength(2);
    expect(result.pageInfo.totalPages).toBe(Math.ceil(DUMMY_ADMIN_SERMONS.length / 2));
  });

  it("실 API 모드면 GET /church/sermons를 1-based→0-based 변환된 page로 호출한다", async () => {
    isDummy.mockReturnValue(false);
    api.get.mockResolvedValue({
      data: { data: { content: [], pageInfo: { page: 1, size: 12, totalElements: 0, totalPages: 0 } } },
    });

    await searchSermons("1", { keyword: "은혜", worshipType: "주일 1부", page: 2, size: 12 });

    expect(api.get).toHaveBeenCalledWith("/church/sermons", {
      params: { keyword: "은혜", worshipType: "주일 1부", page: 1, size: 12 },
    });
  });
});

describe("getSermonDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("더미 모드면 id로 찾아 반환한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await getSermonDetail("1", "s1");
    expect(result).toEqual(DUMMY_ADMIN_SERMONS.find((s) => s.id === "s1"));
  });

  it("더미 모드에서 없는 id면 null을 반환한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await getSermonDetail("1", "존재하지-않는-id");
    expect(result).toBeNull();
  });

  it("실 API 모드면 GET /church/sermons/{publicId}를 호출한다", async () => {
    isDummy.mockReturnValue(false);
    const sermon = { id: "s1", title: "부활의 능력" };
    api.get.mockResolvedValue({ data: { data: sermon } });

    const result = await getSermonDetail("1", "s1");

    expect(api.get).toHaveBeenCalledWith("/church/sermons/s1");
    expect(result).toEqual(sermon);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/sermonService.test.js`
Expected: FAIL — `extractYoutubeVideoId`/`getLiveScreen`/`searchSermons`/`getSermonDetail`가 `sermonService.js`에 없어서 import 에러 또는 undefined 호출 에러.

- [ ] **Step 3: `sermonService.js`에 4개 함수 구현**

파일 상단 import 줄을 아래로 교체(기존 `DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS, DUMMY_ADMIN_SERMONS`에 `DUMMY_LIVE_SCREEN` 추가):

```js
import { DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS, DUMMY_ADMIN_SERMONS, DUMMY_LIVE_SCREEN } from "@/data/dummy/sermons";
```

파일 맨 끝(`endBroadcast` 함수 뒤)에 아래 4개 함수를 추가:

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
export async function getSermonDetail(churchId, publicId) {
  if (isDummy("sermon")) return DUMMY_ADMIN_SERMONS.find((s) => s.id === publicId) ?? null;
  const res = await api.get(`/church/sermons/${publicId}`);
  return res.data.data;
}
```

`import api, { isDummy } from "./api";` 줄은 이미 파일에 있으므로 손대지 않는다.

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/sermonService.test.js`
Expected: PASS (전체 테스트, 기존 CRUD 테스트 포함).

- [ ] **Step 5: Commit**

```bash
git add src/services/sermonService.js src/services/sermonService.test.js
git commit -m "feat: sermonService에 백엔드 실시간/검색/상세 조회 함수 추가"
```

---

## Task 3: `WordBroadcast.jsx` — 실시간 예배 화면 전환

**Files:**
- Modify: `src/pages/WordBroadcast/WordBroadcast.jsx`
- Modify: `src/pages/WordBroadcast/WordBroadcast.test.jsx`

**Interfaces:**
- Consumes: `getLiveScreen`, `extractYoutubeVideoId`(Task 2).
- Produces: 없음(터미널 페이지).

- [ ] **Step 1: 실패하는 테스트로 전체 교체 — `WordBroadcast.test.jsx`**

```jsx
vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WordBroadcast from "./WordBroadcast";

function mockLiveScreen(data) {
  api.get.mockResolvedValue({ data: { data } });
}

describe("WordBroadcast — 실시간 예배", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("LIVE 상태면 실시간 배지와 영상, 설교 정보를 보여준다", async () => {
    mockLiveScreen({
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc12345678",
      sermon: {
        id: "s1",
        title: "부활의 능력",
        scripture: "롬 8:11",
        preacher: "김영수 담임목사",
        worshipType: "주일 1부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: true,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(
      document.querySelector('iframe[src="https://www.youtube.com/embed/abc12345678?autoplay=1"]'),
    ).toBeInTheDocument();
  });

  it("BEFORE 상태면 '곧 예배가 시작됩니다' 안내와 예정 설교 정보를 보여준다", async () => {
    mockLiveScreen({
      state: "BEFORE",
      youtubeLiveUrl: null,
      sermon: {
        id: "s2",
        title: "성령으로 충만하라",
        scripture: "엡 5:18",
        preacher: "박성민 부목사",
        worshipType: "주일 2부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("곧 예배가 시작됩니다")).toBeInTheDocument();
    expect(screen.getByText("성령으로 충만하라")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "스마트 주보 보기" })).not.toBeInTheDocument();
  });

  it("ENDED 상태면 라이브 배지 없이 다시보기 영상을 보여준다", async () => {
    mockLiveScreen({
      state: "ENDED",
      youtubeLiveUrl: "https://youtube.com/live/xyz98765432",
      sermon: {
        id: "s1",
        title: "부활의 능력",
        scripture: "롬 8:11",
        preacher: "김영수 담임목사",
        worshipType: "주일 1부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
  });

  it("ENDED 상태인데 videoId 파싱에 실패하면 예배 없음 안내로 폴백한다", async () => {
    mockLiveScreen({
      state: "ENDED",
      youtubeLiveUrl: null,
      sermon: null,
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("오늘 예정된 예배가 없습니다")).toBeInTheDocument();
  });

  it("NONE 상태면 '오늘 예정된 예배가 없습니다' 안내를 보여준다", async () => {
    mockLiveScreen({ state: "NONE", youtubeLiveUrl: null, sermon: null, bulletinAvailable: false, recentSermons: [] });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("오늘 예정된 예배가 없습니다")).toBeInTheDocument();
  });

  it("지난 설교 목록은 내부 상세 페이지로 링크된다", async () => {
    mockLiveScreen({
      state: "NONE",
      youtubeLiveUrl: null,
      sermon: null,
      bulletinAvailable: false,
      recentSermons: [{ id: "s3", title: "참된 예배", worshipType: "주일 1부", sermonDate: "2026-05-18" }],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    const link = await screen.findByRole("link", { name: /참된 예배/ });
    expect(link).toHaveAttribute("href", "/말씀/설교/s3");
  });

  it("bulletinAvailable=true일 때만 '스마트 주보 보기' 버튼이 뜨고, 클릭하면 모달이 열린다", async () => {
    mockLiveScreen({
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc12345678",
      sermon: {
        id: "s1",
        title: "부활의 능력",
        scripture: "롬 8:11",
        preacher: "김영수 담임목사",
        worshipType: "주일 1부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: true,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });
    await screen.findByText("부활의 능력");

    expect(screen.queryByText("이번 주 주보")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "스마트 주보 보기" }));
    expect(screen.getByText("이번 주 주보")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/WordBroadcast/WordBroadcast.test.jsx`
Expected: FAIL — 컴포넌트가 아직 `getLiveSermon`/`getPastSermons`를 쓰고 있어 `api.get` 모킹을 타지 않음(더미 `DUMMY_LIVE_SERMON`이 항상 `null`을 반환하므로 LIVE/BEFORE 텍스트가 안 뜸).

- [ ] **Step 3: `WordBroadcast.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import WordTabBar from "@/components/word/WordTabBar";
import { getLiveScreen, extractYoutubeVideoId } from "@/services/sermonService";

function YouTubeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function SermonInfoBlock({ sermon, isLive = false, juboOnClick }) {
  return (
    <div className="mt-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-body-5 font-bold rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE
            </span>
          )}
          {sermon.worshipType && (
            <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-5 font-medium rounded-full">
              {sermon.worshipType}
            </span>
          )}
          {sermon.sermonDate && <span className="text-body-5 text-grey-5">{sermon.sermonDate}</span>}
        </div>
        <h2 className="text-sub-tit-3 font-bold text-grey-11 leading-snug mb-2">{sermon.title}</h2>
        {(sermon.scripture || sermon.preacher) && (
          <div className="flex items-center gap-2 text-body-4 text-grey-6">
            {sermon.scripture && <span className="text-primary font-medium">{sermon.scripture}</span>}
            {sermon.scripture && sermon.preacher && <span className="text-grey-4">·</span>}
            {sermon.preacher && <span>{sermon.preacher}</span>}
          </div>
        )}
      </div>
      {juboOnClick && (
        <div className="shrink-0 pt-0.5">
          <SmartJuboButton onClick={juboOnClick} />
        </div>
      )}
    </div>
  );
}

function NoServiceCard() {
  return (
    <div className="w-full rounded-2xl bg-bluegrey-1 border border-bluegrey-2 flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-4xl">📭</div>
      <p className="text-sub-tit-4 font-semibold text-grey-7">오늘 예정된 예배가 없습니다</p>
    </div>
  );
}

export default function WordBroadcast() {
  const { church } = useChurch();
  const channelUrl = church.social?.youtube;
  const [juboOpen, setJuboOpen] = useState(false);
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getLiveScreen(church.id);
        if (!cancelled) setScreen(data);
      } catch (err) {
        console.error("[WordBroadcast] 실시간 예배 화면 조회 실패:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();

    const interval = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [church.id]);

  const status = loading && !screen ? "loading" : (screen?.state ?? "NONE");
  const liveVideoId = extractYoutubeVideoId(screen?.youtubeLiveUrl);
  const recentSermons = screen?.recentSermons ?? [];

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* ── 로딩 중 ── */}
        {status === "loading" && (
          <section className="mb-14 max-w-6xl mx-auto">
            <div className="w-full rounded-2xl overflow-hidden bg-grey-2 animate-pulse aspect-video" />
          </section>
        )}

        {/* ── 실시간 중 ── */}
        {status === "LIVE" && (
          <section className="mb-14 max-w-3xl mx-auto">
            <p className="text-body-4 text-grey-6 mb-3">지금 예배가 진행중입니다</p>
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl aspect-video">
              {liveVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1`}
                  title="실시간 예배 방송"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <YouTubeIcon className="w-16 h-16 text-grey-5" />
                  <p className="text-grey-5 text-body-3">실시간 영상 정보를 불러올 수 없습니다.</p>
                  {channelUrl && (
                    <a
                      href={channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors"
                    >
                      유튜브 채널에서 보기
                    </a>
                  )}
                </div>
              )}
            </div>
            {screen.sermon && (
              <SermonInfoBlock
                sermon={screen.sermon}
                isLive
                juboOnClick={screen.bulletinAvailable ? () => setJuboOpen(true) : null}
              />
            )}
          </section>
        )}

        {/* ── 방송 예정 ── */}
        {status === "BEFORE" && (
          <section className="mb-14 max-w-3xl mx-auto">
            <div className="w-full rounded-2xl bg-bluegrey-1 border border-bluegrey-2 flex flex-col items-center justify-center py-20 gap-3">
              <div className="text-4xl">⏳</div>
              <p className="text-sub-tit-4 font-semibold text-grey-7">곧 예배가 시작됩니다</p>
            </div>
            {screen.sermon && (
              <SermonInfoBlock
                sermon={screen.sermon}
                juboOnClick={screen.bulletinAvailable ? () => setJuboOpen(true) : null}
              />
            )}
          </section>
        )}

        {/* ── 오늘 예배가 끝난 경우(다시보기) ── */}
        {status === "ENDED" && (
          <section className="mb-14 max-w-6xl mx-auto">
            {liveVideoId ? (
              <>
                <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${liveVideoId}`}
                    title={screen.sermon?.title ?? "지난 예배"}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
                {screen.sermon && (
                  <SermonInfoBlock
                    sermon={screen.sermon}
                    juboOnClick={screen.bulletinAvailable ? () => setJuboOpen(true) : null}
                  />
                )}
              </>
            ) : (
              <NoServiceCard />
            )}
          </section>
        )}

        {/* ── 오늘 예배 없음 ── */}
        {status === "NONE" && (
          <section className="mb-14 max-w-3xl mx-auto">
            <NoServiceCard />
          </section>
        )}

        {/* ── 지난 설교 가로 스크롤 ── */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-5">지난 설교</h2>
          {recentSermons.length === 0 ? (
            <p className="text-body-4 text-grey-5">등록된 지난 설교가 없습니다.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
              {recentSermons.map((s) => (
                <a
                  key={s.id}
                  href={`/말씀/설교/${s.id}`}
                  className="group shrink-0 w-52 rounded-xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-md transition-all"
                >
                  <div
                    className="w-full bg-grey-2 flex items-center justify-center overflow-hidden"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <YouTubeIcon className="w-8 h-8 text-grey-4 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="p-3">
                    <p className="text-body-4 font-medium text-grey-10 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-body-5 text-grey-5">
                      {s.worshipType && (
                        <>
                          <span>{s.worshipType}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{s.sermonDate}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {channelUrl && (
            <p className="mt-4 text-body-4 text-grey-6">
              더 많은 설교는{" "}
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                유튜브 채널
              </a>
              에서 확인하세요.
            </p>
          )}
        </section>
      </div>

      {/* 스마트 주보 모달 */}
      {juboOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setJuboOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-bluegrey-2">
              <h3 className="text-sub-tit-4 font-bold text-grey-11">이번 주 주보</h3>
              <button
                onClick={() => setJuboOpen(false)}
                className="text-grey-5 hover:text-grey-9 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-8 text-center text-grey-6 text-body-3">
              {/* TODO: 주보 컨텐츠 연동 */}
              주보 내용이 여기에 표시됩니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartJuboButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex items-center gap-2 px-5 py-2.5 border border-blue-3 text-blue-7 text-body-3 font-medium rounded-full hover:bg-blue-1 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
      스마트 주보 보기
    </button>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/WordBroadcast/WordBroadcast.test.jsx`
Expected: PASS (전체 7개 테스트).

- [ ] **Step 5: Commit**

```bash
git add src/pages/WordBroadcast/WordBroadcast.jsx src/pages/WordBroadcast/WordBroadcast.test.jsx
git commit -m "feat: 실시간 예배 화면을 백엔드 설교 도메인에 연결(BEFORE 상태 추가)"
```

---

## Task 4: `WordSermon.jsx` — 서버 검색/페이지네이션 전환

**Files:**
- Modify: `src/pages/WordSermon/WordSermon.jsx`
- Modify: `src/pages/WordSermon/WordSermon.test.jsx`

**Interfaces:**
- Consumes: `searchSermons`(Task 2), `SERVICE_TYPES`(Task 1).
- Produces: 없음(터미널 페이지).

- [ ] **Step 1: 실패하는 테스트로 전체 교체 — `WordSermon.test.jsx`**

```jsx
vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WordSermon from "./WordSermon";

const SERMONS = [
  { id: "s1", title: "부활의 능력", worshipType: "주일 1부", sermonDate: "2026-05-25" },
  { id: "s2", title: "성령으로 충만하라", worshipType: "주일 2부", sermonDate: "2026-05-25" },
];

function mockSearch(sermons, pageInfo = { totalPages: 1 }) {
  api.get.mockResolvedValue({ data: { data: { content: sermons, pageInfo } } });
}

describe("WordSermon — 예배 목록(서버 검색)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("조회된 설교 목록이 카드로 렌더된다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.getByText("성령으로 충만하라")).toBeInTheDocument();
  });

  it("검색어를 입력하고 제출하면 keyword 파라미터로 서버에 재조회한다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText("부활의 능력");

    mockSearch([SERMONS[0]]);
    const input = screen.getByPlaceholderText("설교 제목 검색");
    fireEvent.change(input, { target: { value: "부활" } });
    fireEvent.submit(input.closest("form"));

    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith(
        "/church/sermons",
        expect.objectContaining({ params: expect.objectContaining({ keyword: "부활" }) }),
      ),
    );
  });

  it("예배구분 필터를 선택하면 worshipType 파라미터로 서버에 재조회한다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText("부활의 능력");

    mockSearch([SERMONS[1]]);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "주일 2부" } });

    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith(
        "/church/sermons",
        expect.objectContaining({ params: expect.objectContaining({ worshipType: "주일 2부" }) }),
      ),
    );
  });

  it("설교 카드를 클릭하면 상세 페이지로 라우팅 이동한다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(
      <Routes>
        <Route path="/말씀/설교" element={<WordSermon />} />
        <Route path="/말씀/설교/:id" element={<div>상세 페이지 진입 확인용 마커</div>} />
      </Routes>,
      { initialEntries: ["/말씀/설교"] },
    );
    const card = await screen.findByText("부활의 능력");
    fireEvent.click(card);

    expect(screen.getByText("상세 페이지 진입 확인용 마커")).toBeInTheDocument();
  });

  it("페이지네이션은 서버가 준 totalPages를 기준으로 렌더된다", async () => {
    mockSearch(SERMONS, { totalPages: 3 });
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText("부활의 능력");

    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("조회 실패 시 재시도 버튼이 노출되고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });

    expect(await screen.findByText("불러오지 못했습니다. 다시 시도해 주세요.")).toBeInTheDocument();

    mockSearch(SERMONS);
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/WordSermon/WordSermon.test.jsx`
Expected: FAIL — 컴포넌트가 아직 `getPastSermons`(더미)를 쓰고 `api.get` 모킹을 안 탐.

- [ ] **Step 3: `WordSermon.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import WordTabBar from "@/components/word/WordTabBar";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import { searchSermons } from "@/services/sermonService";
import { SERVICE_TYPES } from "@/config/sermon.config";

const PAGE_SIZE = 12;

function SermonThumb() {
  return (
    <div
      className="w-full bg-grey-2 flex items-center justify-center overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      <svg
        className="w-10 h-10 text-grey-4 group-hover:text-primary transition-colors"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    </div>
  );
}

export default function WordSermon() {
  const navigate = useNavigate();
  const { church } = useChurch();
  const [sermons, setSermons] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [worshipType, setWorshipType] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    searchSermons(church.id, {
      keyword: query || undefined,
      worshipType: worshipType || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then(({ sermons: list, pageInfo: info }) => {
        if (cancelled) return;
        setSermons(list);
        setPageInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[WordSermon] 설교 목록 조회 실패:", err);
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [church.id, query, worshipType, page, reloadToken]);

  const totalPages = Math.max(1, pageInfo.totalPages ?? 1);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputVal);
    setPage(1);
  };

  const handleClear = () => {
    setInputVal("");
    setQuery("");
    setPage(1);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-2xl">
          <div className="relative flex-1">
            <img
              src={IcoSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              alt=""
            />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="설교 제목 검색"
              className="w-full pl-10 pr-10 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all"
            />
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-4 hover:text-grey-7 text-lg leading-none"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={worshipType}
            onChange={(e) => {
              setWorshipType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 bg-white focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all shrink-0"
          >
            <option value="">예배 전체</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-3 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors shrink-0"
          >
            검색
          </button>
        </form>

        {/* 로딩 중 */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-bluegrey-2 overflow-hidden animate-pulse"
              >
                <div className="w-full bg-grey-2" style={{ aspectRatio: "16/9" }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-grey-2 rounded w-4/5" />
                  <div className="h-3 bg-grey-2 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 조회 실패 */}
        {!loading && error && (
          <div className="py-24 text-center text-grey-6 text-body-2">
            <p className="mb-4">불러오지 못했습니다. 다시 시도해 주세요.</p>
            <button
              onClick={() => setReloadToken((t) => t + 1)}
              className="px-5 py-2.5 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && sermons.length === 0 && (
          <div className="py-24 text-center text-grey-6 text-body-2">
            검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
          </div>
        )}

        {/* 4×3 그리드 */}
        {!loading && !error && sermons.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
              {sermons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/말씀/설교/${s.id}`)}
                  className="group text-left rounded-2xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-lg transition-all"
                >
                  <SermonThumb />
                  <div className="p-4">
                    <h3 className="text-body-3 font-semibold text-grey-11 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                      {s.title}
                    </h3>
                    <div className="flex items-center gap-2 text-body-5 text-grey-6">
                      <span>{s.worshipType}</span>
                      <span>·</span>
                      <span>{s.sermonDate}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <PageBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  label="‹"
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === page} label={String(p)} />
                ))}
                <PageBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  label="›"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg text-body-3 font-medium transition-colors ${
        active
          ? "bg-blue-7 text-white"
          : disabled
            ? "text-grey-4 cursor-not-allowed"
            : "text-grey-8 hover:bg-blue-1 hover:text-blue-7"
      }`}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/WordSermon/WordSermon.test.jsx`
Expected: PASS (전체 6개 테스트).

- [ ] **Step 5: Commit**

```bash
git add src/pages/WordSermon/WordSermon.jsx src/pages/WordSermon/WordSermon.test.jsx
git commit -m "feat: 설교 목록 화면을 클라이언트 필터링에서 서버 검색으로 전환"
```

---

## Task 5: `WordSermonDetail.jsx` 전환 + YouTube 직접 호출 코드 일괄 제거

**Files:**
- Modify: `src/pages/WordSermon/WordSermonDetail.jsx`
- Modify: `src/pages/WordSermon/WordSermonDetail.test.jsx`
- Modify: `src/services/sermonService.js` (레거시 함수 제거)
- Modify: `src/data/dummy/sermons.js` (레거시 더미 데이터 제거)

**Interfaces:**
- Consumes: `getSermonDetail`, `searchSermons`(Task 2).
- Produces: 없음(마지막 태스크).

- [ ] **Step 1: 실패하는 테스트로 전체 교체 — `WordSermonDetail.test.jsx`**

```jsx
vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WordSermonDetail from "./WordSermonDetail";

const NEIGHBORS = [
  {
    id: "s1",
    title: "부활의 능력",
    sermonDate: "2026-05-25",
    worshipType: "주일 1부",
    scripture: "롬 8:11",
    preacher: "김영수 담임목사",
    youtubeVideoId: null,
  },
  {
    id: "s2",
    title: "성령으로 충만하라",
    sermonDate: "2026-05-25",
    worshipType: "주일 2부",
    scripture: "엡 5:18",
    preacher: "박성민 부목사",
    youtubeVideoId: "dQw4w9WgXcQ",
  },
  {
    id: "s3",
    title: "참된 예배",
    sermonDate: "2026-05-18",
    worshipType: "주일 1부",
    scripture: "요 4:23-24",
    preacher: "김영수 담임목사",
    youtubeVideoId: null,
  },
];

function mockBackend() {
  api.get.mockImplementation((url) => {
    if (url === "/church/sermons") {
      return Promise.resolve({ data: { data: { content: NEIGHBORS, pageInfo: { totalPages: 1 } } } });
    }
    const match = url.match(/^\/church\/sermons\/(.+)$/);
    const found = match ? (NEIGHBORS.find((s) => s.id === match[1]) ?? null) : null;
    return Promise.resolve({ data: { data: found } });
  });
}

function renderDetail(id) {
  return renderWithChurch(
    <Routes>
      <Route path="/말씀/설교/:id" element={<WordSermonDetail />} />
    </Routes>,
    { initialEntries: [`/말씀/설교/${id}`] },
  );
}

describe("WordSermonDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id에 해당하는 설교의 제목/날짜/본문말씀/설교자를 보여준다", async () => {
    mockBackend();
    const target = NEIGHBORS[2];
    renderDetail(target.id);

    expect(await screen.findByText(target.title)).toBeInTheDocument();
    expect(screen.getByText(target.sermonDate)).toBeInTheDocument();
    expect(screen.getByText(target.scripture)).toBeInTheDocument();
    expect(screen.getByText(target.preacher)).toBeInTheDocument();
  });

  it("설교를 찾을 수 없으면 안내 문구와 목록으로 돌아가기 버튼을 보여준다", async () => {
    mockBackend();
    renderDetail("존재하지-않는-id");
    expect(await screen.findByText("설교를 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "목록으로 돌아가기" })).toBeInTheDocument();
  });

  it("youtubeVideoId가 없으면 'YouTube에서 보기' 링크로 대체된다", async () => {
    mockBackend();
    const target = NEIGHBORS[0];
    renderDetail(target.id);
    await screen.findByText(target.title);
    expect(screen.getByRole("link", { name: "YouTube에서 보기" })).toBeInTheDocument();
  });

  it("youtubeVideoId가 있으면 embed iframe으로 재생된다", async () => {
    mockBackend();
    const target = NEIGHBORS[1];
    renderDetail(target.id);
    await screen.findByText(target.title);
    expect(
      document.querySelector('iframe[src="https://www.youtube.com/embed/dQw4w9WgXcQ"]'),
    ).toBeInTheDocument();
  });

  it("'다음 설교' 버튼을 클릭하면 인접 목록 기준으로 해당 설교로 전환된다", async () => {
    mockBackend();
    const target = NEIGHBORS[2];
    renderDetail(target.id);
    await screen.findByText(target.title);

    const next = NEIGHBORS[1];
    fireEvent.click(screen.getByRole("button", { name: /다음 설교/ }));

    expect(await screen.findByText(next.title)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/WordSermon/WordSermonDetail.test.jsx`
Expected: FAIL — 컴포넌트가 아직 `getPastSermons`(더미)를 쓰고 `api.get` 모킹을 안 탐, 필드명도 다름(`date`/`videoId` vs `sermonDate`/`youtubeVideoId`).

- [ ] **Step 3: `WordSermonDetail.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { getSermonDetail, searchSermons } from "@/services/sermonService";

const NEIGHBOR_FETCH_SIZE = 50;

export default function WordSermonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { church } = useChurch();
  const [sermon, setSermon] = useState(undefined); // undefined=로딩중, null=없음
  const [neighbors, setNeighbors] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setSermon(undefined);
    Promise.all([
      getSermonDetail(church.id, id),
      searchSermons(church.id, { page: 1, size: NEIGHBOR_FETCH_SIZE }),
    ])
      .then(([detail, { sermons }]) => {
        if (cancelled) return;
        setSermon(detail);
        setNeighbors(sermons);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[WordSermonDetail] 설교 상세 조회 실패:", err);
        setSermon(null);
      });
    return () => {
      cancelled = true;
    };
  }, [church.id, id]);

  if (sermon === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 md:px-8">
        <div
          className="w-full rounded-2xl bg-grey-2 animate-pulse"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    );
  }

  if (sermon === null) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-24 text-center">
        <p className="text-sub-tit-4 text-grey-6">설교를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/말씀/설교")}
          className="mt-6 px-5 py-2.5 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 이전/다음 설교 (검색 결과 순서 기준 — 최신순으로 조회되므로 다음 인덱스가 더 과거)
  const currentIdx = neighbors.findIndex((s) => s.id === sermon.id);
  const prev = currentIdx === -1 ? null : (neighbors[currentIdx + 1] ?? null);
  const next = currentIdx === -1 ? null : (neighbors[currentIdx - 1] ?? null);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <button
            onClick={() => navigate("/말씀/설교")}
            className="flex items-center gap-1.5 text-blue-3 hover:text-white transition-colors text-body-4 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            예배 목록
          </button>
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* 영상 플레이어 */}
        <div
          className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl mb-8"
          style={{ aspectRatio: "16/9" }}
        >
          {sermon.youtubeVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${sermon.youtubeVideoId}`}
              title={sermon.title}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <svg className="w-14 h-14 text-grey-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {church?.social?.youtube && (
                <a
                  href={church.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors"
                >
                  YouTube에서 보기
                </a>
              )}
            </div>
          )}
        </div>

        {/* 설교 정보 */}
        <p className="text-body-4 text-grey-5 mb-3">{sermon.sermonDate}</p>
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-4">{sermon.title}</h2>
        {(sermon.scripture || sermon.preacher || sermon.worshipType) && (
          <div className="flex items-center gap-2 text-body-3 text-grey-6 mb-6">
            {sermon.worshipType && (
              <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-5 font-medium rounded-full">
                {sermon.worshipType}
              </span>
            )}
            {sermon.scripture && <span className="text-primary font-medium">{sermon.scripture}</span>}
            {sermon.scripture && sermon.preacher && <span className="text-grey-4">·</span>}
            {sermon.preacher && <span>{sermon.preacher}</span>}
          </div>
        )}

        {/* 이전/다음 네비게이션 */}
        <div className="flex gap-4 mt-12 pt-8 border-t border-bluegrey-2">
          {prev ? (
            <button
              onClick={() => navigate(`/말씀/설교/${prev.id}`)}
              className="flex-1 text-left px-4 py-3.5 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all group"
            >
              <p className="text-body-5 text-grey-5 mb-1">이전 설교</p>
              <p className="text-body-3 font-medium text-grey-9 group-hover:text-primary transition-colors line-clamp-1">
                {prev.title}
              </p>
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <button
              onClick={() => navigate(`/말씀/설교/${next.id}`)}
              className="flex-1 text-right px-4 py-3.5 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all group"
            >
              <p className="text-body-5 text-grey-5 mb-1">다음 설교</p>
              <p className="text-body-3 font-medium text-grey-9 group-hover:text-primary transition-colors line-clamp-1">
                {next.title}
              </p>
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/WordSermon/WordSermonDetail.test.jsx`
Expected: PASS (전체 5개 테스트).

- [ ] **Step 5: 레거시 YouTube 직접 호출 코드 제거 — 잔존 참조 확인**

Run: `grep -rn "getLiveSermon\|getPastSermons\|DUMMY_LIVE_SERMON\|DUMMY_PAST_SERMONS\|toUploadsPlaylistId\|YOUTUBE_API_KEY\|YOUTUBE_API_BASE" src/`
Expected: `src/services/sermonService.js`와 `src/data/dummy/sermons.js` 안의 정의 줄들만 남아있어야 한다(소비하는 페이지/테스트는 전부 Task 3~5에서 이미 전환됨). 만약 다른 소비처가 남아있다면 이 태스크를 진행하지 말고 먼저 그 파일을 확인한다.

- [ ] **Step 6: `sermonService.js`에서 레거시 함수/상수 삭제**

`src/services/sermonService.js` 상단에서 아래 두 줄 삭제:

```js
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
```

`toUploadsPlaylistId` 함수, `getLiveSermon` 함수, `getPastSermons` 함수 전체 삭제(파일 상단부, `createSermon` 이전 구간).

import 줄을 아래로 수정(더 이상 안 쓰는 `DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS` 제거):

```js
import { DUMMY_ADMIN_SERMONS, DUMMY_LIVE_SCREEN } from "@/data/dummy/sermons";
```

파일 최상단의 `@typedef` JSDoc 블록(`LiveSermon`/`PastSermon`)도 더 이상 쓰이지 않으므로 삭제한다.

- [ ] **Step 7: `src/data/dummy/sermons.js`에서 레거시 더미 데이터 삭제**

`DUMMY_LIVE_SERMON`, `DUMMY_PAST_SERMONS` export 전체를 삭제한다(각각 관련 `@type` JSDoc 주석 포함). `DUMMY_ADMIN_SERMONS`, `DUMMY_LIVE_SCREEN`은 유지.

- [ ] **Step 8: 전체 테스트 스위트 + lint 실행**

Run: `pnpm vitest run`
Expected: 전체 PASS, 0 failures.

Run: `pnpm run lint`
Expected: 에러 없음.

- [ ] **Step 9: Commit**

```bash
git add src/pages/WordSermon/WordSermonDetail.jsx src/pages/WordSermon/WordSermonDetail.test.jsx src/services/sermonService.js src/data/dummy/sermons.js
git commit -m "feat: 설교 상세 화면 전환 완료 및 YouTube 직접 호출 코드 제거"
```

---

## 완료 후 확인 사항 (사용자에게 안내할 내용)

- `.env`의 `VITE_YOUTUBE_API_KEY`는 더 이상 코드에서 참조되지 않지만 무해하므로 그대로 둔다(비목표).
- 스펙의 "확인 필요" 2건(ENDED 상태에서 `youtubeLiveUrl`/`sermon`이 계속 채워지는지, 검색 API 기본 정렬 순서)은 실제 백엔드 응답을 받아본 뒤 검증이 필요하다 — 코드에는 이미 방어적으로 처리해 두었다(ENDED에서 videoId 파싱 실패 시 NONE과 동일한 화면으로 폴백).
