# 공지사항(Notice) 실연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공지사항 공개 조회(`Notice.jsx`)와 관리자 CRUD(`NoticesManage.jsx`)를 실제 백엔드 API와 연동한다.

**Architecture:** 백엔드가 총 개수 메타데이터를 주지 않고 검색/타입 필터도 지원하지 않으므로, 기본(미필터) 상태는 서버 페이지네이션(이전/다음 버튼)으로, 탭 필터·검색이 걸린 상태는 큰 limit으로 받아와 클라이언트 필터링하는 하이브리드 방식을 쓴다. 관리자 CRUD는 응답에 없는 필드(type/featured/author/date)를 로컬에서 재구성하지 않고 mutation 성공 후 목록을 refetch한다.

**Tech Stack:** React 19, Axios(via `src/services/api.js`), `useFetch` 훅(`src/hooks/useFetch.js`), Vitest(`vite-plus/test`), `@testing-library/react` + `@testing-library/user-event`.

## Global Constraints

- 백엔드 공개 목록: `GET /api/churches/{churchId}/notices?page&limit` — `limit` 생략 시 서버 기본값 10, 응답에 총 개수 메타데이터 없음.
- 백엔드 관리자 등록: `POST /api/church/admin/notices` body `{title, content, type, featured, author}`(title만 필수) → 응답 `{noticeId, title, content, createdAt}`(type/featured/author 없음).
- 백엔드 관리자 수정: `PATCH /api/church/admin/notices/{noticeId}` body `{title, content}`만 — type/author/featured를 보내도 무시된다(스키마에 없음).
- 백엔드 관리자 삭제: `DELETE /api/church/admin/notices/{noticeId}` → 204.
- 관리자 전용 목록 조회 엔드포인트는 존재하지 않는다 — 공개 목록 API를 재사용한다.
- 프론트 필드명은 `body`, 백엔드 요청 필드명은 `content` — 서비스 레이어에서 매핑한다.
- 테스트는 `"vite-plus/test"`에서 `describe/it/expect/vi/beforeEach`를 import한다(jest/vitest 패키지 직접 import 금지).
- `@/services/api`를 모킹할 때는 `{ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, isDummy: () => false }` 형태로 모킹해 실 API 분기를 강제한다(이 프로젝트의 로컬 `.env`는 gitignore 대상이라 테스트 환경에 존재하지 않을 수 있고, `isDummy` 실제 구현은 `import.meta.env.VITE_DUMMY_DOMAINS`에 의존하므로 모킹 없이는 결과가 불안정하다).
- 경로 별칭 `@/` → `src/`. `react-router-dom`이 아닌 `react-router`에서 훅 import.
- `.env`는 gitignore 대상이라 git으로 추적되지 않는다 — 이 파일을 고치는 단계에서는 `git add`를 하지 않는다.

---

### Task 1: `noticeService.js` — 관리자 CRUD 추가 + `isDummy` 전환 + 호출부 보정

**Files:**
- Modify: `src/services/noticeService.js`
- Modify: `src/components/home/NoticeSection.jsx`
- Modify: `.env` (워크트리에 파일이 있는 경우에만, gitignore 대상이라 커밋하지 않음)
- Test: `src/services/noticeService.test.js` (신규)
- Test: `src/components/home/NoticeSection.test.jsx` (신규)

**Interfaces:**
- Produces:
  - `getNotices(churchId, { page?, limit? } = {})` → `Promise<Notice[]>` (기존 시그니처 유지, 내부 구현만 변경)
  - `createNotice(churchId, { type, title, body, author, featured })` → `Promise<{noticeId, title, content, createdAt}>`
  - `updateNotice(churchId, noticeId, { title, body })` → `Promise<Notice|null>` (payload에 다른 필드가 더 있어도 title/body만 전송)
  - `deleteNotice(churchId, noticeId)` → `Promise<{success:true}>`
  - 이 4개 함수 시그니처는 Task 3, Task 4가 그대로 소비한다.

- [ ] **Step 1: `noticeService.test.js` 작성(실패 확인용)**

`src/services/noticeService.test.js` 전체 내용:

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getNotices, createNotice, updateNotice, deleteNotice } from "./noticeService";

