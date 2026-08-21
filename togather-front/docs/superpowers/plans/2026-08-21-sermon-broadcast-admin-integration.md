# 설교·방송 관리자 CRUD 실연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `WorshipManage.jsx`(관리자 예배·설교 관리)를 실제 백엔드 설교 CRUD + 방송(라이브) 예약/시작/종료 API와 연동한다. 설교/방송 "공개" 페이지(YouTube 직접 호출)는 이 계획 범위 밖이며 손대지 않는다.

**Architecture:** 기존 `sermonService.js`(YouTube API 전용)에 `isDummy("sermon")` 게이트를 쓰는 관리자 CRUD + 방송 라이프사이클 함수를 추가한다. 백엔드에 설교 목록 조회 API가 없어 `WorshipManage.jsx`는 등록/수정/삭제 결과를 컴포넌트 로컬 state로만 누적한다. 방송도 조회 API가 없어 예약 시 받은 `{id, status}`를 설교별 로컬 state로 추적한다.

**Tech Stack:** React 19, Axios(`src/services/api.js`), Vitest(`vite-plus/test`), `@testing-library/react` + `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-08-21-sermon-broadcast-admin-integration-design.md`

## Global Constraints

- 백엔드 설교 CRUD는 `POST/PATCH/DELETE /api/church/admin/sermons(/{publicId})`뿐이다 — 목록/상세 조회 GET이 없다. 필드: `title, scripture, preacher, worshipType, youtubeVideoId, sermonDate`(title/sermonDate만 필수). `views`(조회수) 필드는 없다.
- 방송은 `POST /api/church/admin/broadcasts`(예약, `sermonId,youtubeLiveUrl,scheduledStartAt` 필요, 응답 `{id,status:"BEFORE"}`), `POST .../broadcasts/{id}/start`(→`LIVE`), `POST .../broadcasts/{id}/end`(→`ENDED`)뿐이다 — 조회 API가 없다.
- 테스트는 `"vite-plus/test"`에서 `describe/it/expect/vi/beforeEach`를 import한다.
- `@/services/api`를 모킹할 때는 `{ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, isDummy: () => false }` 형태로 모킹해 실 API 분기를 강제한다.
- 경로 별칭 `@/` → `src/`. `react-router-dom`이 아닌 `react-router`에서 훅 import.
- 기존 `getLiveSermon`/`getPastSermons`(YouTube API, `USE_DUMMY` 게이트)는 이 계획에서 수정하지 않는다.

---

### Task 1: `sermonService.js`에 관리자 CRUD + 방송 함수 추가

**Files:**
- Modify: `src/services/sermonService.js`
- Modify: `src/services/sermonService.test.js`
- Modify: `src/data/dummy/sermons.js`

**Interfaces:**
- Produces:
  - `getAdminSermons(churchId)` → `Promise<Sermon[]>` — 더미 모드만 항목 반환, 실API는 항상 `[]`(목록 조회 API 없음).
  - `createSermon(churchId, payload)` → `Promise<Sermon>`, `updateSermon(churchId, publicId, payload)` → `Promise<Sermon>`, `deleteSermon(churchId, publicId)` → `Promise<void>`.
  - `scheduleBroadcast(churchId, {sermonId, youtubeLiveUrl, scheduledStartAt})` → `Promise<{id, status:"BEFORE"}>`.
  - `startBroadcast(churchId, broadcastId)` → `Promise<{id, status:"LIVE"}>`, `endBroadcast(churchId, broadcastId)` → `Promise<{id, status:"ENDED"}>`.
  - `Sermon` shape: `{ id, title, scripture, preacher, worshipType, youtubeVideoId, sermonDate }`. Task 2가 이 함수들과 shape을 그대로 소비한다.

- [ ] **Step 1: `src/data/dummy/sermons.js`에 `DUMMY_ADMIN_SERMONS` 추가**

파일 맨 아래에 추가(기존 `DUMMY_LIVE_SERMON`/`DUMMY_PAST_SERMONS`는 그대로 둔다):

