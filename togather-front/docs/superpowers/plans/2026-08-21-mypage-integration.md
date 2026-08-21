# 마이페이지 실연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `MyPage.jsx`의 일정/기도·상담/문의 3개 탭과 회원탈퇴 기능을 실제 백엔드 `/api/my/**` API와 연동한다. "내 정보"(프로필 수정)·"부서/직책" 탭은 대응 API가 없어 범위 밖이며 손대지 않는다.

**Architecture:** 신규 `myPageService.js`가 `isDummy("my")` 분기로 7개 함수(일정 조회/추가/삭제, 기도 조회/추가, 문의 조회/추가, 탈퇴)를 제공한다. `MyPage.jsx`가 `WorshipManage.jsx`(설교·방송 사이클)와 동일한 수동 fetch 패턴(`useState`+`useEffect`, `useFetch` 미사용)으로 3개 탭 데이터를 로드해 하위 컴포넌트에 내려주고, 각 탭은 지금처럼 부모의 setter로 낙관적 갱신한다.

**Tech Stack:** React 19, Axios(`src/services/api.js`), Vitest(`vite-plus/test`), `@testing-library/react` + `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-08-21-mypage-integration-design.md`

## Global Constraints

- 백엔드 `/api/my/**`는 전부 로그인(JWT) 필수, churchId를 URL에 쓰지 않는다(host+JWT 기반) — 서비스 함수는 다른 관리자 서비스와 시그니처 일관성을 위해 `churchId` 첫 인자를 유지하되 URL에는 안 쓴다.
- 일정: `{id,title,date,memo}`, 삭제 가능. 기도: `{id,type,content,status,createdAt}`(**title 없음**), 삭제 불가. 문의: `{id,title,content,status,answer,createdAt}`, 삭제 불가.
- 상태값 문자열은 백엔드가 프론트 표기 그대로(한글) 저장한다 — `src/components/mypage/shared.jsx`의 `StatusBadge` 스타일 맵을 그대로 재사용.
- 테스트는 `"vite-plus/test"`에서 `describe/it/expect/vi/beforeEach`를 import한다.
- `@/services/api`를 모킹할 때는 `{ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, isDummy: () => false }` 형태로 모킹해 실 API 분기를 강제한다.
- 경로 별칭 `@/` → `src/`. `react-router-dom`이 아닌 `react-router`에서 훅 import.
- `src/components/mypage/mockData.js`의 `MOCK_USER`/`MOCK_DEPT`/`MOCK_GROUPS`는 이 계획에서 수정하지 않는다("내 정보"/"부서·직책" 탭이 계속 참조).

---

### Task 1: `myPageService.js` + 더미 데이터 신규 생성

**Files:**
- Create: `src/services/myPageService.js`
- Create: `src/data/dummy/mypage.js`
- Test: `src/services/myPageService.test.js`

**Interfaces:**
- Produces:
  - `getMySchedules(churchId)` → `Promise<MySchedule[]>`, `addMySchedule(churchId, {title,date,memo})` → `Promise<MySchedule>`, `deleteMySchedule(churchId, id)` → `Promise<void>`.
  - `getMyPrayers(churchId)` → `Promise<MyPrayer[]>`, `addMyPrayer(churchId, {type,content})` → `Promise<MyPrayer>`.
  - `getMyInquiries(churchId)` → `Promise<MyInquiry[]>`, `addMyInquiry(churchId, {title,content})` → `Promise<MyInquiry>`.
  - `withdrawAccount(churchId)` → `Promise<void>`.
  - `MySchedule={id,title,date,memo}`, `MyPrayer={id,type,content,status,createdAt}`, `MyInquiry={id,title,content,status,answer,createdAt}`. Task 2~5가 이 함수들과 shape을 그대로 소비한다.

- [ ] **Step 1: `src/data/dummy/mypage.js` 작성**

