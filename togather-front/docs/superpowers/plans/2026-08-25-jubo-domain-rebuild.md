# 주보(Jubo) 도메인 재구축 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스마트 주보 6개 공개 탭(예배/봉사/예물/후원/구역/섬기는 분들)을 정적 설정 읽기에서 실제 백엔드 API로 재배선하고, 관리자 주보 편집 화면(`JuboManage.jsx`)을 백엔드 계약에 맞게 전면 재작성한다.

**Architecture:** `juboService.js`를 `isDummy("jubo")` 게이트로 전면 재작성하고, 6개 공개 탭 컴포넌트는 `useFetch` 훅으로 실API를 호출하도록 재배선한다(로딩/에러/재시도 포함). 관리자 화면은 "생성→6개 섹션 카드 편집(직전 발행본으로 프리필)→섹션별 즉시 저장→발행" 흐름으로 재작성하며, 6개 섹션 편집 UI는 `src/components/admin/jubo/` 아래 독립 컴포넌트로 분리해 각자 프리필 조회+로컬 편집 상태+저장 호출을 자체 관리한다.

**Tech Stack:** React 19, `useFetch`(`src/hooks/useFetch.js`, 이미 존재하는 범용 fetch 훅), Axios, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-25-jubo-domain-rebuild-design.md`

## Global Constraints

- 백엔드(`/Users/myewon/Desktop/back`) 코드는 절대 수정하지 않는다 — 읽기 전용 참고만.
- 새 API 연동은 전부 `isDummy("jubo")` 패턴을 쓴다(레거시 `USE_DUMMY` 전역 플래그 금지).
- 이번 사이클 범위는 예배·봉사·예물·후원·구역·섬기는 분들 6개 탭 + 표지의 호수/날짜만이다. 표지 사진, 소식, 오시는 길, 말씀, 헌금, 기도제목은 손대지 않는다(대응 백엔드 섹션 없음).
- 관리자 초안(juboId) 유실 제약은 그대로 두고 UI 경고 문구로만 안내한다 — 이 제약을 우회하는 로직(예: localStorage 백업)을 만들지 않는다.
- 예배 탭: 사이드바에서 예배를 고르면 그 예배의 순서표만 보이도록 만든다(1부/2부 나란히 표시하던 기존 레이아웃은 없앤다).
- 나머지 5개 탭(봉사/예물/후원/구역/섬기는 분들)은 기존 공개 컴포넌트가 렌더링하는 필드 모양을 그대로 API 계약으로 삼는다 — UI 레이아웃을 바꾸지 않는다.
- 테스트는 `vi.mock("@/services/api", ...)` 전체 모킹 + `isDummy: () => false` 패턴을 쓴다(레거시 `USE_DUMMY` 환경변수 의존 금지).
- 각 공개 컴포넌트의 조회 실패 시 "불러오지 못했습니다" 안내 + "다시 시도" 버튼을 반드시 넣는다.
- 각 관리자 섹션 저장 버튼은 저장 중 비활성화("저장 중..." 라벨)로 중복 제출을 막는다.

---

### Task 1: `juboService.js` 재작성 + 더미 데이터 갱신

**Files:**
- Modify: `src/services/juboService.js` (전체 재작성)
- Modify: `src/data/dummy/jubo.js` (전체 재작성, `DUMMY_JUBO_TABS`는 그대로 유지)
- Create: `src/services/juboService.test.js`

**Interfaces:**
- Produces: `getJuboInfo(churchId)`, `getWorshipServices(churchId)`, `getWorshipOrder(churchId)`, `getVolunteer(churchId)`, `getOffering(churchId)`, `getSupport(churchId)`, `getDistricts(churchId)`, `getMinisters(churchId)`, `createJuboIssue(churchId, {issueNo, juboDate})`, `updateJuboSection(churchId, juboId, sectionType, content)`, `publishJubo(churchId, juboId)` — Task 2~7이 전부 이 함수들을 그대로 가져다 쓴다.

- [ ] **Step 1: `src/data/dummy/jubo.js`를 새 데이터 모양으로 전체 교체**

```js
/** @type {import('@/services/juboService').JuboTab[]} */
export const DUMMY_JUBO_TABS = [
  "표지",
  "예배",
  "소식",
  "봉사",
  "예물",
  "후원",
  "구역",
  "섬기는 분들",
  "오시는 길",
];

export const DUMMY_JUBO_INFO = {
  issueNo: "제10-7",
  date: "2026년 2월 15일",
};

export const DUMMY_WORSHIP_SERVICES = [
  { label: "주일 오전예배", time: "오전 9:00" },
  { label: "주일 오후예배", time: "오후 2:00" },
  { label: "새벽기도회", time: "오전 5:30" },
  { label: "수요기도회", time: "오전 10:00" },
  { label: "금요기도회", time: "오후 8:00" },
];

export const DUMMY_WORSHIP_ORDER = {
  "주일 오전예배": [
    { role: "예배 부름", name: "성가대" },
    { role: "경배와 찬양", name: "찬양팀" },
    { role: "사도신경", name: "다같이" },
    { role: "찬 송", name: "20장 / 큰 영광 중에 계신 주" },
    { role: "대표기도", name: "OOO집사" },
    { role: "성경봉독", name: "로마서 2장 27절" },
    { role: "설 교", name: "OOO목사" },
    { role: "헌 금", name: "331장 / 영광을 받으신 만왕의 주여" },
    { role: "헌금기도", name: "성가대" },
    { role: "교회소식", name: "성가대" },
    { role: "찬 양", name: "함께" },
    { role: "강복선언", name: "성가대" },
  ],
};

export const DUMMY_VOLUNTEER = [
  { role: "예배인도", part1: "000", part2: "000" },
  { role: "대표기도", part1: "000", part2: "000" },
  { role: "설교", part1: "000목사", part2: "000목사" },
  { role: "성경봉독", part1: "000", part2: "000" },
  { role: "찬양대지휘", part1: "000", part2: "000" },
  { role: "반주", part1: "000", part2: "000" },
  { role: "영상", part1: "000", part2: "000" },
  { role: "음향", part1: "000", part2: "000" },
  { role: "안내(남)", part1: "000, 000", part2: "000, 000" },
  { role: "안내(여)", part1: "000, 000", part2: "000, 000" },
  { role: "주보", part1: "000", part2: "000" },
  { role: "방송", part1: "000", part2: "000" },
];

export const DUMMY_OFFERING = [
  { title: "십일조", items: ["OOO 외 00명"] },
  { title: "감사헌금", items: ["OOO 외 00명", "OOO 외 00명"] },
  { title: "건축헌금", items: ["OOO 외 00명"] },
  { title: "선교헌금", items: ["OOO 외 00명"] },
  { title: "기타헌금", items: ["OOO 외 00명"] },
];

export const DUMMY_SUPPORT = [
  { organization: "베트남 | 호치민", target: "선교사님 성함", region: "후원구역명" },
  { organization: "일본 | 동경", target: "선교사님 성함", region: "후원구역명" },
  { organization: "말레이시아 | 쿠알라룸푸르", target: "선교사님 성함", region: "후원구역명" },
];