```js
/** @type {{id:string,title:string,scripture:string,preacher:string,worshipType:string,youtubeVideoId:string|null,sermonDate:string}[]} */
export const DUMMY_ADMIN_SERMONS = [
  { id: "s1", sermonDate: "2026-05-25", worshipType: "주일 1부", title: "부활의 능력", preacher: "김영수 담임목사", scripture: "롬 8:11", youtubeVideoId: null },
  { id: "s2", sermonDate: "2026-05-25", worshipType: "주일 2부", title: "성령으로 충만하라", preacher: "박성민 부목사", scripture: "엡 5:18", youtubeVideoId: null },
  { id: "s3", sermonDate: "2026-05-18", worshipType: "주일 1부", title: "참된 예배", preacher: "김영수 담임목사", scripture: "요 4:23-24", youtubeVideoId: null },
  { id: "s4", sermonDate: "2026-05-14", worshipType: "수요 예배", title: "기도의 능력", preacher: "이은혜 전도사", scripture: "약 5:16", youtubeVideoId: null },
  { id: "s5", sermonDate: "2026-05-11", worshipType: "주일 1부", title: "새 힘을 얻으리니", preacher: "김영수 담임목사", scripture: "사 40:31", youtubeVideoId: null },
  { id: "s6", sermonDate: "2026-05-07", worshipType: "수요 예배", title: "하나님의 뜻", preacher: "박성민 부목사", scripture: "롬 12:2", youtubeVideoId: null },
];
```

- [ ] **Step 2: `sermonService.test.js`에 아래 테스트를 추가 — 실패 확인용**

기존 파일 맨 위 import 블록을 아래로 교체(`isDummy` 모킹 추가, `api` import 추가):

```js
// 변경 전
import { USE_DUMMY } from "./api";
```

```js
// 변경 후
vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
```

(기존 파일에 이미 `USE_DUMMY`를 사용하는 `getLiveSermon`/`getPastSermons` 테스트가 있다면, 그 테스트들은 `isDummy`가 아니라 여전히 `USE_DUMMY`(`import.meta.env.VITE_USE_DUMMY`)를 참조하는 기존 함수를 테스트하므로 위 `vi.mock`으로 `isDummy: () => false`를 추가해도 영향받지 않는다 — `USE_DUMMY`는 모킹 대상이 아니라 실제 env 값을 그대로 읽기 때문이다.)

파일 끝에 아래 테스트를 추가:

```js
import {
  createSermon,
  updateSermon,
  deleteSermon,
  scheduleBroadcast,
  startBroadcast,
  endBroadcast,
} from "./sermonService";

describe("sermonService — 관리자 CRUD + 방송 (실 API 경로)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createSermon은 POST /church/admin/sermons를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 설교", sermonDate: "2026-06-01" };
    api.post.mockResolvedValue({ data: { data: { id: "s10", ...payload } } });

    const result = await createSermon("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/sermons", payload);
    expect(result).toEqual({ id: "s10", ...payload });
  });

  it("updateSermon은 PATCH /church/admin/sermons/{publicId}를 호출한다", async () => {
    const payload = { title: "수정된 제목" };
    api.patch.mockResolvedValue({ data: { data: { id: "s1", ...payload } } });

    const result = await updateSermon("1", "s1", payload);

    expect(api.patch).toHaveBeenCalledWith("/church/admin/sermons/s1", payload);
    expect(result).toEqual({ id: "s1", ...payload });
  });

  it("deleteSermon은 DELETE /church/admin/sermons/{publicId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await deleteSermon("1", "s1");

    expect(api.delete).toHaveBeenCalledWith("/church/admin/sermons/s1");
  });

  it("scheduleBroadcast는 POST /church/admin/broadcasts를 정확한 payload로 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1, status: "BEFORE" } } });

    const result = await scheduleBroadcast("1", {
      sermonId: "s1",
      youtubeLiveUrl: "https://youtube.com/live/abc",
      scheduledStartAt: "2026-06-01T09:00:00Z",
    });

    expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts", {
      sermonId: "s1",
      youtubeLiveUrl: "https://youtube.com/live/abc",
      scheduledStartAt: "2026-06-01T09:00:00Z",
    });
    expect(result).toEqual({ id: 1, status: "BEFORE" });
  });

  it("startBroadcast는 POST /church/admin/broadcasts/{id}/start를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1, status: "LIVE" } } });

    const result = await startBroadcast("1", 1);

    expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts/1/start");
    expect(result).toEqual({ id: 1, status: "LIVE" });
  });

  it("endBroadcast는 POST /church/admin/broadcasts/{id}/end를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1, status: "ENDED" } } });

    const result = await endBroadcast("1", 1);

    expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts/1/end");
    expect(result).toEqual({ id: 1, status: "ENDED" });
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/sermonService.test.js`
Expected: FAIL — `createSermon`/`updateSermon`/`deleteSermon`/`scheduleBroadcast`/`startBroadcast`/`endBroadcast`가 아직 없어 import 에러.