describe("noticeService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getNotices는 page/limit 파라미터를 그대로 전달한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getNotices("1", { page: 2, limit: 10 });

    expect(api.get).toHaveBeenCalledWith("/churches/1/notices", {
      params: { page: 2, limit: 10 },
    });
  });

  it("createNotice는 body를 content로 매핑해 POST /church/admin/notices를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { noticeId: 1, title: "제목", content: "내용", createdAt: "2026-08-14" } },
    });

    const result = await createNotice("1", {
      type: "공지",
      title: "제목",
      body: "내용",
      author: "사무국",
      featured: true,
    });

    expect(api.post).toHaveBeenCalledWith("/church/admin/notices", {
      title: "제목",
      content: "내용",
      type: "공지",
      featured: true,
      author: "사무국",
    });
    expect(result).toEqual({ noticeId: 1, title: "제목", content: "내용", createdAt: "2026-08-14" });
  });

  it("updateNotice는 title/content만 보낸다(type/author/featured는 보내지 않는다)", async () => {
    api.patch.mockResolvedValue({
      data: { data: { noticeId: 1, title: "수정 제목", content: "수정 내용" } },
    });

    await updateNotice("1", "1", {
      type: "공지",
      title: "수정 제목",
      body: "수정 내용",
      author: "무시됨",
      featured: false,
    });

    expect(api.patch).toHaveBeenCalledWith("/church/admin/notices/1", {
      title: "수정 제목",
      content: "수정 내용",
    });
  });

  it("deleteNotice는 DELETE /church/admin/notices/{noticeId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    const result = await deleteNotice("1", "1");

    expect(api.delete).toHaveBeenCalledWith("/church/admin/notices/1");
    expect(result).toEqual({ success: true });
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/noticeService.test.js`
Expected: FAIL — `createNotice`/`updateNotice`/`deleteNotice`가 정의돼 있지 않음(import 에러 또는 undefined 호출 에러).

- [ ] **Step 3: `noticeService.js` 전체를 아래 내용으로 교체**

```js
/**
 * @typedef {{ id:number, type:string, featured:boolean, title:string,
 *   body:string, date:string, author:string }} Notice
 */

import api, { isDummy } from "./api";
import { DUMMY_NOTICES } from "@/data/dummy/notices";

/**
 * 공지 목록 조회
 * @param {string} churchId
 * @param {{ page?:number, limit?:number }} params
 * @returns {Promise<Notice[]>}
 */
export async function getNotices(churchId, params = {}) {
  if (isDummy("notice")) {
    if (!params.limit) return [...DUMMY_NOTICES];
    const start = ((params.page ?? 1) - 1) * params.limit;
    return DUMMY_NOTICES.slice(start, start + params.limit);
  }
  const res = await api.get(`/churches/${churchId}/notices`, { params });
  return res.data.data;
}

/**
 * 공지 등록 (관리자)
 * @param {string} churchId
 * @param {{ type:string, title:string, body:string, author:string, featured:boolean }} payload
 * @returns {Promise<{noticeId:number|string, title:string, content:string, createdAt:string}>}
 */
export async function createNotice(churchId, payload) {
  if (isDummy("notice")) {
    const created = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      type: payload.type,
      title: payload.title,
      body: payload.body,
      author: payload.author,
      featured: payload.featured,
    };
    DUMMY_NOTICES.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/notices`, {
    title: payload.title,
    content: payload.body,
    type: payload.type,
    featured: payload.featured,
    author: payload.author,
  });
  return res.data.data;
}

/**
 * 공지 수정 (관리자) — 백엔드가 title/content만 받는다. type/author/featured는 등록 시에만 정해진다.
 * @param {string} churchId
 * @param {number|string} noticeId
 * @param {{ title:string, body:string }} payload
 * @returns {Promise<Notice|null>}
 */
export async function updateNotice(churchId, noticeId, payload) {
  if (isDummy("notice")) {
    const idx = DUMMY_NOTICES.findIndex((n) => String(n.id) === String(noticeId));
    if (idx === -1) return null;
    DUMMY_NOTICES[idx] = { ...DUMMY_NOTICES[idx], title: payload.title, body: payload.body };
    return DUMMY_NOTICES[idx];
  }
  const res = await api.patch(`/church/admin/notices/${noticeId}`, {
    title: payload.title,
    content: payload.body,
  });
  return res.data.data;
}

/**
 * 공지 삭제 (관리자)
 * @param {string} churchId
 * @param {number|string} noticeId
 */
export async function deleteNotice(churchId, noticeId) {
  if (isDummy("notice")) {
    const idx = DUMMY_NOTICES.findIndex((n) => String(n.id) === String(noticeId));
    if (idx !== -1) DUMMY_NOTICES.splice(idx, 1);
    return { success: true };
  }
  await api.delete(`/church/admin/notices/${noticeId}`);
  return { success: true };
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/noticeService.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/services/noticeService.js src/services/noticeService.test.js
git commit -m "feat: noticeService에 관리자 CRUD 추가, isDummy 전환"
```

- [ ] **Step 6: `NoticeSection.jsx` 호출부 보정 — 왜 필요한가**

홈 화면의 `NoticeSection.jsx`도 `getNotices(church.id)`를 파라미터 없이 호출한다. `isDummy("notice")`가 꺼지면(이 사이클에서 끄는 게 목표) 이 호출은 실 API를 타게 되고, 백엔드는 `limit` 생략 시 기본값 10만 반환한다. `NoticeSection`은 받은 목록을 탭별로 클라이언트 필터링해서 상위 5개만 보여주므로, 10개 중 특정 탭에 해당하는 게 5개 미만이면 실제로는 더 있어도 화면엔 적게 뜬다. 홈 위젯은 페이지네이션이 필요 없으므로 넉넉한 `limit`만 명시하면 충분하다.

`src/components/home/NoticeSection.test.jsx` 전체 내용(신규):

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import NoticeSection from "./NoticeSection";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("NoticeSection — 홈 위젯", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("탭 필터링에 쓸 수 있도록 넉넉한 limit으로 공지를 조회한다", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            type: "공지",
            featured: false,
            title: "테스트 공지",
            body: "내용",
            date: "2026-08-01",
            author: "사무국",
          },
        ],
      },
    });
    renderWithChurch(<NoticeSection />, { withRouter: true });

    expect(await screen.findByText("테스트 공지")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 30 },
    });
  });
});
```

Run: `pnpm vitest run src/components/home/NoticeSection.test.jsx`
Expected: FAIL — `api.get`이 `{params:{}}`로 호출되어 `toHaveBeenCalledWith`의 `{params:{limit:30}}` 기대와 불일치.

- [ ] **Step 7: `NoticeSection.jsx`에서 `getNotices` 호출부 한 줄 수정**

`src/components/home/NoticeSection.jsx`의 41번째 줄:

```jsx
// 변경 전
const { data: notices = [] } = useFetch(() => getNotices(church.id), [church.id], []);