export const DUMMY_DISTRICTS = [
  { name: "1구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { name: "2구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { name: "3구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
];

export const DUMMY_MINISTERS = [
  {
    title: "교역자",
    items: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
  },
  {
    title: "장 로",
    items: ["시무장로 | OOO", "시무장로 | OOO", "협동장로 | OOO", "사역장로 | OOO"],
  },
  { title: "찬 양", items: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"] },
];
```

- [ ] **Step 2: `src/services/juboService.js`를 아래로 전체 교체**

```js
import api, { isDummy } from "./api";
import {
  DUMMY_JUBO_INFO,
  DUMMY_WORSHIP_SERVICES,
  DUMMY_WORSHIP_ORDER,
  DUMMY_VOLUNTEER,
  DUMMY_OFFERING,
  DUMMY_SUPPORT,
  DUMMY_DISTRICTS,
  DUMMY_MINISTERS,
} from "@/data/dummy/jubo";

/**
 * @typedef {{ issueNo: string, date: string }} JuboInfo
 * @typedef {{ label: string, time: string }} WorshipService
 * @typedef {{ role: string, name: string }} OrderRow
 * @typedef {Record<string, OrderRow[]>} WorshipOrderMap
 * @typedef {{ role: string, part1: string, part2: string }} VolunteerRow
 * @typedef {{ title: string, items: string[] }} TitledGroup
 * @typedef {{ organization: string, target: string, region: string }} SupportRow
 * @typedef {{ name: string, location: string, time: string, leader: string }} DistrictRow
 * @typedef {"WORSHIP_SERVICES"|"WORSHIP_ORDER"|"VOLUNTEER"|"OFFERING"|"SUPPORT"|"DISTRICTS"|"MINISTERS"} JuboSectionType
 */

/** 현재 발행된 주보의 호수/날짜 @returns {Promise<JuboInfo>} */
export async function getJuboInfo(churchId) {
  if (isDummy("jubo")) return DUMMY_JUBO_INFO;
  const res = await api.get(`/churches/${churchId}/jubo/current`);
  return res.data.data;
}

/** @returns {Promise<WorshipService[]>} */
export async function getWorshipServices(churchId) {
  if (isDummy("jubo")) return DUMMY_WORSHIP_SERVICES;
  const res = await api.get(`/churches/${churchId}/jubo/worship-services`);
  return res.data.data;
}

/** serviceType 없이 호출해 전체 맵을 받는다 — 클라이언트에서 라벨로 조회한다 @returns {Promise<WorshipOrderMap>} */
export async function getWorshipOrder(churchId) {
  if (isDummy("jubo")) return DUMMY_WORSHIP_ORDER;
  const res = await api.get(`/churches/${churchId}/jubo/worship-order`);
  return res.data.data;
}

/** @returns {Promise<VolunteerRow[]>} */
export async function getVolunteer(churchId) {
  if (isDummy("jubo")) return DUMMY_VOLUNTEER;
  const res = await api.get(`/churches/${churchId}/jubo/volunteer`);
  return res.data.data;
}

/** @returns {Promise<TitledGroup[]>} */
export async function getOffering(churchId) {
  if (isDummy("jubo")) return DUMMY_OFFERING;
  const res = await api.get(`/churches/${churchId}/jubo/offering`);
  return res.data.data;
}

/** @returns {Promise<SupportRow[]>} */
export async function getSupport(churchId) {
  if (isDummy("jubo")) return DUMMY_SUPPORT;
  const res = await api.get(`/churches/${churchId}/jubo/support`);
  return res.data.data;
}

/** @returns {Promise<DistrictRow[]>} */
export async function getDistricts(churchId) {
  if (isDummy("jubo")) return DUMMY_DISTRICTS;
  const res = await api.get(`/churches/${churchId}/jubo/districts`);
  return res.data.data;
}

/** @returns {Promise<TitledGroup[]>} */
export async function getMinisters(churchId) {
  if (isDummy("jubo")) return DUMMY_MINISTERS;
  const res = await api.get(`/churches/${churchId}/jubo/ministers`);
  return res.data.data;
}

/**
 * 주보 발행 초안 생성 (관리자)
 * @param {string} churchId
 * @param {{ issueNo: string, juboDate: string }} payload - juboDate는 "YYYY-MM-DD"
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function createJuboIssue(churchId, payload) {
  if (isDummy("jubo")) return { id: `dummy-${Date.now()}`, ...payload, published: false };
  const res = await api.post(`/church/admin/jubo`, payload);
  return res.data.data;
}

/**
 * 섹션 저장 (관리자) — content는 자유형식 JSON, 섹션 타입별 정확한 모양은 juboService.test.js와
 * 각 SectionEditor 컴포넌트를 참고한다.
 * @param {string} churchId
 * @param {number|string} juboId
 * @param {JuboSectionType} sectionType
 * @param {object} content
 */
export async function updateJuboSection(churchId, juboId, sectionType, content) {
  if (isDummy("jubo")) return;
  await api.put(`/church/admin/jubo/${juboId}/sections/${sectionType}`, content);
}

/**
 * 주보 발행 (관리자)
 * @param {string} churchId
 * @param {number|string} juboId
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function publishJubo(churchId, juboId) {
  if (isDummy("jubo")) return { id: juboId, issueNo: "", juboDate: "", published: true };
  const res = await api.post(`/church/admin/jubo/${juboId}/publish`);
  return res.data.data;
}
```

- [ ] **Step 3: `src/services/juboService.test.js` 작성**

```js
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import {
  getJuboInfo,
  getWorshipServices,
  getWorshipOrder,
  getVolunteer,
  getOffering,
  getSupport,
  getDistricts,
  getMinisters,
  createJuboIssue,
  updateJuboSection,
  publishJubo,
} from "./juboService";

describe("juboService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getJuboInfo는 GET /churches/{churchId}/jubo/current를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
    const result = await getJuboInfo("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/current");
    expect(result).toEqual({ issueNo: "제10-7", date: "2026년 2월 15일" });
  });

  it("getWorshipServices는 GET .../worship-services를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [{ label: "주일 오전예배", time: "오전 9:00" }] } });
    const result = await getWorshipServices("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/worship-services");
    expect(result).toEqual([{ label: "주일 오전예배", time: "오전 9:00" }]);
  });

  it("getWorshipOrder는 serviceType 없이 GET .../worship-order를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: { "주일 오전예배": [] } } });
    await getWorshipOrder("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/worship-order");
  });

  it("getVolunteer는 GET .../volunteer를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getVolunteer("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/volunteer");
  });

  it("getOffering는 GET .../offering을 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getOffering("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/offering");
  });

  it("getSupport는 GET .../support를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getSupport("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/support");
  });

  it("getDistricts는 GET .../districts를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getDistricts("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/districts");
  });

  it("getMinisters는 GET .../ministers를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getMinisters("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/ministers");
  });

  it("createJuboIssue는 POST /church/admin/jubo를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 1, issueNo: "제10-8", juboDate: "2026-06-01", published: false } },
    });
    const result = await createJuboIssue("church-1", { issueNo: "제10-8", juboDate: "2026-06-01" });
    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo", {
      issueNo: "제10-8",
      juboDate: "2026-06-01",
    });
    expect(result).toEqual({ id: 1, issueNo: "제10-8", juboDate: "2026-06-01", published: false });
  });

  it("updateJuboSection은 PUT /church/admin/jubo/{juboId}/sections/{type}을 호출한다", async () => {
    api.put.mockResolvedValue({ data: null });
    await updateJuboSection("church-1", 1, "VOLUNTEER", [{ role: "대표기도" }]);
    expect(api.put).toHaveBeenCalledWith("/church/admin/jubo/1/sections/VOLUNTEER", [
      { role: "대표기도" },
    ]);
  });

  it("publishJubo는 POST /church/admin/jubo/{juboId}/publish를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 1, issueNo: "제10-8", juboDate: "2026-06-01", published: true } },
    });
    const result = await publishJubo("church-1", 1);
    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo/1/publish");
    expect(result.published).toBe(true);
  });
});
```

- [ ] **Step 4: 테스트 실행**

Run: `pnpm vitest run src/services/juboService.test.js`
Expected: 11개 테스트 전부 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/services/juboService.js src/services/juboService.test.js src/data/dummy/jubo.js
git commit -m "feat: juboService를 백엔드 계약에 맞게 재작성(isDummy 게이트 전환)"
```

---

### Task 2: 예배 탭 재배선 (`Worship.jsx`)

**Files:**
- Modify: `src/components/jubo/Worship.jsx` (전체 재작성)
- Modify: `src/components/jubo/Worship.test.jsx` (전체 재작성)
- Modify: `src/config/jubo.config.js` (`worshipServices`, `worshipOrder`, `worshipScheduleSummary` 키 제거)

**Interfaces:**
- Consumes: `getWorshipServices(churchId)`, `getWorshipOrder(churchId)` (Task 1), `useFetch` (`src/hooks/useFetch.js`, 기존), `useChurch` (`src/contexts/ChurchContext.jsx`, 기존)

- [ ] **Step 1: `src/config/jubo.config.js`에서 `worshipServices`/`worshipOrder`/`worshipScheduleSummary` 세 블록을 제거**

`// ── 예배 순서 ─────────────────────────────────────────` 주석부터 `// 예배 시간 요약 (주보 우측 사이드 표시용)` 블록 끝까지(= `// ── 소식 ─────────────────────────────────────────────` 주석 직전까지) 통째로 삭제한다.

- [ ] **Step 2: `src/components/jubo/Worship.jsx`를 아래로 전체 교체**

```jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";

export default function Worship() {
  const { church } = useChurch();
  const { data: services = [], loading: servicesLoading } = useFetch(
    () => getWorshipServices(church.id),
    [church.id],
    [],
  );
  const { data: orderMap = {}, loading: orderLoading } = useFetch(
    () => getWorshipOrder(church.id),
    [church.id],
    {},
  );
  const [selected, setSelected] = useState(null);

  const activeLabel = selected ?? services[0]?.label ?? null;
  const order = activeLabel ? (orderMap[activeLabel] ?? []) : [];
  const loading = servicesLoading || orderLoading;

  return (
    <div className="flex flex-col md:flex-row border border-bluegrey-2 rounded-xl overflow-hidden">
      {/* 사이드바 */}
      <div className="md:w-36 md:shrink-0 border-b md:border-b-0 md:border-r border-bluegrey-2 bg-bluegrey-1 py-3 flex md:flex-col overflow-x-auto">
        {services.map(({ label }) => (
          <button
            key={label}
            onClick={() => setSelected(label)}
            className={`w-full text-left px-3 py-2 text-caption transition-colors shrink-0 ${
              activeLabel === label
                ? "bg-primary text-white font-semibold"
                : "text-grey-9 hover:bg-bluegrey-2 font-medium"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 예배 순서 */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex items-baseline gap-2 mb-5">
          <h3 className="text-body-2 font-bold text-grey-11">예배 순서</h3>
          {activeLabel && <p className="text-body-5 text-grey-6">{activeLabel}</p>}
        </div>
        <div className="border-t border-grey-11 mb-1" />
        {loading ? (
          <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
        ) : order.length === 0 ? (
          <p className="text-center text-caption text-grey-5 py-10">예배 순서가 없습니다.</p>
        ) : (
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-bluegrey-2">
                <th className="text-left py-2.5 px-3 text-grey-7 font-semibold w-1/3">역할</th>
                <th className="py-2.5 px-3 text-grey-7 font-semibold text-center">담당자</th>
              </tr>
            </thead>
            <tbody>
              {order.map(({ role, name }, i) => (
                <tr key={i} className="border-b border-grey-3">
                  <td className="py-3 px-3 text-grey-9 font-medium tracking-widest">{role}</td>
                  <td className="py-3 px-3 text-grey-7 text-center whitespace-pre-line">{name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 예배 및 모임 안내 */}
      <div className="md:w-44 md:shrink-0 border-t md:border-t-0 md:border-l border-bluegrey-2 p-4 md:p-5">
        <h4 className="text-body-5 font-bold text-grey-10 mb-4">예배 및 모임 안내</h4>
        {services.map(({ label, time }) => (
          <div
            key={label}
            className="flex justify-between items-start py-2.5 border-b border-grey-3 last:border-0"
          >
            <span className="text-caption text-grey-8 leading-snug">{label}</span>
            <span className="text-caption text-grey-10 font-semibold text-right leading-snug">
              {time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `src/components/jubo/Worship.test.jsx`를 아래로 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Worship from "./Worship";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SERVICES = [
  { label: "주일 오전예배", time: "오전 9:00" },
  { label: "수요예배", time: "오전 11:00" },
];
const ORDER_MAP = {
  "주일 오전예배": [{ role: "예배 부름", name: "성가대" }],
  수요예배: [{ role: "말씀", name: "김영수 목사" }],
};

describe("Worship — 예배", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes("worship-services")) return Promise.resolve({ data: { data: SERVICES } });
      if (url.includes("worship-order")) return Promise.resolve({ data: { data: ORDER_MAP } });
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
  });

  it("첫 예배의 순서표를 기본으로 렌더한다", async () => {
    renderWithChurch(<Worship />);
    expect(await screen.findByText("예배 부름")).toBeInTheDocument();
    expect(screen.getByText("성가대")).toBeInTheDocument();
  });

  it("사이드바에서 다른 예배를 선택하면 그 예배의 순서표로 바뀐다", async () => {
    renderWithChurch(<Worship />);
    await screen.findByText("예배 부름");

    fireEvent.click(screen.getByRole("button", { name: "수요예배" }));

    expect(await screen.findByText("말씀")).toBeInTheDocument();
    expect(screen.getByText("김영수 목사")).toBeInTheDocument();
    expect(screen.queryByText("예배 부름")).not.toBeInTheDocument();
  });

  it("예배 및 모임 안내 패널에 전체 예배 목록과 시간을 렌더한다", async () => {
    renderWithChurch(<Worship />);
    await screen.findByText("예배 부름");
    expect(screen.getByText("오전 9:00")).toBeInTheDocument();
    expect(screen.getByText("오전 11:00")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 테스트 실행**

Run: `pnpm vitest run src/components/jubo/Worship.test.jsx`
Expected: 3개 테스트 전부 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/components/jubo/Worship.jsx src/components/jubo/Worship.test.jsx src/config/jubo.config.js
git commit -m "feat: 예배 탭이 예배별 순서표를 실API로 보여주도록 재배선"
```

---

### Task 3: 봉사/예물/후원/구역/섬기는 분들 5개 탭 일괄 재배선

동일한 패턴(정적 읽기 → `useFetch` + 로딩/에러/재시도)이 반복되므로 5개 파일을 한 태스크로 묶는다.

**Files:**
- Modify: `src/components/jubo/Service.jsx`, `Service.test.jsx`
- Modify: `src/components/jubo/Offering.jsx`, `Offering.test.jsx`
- Modify: `src/components/jubo/Support.jsx`, `Support.test.jsx`
- Modify: `src/components/jubo/District.jsx`, `District.test.jsx`
- Modify: `src/components/jubo/Ministers.jsx`, `Ministers.test.jsx`
- Modify: `src/config/jubo.config.js` (`serviceRoles`, `offering`, `support`, `districts`, `ministers` 키 제거)

**Interfaces:**
- Consumes: `getVolunteer`/`getOffering`/`getSupport`/`getDistricts`/`getMinisters` (Task 1), `useFetch`, `useChurch`

- [ ] **Step 1: `src/config/jubo.config.js`에서 `serviceRoles`, `offering`, `support`, `districts`, `ministers` 다섯 블록을 제거**

각 블록은 `// ── 봉사 ─────`, `// ── 예물 ─────`, `// ── 후원 ─────`, `// ── 구역 ─────`, `// ── 섬기는 분들 ───` 주석으로 시작해 다음 섹션 주석 직전까지다. 다섯 블록 전부 삭제한다(`// ── 말씀 ─────` 블록은 이번 태스크 범위 밖이므로 그대로 둔다).

- [ ] **Step 2: `src/components/jubo/Service.jsx` 전체 교체**

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getVolunteer } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function Service() {
  const { church } = useChurch();
  const {
    data: serviceRoles = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getVolunteer(church.id), [church.id], []);

  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      >
        다음 주 봉사 안내
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">봉사 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">구분</th>
              <th className="text-center py-2 px-4 text-grey-7 font-semibold">1부</th>
              <th className="text-center py-2 px-4 text-grey-7 font-semibold">2부</th>
            </tr>
          </thead>
          <tbody>
            {serviceRoles.map(({ role, part1, part2 }) => (
              <tr key={role} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-8">{role}</td>
                <td className="py-3 px-4 text-center text-grey-9">{part1}</td>
                <td className="py-3 px-4 text-center text-grey-9">{part2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 3: `src/components/jubo/Service.test.jsx` 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Service from "./Service";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const ROLES = [
  { role: "예배인도", part1: "000", part2: "000" },
  { role: "설교", part1: "000목사", part2: "000목사" },
];

describe("Service — 봉사", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 봉사 역할 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: ROLES } });
    renderWithChurch(<Service />);
    for (const { role } of ROLES) {
      expect(await screen.findByText(role)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Service />);
    expect(await screen.findByText("봉사 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: ROLES } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("예배인도")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: `src/components/jubo/Offering.jsx` 전체 교체**

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getOffering } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function Offering() {
  const { church } = useChurch();
  const {
    data: offering = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getOffering(church.id), [church.id], []);

  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        }
      >
        향기로운 예물
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">예물 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <table className="w-full text-caption mt-1">
          {offering.map(({ title, items }) => (
            <tbody key={title}>
              <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
                <td colSpan={2} className="py-2 px-4 font-semibold text-grey-8">
                  {title}
                </td>
              </tr>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-grey-3">
                  <td className="py-3 px-4 text-grey-7">{item}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 5: `src/components/jubo/Offering.test.jsx` 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Offering from "./Offering";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const OFFERING = [
  { title: "십일조", items: ["OOO 외 00명"] },
  { title: "감사헌금", items: ["OOO 외 00명"] },
];

describe("Offering — 예물", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 예물 항목 제목을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: OFFERING } });
    renderWithChurch(<Offering />);
    for (const { title } of OFFERING) {
      expect(await screen.findByText(title)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Offering />);
    expect(await screen.findByText("예물 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: OFFERING } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("십일조")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: `src/components/jubo/Support.jsx` 전체 교체**

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getSupport } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function Support() {
  const { church } = useChurch();
  const {
    data: support = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getSupport(church.id), [church.id], []);

  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        }
      >
        우리 교회가 돕고 있는 곳
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">후원 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <table className="w-full text-body-4 mt-1 border-collapse">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="py-3 px-6 text-grey-7 font-semibold text-center">기관</th>
              <th className="py-3 px-6 text-grey-7 font-semibold text-center">대상</th>
              <th className="py-3 px-6 text-grey-7 font-semibold text-center">후원구역</th>
            </tr>
          </thead>
          <tbody>
            {support.map(({ organization, target, region }, i) => (
              <tr key={i} className="border-b border-grey-3 last:border-b-0">
                <td className="py-5 px-6 text-grey-9 text-center">{organization}</td>
                <td className="py-5 px-6 text-grey-7 text-center">{target}</td>
                <td className="py-5 px-6 text-grey-7 text-center">{region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 7: `src/components/jubo/Support.test.jsx` 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Support from "./Support";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SUPPORT = [
  { organization: "베트남 | 호치민", target: "선교사님 성함", region: "후원구역명" },
  { organization: "일본 | 동경", target: "선교사님 성함", region: "후원구역명" },
];

describe("Support — 후원", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 후원 기관 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: SUPPORT } });
    renderWithChurch(<Support />);
    for (const { organization } of SUPPORT) {
      expect(await screen.findByText(organization)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Support />);
    expect(await screen.findByText("후원 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: SUPPORT } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("베트남 | 호치민")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: `src/components/jubo/District.jsx` 전체 교체**

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getDistricts } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function District() {
  const { church } = useChurch();
  const {
    data: districts = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getDistricts(church.id), [church.id], []);

  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        }
      >
        구역 모임
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">구역 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">구역</th>
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">모임 장소</th>
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">모임 시간</th>
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">구역장</th>
            </tr>
          </thead>
          <tbody>
            {districts.map(({ name, location, time, leader }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-4 px-4 text-grey-9 font-semibold text-center">{name}</td>
                <td className="py-4 px-4 text-grey-7 text-center">{location}</td>
                <td className="py-4 px-4 text-grey-7 text-center">{time}</td>
                <td className="py-4 px-4 text-grey-7 text-center">{leader}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 9: `src/components/jubo/District.test.jsx` 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import District from "./District";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const DISTRICTS = [
  { name: "1구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { name: "2구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
];

describe("District — 구역", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 구역 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: DISTRICTS } });
    renderWithChurch(<District />);
    for (const { name } of DISTRICTS) {
      expect(await screen.findByText(name)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<District />);
    expect(await screen.findByText("구역 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: DISTRICTS } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("1구역")).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: `src/components/jubo/Ministers.jsx` 전체 교체**

```jsx
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getMinisters } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function Ministers() {
  const { church } = useChurch();
  const {
    data: ministers = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getMinisters(church.id), [church.id], []);

  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      >
        섬기는 분들
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">섬기는 분들 정보를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-6">
          {ministers.map(({ title, items }) => (
            <div key={title}>
              <p className="text-caption font-bold text-grey-9 mb-2 px-1">{title}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {items.map((item) => {
                  const [role, name] = item.split("|").map((s) => s.trim());
                  return (
                    <Link
                      key={item}
                      to="/교적부"
                      className="group flex items-center gap-2.5 p-3 rounded-xl border border-bluegrey-2 bg-white hover:border-primary hover:bg-blue-1 transition-all print:pointer-events-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-bluegrey-2 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                        <svg
                          className="w-4 h-4 text-grey-6 group-hover:text-primary transition-colors"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-grey-6 truncate mb-1">{role}</p>
                        <p className="text-caption font-semibold text-grey-10 group-hover:text-primary transition-colors truncate">
                          {name || role}
                        </p>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 text-grey-4 group-hover:text-primary ml-auto shrink-0 transition-colors print:hidden"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 11: `src/components/jubo/Ministers.test.jsx` 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Ministers from "./Ministers";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const MINISTERS = [
  { title: "교역자", items: ["담임목사 | 홍길동", "부 목 사 | 이철수"] },
  { title: "장 로", items: ["시무장로 | 김영수"] },
];

describe("Ministers — 섬기는 분들", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 그룹 제목과 항목을 렌더하고 교적부로 링크한다", async () => {
    api.get.mockResolvedValue({ data: { data: MINISTERS } });
    renderWithChurch(<Ministers />, { withRouter: true });

    for (const { title } of MINISTERS) {
      expect(await screen.findByText(title)).toBeInTheDocument();
    }
    const link = screen.getByText("홍길동").closest("a");
    expect(link).toHaveAttribute("href", "/교적부");
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Ministers />, { withRouter: true });
    expect(
      await screen.findByText("섬기는 분들 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: MINISTERS } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("교역자")).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: 테스트 실행**

Run: `pnpm vitest run src/components/jubo/Service.test.jsx src/components/jubo/Offering.test.jsx src/components/jubo/Support.test.jsx src/components/jubo/District.test.jsx src/components/jubo/Ministers.test.jsx`
Expected: 10개 테스트 전부 PASS

- [ ] **Step 13: 커밋**

```bash
git add src/components/jubo/Service.jsx src/components/jubo/Service.test.jsx \
  src/components/jubo/Offering.jsx src/components/jubo/Offering.test.jsx \
  src/components/jubo/Support.jsx src/components/jubo/Support.test.jsx \
  src/components/jubo/District.jsx src/components/jubo/District.test.jsx \
  src/components/jubo/Ministers.jsx src/components/jubo/Ministers.test.jsx \
  src/config/jubo.config.js
git commit -m "feat: 봉사/예물/후원/구역/섬기는 분들 5개 탭을 실API로 재배선"
```

---

### Task 4: 표지 탭 부분 재배선 (`Cover.jsx`) — 호수/날짜만

**Files:**
- Modify: `src/components/jubo/Cover.jsx`
- Modify: `src/components/jubo/Cover.test.jsx`
- Modify: `src/config/jubo.config.js` (`cover.issueNumber`, `cover.date` 키 제거, `cover.photos`는 유지)

**Interfaces:**
- Consumes: `getJuboInfo(churchId)` (Task 1)

- [ ] **Step 1: `src/config/jubo.config.js`의 `cover` 블록에서 `issueNumber`/`date` 두 줄 제거**

```js
  // ── 표지 ─────────────────────────────────────────────
  cover: {
    photos: {
      church: null, // 교회 건물 사진 URL
      panorama: null, // 전체 예배 파노라마 사진 URL
      group: null, // 공동체 단체 사진 URL
    },
  },
```

- [ ] **Step 2: `src/components/jubo/Cover.jsx` 전체 교체**

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboInfo } from "@/services/juboService";
import juboConfig from "@/config/jubo.config";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import DefaultBanner from "@/assets/default_banner.png";

export default function Cover() {
  const { church } = useChurch();
  const { cover } = juboConfig;
  const { data: juboInfo } = useFetch(() => getJuboInfo(church.id), [church.id], null);
  const { mainVerse, mainTitle, items, year } = church.vision;

  const churchPhoto = cover.photos?.church;
  const panoramaPhoto = cover.photos?.panorama ?? DefaultBanner;
  const groupPhoto = cover.photos?.group;

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-3 bg-white rounded-xl border border-bluegrey-2">
        <span className="text-caption text-grey-6">{juboInfo?.issueNo ?? ""}</span>
        <span className="text-body-3 font-semibold text-grey-9">{juboInfo?.date ?? ""}</span>
      </div>

      {/* 표어 + 교회 사진 */}
      <div
        className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-bluegrey-2"
        style={{ minHeight: 260 }}
      >
        <div className="flex flex-col justify-center gap-4 px-6 py-6 sm:w-[38%] sm:shrink-0 bg-white">
          <span className="self-start px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold">
            {year}년 표어
          </span>
          <h2 className="text-[22px] md:text-[26px] font-bold leading-[1.35] text-grey-12">
            {mainVerse.replace(/^"|"$/g, "")}
          </h2>
          <p className="text-caption text-grey-6">{mainTitle}</p>
        </div>
        <div className="flex-1 relative overflow-hidden bg-grey-3 min-h-[220px]">
          {churchPhoto ? (
            <img src={churchPhoto} alt="교회 건물" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-2 to-blue-3 flex items-center justify-center text-grey-5 text-caption">
              교회 사진
            </div>
          )}
          <div className="absolute top-4 left-4">
            <img src={LogoIcon} className="h-10 w-auto object-contain" alt={church.name} />
          </div>
        </div>
      </div>

      {/* 파노라마 사진 */}
      <div className="w-full rounded-xl overflow-hidden border border-bluegrey-2 h-48 sm:h-[280px]">
        <img src={panoramaPhoto} alt="예배 전경" className="w-full h-full object-cover" />
      </div>

      {/* 3대 실천사항 + 단체 사진 */}
      <div
        className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-bluegrey-2"
        style={{ minHeight: 220 }}
      >
        <div
          className="flex flex-col items-center justify-center gap-3 px-8 py-6 sm:w-[38%] sm:shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <p className="text-[11px] font-semibold text-blue-3 tracking-widest">[3대 실천사항]</p>
          <div className="flex flex-col items-center gap-1.5">
            {items.map(({ label }) => (
              <p key={label} className="text-sub-tit-3 font-bold text-white">
                {label}
              </p>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-grey-3">
          {groupPhoto ? (
            <img src={groupPhoto} alt="공동체 단체 사진" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-grey-3 to-grey-4 flex items-center justify-center text-grey-5 text-caption">
              공동체 사진
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `src/components/jubo/Cover.test.jsx` 전체 교체**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Cover from "./Cover";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("Cover — 표지", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
  });

  it("호수·발행일을 실API로, 표어·3대 실천사항을 교회 설정으로 렌더한다", async () => {
    renderWithChurch(<Cover />);
    expect(await screen.findByText("제10-7")).toBeInTheDocument();
    expect(screen.getByText("2026년 2월 15일")).toBeInTheDocument();
    expect(
      screen.getByText(churchConfig.vision.mainVerse.replace(/^"|"$/g, "")),
    ).toBeInTheDocument();
    expect(screen.getByText(churchConfig.vision.items[0].label)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 테스트 실행**

Run: `pnpm vitest run src/components/jubo/Cover.test.jsx`
Expected: 1개 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/components/jubo/Cover.jsx src/components/jubo/Cover.test.jsx src/config/jubo.config.js
git commit -m "feat: 표지 탭의 호수/날짜를 실API로 연결"
```

---

### Task 5: 관리자 예배 섹션 에디터 (`WorshipSectionEditor.jsx`)

가장 복잡한 에디터 — `WORSHIP_SERVICES`(예배 목록)와 `WORSHIP_ORDER`(라벨별 순서표)를 한 카드에서 함께 관리한다.

**Files:**
- Create: `src/components/admin/jubo/WorshipSectionEditor.jsx`

**Interfaces:**
- Consumes: `getWorshipServices`, `getWorshipOrder`, `updateJuboSection` (Task 1)
- Produces: `WorshipSectionEditor({ churchId, juboId })` — Task 7이 `JuboManage.jsx`에서 이 컴포넌트를 마운트한다.

- [ ] **Step 1: `src/components/admin/jubo/WorshipSectionEditor.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function WorshipSectionEditor({ churchId, juboId }) {
  const { data: initialServices } = useFetch(() => getWorshipServices(churchId), [churchId], null);
  const { data: initialOrderMap } = useFetch(() => getWorshipOrder(churchId), [churchId], null);

  const [services, setServices] = useState([]);
  const [orderMap, setOrderMap] = useState({});
  const [activeLabel, setActiveLabel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initialServices) {
      setServices(initialServices);
      setActiveLabel(initialServices[0]?.label ?? null);
    }
  }, [initialServices]);

  useEffect(() => {
    if (initialOrderMap) setOrderMap(initialOrderMap);
  }, [initialOrderMap]);

  function addService() {
    setServices((prev) => [...prev, { label: "", time: "" }]);
  }

  function updateService(index, field, value) {
    const prevLabel = services[index].label;
    setServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    if (field === "label" && prevLabel !== value) {
      setOrderMap((prevMap) => {
        if (!(prevLabel in prevMap)) return prevMap;
        const { [prevLabel]: rows, ...rest } = prevMap;
        return { ...rest, [value]: rows };
      });
      if (activeLabel === prevLabel) setActiveLabel(value);
    }
  }

  function removeService(index) {
    const label = services[index].label;
    setServices((prev) => prev.filter((_, i) => i !== index));
    setOrderMap((prev) => {
      const { [label]: _removed, ...rest } = prev;
      return rest;
    });
    if (activeLabel === label) setActiveLabel(null);
  }

  const activeRows = activeLabel ? (orderMap[activeLabel] ?? []) : [];

  function updateActiveRows(rows) {
    if (!activeLabel) return;
    setOrderMap((prev) => ({ ...prev, [activeLabel]: rows }));
  }

  function addRow() {
    updateActiveRows([...activeRows, { role: "", name: "" }]);
  }

  function updateRow(index, field, value) {
    const next = [...activeRows];
    next[index] = { ...next[index], [field]: value };
    updateActiveRows(next);
  }

  function removeRow(index) {
    updateActiveRows(activeRows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "WORSHIP_SERVICES", services);
      await updateJuboSection(churchId, juboId, "WORSHIP_ORDER", orderMap);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[WorshipSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">예배 목록</h3>
        <button onClick={addService} className="text-caption text-primary font-semibold" type="button">
          + 예배 추가
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        {services.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="예배명 (예: 주일 오전예배)"
              value={s.label}
              onChange={(e) => updateService(i, "label", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="시간 (예: 오전 9:00)"
              value={s.time}
              onChange={(e) => updateService(i, "time", e.target.value)}
            />
            <button
              onClick={() => removeService(i)}
              className="shrink-0 text-caption text-grey-5 hover:text-red-500"
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-caption text-grey-5">등록된 예배가 없습니다.</p>
        )}
      </div>

      {services.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {services.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setActiveLabel(s.label)}
                className={`px-3 py-1.5 rounded-full text-caption border transition-colors ${
                  activeLabel === s.label
                    ? "bg-primary border-primary text-white font-semibold"
                    : "bg-white border-grey-3 text-grey-7"
                }`}
              >
                {s.label || "(이름 없음)"}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-body-4 font-semibold text-grey-9">
              {activeLabel || "예배"} 순서표
            </h4>
            <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
              + 순서 추가
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {activeRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  placeholder="역할 (예: 설교)"
                  value={row.role}
                  onChange={(e) => updateRow(i, "role", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="담당자"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                />
                <button
                  onClick={() => removeRow(i)}
                  className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                  type="button"
                >
                  삭제
                </button>
              </div>
            ))}
            {activeRows.length === 0 && (
              <p className="text-caption text-grey-5">등록된 순서가 없습니다.</p>
            )}
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크 겸 lint 실행 (이 컴포넌트는 Task 7의 `JuboManage.test.jsx`에서 통합 검증되므로 별도 유닛 테스트 파일은 만들지 않는다)**

Run: `pnpm run lint`
Expected: `WorshipSectionEditor.jsx`에 대한 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/components/admin/jubo/WorshipSectionEditor.jsx
git commit -m "feat: 관리자 예배 섹션 에디터 신규 구현"
```

---

### Task 6: 관리자 봉사/예물/후원/구역/섬기는 분들 섹션 에디터 5개 일괄 구현

동일한 "행 추가/삭제 + 저장" 패턴이 반복되므로 5개 파일을 한 태스크로 묶는다. 예물/섬기는 분들은 그룹+세부항목 2단 구조라는 점만 다르다.

**Files:**
- Create: `src/components/admin/jubo/VolunteerSectionEditor.jsx`
- Create: `src/components/admin/jubo/OfferingSectionEditor.jsx`
- Create: `src/components/admin/jubo/SupportSectionEditor.jsx`
- Create: `src/components/admin/jubo/DistrictSectionEditor.jsx`
- Create: `src/components/admin/jubo/MinistersSectionEditor.jsx`

**Interfaces:**
- Consumes: `getVolunteer`/`getOffering`/`getSupport`/`getDistricts`/`getMinisters`, `updateJuboSection` (Task 1)
- Produces: 각 `XxxSectionEditor({ churchId, juboId })` — Task 7이 마운트한다.

- [ ] **Step 1: `src/components/admin/jubo/VolunteerSectionEditor.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getVolunteer, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function VolunteerSectionEditor({ churchId, juboId }) {
  const { data: initial } = useFetch(() => getVolunteer(churchId), [churchId], null);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setRows(initial);
  }, [initial]);

  function updateRow(index, field, value) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { role: "", part1: "", part2: "" }]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "VOLUNTEER", rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[VolunteerSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">봉사 안내</h3>
        <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
          + 행 추가
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="구분 (예: 대표기도)"
              value={row.role}
              onChange={(e) => updateRow(i, "role", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="1부 담당"
              value={row.part1}
              onChange={(e) => updateRow(i, "part1", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="2부 담당"
              value={row.part2}
              onChange={(e) => updateRow(i, "part2", e.target.value)}
            />
            <button
              onClick={() => removeRow(i)}
              className="shrink-0 text-caption text-grey-5 hover:text-red-500"
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `src/components/admin/jubo/SupportSectionEditor.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getSupport, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function SupportSectionEditor({ churchId, juboId }) {
  const { data: initial } = useFetch(() => getSupport(churchId), [churchId], null);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setRows(initial);
  }, [initial]);

  function updateRow(index, field, value) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { organization: "", target: "", region: "" }]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "SUPPORT", rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[SupportSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">후원 안내</h3>
        <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
          + 행 추가
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="기관 (예: 베트남 | 호치민)"
              value={row.organization}
              onChange={(e) => updateRow(i, "organization", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="대상 (예: 선교사님 성함)"
              value={row.target}
              onChange={(e) => updateRow(i, "target", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="후원구역"
              value={row.region}
              onChange={(e) => updateRow(i, "region", e.target.value)}
            />
            <button
              onClick={() => removeRow(i)}
              className="shrink-0 text-caption text-grey-5 hover:text-red-500"
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `src/components/admin/jubo/DistrictSectionEditor.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getDistricts, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function DistrictSectionEditor({ churchId, juboId }) {
  const { data: initial } = useFetch(() => getDistricts(churchId), [churchId], null);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setRows(initial);
  }, [initial]);

  function updateRow(index, field, value) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", location: "", time: "", leader: "" }]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "DISTRICTS", rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[DistrictSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">구역 모임</h3>
        <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
          + 행 추가
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="구역명 (예: 1구역)"
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="모임 장소"
              value={row.location}
              onChange={(e) => updateRow(i, "location", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="모임 시간"
              value={row.time}
              onChange={(e) => updateRow(i, "time", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="구역장"
              value={row.leader}
              onChange={(e) => updateRow(i, "leader", e.target.value)}
            />
            <button
              onClick={() => removeRow(i)}
              className="shrink-0 text-caption text-grey-5 hover:text-red-500"
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `src/components/admin/jubo/OfferingSectionEditor.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getOffering, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function OfferingSectionEditor({ churchId, juboId }) {
  const { data: initial } = useFetch(() => getOffering(churchId), [churchId], null);
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setGroups(initial);
  }, [initial]);

  function addGroup() {
    setGroups((prev) => [...prev, { title: "", items: [""] }]);
  }

  function updateGroupTitle(gi, value) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], title: value };
      return next;
    });
  }

  function removeGroup(gi) {
    setGroups((prev) => prev.filter((_, i) => i !== gi));
  }

  function addItem(gi) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], items: [...next[gi].items, ""] };
      return next;
    });
  }

  function updateItem(gi, ii, value) {
    setGroups((prev) => {
      const next = [...prev];
      const items = [...next[gi].items];
      items[ii] = value;
      next[gi] = { ...next[gi], items };
      return next;
    });
  }

  function removeItem(gi, ii) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], items: next[gi].items.filter((_, i) => i !== ii) };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "OFFERING", groups);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[OfferingSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">예물 안내</h3>
        <button onClick={addGroup} className="text-caption text-primary font-semibold" type="button">
          + 항목 추가
        </button>
      </div>
      <div className="flex flex-col gap-4 mb-4">
        {groups.map((group, gi) => (
          <div key={gi} className="border border-grey-2 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                className={inputCls}
                placeholder="제목 (예: 십일조)"
                value={group.title}
                onChange={(e) => updateGroupTitle(gi, e.target.value)}
              />
              <button
                onClick={() => removeGroup(gi)}
                className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                type="button"
              >
                항목 삭제
              </button>
            </div>
            <div className="flex flex-col gap-2 pl-2">
              {group.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    placeholder="예: OOO 외 00명"
                    value={item}
                    onChange={(e) => updateItem(gi, ii, e.target.value)}
                  />
                  <button
                    onClick={() => removeItem(gi, ii)}
                    className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(gi)}
                className="self-start text-caption text-primary"
                type="button"
              >
                + 세부 항목 추가
              </button>
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `src/components/admin/jubo/MinistersSectionEditor.jsx` 작성**

```jsx
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getMinisters, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function MinistersSectionEditor({ churchId, juboId }) {
  const { data: initial } = useFetch(() => getMinisters(churchId), [churchId], null);
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setGroups(initial);
  }, [initial]);

  function addGroup() {
    setGroups((prev) => [...prev, { title: "", items: [""] }]);
  }

  function updateGroupTitle(gi, value) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], title: value };
      return next;
    });
  }

  function removeGroup(gi) {
    setGroups((prev) => prev.filter((_, i) => i !== gi));
  }

  function addItem(gi) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], items: [...next[gi].items, ""] };
      return next;
    });
  }

  function updateItem(gi, ii, value) {
    setGroups((prev) => {
      const next = [...prev];
      const items = [...next[gi].items];
      items[ii] = value;
      next[gi] = { ...next[gi], items };
      return next;
    });
  }

  function removeItem(gi, ii) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], items: next[gi].items.filter((_, i) => i !== ii) };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "MINISTERS", groups);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[MinistersSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">섬기는 분들</h3>
        <button onClick={addGroup} className="text-caption text-primary font-semibold" type="button">
          + 항목 추가
        </button>
      </div>
      <div className="flex flex-col gap-4 mb-4">
        {groups.map((group, gi) => (
          <div key={gi} className="border border-grey-2 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                className={inputCls}
                placeholder="제목 (예: 교역자)"
                value={group.title}
                onChange={(e) => updateGroupTitle(gi, e.target.value)}
              />
              <button
                onClick={() => removeGroup(gi)}
                className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                type="button"
              >
                항목 삭제
              </button>
            </div>
            <div className="flex flex-col gap-2 pl-2">
              {group.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    placeholder="역할 | 이름 (예: 담임목사 | 홍길동)"
                    value={item}
                    onChange={(e) => updateItem(gi, ii, e.target.value)}
                  />
                  <button
                    onClick={() => removeItem(gi, ii)}
                    className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(gi)}
                className="self-start text-caption text-primary"
                type="button"
              >
                + 세부 항목 추가
              </button>
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: lint 실행**

Run: `pnpm run lint`
Expected: 5개 신규 파일에 대한 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add src/components/admin/jubo/VolunteerSectionEditor.jsx \
  src/components/admin/jubo/SupportSectionEditor.jsx \
  src/components/admin/jubo/DistrictSectionEditor.jsx \
  src/components/admin/jubo/OfferingSectionEditor.jsx \
  src/components/admin/jubo/MinistersSectionEditor.jsx
git commit -m "feat: 관리자 봉사/예물/후원/구역/섬기는 분들 섹션 에디터 5개 신규 구현"
```

---

### Task 7: `JuboManage.jsx` 전면 재작성 — 생성/편집/발행 흐름 조립

**Files:**
- Modify: `src/pages/admin/JuboManage.jsx` (전체 재작성)
- Create: `src/pages/admin/JuboManage.test.jsx`

**Interfaces:**
- Consumes: `getJuboInfo`, `createJuboIssue`, `publishJubo` (Task 1), `WorshipSectionEditor` (Task 5), `VolunteerSectionEditor`/`OfferingSectionEditor`/`SupportSectionEditor`/`DistrictSectionEditor`/`MinistersSectionEditor` (Task 6), `useFetch`, `useChurch`

라우팅(`/admin/jubo`)과 사이드바 메뉴는 이미 존재하므로(`routes.jsx:105`, `AdminLayout.jsx:21`) 변경하지 않는다.

- [ ] **Step 1: `src/pages/admin/JuboManage.jsx`를 아래로 전체 교체**

```jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboInfo, createJuboIssue, publishJubo } from "@/services/juboService";
import WorshipSectionEditor from "@/components/admin/jubo/WorshipSectionEditor";
import VolunteerSectionEditor from "@/components/admin/jubo/VolunteerSectionEditor";
import OfferingSectionEditor from "@/components/admin/jubo/OfferingSectionEditor";
import SupportSectionEditor from "@/components/admin/jubo/SupportSectionEditor";
import DistrictSectionEditor from "@/components/admin/jubo/DistrictSectionEditor";
import MinistersSectionEditor from "@/components/admin/jubo/MinistersSectionEditor";

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function JuboManage() {
  const { church } = useChurch();
  const {
    data: currentInfo,
    loading: infoLoading,
    refetch: refetchInfo,
  } = useFetch(() => getJuboInfo(church.id), [church.id], null);

  const [juboId, setJuboId] = useState(null);
  const [issueNo, setIssueNo] = useState("");
  const [juboDate, setJuboDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(false);
  const [published, setPublished] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!issueNo.trim() || !juboDate) return;
    setCreating(true);
    setCreateError(false);
    try {
      const created = await createJuboIssue(church.id, { issueNo: issueNo.trim(), juboDate });
      setJuboId(created.id);
      setPublished(false);
    } catch (err) {
      console.error("[JuboManage] 주보 생성 실패:", err);
      setCreateError(true);
    } finally {
      setCreating(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(false);
    try {
      await publishJubo(church.id, juboId);
      setPublished(true);
      refetchInfo();
    } catch (err) {
      console.error("[JuboManage] 주보 발행 실패:", err);
      setPublishError(true);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">스마트 주보 관리</h1>
      </div>

      <div className="bg-white rounded-2xl border border-grey-2 p-5 mb-5">
        <span className="text-body-4 font-semibold text-grey-8">현재 발행된 주보</span>
        <p className="mt-1 text-body-4 text-grey-9">
          {infoLoading
            ? "불러오는 중..."
            : currentInfo
              ? `${currentInfo.issueNo} · ${currentInfo.date}`
              : "발행된 주보가 없습니다."}
        </p>
      </div>

      {!juboId ? (
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-4">새 주보 작성</h2>
          <form onSubmit={handleCreate} className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-caption text-grey-6 mb-1" htmlFor="jubo-issue-no">
                호수
              </label>
              <input
                id="jubo-issue-no"
                className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4"
                placeholder="예: 제10-8"
                value={issueNo}
                onChange={(e) => setIssueNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-caption text-grey-6 mb-1" htmlFor="jubo-date">
                날짜
              </label>
              <input
                id="jubo-date"
                type="date"
                className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4"
                value={juboDate}
                onChange={(e) => setJuboDate(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
            >
              {creating ? "생성 중..." : "작성 시작"}
            </button>
          </form>
          {createError && (
            <p className="mt-3 text-caption text-red-500">
              주보 생성에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 px-4 py-3 rounded-xl bg-blue-1 border border-blue-3 text-caption text-blue-9">
            작성 중 새로고침하면 저장하지 않은 내용은 유실됩니다. 섹션별로 저장 버튼을 눌러
            진행 상황을 지켜주세요.
          </div>

          <div className="grid gap-5">
            <SectionCard title="예배">
              <WorshipSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="봉사">
              <VolunteerSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="예물">
              <OfferingSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="후원">
              <SupportSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="구역">
              <DistrictSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="섬기는 분들">
              <MinistersSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
            >
              {published ? "발행 완료" : publishing ? "발행 중..." : "발행하기"}
            </button>
            {publishError && (
              <span className="text-caption text-red-500">
                발행에 실패했습니다. 다시 시도해 주세요.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `src/pages/admin/JuboManage.test.jsx` 작성**

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import JuboManage from "./JuboManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

function mockPrefillGets() {
  api.get.mockImplementation((url) => {
    if (url.includes("/current")) {
      return Promise.resolve({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
    }
    if (url.includes("worship-services")) {
      return Promise.resolve({ data: { data: [{ label: "주일 오전예배", time: "오전 9:00" }] } });
    }
    if (url.includes("worship-order")) {
      return Promise.resolve({
        data: { data: { "주일 오전예배": [{ role: "예배 부름", name: "성가대" }] } },
      });
    }
    if (url.includes("volunteer")) {
      return Promise.resolve({
        data: { data: [{ role: "대표기도", part1: "000", part2: "000" }] },
      });
    }
    if (url.includes("offering")) {
      return Promise.resolve({ data: { data: [{ title: "십일조", items: ["OOO 외 00명"] }] } });
    }
    if (url.includes("support")) {
      return Promise.resolve({
        data: { data: [{ organization: "베트남", target: "선교사님", region: "구역명" }] },
      });
    }
    if (url.includes("districts")) {
      return Promise.resolve({
        data: { data: [{ name: "1구역", location: "장소", time: "시간", leader: "OOO 집사" }] },
      });
    }
    if (url.includes("ministers")) {
      return Promise.resolve({ data: { data: [{ title: "교역자", items: ["담임목사 | OOO"] }] } });
    }
    return Promise.reject(new Error(`unexpected GET url: ${url}`));
  });
}

function mockCreateOnce() {
  api.post.mockResolvedValueOnce({
    data: { data: { id: 42, issueNo: "제10-8", juboDate: "2026-06-01", published: false } },
  });
}

async function createIssue(user) {
  await user.type(screen.getByLabelText("호수"), "제10-8");
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-06-01" } });
  await user.click(screen.getByRole("button", { name: "작성 시작" }));
  await screen.findByRole("button", { name: "발행하기" });
}

describe("JuboManage — 주보 관리", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrefillGets();
  });

  it("마운트 시 현재 발행된 주보 정보를 보여준다", async () => {
    renderWithChurch(<JuboManage />);
    expect(await screen.findByText("제10-7 · 2026년 2월 15일")).toBeInTheDocument();
  });

  it("호수/날짜를 입력해 작성 시작하면 createJuboIssue를 호출하고 섹션 에디터가 나타난다", async () => {
    mockCreateOnce();
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");

    await createIssue(user);

    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo", {
      issueNo: "제10-8",
      juboDate: "2026-06-01",
    });
    expect(screen.getByText("예배")).toBeInTheDocument();
    expect(screen.getByText("봉사")).toBeInTheDocument();
  });

  it("주보 생성이 실패하면 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");

    await user.type(screen.getByLabelText("호수"), "제10-8");
    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-06-01" } });
    await user.click(screen.getByRole("button", { name: "작성 시작" }));

    expect(
      await screen.findByText("주보 생성에 실패했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("예배 섹션 저장 시 WORSHIP_SERVICES와 WORSHIP_ORDER를 함께 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("주일 오전예배");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[0]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/WORSHIP_SERVICES",
        expect.any(Array),
      ),
    );
    expect(api.put).toHaveBeenCalledWith(
      "/church/admin/jubo/42/sections/WORSHIP_ORDER",
      expect.any(Object),
    );
  });

  it("봉사 섹션 저장 시 VOLUNTEER 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("대표기도");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[1]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/VOLUNTEER",
        expect.any(Array),
      ),
    );
  });

  it("예물 섹션 저장 시 OFFERING 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("십일조");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[2]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/OFFERING",
        expect.any(Array),
      ),
    );
  });

  it("후원 섹션 저장 시 SUPPORT 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("베트남");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[3]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/SUPPORT",
        expect.any(Array),
      ),
    );
  });

  it("구역 섹션 저장 시 DISTRICTS 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("1구역");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[4]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/DISTRICTS",
        expect.any(Array),
      ),
    );
  });

  it("섬기는 분들 섹션 저장 시 MINISTERS 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("교역자");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[5]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/MINISTERS",
        expect.any(Array),
      ),
    );
  });

  it("발행하기를 누르면 publishJubo를 호출하고 발행 완료 상태가 된다", async () => {
    mockCreateOnce();
    api.post.mockResolvedValueOnce({
      data: { data: { id: 42, issueNo: "제10-8", juboDate: "2026-06-01", published: true } },
    });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    await user.click(screen.getByRole("button", { name: "발행하기" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/church/admin/jubo/42/publish"));
    expect(await screen.findByRole("button", { name: "발행 완료" })).toBeInTheDocument();
  });
});
```

`mockCreateOnce`가 `api.post`에 큐잉하는 방식(`mockResolvedValueOnce`) 특성상 "발행하기" 테스트는 생성 호출(1번째)과 발행 호출(2번째)이 순서대로 소비되도록 `mockCreateOnce()` 다음에 발행 응답을 추가로 큐잉한다.

- [ ] **Step 3: 테스트 실행**

Run: `pnpm vitest run src/pages/admin/JuboManage.test.jsx`
Expected: 9개 테스트 전부 PASS

- [ ] **Step 4: 전체 스위트 실행 — 이번 사이클에서 건드린 모든 파일이 서로 충돌 없이 통과하는지 확인**

Run: `pnpm test:run`
Expected: 전체 테스트 PASS(기존 스위트 규모에서 이번 사이클 신규/수정분만큼 증가)

- [ ] **Step 5: 커밋**

```bash
git add src/pages/admin/JuboManage.jsx src/pages/admin/JuboManage.test.jsx
git commit -m "feat: JuboManage를 생성/편집/발행 흐름으로 전면 재작성"
```

---

## 최종 검증 (전체 태스크 완료 후)

- [ ] `pnpm run lint` 전체 실행 — 신규/수정 파일 전부 통과
- [ ] `pnpm test:run` 전체 실행 — 전체 스위트 통과
- [ ] 브라우저로 `/주보?tab=예배` 등 6개 탭을 직접 열어 실제 렌더링 확인(더미 모드 또는 로컬 백엔드 기동 상태에서)
- [ ] 브라우저로 `/admin/jubo`에서 새 주보 작성 → 6개 섹션 입력 → 저장 → 발행까지 실제 흐름 검증(로컬 백엔드 필요, WorshipManage 사이클과 동일한 시드 계정 `admin@algok.local`/`local1234!` 사용 가능)