- [ ] **Step 4: `sermonService.js`에 함수 추가**

파일 상단 import에 `isDummy`, `DUMMY_ADMIN_SERMONS`를 추가(기존 `USE_DUMMY`/`DUMMY_LIVE_SERMON`/`DUMMY_PAST_SERMONS` import는 그대로 둔다):

```js
// 변경 전
import { USE_DUMMY } from "./api";
import { DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
```

```js
// 변경 후
import api, { USE_DUMMY, isDummy } from "./api";
import { DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS, DUMMY_ADMIN_SERMONS } from "@/data/dummy/sermons";
```

파일 끝에 아래 함수들을 추가:

```js
/**
 * 설교 목록 조회 (관리자) — 백엔드에 목록 조회 API가 없어 더미 모드에서만 항목을 반환한다.
 * 실API 모드에서는 항상 빈 배열을 반환하며, 화면은 등록/수정/삭제 결과를 로컬로 누적해서 보여준다.
 * @param {string} churchId
 * @returns {Promise<object[]>}
 */
export async function getAdminSermons(churchId) {
  if (isDummy("sermon")) return [...DUMMY_ADMIN_SERMONS];
  return [];
}

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

/**
 * 설교 수정 (관리자)
 * @param {string} churchId
 * @param {string} publicId
 * @param {object} payload
 */
export async function updateSermon(churchId, publicId, payload) {
  if (isDummy("sermon")) {
    const idx = DUMMY_ADMIN_SERMONS.findIndex((s) => s.id === publicId);
    if (idx !== -1) DUMMY_ADMIN_SERMONS[idx] = { ...DUMMY_ADMIN_SERMONS[idx], ...payload };
    return DUMMY_ADMIN_SERMONS[idx] ?? null;
  }
  const res = await api.patch(`/church/admin/sermons/${publicId}`, payload);
  return res.data.data;
}

/**
 * 설교 삭제 (관리자)
 * @param {string} churchId
 * @param {string} publicId
 */
export async function deleteSermon(churchId, publicId) {
  if (isDummy("sermon")) {
    const idx = DUMMY_ADMIN_SERMONS.findIndex((s) => s.id === publicId);
    if (idx !== -1) DUMMY_ADMIN_SERMONS.splice(idx, 1);
    return;
  }
  await api.delete(`/church/admin/sermons/${publicId}`);
}

/**
 * 방송 예약 (관리자) — 백엔드에 조회 API가 없어 이 응답의 id를 호출부가 로컬로 계속 들고 있어야 한다.
 * @param {string} churchId
 * @param {{ sermonId:string, youtubeLiveUrl:string, scheduledStartAt:string }} payload
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

/**
 * 방송 시작
 * @param {string} churchId
 * @param {number|string} broadcastId
 * @returns {Promise<{id:number|string, status:"LIVE"}>}
 */
export async function startBroadcast(churchId, broadcastId) {
  if (isDummy("sermon")) return { id: broadcastId, status: "LIVE" };
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/start`);
  return res.data.data;
}

/**
 * 방송 종료
 * @param {string} churchId
 * @param {number|string} broadcastId
 * @returns {Promise<{id:number|string, status:"ENDED"}>}
 */
