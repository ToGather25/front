# 교적부(Member Registry) 실연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `MembersManage.jsx`(관리자 교인 관리)의 "교인 목록" 탭을 실제 백엔드 교적부 조회 API와 연동한다. `Gyojeokbu.jsx`(일반 교인용)와 "승인 대기" 탭은 이번 계획 범위 밖이며 수정하지 않는다.

**Architecture:** 신규 `memberService.js`가 `isDummy("member")` 분기로 목록/상세 조회를 제공한다. 목록은 서버 페이지네이션(1-based를 서비스 레이어에서 0-based로 변환)+서버 사이드 키워드 검색으로 전환하고, 백엔드에 없는 필드(부서/직책/이메일/삭제/등록 기능)는 UI에서 완전히 제거한다.

**Tech Stack:** React 19, Axios(`src/services/api.js`), `useFetch`(`src/hooks/useFetch.js`), Vitest(`vite-plus/test`), `@testing-library/react` + `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-08-21-member-registry-integration-design.md`

## Global Constraints

- 백엔드 교적부 조회는 `GET /api/church/admin/members?keyword&page&size`(목록, `page` 0-based)와 `GET /api/church/admin/members/{publicId}`(상세)뿐이다 — 생성/수정/삭제/내보내기 API는 없다.
- 목록 응답 필드: `{id(UUID), name, birthDate, phone(중간마스킹), newcomer, registeredAt}`. 상세 응답은 추가로 `phone`이 마스킹 없는 원문이고 `hasAccount(bool)`이 붙는다.
- 부서/직책/구역/소그룹/이메일/주소/세례일/가족/이력/메모/출석 필드는 백엔드에 없다 — UI에서 참조하지 않는다.
- 테스트는 `"vite-plus/test"`에서 `describe/it/expect/vi/beforeEach`를 import한다.
- `@/services/api`를 모킹할 때는 `{ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, isDummy: () => false }` 형태로 모킹해 실 API 분기를 강제한다.
- 경로 별칭 `@/` → `src/`. `react-router-dom`이 아닌 `react-router`에서 훅 import.
- `src/config/members.config.js`는 삭제하지 않는다(`Gyojeokbu.jsx`가 계속 참조함, 이번 계획에서 그 파일은 수정하지 않음).

---

### Task 1: `memberService.js` + 더미 데이터 신규 생성

**Files:**
- Create: `src/services/memberService.js`
- Create: `src/data/dummy/members.js`
- Test: `src/services/memberService.test.js`

**Interfaces:**
- Produces:
  - `getMembers(churchId, { keyword?, page?, size? })` → `Promise<{ members: MemberSummary[], pageInfo: object }>` — Task 2가 그대로 소비한다.
  - `getMemberDetail(churchId, publicId)` → `Promise<MemberSummary & { hasAccount:boolean }>` — Task 2가 그대로 소비한다.
  - `MemberSummary` shape: `{ id, name, birthDate, phone, newcomer, registeredAt }`.

- [ ] **Step 1: `src/data/dummy/members.js` 작성**

