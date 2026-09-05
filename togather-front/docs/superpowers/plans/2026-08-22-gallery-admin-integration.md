# 갤러리 관리자 CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 갤러리 관리자 화면(`GalleryManage.jsx`)을 신규로 만들어 공동체/사진 등록과 사진 삭제를 실제 백엔드 API와 연동한다. 공개 `Gallery.jsx`의 `getCommunities`/`getPhotos`도 `isDummy("gallery")` 패턴으로 전환한다.

**Architecture:** `galleryService.js`에 `isDummy("gallery")` 게이트로 기존 2개 조회 함수 + 신규 3개 관리자 함수(`createCommunity`/`createPhoto`/`deletePhoto`)를 둔다. `GalleryManage.jsx`는 공동체 관리 섹션과 사진 관리 섹션(공동체 탭 선택) 두 부분으로 구성되며, 이번 세션에서 확립된 조회-에러+재시도, 등록/삭제-에러+중복제출가드 패턴을 처음부터 적용한다(`MyPage.jsx`/`ScheduleTab.jsx`의 fix wave 이후 코드가 레퍼런스).

**Tech Stack:** React 19, React Router v7, Axios(`src/services/api.js`), Vitest(`vite-plus/test`), `@testing-library/react` + `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-08-22-gallery-admin-integration-design.md`

## Global Constraints

- 백엔드 갤러리 관리자 API는 `POST /api/church/admin/communities`(등록), `POST /api/church/admin/gallery`(사진 등록), `DELETE /api/church/admin/gallery/{photoId}`(사진 삭제)뿐이다 — 수정 API, 공동체 삭제 API가 없다.
- 사진 등록 응답은 `{id, communityId, title}`만 온다 — 나머지 필드(`date`/`desc`/`imageUrl`)는 제출한 폼 값을 그대로 써서 반환 객체를 구성한다.
- `date`는 자유 형식 문자열(예: "2025년 8월 2일")이라 형식 검증 없이 그대로 보낸다.
- 조회 실패 시 반드시 "불러오지 못했습니다. 다시 시도해 주세요." + 재시도 버튼을 보여준다(빈 목록으로 오인되게 두지 않는다). 등록/삭제는 진행 중 버튼을 `disabled`로 막고 실패 시 인라인 에러 메시지를 보여준다.
- 테스트는 `"vite-plus/test"`에서 `describe/it/expect/vi/beforeEach`를 import한다.
- `@/services/api`를 모킹할 때는 `{ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, isDummy: () => false }` 형태로 모킹해 실 API 분기를 강제한다.
- 경로 별칭 `@/` → `src/`. `react-router-dom`이 아닌 `react-router`에서 훅 import.

---

### Task 1: `galleryService.js` 전환 + 관리자 함수 추가

**Files:**
- Modify: `src/services/galleryService.js`
- Modify: `src/services/galleryService.test.js` (신규이면 생성)

**Interfaces:**
- Produces:
  - `getCommunities(churchId)` → `Promise<Community[]>`, `getPhotos(churchId, {communityId?})` → `Promise<Photo[]>` — 시그니처 변경 없음, `isDummy("gallery")`로 전환만.
  - `createCommunity(churchId, {name, desc?})` → `Promise<Community>`.
  - `createPhoto(churchId, {communityId, title, date?, desc?, imageUrl?})` → `Promise<Photo>`.
  - `deletePhoto(churchId, photoId)` → `Promise<void>`.
  - Task 2가 이 5개 함수를 그대로 소비한다.

- [ ] **Step 1: `galleryService.test.js` 작성 — 실패 확인용**

`src/services/galleryService.test.js` 전체 내용:

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getCommunities, getPhotos, createCommunity, createPhoto, deletePhoto } from "./galleryService";