export async function endBroadcast(churchId, broadcastId) {
  if (isDummy("sermon")) return { id: broadcastId, status: "ENDED" };
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/end`);
  return res.data.data;
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/sermonService.test.js`
Expected: PASS (기존 테스트 + 신규 6개 모두 통과)

- [ ] **Step 6: 커밋**

```bash
git add src/services/sermonService.js src/services/sermonService.test.js src/data/dummy/sermons.js
git commit -m "feat: sermonService에 설교 관리자 CRUD + 방송 예약/시작/종료 함수 추가"
```

---

### Task 2: `WorshipManage.jsx` 재설계

**Files:**
- Modify: `src/pages/admin/WorshipManage.jsx`
- Test: `src/pages/admin/WorshipManage.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `getAdminSermons`/`createSermon`/`updateSermon`/`deleteSermon`/`scheduleBroadcast`/`startBroadcast`/`endBroadcast`.
- Produces: 없음(리프 페이지 컴포넌트).

- [ ] **Step 1: `WorshipManage.test.jsx` 작성 — 실패 확인용**

`src/pages/admin/WorshipManage.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import WorshipManage from "./WorshipManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("WorshipManage — 설교 관리자 CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("조회수 컬럼이 없다", async () => {
    renderWithChurch(<WorshipManage />);
    expect(screen.queryByText("조회")).not.toBeInTheDocument();
  });

  it("설교 등록 모달에 유튜브 영상 ID 입력 필드가 있다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));

    expect(screen.getByText("유튜브 영상 ID")).toBeInTheDocument();
  });

  it("설교를 등록하면 createSermon을 호출하고 목록에 추가된다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id: "s10",
          sermonDate: "2026-06-01",
          worshipType: "주일 1부",
          title: "새 설교",
          preacher: "홍길동 목사",
          scripture: "요 1:1",
          youtubeVideoId: "",
        },
      },
    });
    const user = userEvent.setup();
    renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "새 설교");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("새 설교")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/sermons",
      expect.objectContaining({ title: "새 설교" }),
    );
  });

  it("설교를 삭제하면 deleteSermon을 호출하고 목록에서 사라진다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id: "s10",
          sermonDate: "2026-06-01",
          worshipType: "주일 1부",
          title: "삭제될 설교",
          preacher: "",
          scripture: "",
          youtubeVideoId: "",
        },
      },
    });
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "삭제될 설교");
    await user.click(screen.getByRole("button", { name: "등록" }));
    await screen.findByText("삭제될 설교");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/church/admin/sermons/s10"));
    expect(screen.queryByText("삭제될 설교")).not.toBeInTheDocument();
  });

  it("방송 버튼을 클릭해 예약하면 상태 배지와 시작 버튼이 나타난다", async () => {
    api.post
      .mockResolvedValueOnce({
        data: {
          data: {
            id: "s10",
            sermonDate: "2026-06-01",
            worshipType: "주일 1부",
            title: "방송용 설교",
            preacher: "",
            scripture: "",
            youtubeVideoId: "",
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { id: 1, status: "BEFORE" } } });
    const user = userEvent.setup();
    renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "방송용 설교");
    await user.click(screen.getByRole("button", { name: "등록" }));
    await screen.findByText("방송용 설교");

    await user.click(screen.getByRole("button", { name: "방송" }));
    await user.type(screen.getByPlaceholderText("https://youtube.com/live/..."), "https://youtube.com/live/xyz");
    await user.type(screen.getByLabelText("예정 시각"), "2026-06-01T09:00");
    await user.click(screen.getByRole("button", { name: "예약" }));

    expect(await screen.findByText("예약됨")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "방송 시작" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/admin/WorshipManage.test.jsx`
Expected: FAIL — 현재 `WorshipManage.jsx`는 조회수 컬럼이 있고, 유튜브 영상 ID 필드가 없고, API 호출이 전혀 없다.

- [ ] **Step 3: `WorshipManage.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import {
  getAdminSermons,
  createSermon,
  updateSermon,
  deleteSermon,
  scheduleBroadcast,
  startBroadcast,
  endBroadcast,
} from "@/services/sermonService";

const SERVICE_TYPES = ["전체", "주일 1부", "주일 2부", "수요 예배", "청년 예배"];

const BROADCAST_LABEL = { BEFORE: "예약됨", LIVE: "방송 중", ENDED: "종료됨" };

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function emptyForm() {
  return { sermonDate: "", worshipType: SERVICE_TYPES[1], title: "", preacher: "", scripture: "", youtubeVideoId: "" };
}

function toFormState(sermon) {
  if (!sermon) return emptyForm();
  return { ...emptyForm(), ...sermon };
}

function SermonModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => toFormState(initial));

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.sermonDate) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[520px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">
          {isEdit ? "설교 수정" : "설교 등록"}
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>날짜</label>
              <input
                type="date"
                className={inputCls}
                value={form.sermonDate}
                onChange={set("sermonDate")}
              />
            </div>
            <div>
              <label className={labelCls}>예배 구분</label>
              <select
                className={`${inputCls} bg-white`}
                value={form.worshipType}
                onChange={set("worshipType")}
              >
                {SERVICE_TYPES.filter((s) => s !== "전체").map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>설교 제목</label>
            <input
              className={inputCls}
              placeholder="설교 제목 입력"
              value={form.title}
              onChange={set("title")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>설교자</label>
              <input
                className={inputCls}
                placeholder="설교자 이름"
                value={form.preacher}
                onChange={set("preacher")}
              />
            </div>
            <div>
              <label className={labelCls}>본문 말씀</label>
              <input
                className={inputCls}
                placeholder="예: 요 3:16"
                value={form.scripture}
                onChange={set("scripture")}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>유튜브 영상 ID</label>
            <input
              className={inputCls}
              placeholder="예: dQw4w9WgXcQ (선택)"
              value={form.youtubeVideoId}
              onChange={set("youtubeVideoId")}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
          >
            {isEdit ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BroadcastPanel({ broadcast, onClose, onSchedule, onStart, onEnd }) {
  const [url, setUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">방송 관리</h3>
        {!broadcast ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>유튜브 라이브 URL</label>
              <input
                className={inputCls}
                placeholder="https://youtube.com/live/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="broadcast-scheduled-at" className={labelCls}>
                예정 시각
              </label>
              <input
                id="broadcast-scheduled-at"
                type="datetime-local"
                className={inputCls}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <button
              onClick={() => onSchedule({ youtubeLiveUrl: url, scheduledStartAt: scheduledAt })}
              disabled={!url || !scheduledAt}
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
            >
              예약
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit px-3 py-1 rounded-full text-body-4 font-semibold bg-blue-1 text-primary">
              {BROADCAST_LABEL[broadcast.status]}
            </span>
            {broadcast.status === "BEFORE" && (
              <button
                onClick={onStart}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
              >
                방송 시작
              </button>
            )}
            {broadcast.status === "LIVE" && (
              <button
                onClick={onEnd}
                className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-body-4 font-semibold hover:bg-red-600 transition-colors"
              >
                방송 종료
              </button>
            )}
            <p className="text-body-5 text-grey-5">
              이 방송 상태는 새로고침하면 사라집니다(백엔드에 조회 API가 없어 이 브라우저 세션에서만 추적됩니다).
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default function WorshipManage() {
  const { church } = useChurch();
  const [filter, setFilter] = useState("전체");
  const [sermons, setSermons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);
  const [broadcasts, setBroadcasts] = useState({});
  const [broadcastSermonId, setBroadcastSermonId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAdminSermons(church.id).then((list) => {
      if (!cancelled) setSermons(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id]);

  const filtered = filter === "전체" ? sermons : sermons.filter((s) => s.worshipType === filter);

  async function handleSave(form) {
    if (editingSermon) {
      const updated = await updateSermon(church.id, editingSermon.id, form);
      setSermons((prev) => prev.map((s) => (s.id === editingSermon.id ? updated : s)));
    } else {
      const created = await createSermon(church.id, form);
      setSermons((prev) => [created, ...prev]);
    }
    setShowModal(false);
    setEditingSermon(null);
  }

  async function handleDelete(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteSermon(church.id, id);
    setSermons((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSchedule({ youtubeLiveUrl, scheduledStartAt }) {
    const result = await scheduleBroadcast(church.id, {
      sermonId: broadcastSermonId,
      youtubeLiveUrl,
      scheduledStartAt,
    });
    setBroadcasts((prev) => ({ ...prev, [broadcastSermonId]: result }));
  }

  async function handleStart() {
    const bc = broadcasts[broadcastSermonId];
    const result = await startBroadcast(church.id, bc.id);
    setBroadcasts((prev) => ({ ...prev, [broadcastSermonId]: result }));
  }

  async function handleEnd() {
    const bc = broadcasts[broadcastSermonId];
    const result = await endBroadcast(church.id, bc.id);
    setBroadcasts((prev) => ({ ...prev, [broadcastSermonId]: result }));
  }

  return (
    <div>
      {showModal && (
        <SermonModal
          initial={editingSermon}
          onClose={() => {
            setShowModal(false);
            setEditingSermon(null);
          }}
          onSave={handleSave}
        />
      )}
      {broadcastSermonId && (
        <BroadcastPanel
          broadcast={broadcasts[broadcastSermonId] ?? null}
          onClose={() => setBroadcastSermonId(null)}
          onSchedule={handleSchedule}
          onStart={handleStart}
          onEnd={handleEnd}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">예배 및 설교 관리</h1>
        <button
          onClick={() => {
            setEditingSermon(null);
            setShowModal(true);
          }}
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
          설교 등록
        </button>
      </div>

      <p className="text-body-5 text-grey-5 mb-4">
        백엔드에 설교 목록 조회 API가 없어 새로고침하면 등록한 설교 목록이 초기화됩니다.
      </p>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {SERVICE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-body-5 font-medium transition-colors ${t === filter ? "bg-primary text-white" : "bg-white border border-grey-3 text-grey-7 hover:border-primary hover:text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
        <div
          className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
          style={{ gridTemplateColumns: "110px 110px 1fr 140px 100px 220px" }}
        >
          <span>날짜</span>
          <span>예배 구분</span>
          <span>설교 제목</span>
          <span>설교자</span>
          <span>본문 말씀</span>
          <span className="text-center">관리</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">등록된 설교가 없습니다.</div>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s.id}
              className={`grid items-center px-6 py-4 hover:bg-grey-1 transition-colors ${i < filtered.length - 1 ? "border-b border-grey-2" : ""}`}
              style={{ gridTemplateColumns: "110px 110px 1fr 140px 100px 220px" }}
            >
              <span className="text-body-5 text-grey-6">{s.sermonDate}</span>
              <span className="text-body-5 font-medium text-primary bg-blue-1 px-2 py-0.5 rounded w-fit">
                {s.worshipType}
              </span>
              <span className="text-body-4 font-medium text-grey-10 truncate pr-4">{s.title}</span>
              <span className="text-body-5 text-grey-7">{s.preacher}</span>
              <span className="text-body-5 text-grey-6">{s.scripture}</span>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => {
                    setEditingSermon(s);
                    setShowModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setBroadcastSermonId(s.id)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                >
                  방송
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/admin/WorshipManage.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: 전체 스위트 + lint 확인**

Run: `pnpm test:run && pnpm run lint`
Expected: 모든 테스트 통과, lint 경고 없음.

(로컬 `.env`에 `VITE_USE_DUMMY=false`가 설정돼 있으면 이 사이클과 무관한 도메인 테스트가 실패할 수 있다 — 그 경우 `VITE_USE_DUMMY=true pnpm test:run`으로 override해서 재확인한다.)

- [ ] **Step 6: 커밋**

```bash
git add src/pages/admin/WorshipManage.jsx src/pages/admin/WorshipManage.test.jsx
git commit -m "feat: WorshipManage가 설교 관리자 CRUD와 방송 예약/시작/종료 API와 연동"
```