```js
/**
 * @typedef {Object} MemberSummary
 * @property {string} id
 * @property {string} name
 * @property {string} birthDate     - "YYYY-MM-DD"
 * @property {string} phone
 * @property {boolean} newcomer
 * @property {string} registeredAt  - ISO datetime
 */

/** @type {MemberSummary[]} */
export const DUMMY_MEMBERS = [
  { id: "m1", name: "김은혜", birthDate: "1985-03-12", phone: "010-1111-2222", newcomer: false, registeredAt: "2021-02-01T09:00:00" },
  { id: "m2", name: "박소망", birthDate: "1990-07-22", phone: "010-2222-3333", newcomer: false, registeredAt: "2020-11-15T09:00:00" },
  { id: "m3", name: "이믿음", birthDate: "1978-01-05", phone: "010-3333-4444", newcomer: false, registeredAt: "2015-05-20T09:00:00" },
  { id: "m4", name: "최사랑", birthDate: "1995-09-30", phone: "010-4444-5555", newcomer: true, registeredAt: "2026-06-10T09:00:00" },
  { id: "m5", name: "정평강", birthDate: "1988-12-18", phone: "010-5555-6666", newcomer: false, registeredAt: "2019-03-08T09:00:00" },
  { id: "m6", name: "한기쁨", birthDate: "2000-04-25", phone: "010-6666-7777", newcomer: true, registeredAt: "2026-07-01T09:00:00" },
  { id: "m7", name: "윤소원", birthDate: "1972-06-14", phone: "010-7777-8888", newcomer: false, registeredAt: "2010-09-12T09:00:00" },
  { id: "m8", name: "임구원", birthDate: "1983-10-02", phone: "010-8888-9999", newcomer: false, registeredAt: "2017-01-25T09:00:00" },
  { id: "m9", name: "서은총", birthDate: "1998-02-17", phone: "010-9999-0000", newcomer: true, registeredAt: "2026-05-18T09:00:00" },
  { id: "m10", name: "문영광", birthDate: "1965-08-08", phone: "010-1010-2020", newcomer: false, registeredAt: "2005-04-03T09:00:00" },
  { id: "m11", name: "오찬양", birthDate: "1992-11-11", phone: "010-1212-3434", newcomer: false, registeredAt: "2022-08-19T09:00:00" },
  { id: "m12", name: "강예배", birthDate: "1980-05-27", phone: "010-1313-4545", newcomer: false, registeredAt: "2013-12-01T09:00:00" },
  { id: "m13", name: "조섬김", birthDate: "1996-03-03", phone: "010-1414-5656", newcomer: true, registeredAt: "2026-04-22T09:00:00" },
  { id: "m14", name: "장충성", birthDate: "1975-07-19", phone: "010-1515-6767", newcomer: false, registeredAt: "2008-06-30T09:00:00" },
  { id: "m15", name: "신소명", birthDate: "1989-09-09", phone: "010-1616-7878", newcomer: false, registeredAt: "2018-10-14T09:00:00" },
];
```

- [ ] **Step 2: `memberService.test.js` 작성 (실패 확인용)**

`src/services/memberService.test.js` 전체 내용:

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getMembers, getMemberDetail } from "./memberService";