```js
/** @typedef {{id:number, title:string, date:string, memo:string}} MySchedule */
/** @typedef {{id:number, type:string, content:string, status:string, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */

/** @type {MySchedule[]} */
export const DUMMY_MY_SCHEDULES = [
  { id: 1, title: "1구역 모임", date: "2026-02-18", memo: "옥길동 박OO 권사 댁 · 19:30" },
  { id: 2, title: "성가대 부활절 연습", date: "2026-02-22", memo: "본당 4층 · 20:00" },
  { id: 3, title: "주일 1·2부 예배", date: "2026-02-23", memo: "본당 · 09:00 / 11:00" },
  { id: 4, title: "개인 — 직장 송별회", date: "2026-02-25", memo: "강남 · 19:00" },
  { id: 5, title: "부활주일 연합 예배", date: "2026-04-05", memo: "본당 · 11:00" },
  { id: 6, title: "주일 1부 예배", date: "2026-04-12", memo: "본당 · 09:00" },
];

/** @type {MyPrayer[]} */
export const DUMMY_MY_PRAYERS = [
  {
    id: 1,
    type: "기도",
    content: "가족 간의 깊은 대화가 필요합니다. 함께 기도해 주세요.",
    status: "답변 완료",
    createdAt: "2026-02-10T09:00:00",
  },
  {
    id: 2,
    type: "상담",
    content: "이직 결정을 앞두고 지혜가 필요합니다.",
    status: "답변 대기",
    createdAt: "2026-02-04T09:00:00",
  },
  {
    id: 3,
    type: "기도",
    content: "수술 잘 끝났습니다. 함께 기도해 주신 모든 분께 감사드립니다.",
    status: "답변 완료",
    createdAt: "2026-01-27T09:00:00",
  },
  {
    id: 4,
    type: "기도",
    content: "큰 아이가 수능을 앞두고 있습니다. 지혜와 평안을 위해 기도 부탁드립니다.",
    status: "답변 완료",
    createdAt: "2026-01-15T09:00:00",
  },
  {
    id: 5,
    type: "상담",
    content: "가정 내 갈등으로 힘든 시간을 보내고 있습니다. 상담을 부탁드립니다.",
    status: "답변 완료",
    createdAt: "2026-01-08T09:00:00",
  },
];

/** @type {MyInquiry[]} */
export const DUMMY_MY_INQUIRIES = [
  {
    id: 1,
    title: "교적 정보 수정 요청 (주소 변경)",
    content: "이사를 하게 되어 주소 변경을 요청드립니다.",
    status: "답변 완료",
    answer: "사무국 — 주소 변경 완료되었습니다. 다음 주보부터 반영됩니다.",
    createdAt: "2026-02-12T09:00:00",
  },
  {
    id: 2,
    title: "새가족부 신청",
    content: "새가족부에 참여하고 싶습니다.",
    status: "진행 중",
    answer: null,
    createdAt: "2026-02-05T09:00:00",
  },
  {
    id: 3,
    title: "심방 일정 요청",
    content: "이번 주 중 심방을 요청드립니다.",
    status: "답변 완료",
    answer: "부목사 — 2/3 화요일 19:00에 방문드리겠습니다.",
    createdAt: "2026-01-20T09:00:00",
  },
  {
    id: 4,
    title: "교육 프로그램 등록",
    content: "제자훈련 1기 등록을 원합니다.",
    status: "답변 완료",
    answer: "교육부 — 제자훈련 1기 등록 완료되었습니다.",
    createdAt: "2026-01-10T09:00:00",
  },
  {
    id: 5,
    title: "구역 변경 신청",
    content: "이사로 인해 구역 변경을 요청드립니다.",
    status: "진행 중",
    answer: null,
    createdAt: "2025-11-30T09:00:00",
  },
];
```

- [ ] **Step 2: `myPageService.test.js` 작성 — 실패 확인용**

`src/services/myPageService.test.js` 전체 내용:

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import {
  getMySchedules,
  addMySchedule,
  deleteMySchedule,
  getMyPrayers,
  addMyPrayer,
  getMyInquiries,
  addMyInquiry,
  withdrawAccount,
} from "./myPageService";

describe("myPageService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMySchedules는 GET /my/schedules를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1, title: "모임", date: "2026-03-01", memo: "" }] } });

    const result = await getMySchedules("1");

    expect(api.get).toHaveBeenCalledWith("/my/schedules");
    expect(result).toEqual([{ id: 1, title: "모임", date: "2026-03-01", memo: "" }]);
  });

  it("addMySchedule은 POST /my/schedules를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 일정", date: "2026-03-15", memo: "본당" };
    api.post.mockResolvedValue({ data: { data: { id: 10, ...payload } } });

    const result = await addMySchedule("1", payload);

    expect(api.post).toHaveBeenCalledWith("/my/schedules", payload);
    expect(result).toEqual({ id: 10, ...payload });
  });

  it("deleteMySchedule은 DELETE /my/schedules/{id}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await deleteMySchedule("1", 10);

    expect(api.delete).toHaveBeenCalledWith("/my/schedules/10");
  });

  it("getMyPrayers는 GET /my/prayers를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getMyPrayers("1");

    expect(api.get).toHaveBeenCalledWith("/my/prayers");
  });

  it("addMyPrayer는 POST /my/prayers를 정확한 payload로 호출한다", async () => {
    const payload = { type: "상담", content: "고민이 있습니다" };
    api.post.mockResolvedValue({ data: { data: { id: 20, ...payload, status: "답변 대기", createdAt: "2026-03-15T09:00:00" } } });

    const result = await addMyPrayer("1", payload);

    expect(api.post).toHaveBeenCalledWith("/my/prayers", payload);
    expect(result.status).toBe("답변 대기");
  });

  it("getMyInquiries는 GET /my/inquiries를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getMyInquiries("1");

    expect(api.get).toHaveBeenCalledWith("/my/inquiries");
  });

  it("addMyInquiry는 POST /my/inquiries를 정확한 payload로 호출한다", async () => {
    const payload = { title: "문의합니다", content: "내용입니다" };
    api.post.mockResolvedValue({ data: { data: { id: 30, ...payload, status: "진행 중", answer: null, createdAt: "2026-03-15T09:00:00" } } });

    const result = await addMyInquiry("1", payload);

    expect(api.post).toHaveBeenCalledWith("/my/inquiries", payload);
    expect(result.status).toBe("진행 중");
  });

  it("withdrawAccount는 DELETE /my/account를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await withdrawAccount("1");

    expect(api.delete).toHaveBeenCalledWith("/my/account");
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/services/myPageService.test.js`
Expected: FAIL — `myPageService.js`가 아직 없어 모듈 resolve 에러.

- [ ] **Step 4: `src/services/myPageService.js` 작성**

```js
import api, { isDummy } from "./api";
import { DUMMY_MY_SCHEDULES, DUMMY_MY_PRAYERS, DUMMY_MY_INQUIRIES } from "@/data/dummy/mypage";

/** @typedef {{id:number, title:string, date:string, memo:string}} MySchedule */
/** @typedef {{id:number, type:string, content:string, status:string, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */

/**
 * 내 일정 목록 조회
 * @param {string} churchId
 * @returns {Promise<MySchedule[]>}
 */
export async function getMySchedules(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_SCHEDULES];
  const res = await api.get(`/my/schedules`);
  return res.data.data;
}