describe("galleryService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCommunities는 GET /churches/{churchId}/communities를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1, name: "알곡교회", desc: "" }] } });

    const result = await getCommunities("1");

    expect(api.get).toHaveBeenCalledWith("/churches/1/communities");
    expect(result).toEqual([{ id: 1, name: "알곡교회", desc: "" }]);
  });

  it("getPhotos는 GET /churches/{churchId}/gallery를 params와 함께 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getPhotos("1", { communityId: 2 });

    expect(api.get).toHaveBeenCalledWith("/churches/1/gallery", { params: { communityId: 2 } });
  });

  it("createCommunity는 POST /church/admin/communities를 정확한 payload로 호출한다", async () => {
    const payload = { name: "청년부", desc: "청년들의 모임" };
    api.post.mockResolvedValue({ data: { data: { id: 10, ...payload, orderNo: 0 } } });

    const result = await createCommunity("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/communities", payload);
    expect(result).toEqual({ id: 10, ...payload, orderNo: 0 });
  });

  it("createPhoto는 POST /church/admin/gallery를 호출하고 응답 id와 제출 폼 값을 합쳐 반환한다", async () => {
    const payload = { communityId: 2, title: "여름 수련회", date: "2026년 8월 1일", desc: "", imageUrl: "" };
    api.post.mockResolvedValue({ data: { data: { id: 20, communityId: 2, title: "여름 수련회" } } });

    const result = await createPhoto("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/gallery", payload);
    expect(result).toEqual({ ...payload, id: 20 });
  });

  it("deletePhoto는 DELETE /church/admin/gallery/{photoId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await deletePhoto("1", 20);

    expect(api.delete).toHaveBeenCalledWith("/church/admin/gallery/20");
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/galleryService.test.js`
Expected: FAIL — `createCommunity`/`createPhoto`/`deletePhoto`가 아직 없고, 기존 두 함수는 `USE_DUMMY`를 참조 중이라 `isDummy: () => false` 모킹이 적용 안 됨(실제로는 두 함수 다 모킹된 `api.get`을 잘 호출하긴 하지만, `USE_DUMMY`가 undefined라 `if (USE_DUMMY)`가 falsy가 되어 우연히 실API 분기를 타는 상태 — 신규 함수 3개가 없어서 확실히 실패한다).

- [ ] **Step 3: `galleryService.js` 전체를 아래 내용으로 교체**

```js
/**
 * @typedef {{ id:number, name:string, desc:string }} Community
 * @typedef {{ id:number, communityId:number, title:string, date:string,
 *   desc:string, imageUrl:string|null }} Photo
 */

import api, { isDummy } from "./api";
import { DUMMY_COMMUNITIES, DUMMY_PHOTOS } from "@/data/dummy/gallery";

/**
 * 공동체 목록 조회
 * @param {string} churchId
 * @returns {Promise<Community[]>}
 */
export async function getCommunities(churchId) {
  if (isDummy("gallery")) return DUMMY_COMMUNITIES;
  const res = await api.get(`/churches/${churchId}/communities`);
  return res.data.data;
}

/**
 * 갤러리 사진 목록 조회
 * @param {string} churchId
 * @param {{ communityId?:number, page?:number }} params
 * @returns {Promise<Photo[]>}
 */
export async function getPhotos(churchId, params = {}) {
  if (isDummy("gallery")) {
    const { communityId } = params;
    return communityId ? DUMMY_PHOTOS.filter((p) => p.communityId === communityId) : DUMMY_PHOTOS;
  }
  const res = await api.get(`/churches/${churchId}/gallery`, { params });
  return res.data.data;
}

/**
 * 공동체 등록 (관리자)
 * @param {string} churchId
 * @param {{ name:string, desc?:string }} payload
 * @returns {Promise<Community>}
 */
export async function createCommunity(churchId, payload) {
  if (isDummy("gallery")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_COMMUNITIES.push(created);
    return created;
  }
  const res = await api.post(`/church/admin/communities`, payload);
  return res.data.data;
}

/**
 * 사진 등록 (관리자) — 응답이 {id,communityId,title}뿐이라 제출 폼 값과 합쳐 반환한다.
 * @param {string} churchId
 * @param {{ communityId:number, title:string, date?:string, desc?:string, imageUrl?:string }} payload
 * @returns {Promise<Photo>}
 */
export async function createPhoto(churchId, payload) {
  if (isDummy("gallery")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_PHOTOS.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/gallery`, payload);
  return { ...payload, id: res.data.data.id };
}

/**
 * 사진 삭제 (관리자)
 * @param {string} churchId
 * @param {number} photoId
 */
export async function deletePhoto(churchId, photoId) {
  if (isDummy("gallery")) {
    const idx = DUMMY_PHOTOS.findIndex((p) => p.id === photoId);
    if (idx !== -1) DUMMY_PHOTOS.splice(idx, 1);
    return;
  }
  await api.delete(`/church/admin/gallery/${photoId}`);
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/galleryService.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: `Gallery.jsx`(공개 페이지) 영향 확인**

`getCommunities`/`getPhotos` 시그니처가 그대로라 `src/pages/Gallery/Gallery.jsx`는 코드 수정이 불필요하다. 다만 `isDummy("gallery")`로 전환됐으므로, 로컬 `.env`에 `VITE_DUMMY_DOMAINS`가 있고 거기서 `gallery`가 이미 빠져있다면 이제부터 실API로 동작한다는 점만 인지하고 있어라(수정하지 않음, `.env`는 gitignore 대상).

Run: `pnpm vitest run src/pages/Gallery`
Expected: 기존 `Gallery.test.jsx`가 있다면 PASS 유지(있으면 실행해서 회귀 없는지 확인, 없으면 이 스텝은 스킵).

- [ ] **Step 6: 커밋**

```bash
git add src/services/galleryService.js src/services/galleryService.test.js
git commit -m "feat: galleryService가 isDummy로 전환하고 공동체/사진 관리자 등록·삭제 함수 추가"
```

---

### Task 2: 신규 `GalleryManage.jsx` + 라우팅 + 사이드바 메뉴

**Files:**
- Create: `src/pages/admin/GalleryManage.jsx`
- Create: `src/pages/admin/GalleryManage.test.jsx`
- Create: `src/assets/icon-svg/admin-gallery-white.svg`
- Modify: `src/routes.jsx`
- Modify: `src/layouts/AdminLayout.jsx`

**Interfaces:**
- Consumes: Task 1의 `getCommunities`/`getPhotos`/`createCommunity`/`createPhoto`/`deletePhoto`.
- Produces: 없음(리프 페이지 컴포넌트).

- [ ] **Step 1: 아이콘 파일 생성**

`src/assets/icon-svg/admin-gallery-white.svg` 전체 내용(기존 `admin-file-white.svg`와 동일한 스타일, 이미지 프레임 아이콘):

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="2.5" y="3.33203" width="15" height="13.3333" rx="1.5" stroke="#EEF0F2" stroke-width="1.4"/>
<path d="M2.5 13.332L6.66667 9.16536C7.24619 8.58584 8.1872 8.58584 8.76672 9.16536L12.5 12.8987" stroke="#EEF0F2" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.833 11.6667L11.9463 10.5533C12.5259 9.97381 13.4669 9.97381 14.0464 10.5533L17.4997 14.0007" stroke="#EEF0F2" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="6.66634" cy="6.66536" r="1.25" stroke="#EEF0F2" stroke-width="1.4"/>
</svg>
```

- [ ] **Step 2: `GalleryManage.test.jsx` 작성 — 실패 확인용**

`src/pages/admin/GalleryManage.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import GalleryManage from "./GalleryManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const COMMUNITIES = [{ id: 1, name: "청년부", desc: "청년들의 모임" }];
const PHOTOS = [{ id: 10, communityId: 1, title: "여름 수련회", date: "2026년 8월 1일", desc: "", imageUrl: null }];

describe("GalleryManage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/churches/togather-church/communities") {
        return Promise.resolve({ data: { data: COMMUNITIES } });
      }
      return Promise.resolve({ data: { data: PHOTOS } });
    });
  });

  it("공동체 목록을 불러와 렌더링한다", async () => {
    renderWithChurch(<GalleryManage />);
    expect(await screen.findByText("청년부")).toBeInTheDocument();
  });

  it("공동체를 등록하면 createCommunity를 호출하고 목록에 추가된다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 2, name: "새가족부", desc: "" } } });
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");

    await user.click(screen.getByRole("button", { name: "공동체 등록" }));
    await user.type(screen.getByPlaceholderText("예) 청년부"), "새가족부");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("새가족부")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/communities",
      expect.objectContaining({ name: "새가족부" }),
    );
  });

  it("공동체를 선택하면 해당 사진만 조회한다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");

    await user.click(screen.getByText("청년부"));

    expect(await screen.findByText("여름 수련회")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/churches/togather-church/gallery", {
      params: { communityId: 1 },
    });
  });

  it("사진을 등록하면 createPhoto를 호출하고 그리드에 추가된다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 11, communityId: 1, title: "가을 야유회" } },
    });
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");
    await user.click(screen.getByText("청년부"));
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "사진 등록" }));
    await user.type(screen.getByPlaceholderText("예) 여름 수련회"), "가을 야유회");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("가을 야유회")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/gallery",
      expect.objectContaining({ communityId: 1, title: "가을 야유회" }),
    );
  });

  it("사진을 삭제하면 deletePhoto를 호출하고 그리드에서 제거된다", async () => {
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");
    await user.click(screen.getByText("청년부"));
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/church/admin/gallery/10"));
    expect(screen.queryByText("여름 수련회")).not.toBeInTheDocument();
  });

  it("공동체 조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);

    expect(await screen.findByText("불러오지 못했습니다. 다시 시도해 주세요.")).toBeInTheDocument();

    api.get.mockImplementation((url) => {
      if (url === "/churches/togather-church/communities") {
        return Promise.resolve({ data: { data: COMMUNITIES } });
      }
      return Promise.resolve({ data: { data: PHOTOS } });
    });
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("청년부")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/admin/GalleryManage.test.jsx`
Expected: FAIL — `GalleryManage.jsx`가 아직 없어 모듈 resolve 에러.

- [ ] **Step 4: `src/pages/admin/GalleryManage.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import {
  getCommunities,
  getPhotos,
  createCommunity,
  createPhoto,
  deletePhoto,
} from "@/services/galleryService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function CommunityModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", desc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("공동체 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[480px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">공동체 등록</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>공동체 이름</label>
            <input
              className={inputCls}
              placeholder="예) 청년부"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>소개</label>
            <input
              className={inputCls}
              placeholder="예) 젊은 에너지로 하나님을 찾는"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
        </div>
        {error && <p className="text-body-5 text-red-500 mt-3">{error}</p>}
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", date: "", desc: "", imageUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("사진 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[480px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">사진 등록</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>제목</label>
            <input
              className={inputCls}
              placeholder="예) 여름 수련회"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>날짜</label>
            <input
              className={inputCls}
              placeholder="예) 2026년 8월 1일"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>설명</label>
            <input
              className={inputCls}
              placeholder="사진에 대한 간단한 설명"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>이미지 URL</label>
            <input
              className={inputCls}
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>
        </div>
        {error && <p className="text-body-5 text-red-500 mt-3">{error}</p>}
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryManage() {
  const { church } = useChurch();
  const [communities, setCommunities] = useState([]);
  const [communityError, setCommunityError] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  function fetchCommunities(cancelledRef) {
    setCommunityError(false);
    return getCommunities(church.id)
      .then((list) => {
        if (!cancelledRef?.current) setCommunities(list);
      })
      .catch(() => {
        if (!cancelledRef?.current) setCommunityError(true);
      });
  }

  useEffect(() => {
    const cancelledRef = { current: false };
    fetchCommunities(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [church.id]);

  function fetchPhotos(communityId, cancelledRef) {
    setPhotoError(false);
    return getPhotos(church.id, { communityId })
      .then((list) => {
        if (!cancelledRef?.current) setPhotos(list);
      })
      .catch(() => {
        if (!cancelledRef?.current) setPhotoError(true);
      });
  }

  useEffect(() => {
    if (!selectedId) return;
    const cancelledRef = { current: false };
    fetchPhotos(selectedId, cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [church.id, selectedId]);

  async function handleSaveCommunity(form) {
    const created = await createCommunity(church.id, form);
    setCommunities((prev) => [...prev, created]);
  }

  async function handleSavePhoto(form) {
    const created = await createPhoto(church.id, { ...form, communityId: selectedId });
    setPhotos((prev) => [created, ...prev]);
  }

  async function handleDeletePhoto(photoId) {
    if (!confirm("삭제하시겠습니까?")) return;
    setDeletingId(photoId);
    setDeleteError("");
    try {
      await deletePhoto(church.id, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setDeleteError("사진 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  const selectedCommunity = communities.find((c) => c.id === selectedId);

  return (
    <div>
      {showCommunityModal && (
        <CommunityModal
          onClose={() => setShowCommunityModal(false)}
          onSave={handleSaveCommunity}
        />
      )}
      {showPhotoModal && (
        <PhotoModal onClose={() => setShowPhotoModal(false)} onSave={handleSavePhoto} />
      )}

      {/* 공동체 관리 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">갤러리 관리</h1>
        <button
          onClick={() => setShowCommunityModal(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          공동체 등록
        </button>
      </div>

      {communityError ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-white rounded-2xl border border-grey-2">
          <p className="text-body-4 text-grey-7">불러오지 못했습니다. 다시 시도해 주세요.</p>
          <button
            onClick={() => fetchCommunities()}
            className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`text-left bg-white rounded-2xl border p-5 transition-colors ${
                selectedId === c.id ? "border-primary" : "border-grey-2 hover:border-blue-4"
              }`}
            >
              <p className="text-body-3 font-semibold text-grey-11 truncate">{c.name}</p>
              {c.desc && <p className="text-body-5 text-grey-6 mt-1 truncate">{c.desc}</p>}
            </button>
          ))}
        </div>
      )}

      {/* 사진 관리 */}
      <div className="bg-white rounded-2xl border border-grey-2 p-6">
        {!selectedId ? (
          <p className="text-body-4 text-grey-6 text-center py-10">
            공동체를 먼저 선택해 주세요.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sub-tit-4 font-bold text-grey-10">
                {selectedCommunity?.name} 사진
              </h2>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
              >
                사진 등록
              </button>
            </div>

            {deleteError && <p className="text-body-5 text-red-500 mb-3">{deleteError}</p>}

            {photoError ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <p className="text-body-4 text-grey-7">불러오지 못했습니다. 다시 시도해 주세요.</p>
                <button
                  onClick={() => fetchPhotos(selectedId)}
                  className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : photos.length === 0 ? (
              <p className="text-body-4 text-grey-6 text-center py-10">등록된 사진이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((p) => (
                  <div key={p.id} className="rounded-xl border border-grey-2 overflow-hidden">
                    <div className="aspect-square bg-grey-2 flex items-center justify-center">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-body-5 font-semibold text-grey-10 truncate">{p.title}</p>
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        disabled={deletingId === p.id}
                        className="mt-2 text-body-5 text-grey-5 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === p.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/admin/GalleryManage.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 6: 라우팅 등록**

`src/routes.jsx`의 admin import 블록(`MembersManage`/`JuboManage` import 근처)에 추가:

```js
import GalleryManage from "@/pages/admin/GalleryManage";
```

admin 라우트 배열(`{ path: "members", element: <MembersManage /> }` 다음 줄 등)에 추가:

```js
{ path: "gallery", element: <GalleryManage /> },
```

- [ ] **Step 7: 사이드바 메뉴 추가**

`src/layouts/AdminLayout.jsx`의 아이콘 import 블록에 추가:

```js
import IcoGallery from "@/assets/icon-svg/admin-gallery-white.svg";
```

nav 배열(`{ label: "교인 관리", to: "/admin/members", icon: IcoUsers }` 다음 줄 등)에 추가:

```js
{ label: "갤러리 관리", to: "/admin/gallery", icon: IcoGallery },
```

- [ ] **Step 8: 전체 스위트 + lint 확인**

Run: `pnpm test:run && pnpm run lint`
Expected: 모든 테스트 통과, lint 경고 없음.

(로컬 `.env`에 `VITE_USE_DUMMY=false`가 설정돼 있으면 이 사이클과 무관한 도메인 테스트가 실패할 수 있다 — 그 경우 `VITE_USE_DUMMY=true pnpm test:run`으로 override해서 재확인한다.)

- [ ] **Step 9: 커밋**

```bash
git add src/pages/admin/GalleryManage.jsx src/pages/admin/GalleryManage.test.jsx src/assets/icon-svg/admin-gallery-white.svg src/routes.jsx src/layouts/AdminLayout.jsx
git commit -m "feat: 갤러리 관리자 화면 신규 추가 — 공동체/사진 등록·삭제"
```