const PAGE_RESPONSE = {
  content: [
    {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-****-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
    },
  ],
  pageInfo: {
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
};

describe("memberService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMembers는 1-based page를 0-based로 변환해 GET /church/admin/members를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    const result = await getMembers("1", { page: 2, size: 20 });

    expect(api.get).toHaveBeenCalledWith("/church/admin/members", {
      params: { keyword: undefined, page: 1, size: 20 },
    });
    expect(result).toEqual({ members: PAGE_RESPONSE.content, pageInfo: PAGE_RESPONSE.pageInfo });
  });

  it("getMembers는 keyword 파라미터를 그대로 전달한다", async () => {
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    await getMembers("1", { keyword: "김은혜", page: 1, size: 20 });

    expect(api.get).toHaveBeenCalledWith("/church/admin/members", {
      params: { keyword: "김은혜", page: 0, size: 20 },
    });
  });

  it("getMembers는 page/size 생략 시 1페이지/20건 기본값으로 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    await getMembers("1");

    expect(api.get).toHaveBeenCalledWith("/church/admin/members", {
      params: { keyword: undefined, page: 0, size: 20 },
    });
  });

  it("getMemberDetail은 GET /church/admin/members/{publicId}를 호출한다", async () => {
    const detail = {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-1111-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
      hasAccount: true,
    };
    api.get.mockResolvedValue({ data: { data: detail } });

    const result = await getMemberDetail("1", "abc-123");

    expect(api.get).toHaveBeenCalledWith("/church/admin/members/abc-123");
    expect(result).toEqual(detail);
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/memberService.test.js`
Expected: FAIL — `memberService.js`가 아직 없어 모듈 resolve 에러.

- [ ] **Step 4: `src/services/memberService.js` 작성**

```js
import api, { isDummy } from "./api";
import { DUMMY_MEMBERS } from "@/data/dummy/members";

/**
 * @typedef {Object} MemberSummary
 * @property {string} id            - UUID(더미는 "m1" 형태 문자열)
 * @property {string} name
 * @property {string} birthDate     - "YYYY-MM-DD"
 * @property {string} phone         - 목록: 중간 마스킹, 상세: 원문
 * @property {boolean} newcomer
 * @property {string} registeredAt  - ISO datetime
 */

const DEFAULT_SIZE = 20;

/**
 * 교적부 목록 조회 (관리자, CHURCH_ADMIN 전용)
 * @param {string} churchId
 * @param {{ keyword?:string, page?:number, size?:number }} params - page는 1-based(프론트 관례)
 * @returns {Promise<{ members: MemberSummary[], pageInfo: object }>}
 */
export async function getMembers(churchId, { keyword, page = 1, size = DEFAULT_SIZE } = {}) {
  if (isDummy("member")) {
    const filtered = keyword
      ? DUMMY_MEMBERS.filter((m) => m.name.includes(keyword) || m.phone.includes(keyword))
      : DUMMY_MEMBERS;
    const start = (page - 1) * size;
    const content = filtered.slice(start, start + size);
    return {
      members: content,
      pageInfo: {
        page: page - 1,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        hasNext: start + size < filtered.length,
        hasPrevious: page > 1,
      },
    };
  }
  const res = await api.get(`/church/admin/members`, {
    params: { keyword: keyword || undefined, page: page - 1, size },
  });
  return { members: res.data.data.content, pageInfo: res.data.data.pageInfo };
}

/**
 * 교적부 상세 조회 (관리자, CHURCH_ADMIN 전용)
 * @param {string} churchId
 * @param {string} publicId
 * @returns {Promise<MemberSummary & { hasAccount:boolean }>}
 */
export async function getMemberDetail(churchId, publicId) {
  if (isDummy("member")) {
    const found = DUMMY_MEMBERS.find((m) => String(m.id) === String(publicId));
    return found ? { ...found, hasAccount: true } : null;
  }
  const res = await api.get(`/church/admin/members/${publicId}`);
  return res.data.data;
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/memberService.test.js`
Expected: PASS (4 tests)

- [ ] **Step 6: 커밋**

```bash
git add src/services/memberService.js src/services/memberService.test.js src/data/dummy/members.js
git commit -m "feat: memberService 신규 추가 — 교적부 목록/상세 조회 API 연동"
```

---

### Task 2: `MembersManage.jsx` "교인 목록" 탭 재설계

**Files:**
- Modify: `src/pages/admin/MembersManage.jsx`
- Modify: `src/pages/admin/MembersManage.test.jsx` (전면 교체)

**Interfaces:**
- Consumes: Task 1의 `getMembers(churchId, {keyword, page, size})`, `getMemberDetail(churchId, publicId)`.
- Produces: 없음(리프 페이지 컴포넌트). "승인 대기" 탭(`DUMMY_PENDING`, `handleApprove`)은 이 태스크에서 전혀 손대지 않는다.

- [ ] **Step 1: `MembersManage.test.jsx` 전체 내용을 아래로 교체 — 실패 확인용**

기존 파일은 `members.config.js`의 부서/직책 클라이언트 필터에 의존하는데, 이번 변경으로 그 필터 자체가 사라지므로 전면 교체한다.

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MembersManage from "./MembersManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const PAGE_RESPONSE = {
  content: [
    {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-****-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
    },
  ],
  pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
};

describe("MembersManage — 교인 목록 탭", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });
  });

  it("목록을 불러와 렌더링한다", async () => {
    renderWithChurch(<MembersManage />);
    expect(await screen.findByText("김은혜")).toBeInTheDocument();
  });

  it("부서/직책 필터, 교인 등록, 엑셀 다운로드, 삭제 버튼이 존재하지 않는다", async () => {
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");

    expect(screen.queryByText("부서")).not.toBeInTheDocument();
    expect(screen.queryByText("직책")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "교인 등록" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "엑셀 다운로드" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it("검색어를 입력하면 디바운스 후 keyword로 서버 검색을 호출한다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    await user.type(screen.getByPlaceholderText("이름 / 연락처 검색"), "김은혜");

    await waitFor(
      () =>
        expect(api.get).toHaveBeenCalledWith(
          "/church/admin/members",
          expect.objectContaining({ params: expect.objectContaining({ keyword: "김은혜" }) }),
        ),
      { timeout: 1000 },
    );
  });

  it("상세 버튼을 클릭하면 getMemberDetail을 호출해 모달에 상세 정보를 보여준다", async () => {
    const detail = {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-1111-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
      hasAccount: true,
    };
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");
    api.get.mockResolvedValue({ data: { data: detail } });

    await user.click(screen.getByRole("button", { name: "상세" }));

    expect(await screen.findByText("010-1111-2222")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/church/admin/members/abc-123");
  });

  it("승인 대기 탭은 기존 더미 동작 그대로 유지된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");

    await user.click(screen.getByText("승인 대기"));

    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "승인" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/pages/admin/MembersManage.test.jsx`
Expected: FAIL — 현재 `MembersManage.jsx`는 여전히 `members.config.js`를 쓰고 부서/직책 필터·교인등록·엑셀다운로드·삭제 버튼이 남아있으며, 검색은 클라이언트 필터라 API를 호출하지 않는다.

- [ ] **Step 3: `MembersManage.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getMembers, getMemberDetail } from "@/services/memberService";
import PrevNextPagination from "@/components/common/PrevNextPagination";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const DUMMY_PENDING = [
  {
    id: 101,
    name: "홍길동",
    birthdate: "1990.05.12",
    phone: "010-1111-2222",
    appliedAt: "2026.07.08",
  },
  {
    id: 102,
    name: "김새신",
    birthdate: "1998.11.30",
    phone: "010-3333-4444",
    appliedAt: "2026.07.09",
  },
  {
    id: 103,
    name: "이방문",
    birthdate: "2001.03.22",
    phone: "010-5555-6666",
    appliedAt: "2026.07.10",
  },
];

const EMPTY_PAGE = { page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false };

function toDate(iso) {
  return iso ? iso.slice(0, 10) : "-";
}

function MemberDetailModal({ detail, loading, onClose }) {
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
        {loading ? (
          <p className="text-body-3 text-grey-6 text-center py-8">불러오는 중...</p>
        ) : !detail ? (
          <p className="text-body-3 text-grey-6 text-center py-8">정보를 찾을 수 없습니다.</p>
        ) : (
          <>
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">{detail.name}</h3>
            <div className="flex flex-col gap-3 text-body-4">
              <div className="flex justify-between">
                <span className="text-grey-6">생년월일</span>
                <span className="text-grey-10 font-mono">{detail.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">연락처</span>
                <span className="text-grey-10 font-mono">{detail.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">등록일</span>
                <span className="text-grey-10 font-mono">{toDate(detail.registeredAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">신규 여부</span>
                <span className="text-grey-10">{detail.newcomer ? "새가족" : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">계정 연동</span>
                <span className="text-grey-10">{detail.hasAccount ? "연동됨" : "미연동"}</span>
              </div>
            </div>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default function MembersManage() {
  const { church } = useChurch();
  const [activeTab, setActiveTab] = useState("active"); // "active" | "pending"
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pendingList, setPendingList] = useState(DUMMY_PENDING);
  const [approvingId, setApprovingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: { members, pageInfo } = { members: [], pageInfo: EMPTY_PAGE },
    loading,
  } = useFetch(
    () => getMembers(church.id, { keyword, page }),
    [church.id, keyword, page],
    { members: [], pageInfo: EMPTY_PAGE },
  );

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getMemberDetail(church.id, detailId).then((d) => {
      if (!cancelled) {
        setDetail(d);
        setDetailLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, detailId]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    // TODO: PATCH /api/admin/members/:id/approve → 승인 처리 + 알림톡 발송
    await new Promise((r) => setTimeout(r, 700));
    setPendingList((prev) => prev.filter((p) => p.id !== id));
    setApprovingId(null);
  };

  const tabCls = (tab) =>
    `px-5 py-2.5 text-body-3 font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary font-semibold"
        : "border-transparent text-grey-6 hover:text-grey-9"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">교인 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-grey-2 mb-5">
        <button className={tabCls("active")} onClick={() => setActiveTab("active")}>
          교인 목록
          <span className="ml-1.5 text-body-5 text-grey-5">({pageInfo.totalElements})</span>
        </button>
        <button className={tabCls("pending")} onClick={() => setActiveTab("pending")}>
          승인 대기
          {pendingList.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold">
              {pendingList.length}
            </span>
          )}
        </button>
      </div>

      {/* ── 교인 목록 탭 ── */}
      {activeTab === "active" && (
        <>
          <div className="bg-white rounded-2xl border border-grey-2 p-4 mb-4 flex items-center gap-3">
            <div className="relative">
              <input
                className="border border-grey-3 rounded-xl pl-9 pr-4 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary w-64"
                placeholder="이름 / 연락처 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <img
                src={IcoSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
                alt=""
              />
            </div>
            <span className="ml-auto text-body-5 text-grey-5">총 {pageInfo.totalElements}명</span>
          </div>

          <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2">
                  <th className="text-center px-2 py-3 w-12">No</th>
                  <th className="text-left px-4 py-3">이름</th>
                  <th className="text-left px-4 py-3">생년월일</th>
                  <th className="text-left px-4 py-3">연락처</th>
                  <th className="text-left px-4 py-3">등록일</th>
                  <th className="text-center px-4 py-3">신규</th>
                  <th className="text-center px-4 py-3 w-20">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-grey-5 text-body-3">
                      불러오는 중...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-grey-5 text-body-3">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`hover:bg-grey-1 transition-colors ${i < members.length - 1 ? "border-b border-grey-2" : ""}`}
                    >
                      <td className="text-body-5 text-grey-5 text-center px-2 py-3.5">
                        {(page - 1) * pageInfo.size + i + 1}
                      </td>
                      <td className="text-body-4 font-semibold text-grey-10 px-4 py-3.5">
                        {m.name}
                      </td>
                      <td className="text-body-5 text-grey-7 font-mono px-4 py-3.5">
                        {m.birthDate}
                      </td>
                      <td className="text-body-5 text-grey-6 font-mono px-4 py-3.5">{m.phone}</td>
                      <td className="text-body-5 text-grey-5 font-mono px-4 py-3.5">
                        {toDate(m.registeredAt)}
                      </td>
                      <td className="text-center px-4 py-3.5">
                        {m.newcomer && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-body-5 font-semibold bg-[#e0f5eb] text-[#008848]">
                            새가족
                          </span>
                        )}
                      </td>
                      <td className="text-center px-4 py-3.5">
                        <button
                          onClick={() => setDetailId(m.id)}
                          className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pageInfo.totalPages > 1 && (
            <PrevNextPagination page={page} hasNext={pageInfo.hasNext} onChange={setPage} />
          )}
        </>
      )}

      {/* ── 승인 대기 탭 ── */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
          <div
            className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
            style={{ gridTemplateColumns: "48px 100px 120px 150px 120px 110px" }}
          >
            <span className="text-center">No</span>
            <span>이름</span>
            <span>생년월일</span>
            <span>휴대폰</span>
            <span>신청일</span>
            <span className="text-center">처리</span>
          </div>
          {pendingList.length === 0 ? (
            <div className="py-16 text-center text-grey-5 text-body-3">
              대기 중인 가입 신청이 없습니다.
            </div>
          ) : (
            pendingList.map((p, i) => (
              <div
                key={p.id}
                className={`grid items-center px-6 py-4 hover:bg-grey-1 transition-colors ${i < pendingList.length - 1 ? "border-b border-grey-2" : ""}`}
                style={{ gridTemplateColumns: "48px 100px 120px 150px 120px 110px" }}
              >
                <span className="text-body-5 text-grey-5 text-center">{i + 1}</span>
                <span className="text-body-4 font-semibold text-grey-10">{p.name}</span>
                <span className="text-body-5 text-grey-7">{p.birthdate}</span>
                <span className="text-body-5 text-grey-6">{p.phone}</span>
                <span className="text-body-5 text-grey-5">{p.appliedAt}</span>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={approvingId === p.id}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-body-5 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
                  >
                    {approvingId === p.id ? "처리 중..." : "승인"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {detailId && (
        <MemberDetailModal
          detail={detail}
          loading={detailLoading}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/pages/admin/MembersManage.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: 전체 스위트 + lint 확인**

Run: `pnpm test:run && pnpm run lint`
Expected: 모든 테스트 통과, lint 경고 없음.

(로컬 `.env`에 `VITE_USE_DUMMY=false`가 설정돼 있으면 이 사이클과 무관한 도메인 테스트가 실패할 수 있다 — 그 경우 `VITE_USE_DUMMY=true pnpm test:run`으로 override해서 재확인한다.)

- [ ] **Step 6: 커밋**

```bash
git add src/pages/admin/MembersManage.jsx src/pages/admin/MembersManage.test.jsx
git commit -m "feat: MembersManage 교인 목록 탭이 실제 교적부 API와 연동"
```