/**
 * 내 일정 추가
 * @param {string} churchId
 * @param {{ title:string, date:string, memo?:string }} payload
 * @returns {Promise<MySchedule>}
 */
export async function addMySchedule(churchId, payload) {
  if (isDummy("my")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_MY_SCHEDULES.push(created);
    return created;
  }
  const res = await api.post(`/my/schedules`, payload);
  return res.data.data;
}

/**
 * 내 일정 삭제
 * @param {string} churchId
 * @param {number} id
 */
export async function deleteMySchedule(churchId, id) {
  if (isDummy("my")) {
    const idx = DUMMY_MY_SCHEDULES.findIndex((s) => s.id === id);
    if (idx !== -1) DUMMY_MY_SCHEDULES.splice(idx, 1);
    return;
  }
  await api.delete(`/my/schedules/${id}`);
}

/**
 * 내 기도/상담 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyPrayer[]>}
 */
export async function getMyPrayers(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_PRAYERS];
  const res = await api.get(`/my/prayers`);
  return res.data.data;
}

/**
 * 기도/상담 신청
 * @param {string} churchId
 * @param {{ type:string, content:string }} payload
 * @returns {Promise<MyPrayer>}
 */
export async function addMyPrayer(churchId, payload) {
  if (isDummy("my")) {
    const created = {
      id: Date.now(),
      ...payload,
      status: "답변 대기",
      createdAt: new Date().toISOString(),
    };
    DUMMY_MY_PRAYERS.unshift(created);
    return created;
  }
  const res = await api.post(`/my/prayers`, payload);
  return res.data.data;
}

/**
 * 내 문의 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyInquiry[]>}
 */
export async function getMyInquiries(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_INQUIRIES];
  const res = await api.get(`/my/inquiries`);
  return res.data.data;
}

/**
 * 문의 등록
 * @param {string} churchId
 * @param {{ title:string, content?:string }} payload
 * @returns {Promise<MyInquiry>}
 */
export async function addMyInquiry(churchId, payload) {
  if (isDummy("my")) {
    const created = {
      id: Date.now(),
      ...payload,
      status: "진행 중",
      answer: null,
      createdAt: new Date().toISOString(),
    };
    DUMMY_MY_INQUIRIES.unshift(created);
    return created;
  }
  const res = await api.post(`/my/inquiries`, payload);
  return res.data.data;
}

/**
 * 회원 탈퇴 (즉시 소프트삭제)
 * @param {string} churchId
 */