// 변경 후
const { data: notices = [] } = useFetch(
  () => getNotices(church.id, { limit: 30 }),
  [church.id],
  [],
);
```

- [ ] **Step 8: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/home/NoticeSection.test.jsx`
Expected: PASS

- [ ] **Step 9: 커밋**

```bash
git add src/components/home/NoticeSection.jsx src/components/home/NoticeSection.test.jsx
git commit -m "fix: NoticeSection이 넉넉한 limit으로 공지를 조회하도록 보정"
```

- [ ] **Step 10: `.env`에서 `notice`를 더미 도메인 목록에서 제거 (있는 경우에만)**

이 저장소의 `.env`는 gitignore 대상이라 워크트리마다 따로 존재하지 않을 수 있다.

- 이 워크트리에 `.env` 파일이 있다면 열어서 `VITE_DUMMY_DOMAINS` 값에서 `notice`를 제거한다(예: `VITE_DUMMY_DOMAINS=notice,events,gallery,...` → `VITE_DUMMY_DOMAINS=events,gallery,...`). 이 파일은 `git add`하지 않는다(gitignore 대상).
- `.env` 파일 자체가 없다면 이 단계는 건너뛴다 — 오케스트레이터가 최종 병합 후 로컬 개발 환경의 `.env`를 별도로 동기화한다.

이 단계는 커밋 대상이 아니므로 git 커밋 없음.

---

### Task 2: 공유 페이지네이션 컴포넌트 — `PrevNextPagination`, `NumberedPagination`

**Files:**
- Create: `src/components/common/PrevNextPagination.jsx`
- Create: `src/components/common/NumberedPagination.jsx`
- Test: `src/components/common/PrevNextPagination.test.jsx` (신규)
- Test: `src/components/common/NumberedPagination.test.jsx` (신규)

**Interfaces:**
- Consumes: 없음(독립 컴포넌트).
- Produces:
  - `PrevNextPagination({ page, hasNext, onChange })` — `onChange(newPage:number)`를 호출하는 이전/다음 버튼 페이지네이션. Task 3, Task 4가 서버 모드에서 사용.
  - `NumberedPagination({ total, perPage, current, onChange })` — `onChange(newPage:number)`를 호출하는 번호 매기기 페이지네이션(기존 `Notice.jsx`의 `Pagination` 컴포넌트와 동일한 로직). Task 3, Task 4가 필터 모드에서 사용.

- [ ] **Step 1: `PrevNextPagination.test.jsx` 작성**