export async function withdrawAccount(churchId) {
  if (isDummy("my")) return;
  await api.delete(`/my/account`);
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/services/myPageService.test.js`
Expected: PASS (8 tests)

- [ ] **Step 6: 커밋**

```bash
git add src/services/myPageService.js src/services/myPageService.test.js src/data/dummy/mypage.js
git commit -m "feat: myPageService 신규 추가 — 마이페이지 일정/기도/문의/탈퇴 API 연동"
```

---

### Task 2: `MyPage.jsx` 데이터 페칭 전환 + `ScheduleTab.jsx` 재설계

**Files:**
- Modify: `src/pages/MyPage/MyPage.jsx`
- Modify: `src/components/mypage/ScheduleTab.jsx`
- Test: `src/components/mypage/ScheduleTab.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `getMySchedules`/`addMySchedule`/`deleteMySchedule`.
- Produces: `MyPage.jsx`가 `schedules`/`setSchedules`를 fetch 기반으로 소유(기존과 동일한 방식으로 `prayers`/`inquiries`에도 곧 적용됨, Task 3이 이어받음).

- [ ] **Step 1: `MyPage.jsx`에서 일정 관련 fetch 배선 추가**

`src/pages/MyPage/MyPage.jsx`의 import 블록(현재 1-24번째 줄)을 아래로 교체:

```js
// 변경 전
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import UserBlue from "@/assets/icon-svg/mypage-user-blue.svg";
import UserWhite from "@/assets/icon-svg/mypage-user-white.svg";
import ChurchIcon from "@/assets/icon-svg/mypage-church.svg";
import CalBlue from "@/assets/icon-svg/mypage-calendar-blue.svg";
import CalWhite from "@/assets/icon-svg/mypage-calendar-white.svg";
import HeartHandBlue from "@/assets/icon-svg/mypage-heart-hand-blue.svg";
import HeartHandWhite from "@/assets/icon-svg/mypage-heart-hand-white.svg";
import ChatBlue from "@/assets/icon-svg/mypage-chat-blue.svg";
import ChatWhite from "@/assets/icon-svg/mypage-chat-white.svg";
import {
  MOCK_USER,
  INITIAL_SCHEDULES,
  INITIAL_PRAYERS,
  INITIAL_INQUIRIES,
} from "@/components/mypage/mockData";
import InfoTab from "@/components/mypage/InfoTab";
import DeptTab from "@/components/mypage/DeptTab";
import ScheduleTab from "@/components/mypage/ScheduleTab";
import PrayerTab from "@/components/mypage/PrayerTab";
import InquiryTab from "@/components/mypage/InquiryTab";
```

```js
// 변경 후
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import { getMySchedules, getMyPrayers, getMyInquiries } from "@/services/myPageService";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import UserBlue from "@/assets/icon-svg/mypage-user-blue.svg";
import UserWhite from "@/assets/icon-svg/mypage-user-white.svg";
import ChurchIcon from "@/assets/icon-svg/mypage-church.svg";
import CalBlue from "@/assets/icon-svg/mypage-calendar-blue.svg";
import CalWhite from "@/assets/icon-svg/mypage-calendar-white.svg";
import HeartHandBlue from "@/assets/icon-svg/mypage-heart-hand-blue.svg";
import HeartHandWhite from "@/assets/icon-svg/mypage-heart-hand-white.svg";
import ChatBlue from "@/assets/icon-svg/mypage-chat-blue.svg";
import ChatWhite from "@/assets/icon-svg/mypage-chat-white.svg";
import { MOCK_USER } from "@/components/mypage/mockData";
import InfoTab from "@/components/mypage/InfoTab";
import DeptTab from "@/components/mypage/DeptTab";
import ScheduleTab from "@/components/mypage/ScheduleTab";
import PrayerTab from "@/components/mypage/PrayerTab";
import InquiryTab from "@/components/mypage/InquiryTab";
```

`MyPage` 컴포넌트 본문(현재 34-54번째 줄)을 아래로 교체:

```js
// 변경 전
export default function MyPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("info");

  // 탭을 벗어났다가 돌아와도 사용자가 입력·추가한 내용이 유지되도록(원본
  // MyPage.jsx와 동일한 지속성), 여러 탭에 걸쳐 보존해야 하는 "데이터"만
  // 부모가 소유한다. 필터/페이지 위치/모달 열림 여부처럼 뷰 상태 성격의
  // 값은 각 탭이 자체 소유해 탭 전환 시 초기화되며, 이는 사용자가 입력한
  // 값이 아니므로 문제없다.
  const [userForm, setUserForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    email: MOCK_USER.email,
    address: MOCK_USER.address,
    currentPw: "",
    newPw: "",
  });
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);

  if (!currentUser) {
```

```js
// 변경 후
export default function MyPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { church } = useChurch();
  const [activeTab, setActiveTab] = useState("info");

  // 탭을 벗어났다가 돌아와도 사용자가 입력·추가한 내용이 유지되도록(원본
  // MyPage.jsx와 동일한 지속성), 여러 탭에 걸쳐 보존해야 하는 "데이터"만
  // 부모가 소유한다. 필터/페이지 위치/모달 열림 여부처럼 뷰 상태 성격의
  // 값은 각 탭이 자체 소유해 탭 전환 시 초기화되며, 이는 사용자가 입력한
  // 값이 아니므로 문제없다.
  const [userForm, setUserForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    email: MOCK_USER.email,
    address: MOCK_USER.address,
    currentPw: "",
    newPw: "",
  });
  const [schedules, setSchedules] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getMySchedules(church.id).then((list) => {
      if (!cancelled) setSchedules(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getMyPrayers(church.id).then((list) => {
      if (!cancelled) setPrayers(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getMyInquiries(church.id).then((list) => {
      if (!cancelled) setInquiries(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, currentUser]);

  if (!currentUser) {
```

(`!currentUser`일 때 각 `useEffect`가 즉시 return하는 이유: 비로그인 상태에서도 훅은 항상 호출돼야 하므로(React 규칙), 실제 fetch만 로그인 후로 미룬다 — `/api/my/**`는 로그인 필수라 비로그인 상태에서 호출하면 401이 난다.)

- [ ] **Step 2: `ScheduleTab.test.jsx` 작성 — 실패 확인용**

`src/components/mypage/ScheduleTab.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import ScheduleTab from "./ScheduleTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SCHEDULES = [{ id: 1, title: "1구역 모임", date: "2026-02-18", memo: "옥길동 · 19:30" }];

describe("ScheduleTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("요일 입력 필드와 상태 배지가 없다", () => {
    renderWithChurch(<ScheduleTab schedules={SCHEDULES} setSchedules={() => {}} />);
    expect(screen.queryByText("요일")).not.toBeInTheDocument();
    expect(screen.queryByText("참석 예정")).not.toBeInTheDocument();
  });

  it("일정을 추가하면 addMySchedule을 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 2, title: "새 일정", date: "2026-03-15", memo: "본당" } },
    });
    const setSchedules = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<ScheduleTab schedules={SCHEDULES} setSchedules={setSchedules} />);

    await user.click(screen.getByRole("button", { name: "+ 일정 추가" }));
    await user.type(screen.getByPlaceholderText("03.15"), "2026-03-15");
    await user.type(screen.getByPlaceholderText("예) 새가족 모임"), "새 일정");
    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/my/schedules",
        expect.objectContaining({ title: "새 일정" }),
      ),
    );
  });

  it("일정을 삭제하면 deleteMySchedule을 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const setSchedules = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<ScheduleTab schedules={SCHEDULES} setSchedules={setSchedules} />);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/my/schedules/1"));
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/mypage/ScheduleTab.test.jsx`
Expected: FAIL — 현재 `ScheduleTab.jsx`는 요일 입력·상태 배지가 있고 API 호출이 전혀 없다.

- [ ] **Step 4: `ScheduleTab.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMySchedule, deleteMySchedule } from "@/services/myPageService";
import { formatMonthDay, getWeekdayLabel, parseLocalDate } from "@/utils/date";
import { Pagination, InputField, ModalOverlay } from "./shared";

const PAGE_SIZE = 5;

export default function ScheduleTab({ schedules, setSchedules }) {
  const { church } = useChurch();
  const [scheduleForm, setScheduleForm] = useState({ date: "", title: "", memo: "" });
  const [schedulePage, setSchedulePage] = useState(1);
  const [modal, setModal] = useState(null);

  async function handleAddSchedule() {
    if (!scheduleForm.title || !scheduleForm.date) return;
    const created = await addMySchedule(church.id, scheduleForm);
    setSchedules((prev) => [...prev, created]);
    setScheduleForm({ date: "", title: "", memo: "" });
    setModal(null);
  }

  async function handleDeleteSchedule(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteMySchedule(church.id, id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  const pagedSchedules = schedules.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col min-h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">내 일정 ({schedules.length})</h2>
        <button
          onClick={() => setModal("add-schedule")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          + 일정 추가
        </button>
      </div>
      <div className="space-y-3">
        {pagedSchedules.map((item) => {
          const d = parseLocalDate(item.date);
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-grey-3 rounded-xl px-5 py-4"
            >
              <div className="shrink-0 w-12 text-center">
                <p className="text-body-4 font-bold text-primary">{formatMonthDay(item.date)}</p>
                <p className="text-body-5 text-grey-6">{d ? getWeekdayLabel(d.getDay()) : ""}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                {item.memo && <p className="text-body-5 text-grey-6 mt-0.5">{item.memo}</p>}
              </div>
              <button
                onClick={() => handleDeleteSchedule(item.id)}
                className="text-body-5 text-grey-5 hover:text-red-500 transition-colors shrink-0"
              >
                삭제
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex-1" />
      <Pagination
        total={schedules.length}
        perPage={PAGE_SIZE}
        current={schedulePage}
        onChange={setSchedulePage}
      />

      {modal === "add-schedule" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">일정 추가</h3>
          <div className="space-y-4">
            <InputField
              label="날짜"
              type="date"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm((f) => ({ ...f, date: e.target.value }))}
              placeholder="03.15"
            />
            <InputField
              label="제목"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예) 새가족 모임"
            />
            <InputField
              label="시간 · 장소"
              value={scheduleForm.memo}
              onChange={(e) => setScheduleForm((f) => ({ ...f, memo: e.target.value }))}
              placeholder="예) 본당 · 14:00"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddSchedule}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              추가
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
```

`InputField`(`src/components/mypage/shared.jsx`)는 이미 `type` prop을 받으므로(기본값 `"text"`) `type="date"`를 넘기면 네이티브 날짜 입력이 된다 — `shared.jsx` 수정 불필요.

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/mypage/ScheduleTab.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 6: 커밋**

```bash
git add src/pages/MyPage/MyPage.jsx src/components/mypage/ScheduleTab.jsx src/components/mypage/ScheduleTab.test.jsx
git commit -m "feat: MyPage가 일정/기도/문의를 실API로 페칭하고 ScheduleTab이 실제 CRUD와 연동"
```

---

### Task 3: `PrayerTab.jsx` 재설계

**Files:**
- Modify: `src/components/mypage/PrayerTab.jsx`
- Test: `src/components/mypage/PrayerTab.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `addMyPrayer(churchId, {type, content})`.
- Produces: 없음.

- [ ] **Step 1: `PrayerTab.test.jsx` 작성 — 실패 확인용**

`src/components/mypage/PrayerTab.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import PrayerTab from "./PrayerTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const PRAYERS = [
  { id: 1, type: "기도", content: "건강을 위해 기도합니다", status: "답변 완료", createdAt: "2026-02-10T09:00:00" },
];