`src/components/common/PrevNextPagination.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrevNextPagination from "./PrevNextPagination";

describe("PrevNextPagination", () => {
  it("현재 페이지 번호를 보여준다", () => {
    render(<PrevNextPagination page={2} hasNext={true} onChange={() => {}} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("1페이지에서는 이전 버튼이 비활성화된다", () => {
    render(<PrevNextPagination page={1} hasNext={true} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
  });

  it("hasNext가 false면 다음 버튼이 비활성화된다", () => {
    render(<PrevNextPagination page={1} hasNext={false} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("다음 버튼을 클릭하면 onChange가 page+1로 호출된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PrevNextPagination page={2} hasNext={true} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "다음 페이지" }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("이전 버튼을 클릭하면 onChange가 page-1로 호출된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PrevNextPagination page={2} hasNext={true} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "이전 페이지" }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/common/PrevNextPagination.test.jsx`
Expected: FAIL — 모듈을 찾을 수 없음(`./PrevNextPagination` 없음).

- [ ] **Step 3: `PrevNextPagination.jsx` 작성**

```jsx
export default function PrevNextPagination({ page, hasNext, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span className="text-body-4 font-medium text-grey-8 min-w-[24px] text-center">{page}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
        aria-label="다음 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/common/PrevNextPagination.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: `NumberedPagination.test.jsx` 작성**

`src/components/common/NumberedPagination.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberedPagination from "./NumberedPagination";

describe("NumberedPagination", () => {
  it("total/perPage로 계산된 페이지 수만큼 버튼을 렌더링한다", () => {
    render(<NumberedPagination total={25} perPage={10} current={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "4" })).not.toBeInTheDocument();
  });

  it("첫 페이지에서는 이전 버튼이 비활성화된다", () => {
    render(<NumberedPagination total={25} perPage={10} current={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
  });

  it("마지막 페이지에서는 다음 버튼이 비활성화된다", () => {
    render(<NumberedPagination total={25} perPage={10} current={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("페이지 번호를 클릭하면 onChange가 해당 번호로 호출된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberedPagination total={25} perPage={10} current={1} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "2" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });
});
```

- [ ] **Step 6: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/common/NumberedPagination.test.jsx`
Expected: FAIL — 모듈을 찾을 수 없음.

- [ ] **Step 7: `NumberedPagination.jsx` 작성**

`Notice.jsx`에 있던 기존 `Pagination` 컴포넌트를 그대로 옮기되, 아이콘 버튼에 `aria-label`을 추가한다(접근성 규칙상 아이콘 전용 버튼은 접근 가능한 이름이 있어야 하는데, 기존 컴포넌트엔 없었다 — 이 컴포넌트를 옮기는 김에 보정한다).

```jsx
export default function NumberedPagination({ total, perPage, current, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="이전 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-body-4 font-medium transition-colors ${
            p === current ? "bg-primary text-white" : "text-grey-7 hover:bg-grey-2"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        aria-label="다음 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 8: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/common/NumberedPagination.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 9: 커밋**

```bash
git add src/components/common/PrevNextPagination.jsx src/components/common/PrevNextPagination.test.jsx src/components/common/NumberedPagination.jsx src/components/common/NumberedPagination.test.jsx
git commit -m "feat: 이전/다음, 번호매기기 공유 페이지네이션 컴포넌트 추가"
```

---

### Task 3: `Notice.jsx` — 하이브리드 페칭으로 재설계

**Files:**
- Modify: `src/pages/Notice/Notice.jsx` (전체 교체)
- Test: `src/pages/Notice/Notice.test.jsx` (신규)

**Interfaces:**
- Consumes: `getNotices(churchId, {page?, limit?})`(Task 1), `PrevNextPagination`/`NumberedPagination`(Task 2).
- Produces: 없음(리프 페이지 컴포넌트, 다른 태스크가 소비하지 않음).

- [ ] **Step 1: `Notice.test.jsx` 작성**

`src/pages/Notice/Notice.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Notice from "./Notice";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

function makeNotices(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type: "공지",
    featured: false,
    title: `공지 ${i + 1}`,
    body: "내용",
    date: "2026-08-01",
    author: "사무국",
  }));
}

const MIXED = [
  { id: 1, type: "공지", featured: false, title: "공지 1", body: "내용", date: "2026-08-01", author: "사무국" },
  { id: 2, type: "행사", featured: false, title: "행사 공지", body: "내용", date: "2026-08-02", author: "교역자실" },
];

describe("Notice — 공개 목록", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("기본 진입 시 page:1, limit:10으로 조회한다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(10) } });
    renderWithChurch(<Notice />, { withRouter: true });

    await screen.findByText("공지 1");

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { page: 1, limit: 10 },
    });
  });

  it("정확히 limit만큼 받으면 다음 버튼이 활성화된다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(10) } });
    renderWithChurch(<Notice />, { withRouter: true });

    await screen.findByText("공지 1");
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeEnabled();
  });

  it("limit보다 적게 받으면 다음 버튼이 비활성화된다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(3) } });
    renderWithChurch(<Notice />, { withRouter: true });

    await screen.findByText("공지 1");
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("탭을 전환하면 limit:1000으로 재요청하고 클라이언트에서 필터링한다", async () => {
    api.get.mockResolvedValue({ data: { data: MIXED } });
    const user = userEvent.setup();
    renderWithChurch(<Notice />, { withRouter: true });
    await screen.findByText("공지 1");

    await user.click(screen.getByRole("button", { name: "행사" }));

    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith(expect.stringContaining("/notices"), {
        params: { limit: 1000 },
      }),
    );
    expect(await screen.findByText("행사 공지")).toBeInTheDocument();
    expect(screen.queryByText("공지 1")).not.toBeInTheDocument();
  });

  it("목록 항목을 클릭하면 상세 화면으로 전환되고 목록으로 버튼으로 되돌아간다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(2) } });
    const user = userEvent.setup();
    renderWithChurch(<Notice />, { withRouter: true });
    await screen.findByText("공지 1");

    await user.click(screen.getByText("공지 1"));
    expect(screen.getByText("내용")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "목록으로" }));
    expect(screen.queryByText("목록으로")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/Notice/Notice.test.jsx`
Expected: FAIL — 기존 `Notice.jsx`가 `getNotices(church.id)`를 파라미터 없이 호출하므로 `{params:{page:1,limit:10}}` 기대와 불일치, "다음 페이지"/"이전 페이지" 버튼도 아직 없음.

- [ ] **Step 3: `Notice.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import PrevNextPagination from "@/components/common/PrevNextPagination";
import NumberedPagination from "@/components/common/NumberedPagination";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { bg: "rgba(61,85,136,.12)", color: "#2b3c61" },
  행사: { bg: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { bg: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

const PAGE_SIZE = 10;
const FILTER_FETCH_LIMIT = 1000;

function IconPin() {
  return (
    <span className="inline-flex items-center justify-center shrink-0 rounded-[5px] w-[22px] h-[22px] bg-blue-7">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    </span>
  );
}

export default function Notice() {
  const { church } = useChurch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("전체");
  const [serverPage, setServerPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const isFiltered = tab !== "전체";
  const { data: notices = [] } = useFetch(
    () =>
      isFiltered
        ? getNotices(church.id, { limit: FILTER_FETCH_LIMIT })
        : getNotices(church.id, { page: serverPage, limit: PAGE_SIZE }),
    [church.id, isFiltered, serverPage],
    [],
  );

  useEffect(() => {
    const id = searchParams.get("id");
    if (id && notices.length > 0) {
      const found = notices.find((n) => String(n.id) === id);
      if (found) setSelected(found);
    }
  }, [notices, searchParams]);

  const filtered = isFiltered ? notices.filter((n) => n.type === tab) : notices;
  const paged = isFiltered
    ? filtered.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE)
    : filtered;
  const hasNext = !isFiltered && notices.length === PAGE_SIZE;

  function handleTabChange(t) {
    setTab(t);
    setServerPage(1);
    setClientPage(1);
    setSelected(null);
  }

  function formatDate(dateStr) {
    return dateStr?.replace(/-/g, ".");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-body-5 text-grey-6 mb-1">교회소식</p>
        <h1 className="text-headline-4 font-bold text-grey-11">공지사항</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-5 py-2 rounded-full text-body-4 font-medium transition-colors ${
              t === tab ? "bg-primary text-white" : "bg-grey-2 text-grey-7 hover:bg-grey-3"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 목록 or 상세 */}
      {selected ? (
        /* 상세 */
        <div className="border border-grey-3 rounded-2xl overflow-hidden">
          {/* 상세 헤더 */}
          <div className="border-b border-grey-3 px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              {selected.featured && <IconPin />}
              <span
                className="text-body-5 font-bold px-1 py-1 rounded-md"
                style={TAG_STYLES[selected.type] ?? TAG_STYLES["공지"]}
              >
                {selected.type}
              </span>
            </div>
            <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">{selected.title}</h2>
            <div className="flex items-center gap-4 text-body-5 text-grey-6">
              <span>{selected.author}</span>
              <span>·</span>
              <span>{formatDate(selected.date)}</span>
            </div>
          </div>
          {/* 본문 */}
          <div className="px-8 py-8 min-h-[200px]">
            <p className="text-body-3 text-grey-9 leading-relaxed whitespace-pre-wrap">
              {selected.body}
            </p>
          </div>
          {/* 하단 */}
          <div className="border-t border-grey-3 px-8 py-4 flex justify-end">
            <button
              onClick={() => {
                setSelected(null);
                setSearchParams({});
              }}
              className="border border-grey-4 text-grey-7 rounded-full px-6 py-2 text-body-4 hover:bg-grey-1 transition-colors"
            >
              목록으로
            </button>
          </div>
        </div>
      ) : (
        /* 목록 */
        <>
          <div className="flex flex-col min-h-[700px]">
            <div className="border border-grey-3 rounded-2xl overflow-hidden">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_80px_100px] bg-grey-1 border-b border-grey-3 px-3 py-3 text-body-5 font-semibold text-grey-7">
                <span className="text-center">구분</span>
                <span className="pl-4">제목</span>
                <span className="hidden md:block text-center">작성자</span>
                <span className="hidden md:block text-center">날짜</span>
              </div>

              {paged.length === 0 ? (
                <div className="py-20 text-center text-grey-5 text-body-3">
                  공지사항이 없습니다.
                </div>
              ) : (
                paged.map((n, i) => {
                  const tagStyle = TAG_STYLES[n.type] ?? TAG_STYLES["공지"];
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        setSelected(n);
                        setSearchParams({ id: n.id });
                      }}
                      className={`w-full grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_80px_100px] items-center px-3 py-4 text-left transition-colors hover:bg-grey-1 ${
                        i < paged.length - 1 ? "border-b border-grey-3" : ""
                      } ${n.featured ? "bg-blue-1/30" : ""}`}
                    >
                      <span className="flex justify-center">
                        <span
                          className="text-body-5 font-bold px-2.5 py-1 rounded-md text-center"
                          style={tagStyle}
                        >
                          {n.type}
                        </span>
                      </span>
                      <span className="pl-4 flex items-center gap-2 min-w-0">
                        {n.featured && <IconPin className="shrink-0 text-primary" />}
                        <span
                          className={`truncate text-body-3 ${n.featured ? "font-semibold text-grey-11" : "text-grey-10"}`}
                        >
                          {n.title}
                        </span>
                      </span>
                      <span className="hidden md:block text-center text-body-5 text-grey-6">
                        {n.author}
                      </span>
                      <span className="hidden md:block text-center text-body-5 text-grey-6">
                        {formatDate(n.date)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex-1" />
            {isFiltered ? (
              <NumberedPagination
                total={filtered.length}
                perPage={PAGE_SIZE}
                current={clientPage}
                onChange={setClientPage}
              />
            ) : (
              <PrevNextPagination page={serverPage} hasNext={hasNext} onChange={setServerPage} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/Notice/Notice.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/pages/Notice/Notice.jsx src/pages/Notice/Notice.test.jsx
git commit -m "feat: Notice.jsx가 서버/필터 하이브리드 페이지네이션으로 실API 연동"
```

---

### Task 4: `NoticesManage.jsx` — 실 CRUD 연동 + 하이브리드 페이지네이션

**Files:**
- Modify: `src/pages/admin/NoticesManage.jsx` (전체 교체)
- Test: `src/pages/admin/NoticesManage.test.jsx` (신규)

**Interfaces:**
- Consumes: `getNotices`/`createNotice`/`updateNotice`/`deleteNotice`(Task 1), `PrevNextPagination`/`NumberedPagination`(Task 2).
- Produces: 없음(리프 페이지 컴포넌트).

- [ ] **Step 1: `NoticesManage.test.jsx` 작성**

`src/pages/admin/NoticesManage.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import NoticesManage from "./NoticesManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const NOTICE = {
  id: 1,
  type: "공지",
  featured: true,
  title: "기존 공지",
  body: "기존 내용",
  date: "2026-08-01",
  author: "사무국",
};

describe("NoticesManage — 관리자 CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [NOTICE] } });
  });

  it("목록을 불러와 렌더링하고 조회 컬럼은 표시하지 않는다", async () => {
    renderWithChurch(<NoticesManage />);
    expect(await screen.findByText("기존 공지")).toBeInTheDocument();
    expect(screen.queryByText("조회")).not.toBeInTheDocument();
  });

  it("공지 등록 시 createNotice(POST)를 호출하고 목록을 다시 불러온다", async () => {
    api.post.mockResolvedValue({
      data: { data: { noticeId: 2, title: "새 공지", content: "새 내용", createdAt: "2026-08-14" } },
    });
    const user = userEvent.setup();
    renderWithChurch(<NoticesManage />);
    await screen.findByText("기존 공지");

    await user.click(screen.getByRole("button", { name: "공지 등록" }));
    await user.type(screen.getByPlaceholderText("공지 제목"), "새 공지");
    await user.type(screen.getByPlaceholderText("공지 내용을 입력하세요"), "새 내용");
    await user.click(screen.getByRole("button", { name: "등록" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/church/admin/notices",
        expect.objectContaining({ title: "새 공지", content: "새 내용" }),
      ),
    );
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });

  it("수정 모달에서는 구분/작성자/상단고정이 읽기전용으로 표시된다(입력 요소 없음)", async () => {
    const user = userEvent.setup();
    renderWithChurch(<NoticesManage />);
    await screen.findByText("기존 공지");

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByText("공지 수정")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("작성자")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("공지 제목")).toBeInTheDocument();
  });

  it("공지 삭제 시 deleteNotice(DELETE)를 호출하고 목록을 다시 불러온다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<NoticesManage />);
    await screen.findByText("기존 공지");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/church/admin/notices/1"));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/admin/NoticesManage.test.jsx`
Expected: FAIL — 현재 `NoticesManage.jsx`는 `DUMMY_NOTICES`를 로컬 `useState`로만 쓰고 `api`/`getNotices`를 전혀 호출하지 않으므로 "기존 공지" 텍스트가 뜨지 않음(더미 데이터의 제목과 다름), `createNotice`/`deleteNotice` 호출도 없음.

- [ ] **Step 3: `NoticesManage.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices, createNotice, updateNotice, deleteNotice } from "@/services/noticeService";
import PrevNextPagination from "@/components/common/PrevNextPagination";
import NumberedPagination from "@/components/common/NumberedPagination";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { background: "rgba(61,85,136,.12)", color: "#2b3c61" },
  행사: { background: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { background: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

const PAGE_SIZE = 10;
const FILTER_FETCH_LIMIT = 1000;

function NoticeModal({ notice, onClose, onSave }) {
  const isEdit = !!notice;
  const [form, setForm] = useState(
    notice ?? { type: "공지", title: "", body: "", author: "", featured: false },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[560px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">
          {isEdit ? "공지 수정" : "공지 등록"}
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">카테고리</label>
              {isEdit ? (
                <p className="w-full border border-grey-2 bg-grey-1 rounded-xl px-4 py-2.5 text-body-4 text-grey-6">
                  {form.type}
                </p>
              ) : (
                <select
                  className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary bg-white"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                >
                  {["공지", "행사", "소식"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">작성자</label>
              {isEdit ? (
                <p className="w-full border border-grey-2 bg-grey-1 rounded-xl px-4 py-2.5 text-body-4 text-grey-6">
                  {form.author}
                </p>
              ) : (
                <input
                  className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
                  value={form.author}
                  onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  placeholder="작성자"
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">제목</label>
            <input
              className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="공지 제목"
            />
          </div>
          <div>
            <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">내용</label>
            <textarea
              rows={5}
              className="w-full border border-grey-3 rounded-xl px-4 py-3 text-body-4 focus:outline-none focus:border-primary resize-none"
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="공지 내용을 입력하세요"
            />
          </div>
          {isEdit ? (
            <p className="text-body-5 text-grey-5">
              상단 고정: {form.featured ? "고정됨" : "고정 안 됨"} · 등록 시에만 설정할 수 있어요.
            </p>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-body-4 text-grey-8">상단 고정</span>
            </label>
          )}
          {error && <p className="text-body-5 text-red-500">{error}</p>}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors disabled:opacity-50"
          >
            {saving ? "저장 중..." : isEdit ? "저장" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NoticesManage() {
  const { church } = useChurch();
  const [tab, setTab] = useState("전체");
  const [search, setSearch] = useState("");
  const [serverPage, setServerPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [modal, setModal] = useState(null); // null | "new" | { notice }
  const [actionError, setActionError] = useState(null);

  const isFiltered = tab !== "전체" || search !== "";
  const {
    data: notices = [],
    loading,
    refetch,
  } = useFetch(
    () =>
      isFiltered
        ? getNotices(church.id, { limit: FILTER_FETCH_LIMIT })
        : getNotices(church.id, { page: serverPage, limit: PAGE_SIZE }),
    [church.id, isFiltered, serverPage],
    [],
  );

  const filtered = isFiltered
    ? notices.filter((n) => tab === "전체" || n.type === tab).filter((n) => n.title.includes(search))
    : notices;
  const displayPage = isFiltered ? clientPage : serverPage;
  const paged = isFiltered
    ? filtered.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE)
    : filtered;
  const hasNext = !isFiltered && notices.length === PAGE_SIZE;

  function handleTabChange(t) {
    setTab(t);
    setServerPage(1);
    setClientPage(1);
  }

  function handleSearchChange(value) {
    setSearch(value);
    setServerPage(1);
    setClientPage(1);
  }

  async function handleSave(form) {
    if (form.id) {
      await updateNotice(church.id, form.id, form);
    } else {
      await createNotice(church.id, form);
    }
    await refetch();
  }

  async function handleDelete(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    setActionError(null);
    try {
      await deleteNotice(church.id, id);
      await refetch();
    } catch {
      setActionError("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <div>
      {modal && (
        <NoticeModal
          notice={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">공지사항 관리</h1>
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
          공지 등록
        </button>
      </div>

      {actionError && <p className="text-body-4 text-red-500 mb-4">{actionError}</p>}

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-2 rounded-full text-body-5 font-medium transition-colors ${t === tab ? "bg-primary text-white" : "bg-white border border-grey-3 text-grey-7 hover:border-primary hover:text-primary"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <input
            className="border border-grey-3 rounded-xl pl-9 pr-4 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary w-64"
            placeholder="제목 검색"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <img
            src={IcoSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
            alt=""
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
        <div
          className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
          style={{ gridTemplateColumns: "48px 80px 1fr 80px 100px 80px 100px" }}
        >
          <span className="text-center">No</span>
          <span className="text-center">구분</span>
          <span className="pl-2">제목</span>
          <span className="text-center">작성자</span>
          <span className="text-center">작성일</span>
          <span className="text-center">고정</span>
          <span className="text-center">관리</span>
        </div>
        {loading && paged.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">불러오는 중...</div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">공지사항이 없습니다.</div>
        ) : (
          paged.map((n, i) => (
            <div
              key={n.id}
              className={`grid items-center px-6 py-3.5 hover:bg-grey-1 transition-colors ${i < paged.length - 1 ? "border-b border-grey-2" : ""}`}
              style={{ gridTemplateColumns: "48px 80px 1fr 80px 100px 80px 100px" }}
            >
              <span className="text-body-5 text-grey-5 text-center">
                {(displayPage - 1) * PAGE_SIZE + i + 1}
              </span>
              <span className="flex justify-center">
                <span
                  className="text-body-5 font-bold px-2 py-0.5 rounded"
                  style={TAG_STYLES[n.type] ?? TAG_STYLES["공지"]}
                >
                  {n.type}
                </span>
              </span>
              <span className="pl-2 text-body-4 text-grey-9 truncate flex items-center gap-1.5 pr-4">
                {n.featured && (
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary shrink-0"
                  >
                    <line x1="6" y1="8.5" x2="6" y2="11" />
                    <path d="M2.5 8.5h7v-.88a1 1 0 00-.56-.9l-.89-.44A1 1 0 018 5.38V3h.5a1 1 0 000-2H3.5a1 1 0 000 2H4v2.38a1 1 0 01-.56.9l-.89.44a1 1 0 00-.55.9Z" />
                  </svg>
                )}
                {n.title}
              </span>
              <span className="text-body-5 text-grey-6 text-center">{n.author}</span>
              <span className="text-body-5 text-grey-6 text-center">
                {n.date?.replace(/-/g, ".")}
              </span>
              <span className="text-center">
                {n.featured ? (
                  <span className="text-body-5 font-semibold text-primary">고정</span>
                ) : (
                  <span className="text-body-5 text-grey-4">-</span>
                )}
              </span>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => setModal(n)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isFiltered ? (
        <NumberedPagination
          total={filtered.length}
          perPage={PAGE_SIZE}
          current={clientPage}
          onChange={setClientPage}
        />
      ) : (
        <PrevNextPagination page={serverPage} hasNext={hasNext} onChange={setServerPage} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/admin/NoticesManage.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 5: 전체 스위트 + lint 확인**

Run: `pnpm test:run && pnpm run lint`
Expected: 모든 테스트 통과, lint 경고 없음.

(로컬 `.env`에 `VITE_USE_DUMMY=false`가 설정돼 있으면 이 사이클과 무관한 도메인 테스트가 실패할 수 있다 — 그 경우 `VITE_USE_DUMMY=true pnpm test:run`으로 override해서 재확인한다.)

- [ ] **Step 6: 커밋**

```bash
git add src/pages/admin/NoticesManage.jsx src/pages/admin/NoticesManage.test.jsx
git commit -m "feat: NoticesManage.jsx가 실 CRUD API와 연동, 조회 컬럼 제거"
```