describe("PrayerTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("제목과 답변 텍스트를 표시하지 않는다", () => {
    renderWithChurch(<PrayerTab prayers={PRAYERS} setPrayers={() => {}} />);
    expect(screen.getByText("건강을 위해 기도합니다")).toBeInTheDocument();
    expect(screen.queryByText("답변:")).not.toBeInTheDocument();
  });

  it("신청 시 유형을 선택할 수 있고 addMyPrayer를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 2, type: "상담", content: "고민이 있습니다", status: "답변 대기", createdAt: "2026-03-15T09:00:00" } },
    });
    const setPrayers = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<PrayerTab prayers={PRAYERS} setPrayers={setPrayers} />);

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    // "상담" 버튼이 목록 위 필터 칩(전체/기도/상담)과 모달 안 유형 선택 버튼 두 곳에 렌더된다.
    // 모달은 JSX 트리 마지막에 조건부 렌더되므로 DOM 순서상 두 번째("상담" 필터 다음)가 모달 것이다.
    const typeButtons = screen.getAllByRole("button", { name: "상담" });
    await user.click(typeButtons[typeButtons.length - 1]);
    await user.type(screen.getByPlaceholderText("기도 제목을 간략히 작성해 주세요."), "고민이 있습니다");
    await user.click(screen.getByRole("button", { name: "신청" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/my/prayers", { type: "상담", content: "고민이 있습니다" }),
    );
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/mypage/PrayerTab.test.jsx`
Expected: FAIL — 현재 `PrayerTab.jsx`는 제목을 표시하고 답변을 보여주며, 유형 선택 없이 `type: "기도"`로 고정돼 있고 API 호출이 없다.

- [ ] **Step 3: `PrayerTab.jsx` 전체를 아래 내용으로 교체**

```jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMyPrayer } from "@/services/myPageService";
import { StatusBadge, Pagination, ModalOverlay } from "./shared";

const PRAYER_PAGE_SIZE = 4;
const PRAYER_TYPES = ["기도", "상담"];

export default function PrayerTab({ prayers, setPrayers }) {
  const { church } = useChurch();
  const [prayerForm, setPrayerForm] = useState({ type: "기도", content: "" });
  const [prayerFilter, setPrayerFilter] = useState("전체");
  const [prayerPage, setPrayerPage] = useState(1);
  const [modal, setModal] = useState(null);

  async function handleAddPrayer() {
    if (!prayerForm.content) return;
    const created = await addMyPrayer(church.id, prayerForm);
    setPrayers((prev) => [created, ...prev]);
    setPrayerForm({ type: "기도", content: "" });
    setModal(null);
  }

  function handlePrayerFilter(f) {
    setPrayerFilter(f);
    setPrayerPage(1);
  }

  const filteredPrayers =
    prayerFilter === "전체" ? prayers : prayers.filter((p) => p.type === prayerFilter);
  const pagedPrayers = filteredPrayers.slice(
    (prayerPage - 1) * PRAYER_PAGE_SIZE,
    prayerPage * PRAYER_PAGE_SIZE,
  );

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">기도 / 상담 내역</h2>
        <button
          onClick={() => setModal("add-prayer")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          신청하기
        </button>
      </div>
      <div className="flex gap-2 mb-5">
        {["전체", ...PRAYER_TYPES].map((f) => (
          <button
            key={f}
            onClick={() => handlePrayerFilter(f)}
            className={`text-body-5 rounded-full px-4 py-1.5 transition-colors ${
              prayerFilter === f ? "bg-primary text-white" : "bg-grey-2 text-grey-7 hover:bg-grey-3"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {pagedPrayers.map((item) => (
          <div key={item.id} className="border border-grey-3 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <span
                className={`text-body-5 rounded px-2 py-0.5 ${
                  item.type === "기도" ? "bg-grey-2 text-grey-7" : "bg-blue-1 text-primary"
                }`}
              >
                {item.type}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-body-5 text-grey-6">{item.createdAt?.slice(0, 10)}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <p className="text-body-5 text-grey-7 mt-2">{item.content}</p>
          </div>
        ))}
      </div>
      <Pagination
        total={filteredPrayers.length}
        perPage={PRAYER_PAGE_SIZE}
        current={prayerPage}
        onChange={setPrayerPage}
      />

      {modal === "add-prayer" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">기도 / 상담 신청하기</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-body-5 text-grey-7 mb-1">유형</label>
              <div className="flex gap-2">
                {PRAYER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPrayerForm((f) => ({ ...f, type: t }))}
                    className={`text-body-4 rounded-full px-5 py-2 transition-colors ${
                      prayerForm.type === t
                        ? "bg-primary text-white"
                        : "bg-grey-2 text-grey-7 hover:bg-grey-3"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-body-5 text-grey-7 mb-1">내용</label>
              <textarea
                value={prayerForm.content}
                onChange={(e) => setPrayerForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="기도 제목을 간략히 작성해 주세요."
                rows={4}
                className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddPrayer}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              신청
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/mypage/PrayerTab.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/mypage/PrayerTab.jsx src/components/mypage/PrayerTab.test.jsx
git commit -m "feat: PrayerTab이 유형 선택을 지원하고 실 API와 연동, 없는 제목/답변 표시 제거"
```

---

### Task 4: `InquiryTab.jsx` 재설계

**Files:**
- Modify: `src/components/mypage/InquiryTab.jsx`
- Test: `src/components/mypage/InquiryTab.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `addMyInquiry(churchId, {title, content})`.
- Produces: 없음.

- [ ] **Step 1: `InquiryTab.test.jsx` 작성 — 실패 확인용**

`src/components/mypage/InquiryTab.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import InquiryTab from "./InquiryTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const INQUIRIES = [
  {
    id: 1,
    title: "주소 변경 요청",
    content: "이사했습니다",
    status: "답변 완료",
    answer: "사무국 — 반영 완료했습니다.",
    createdAt: "2026-02-12T09:00:00",
  },
];

describe("InquiryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("answer 필드를 답변으로 표시한다", () => {
    renderWithChurch(<InquiryTab inquiries={INQUIRIES} setInquiries={() => {}} />);
    expect(screen.getByText("사무국 — 반영 완료했습니다.")).toBeInTheDocument();
  });

  it("문의를 등록하면 addMyInquiry를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id: 2,
          title: "새 문의",
          content: "내용입니다",
          status: "진행 중",
          answer: null,
          createdAt: "2026-03-15T09:00:00",
        },
      },
    });
    const setInquiries = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<InquiryTab inquiries={INQUIRIES} setInquiries={setInquiries} />);

    await user.click(screen.getByRole("button", { name: "문의하기" }));
    await user.type(screen.getByPlaceholderText("문의 제목을 입력해 주세요."), "새 문의");
    await user.type(screen.getByPlaceholderText("자세히 내용을 작성하여 주시면 더 도움이 됩니다."), "내용입니다");
    await user.click(screen.getByRole("button", { name: "접수" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/my/inquiries", { title: "새 문의", content: "내용입니다" }),
    );
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/mypage/InquiryTab.test.jsx`
Expected: FAIL — 현재 `InquiryTab.jsx`는 `item.reply`를 읽고(더미 항목엔 `answer`가 아니라 `reply` 필드가 있어야 렌더됨) API 호출이 없다.

- [ ] **Step 3: `InquiryTab.jsx`를 아래와 같이 수정**

`src/components/mypage/InquiryTab.jsx`의 import 블록(현재 1-6번째 줄)을 아래로 교체:

```js
// 변경 전
import { useState } from "react";
import MailIcon from "@/assets/icon-svg/mypage-mail.svg";
import { MOCK_USER } from "./mockData";
import { StatusBadge, Pagination, InputField, ReadonlyField, IconBack } from "./shared";
```

```js
// 변경 후
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMyInquiry } from "@/services/myPageService";
import MailIcon from "@/assets/icon-svg/mypage-mail.svg";
import { MOCK_USER } from "./mockData";
import { StatusBadge, Pagination, InputField, ReadonlyField, IconBack } from "./shared";
```

`InquiryTab` 함수 본문 시작부(현재 12-32번째 줄)를 아래로 교체:

```js
// 변경 전
export default function InquiryTab({ inquiries, setInquiries }) {
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryWriteMode, setInquiryWriteMode] = useState(false);

  function handleAddInquiry() {
    if (!inquiryForm.title) return;
    setInquiries((prev) => [
      {
        id: Date.now(),
        title: inquiryForm.title,
        date: "2026.03.15",
        status: "진행 중",
        reply: null,
      },
      ...prev,
    ]);
    setInquiryForm({ title: "", content: "" });
    setInquiryWriteMode(false);
    setInquiryPage(1);
  }
```

```js
// 변경 후
export default function InquiryTab({ inquiries, setInquiries }) {
  const { church } = useChurch();
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryWriteMode, setInquiryWriteMode] = useState(false);

  async function handleAddInquiry() {
    if (!inquiryForm.title) return;
    const created = await addMyInquiry(church.id, inquiryForm);
    setInquiries((prev) => [created, ...prev]);
    setInquiryForm({ title: "", content: "" });
    setInquiryWriteMode(false);
    setInquiryPage(1);
  }
```

목록 렌더링 부분(현재 52-72번째 줄, `pagedInquiries.map` 블록)에서 `item.date`→`item.createdAt?.slice(0,10)`, `item.reply`→`item.answer`로 교체:

```jsx
// 변경 전
            {pagedInquiries.map((item) => (
              <div key={item.id} className="border border-grey-3 rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-body-5 text-grey-6">{item.date}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                {item.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-grey-3 flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">
                      <IconMail />
                    </span>
                    <p className="text-body-5 text-grey-6">{item.reply}</p>
                  </div>
                )}
              </div>
            ))}
```

```jsx
// 변경 후
            {pagedInquiries.map((item) => (
              <div key={item.id} className="border border-grey-3 rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-body-5 text-grey-6">{item.createdAt?.slice(0, 10)}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                {item.answer && (
                  <div className="mt-3 pl-4 border-l-2 border-grey-3 flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">
                      <IconMail />
                    </span>
                    <p className="text-body-5 text-grey-6">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/mypage/InquiryTab.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/mypage/InquiryTab.jsx src/components/mypage/InquiryTab.test.jsx
git commit -m "feat: InquiryTab이 실 API와 연동(answer 필드 반영)"
```

---

### Task 5: `InfoTab.jsx` — 회원탈퇴 실API 연동

**Files:**
- Modify: `src/components/mypage/InfoTab.jsx`
- Test: `src/components/mypage/InfoTab.test.jsx` (신규)

**Interfaces:**
- Consumes: Task 1의 `withdrawAccount(churchId)`.
- Produces: 없음.

- [ ] **Step 1: `InfoTab.test.jsx` 작성 — 실패 확인용**

실제 파일 구조(확인 완료): 페이지 본문의 "회원 탈퇴" 버튼(`onClick={() => setModal("withdraw-confirm")}`)이 확인 모달을 열고, 그 모달 안의 "탈퇴 신청" 버튼(현재 `onClick={() => setModal("withdraw-done")}`)이 실제 탈퇴를 트리거해야 하는 지점이다. `src/components/mypage/InfoTab.test.jsx` 전체 내용:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import InfoTab from "./InfoTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("InfoTab — 회원탈퇴", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
  });

  it("탈퇴를 확정하면 withdrawAccount를 호출하고 로그아웃한다", async () => {
    api.delete.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<InfoTab userForm={{}} setUserForm={() => {}} onNavigateDept={() => {}} />, {
      withAuth: true,
    });

    await user.click(screen.getByRole("button", { name: "회원 탈퇴" }));
    await user.click(screen.getByRole("button", { name: "탈퇴 신청" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/my/account"));
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(localStorage.getItem("user")).toBeNull();
  });

  it("탈퇴 API가 실패하면 에러 메시지를 보여주고 로그아웃하지 않는다", async () => {
    api.delete.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<InfoTab userForm={{}} setUserForm={() => {}} onNavigateDept={() => {}} />, {
      withAuth: true,
    });

    await user.click(screen.getByRole("button", { name: "회원 탈퇴" }));
    await user.click(screen.getByRole("button", { name: "탈퇴 신청" }));

    expect(
      await screen.findByText("탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(localStorage.getItem("user")).not.toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm vitest run src/components/mypage/InfoTab.test.jsx`
Expected: FAIL — 현재 탈퇴 흐름은 API 호출 없이 바로 "탈퇴 신청이 접수되었습니다" 안내로 넘어간다.

- [ ] **Step 3: `InfoTab.jsx` 수정**

파일 상단 import 블록에 아래 3줄을 추가한다(기존 `import { useState } from "react";` 다음 줄):

```js
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import { withdrawAccount } from "@/services/myPageService";
```

컴포넌트 함수 본문 상단(다른 `useState` 선언들 근처)에 아래를 추가:

```jsx
const { logout } = useAuth();
const { church } = useChurch();
const [withdrawError, setWithdrawError] = useState("");

async function handleWithdraw() {
  setWithdrawError("");
  try {
    await withdrawAccount(church.id);
    setModal("withdraw-done");
  } catch {
    setWithdrawError("탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
```

`withdraw-confirm` 모달 전체(현재 146-173번째 줄 부근)를 아래로 교체 — 버튼 핸들러를 `handleWithdraw`로 바꾸고, "관리자의 검토를 거쳐 최종 처리됩니다"라는 실제와 다른 안내 문구를 즉시-처리 사실에 맞게 바꾸고, 에러 메시지 노출을 추가한다:

```jsx
// 변경 전
      {modal === "withdraw-confirm" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              회원 탈퇴를 진행하시겠습니까?
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              탈퇴를 진행하면 계정 정보가 삭제되며, 일부 데이터는 복구할 수 없습니다.
              <br />
              탈퇴 신청 후 관리자의 검토를 거쳐 최종 처리됩니다.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModal(null)}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setModal("withdraw-done")}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
              >
                탈퇴 신청
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
```

```jsx
// 변경 후
      {modal === "withdraw-confirm" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              회원 탈퇴를 진행하시겠습니까?
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              탈퇴를 진행하면 계정 정보가 즉시 삭제되며, 복구할 수 없습니다.
            </p>
            {withdrawError && <p className="text-body-5 text-red-500 mb-4">{withdrawError}</p>}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModal(null)}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
              >
                탈퇴 신청
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
```

`withdraw-done` 모달 전체(현재 175-190번째 줄 부근)를 아래로 교체 — "30일 소요" 같은 가짜 대기 절차 문구를 즉시완료 문구로 바꾸고, 확인 버튼이 `logout`을 호출하도록 바꾼다:

```jsx
// 변경 전
      {modal === "withdraw-done" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              탈퇴 신청이 접수되었습니다.
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              검토 완료 후 탈퇴가 최종 처리되며, 처리까지는 약 30일 정도 소요됩니다.
              <br />
              처리 전까지 서비스 이용이 제한될 수 있습니다.
            </p>
            <button
              onClick={() => setModal(null)}
              className="bg-primary text-white rounded-full px-8 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </ModalOverlay>
      )}
```

```jsx
// 변경 후
      {modal === "withdraw-done" && (
        <ModalOverlay onClose={logout}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              회원 탈퇴가 완료되었습니다.
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              그동안 ToGather를 이용해 주셔서 감사합니다.
            </p>
            <button
              onClick={logout}
              className="bg-primary text-white rounded-full px-8 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </ModalOverlay>
      )}
```

(`ModalOverlay`의 `onClose`도 `logout`으로 바꾼 이유: 탈퇴가 이미 완료된 뒤라 배경 클릭으로 닫아도 로그인 세션을 계속 살려두면 안 된다 — 어떤 방식으로 닫히든 로그아웃돼야 한다.)

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm vitest run src/components/mypage/InfoTab.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: 전체 스위트 + lint 확인**

Run: `pnpm test:run && pnpm run lint`
Expected: 모든 테스트 통과, lint 경고 없음.

(로컬 `.env`에 `VITE_USE_DUMMY=false`가 설정돼 있으면 이 사이클과 무관한 도메인 테스트가 실패할 수 있다 — 그 경우 `VITE_USE_DUMMY=true pnpm test:run`으로 override해서 재확인한다.)

- [ ] **Step 6: 커밋**

```bash
git add src/components/mypage/InfoTab.jsx src/components/mypage/InfoTab.test.jsx
git commit -m "feat: InfoTab 회원탈퇴가 실API와 연동되고 즉시완료 문구로 수정"
```
