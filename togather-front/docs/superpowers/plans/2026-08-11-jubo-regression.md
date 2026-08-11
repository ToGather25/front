# 스마트 주보 신규 3탭 추가 + 탭별 컴포넌트 분리 + 회귀 테스트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `Jubo.jsx`(732줄, 9탭)를 탭별 컴포넌트로 분리하고, CSV 업데이트 스펙의 신규 3탭(말씀/헌금/기도제목)을 TDD로 추가하고, 전체에 회귀 테스트를 추가한다.

**Architecture:** 9개 기존 탭(표지/예배/소식/봉사/예물/후원/구역/섬기는 분들/오시는 길)은 로직·마크업·문구를 절대 바꾸지 않고 `src/components/jubo/`로 그대로 옮긴다(성경쓰기·마이페이지 사이클과 동일한 순수 리팩터링 원칙). 공용 `JuboPage`(페이지 래퍼+인쇄CSS 연동)·`SectionTitle`은 `shared.jsx`로 분리한다. 신규 3탭은 `jubo.config.js`에 추가한 정적 데이터를 그대로 재사용하는 기존 패턴을 따른다. `Jubo.jsx`는 탭 전환 + 인쇄 시 전체 탭 순차 렌더만 담당하는 얇은 부모가 된다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event`, `react-router` v7, `src/test/renderWithChurch.jsx`.

## Global Constraints

- `describe`/`it`/`expect`/`beforeEach`는 `"vite-plus/test"`에서 import한다.
- 기존 9탭을 옮기는 과정에서 로직·마크업·클래스명·문구·`jubo.config.js`의 기존 값을 절대 바꾸지 않는다. 신규 로직은 3개 새 탭 컴포넌트와 `jubo.config.js`에 새로 추가하는 3개 섹션(`sermon`/`giving`/`prayerTopics`)뿐이다.
- 말씀 탭의 좋아요 버튼은 **주보 탭 내부 로컬 `useState` 토글일 뿐**이다 — 성경읽기(`BibleRead.jsx`)의 `savedVerses`와 실제로 연동하지 않는다(사용자 확인 완료, `savedVerses`가 세션 전용 상태라 페이지 간 공유가 애초에 불가능함).
- `juboService.js`/`src/data/dummy/jubo.js`는 죽은 코드이지만 이번 사이클에서 건드리지 않는다(기존 9탭을 그대로 유지하기로 확정했으므로 스코프 밖).
- `Jubo.jsx`는 인증이 필요 없는 공개 페이지다 — 로그인 가드를 추가하지 않는다.
- `Cover`/`Direction` 컴포넌트는 `useChurch()`를 쓰므로 테스트에서 `renderWithChurch(ui)`로 감싼다(`@/test/renderWithChurch`). `Ministers` 컴포넌트는 `react-router`의 `Link`를 쓰므로 테스트에서 `MemoryRouter`로 감싼다. 나머지 탭 컴포넌트(`Worship`/`News`/`Service`/`Offering`/`Support`/`District`, 신규 3탭)는 컨텍스트가 필요 없어 `@testing-library/react`의 `render`만으로 충분하다.
- 카카오맵(`KakaoMap.jsx`)은 테스트 환경(jsdom)에서 `window.kakao`가 없으면 에러 문구를 표시할 뿐 크래시하지 않는다(`window.kakao.maps` 부재 시 `setError`로 안전 처리됨, 기존 `src/components/church/Direction.test.jsx`에서 이미 검증된 패턴) — 별도 mock 없이 그대로 렌더 가능하다.

---

## Task 1: 공용 UI(`shared.jsx`) 추출

**Files:**
- Create: `src/components/jubo/shared.jsx`

**Interfaces:**
- Produces: `shared.jsx`가 export하는 `JuboPage`, `SectionTitle` — 이후 모든 태스크(2~14)가 이 파일을 소비한다.

이 태스크는 기존 `src/pages/Jubo/Jubo.jsx`에서 로직·값을 전혀 바꾸지 않고 그대로 옮기는 순수 추출이라 별도 테스트가 필요 없다(이후 태스크들의 테스트가 간접적으로 검증한다). `Jubo.jsx` 자체는 이번 태스크에서 아직 건드리지 않는다(Task 15에서 최종 교체).

- [ ] **Step 1: `shared.jsx` 작성**

`src/components/jubo/shared.jsx`를 새로 만든다:

```jsx
// 주보 컨텐츠 래퍼 — 화면: 반응형 / 인쇄: A4
export function JuboPage({ children, noPadding = false }) {
  return (
    <div className="jubo-page w-full mx-auto bg-white border border-bluegrey-2 shadow-md rounded-2xl overflow-hidden">
      <div className={noPadding ? "" : "p-4 md:p-8 lg:p-10"}>{children}</div>
    </div>
  );
}

// 공통 섹션 타이틀
export function SectionTitle({ icon, children }) {
  return (
    <>
      <h3 className="flex items-center gap-2.5 text-sub-tit-4 font-bold text-grey-11 mb-4">
        {icon}
        {children}
      </h3>
      <div className="border-t-2 border-grey-11" />
    </>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료(아직 아무도 이 파일을 import하지 않으므로 신규 파일 문법 오류만 체크됨)

- [ ] **Step 3: Commit**

```bash
git add src/components/jubo/shared.jsx
git commit -m "refactor: 스마트 주보 공용 UI(JuboPage, SectionTitle) shared.jsx로 추출

Jubo.jsx(732줄, 9개 탭 단일 파일)를 탭별 컴포넌트로 분리하는 작업의
첫 단계. 9개 탭이 공통으로 쓰는 페이지 래퍼(JuboPage, 인쇄 CSS 연동)와
섹션 타이틀(SectionTitle)을 로직·값 변경 없이 그대로 추출했다.
Jubo.jsx 자체는 아직 건드리지 않음(Task 15에서 교체)."
```

---

## Task 2: `Cover.jsx` — 표지

**Files:**
- Create: `src/components/jubo/Cover.jsx`
- Create: `src/components/jubo/Cover.test.jsx`

**Interfaces:**
- Consumes: `useChurch`(`@/contexts/ChurchContext`), `jubo.config.js`의 `cover`
- Produces: `Cover` 컴포넌트(default export, props 없음) — Task 15가 `<Cover />`로 마운트한다.

- [ ] **Step 1: `Cover.jsx` 작성**

`src/components/jubo/Cover.jsx`를 새로 만든다:

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import juboConfig from "@/config/jubo.config";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import DefaultBanner from "@/assets/default_banner.png";

export default function Cover() {
  const { church } = useChurch();
  const { cover } = juboConfig;
  const { mainVerse, mainTitle, items, year } = church.vision;

  const churchPhoto = cover.photos?.church;
  const panoramaPhoto = cover.photos?.panorama ?? DefaultBanner;
  const groupPhoto = cover.photos?.group;

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-3 bg-white rounded-xl border border-bluegrey-2">
        <span className="text-caption text-grey-6">{cover.issueNumber}</span>
        <span className="text-body-3 font-semibold text-grey-9">{cover.date}</span>
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

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Cover.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import juboConfig from "@/config/jubo.config";
import Cover from "./Cover";

describe("Cover — 표지", () => {
  it("호수·발행일과 표어·3대 실천사항을 렌더한다", () => {
    renderWithChurch(<Cover />);
    expect(screen.getByText(juboConfig.cover.issueNumber)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.cover.date)).toBeInTheDocument();
    expect(
      screen.getByText(churchConfig.vision.mainVerse.replace(/^"|"$/g, "")),
    ).toBeInTheDocument();
    expect(screen.getByText(churchConfig.vision.items[0].label)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Cover.test.jsx`
Expected: PASS (1/1) — 순수 이동이라 실패 없이 바로 통과해야 정상이다.

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Cover.jsx src/components/jubo/Cover.test.jsx
git commit -m "refactor: 스마트 주보 표지 탭을 Cover.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 3: `Worship.jsx` — 예배

**Files:**
- Create: `src/components/jubo/Worship.jsx`
- Create: `src/components/jubo/Worship.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `worshipOrder`/`worshipScheduleSummary`
- Produces: `Worship` 컴포넌트(default export, props 없음) — Task 15가 `<Worship />`으로 마운트한다.

- [ ] **Step 1: `Worship.jsx` 작성**

`src/components/jubo/Worship.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import juboConfig from "@/config/jubo.config";

const SIDEBAR_SERVICES = [
  { label: "전체", group: "main" },
  { label: "주일 오전예배", group: "main" },
  { label: "주일 오후예배", group: "main" },
  { label: "새벽기도회", group: "main" },
  { label: "수요예배", group: "main" },
  { label: "금요기도회", group: "main" },
  { label: "유치부", group: "sub" },
  { label: "초등부", group: "sub" },
  { label: "중고등부", group: "sub" },
  { label: "대학청년부", group: "sub" },
];

export default function Worship() {
  const { worshipOrder, worshipScheduleSummary } = juboConfig;
  const [selected, setSelected] = useState("주일 오전예배");

  return (
    <div className="flex flex-col md:flex-row border border-bluegrey-2 rounded-xl overflow-hidden">
      {/* 사이드바 */}
      <div className="md:w-36 md:shrink-0 border-b md:border-b-0 md:border-r border-bluegrey-2 bg-bluegrey-1 py-3 flex md:flex-col overflow-x-auto">
        <p className="text-[10px] font-bold text-grey-6 uppercase tracking-wider px-3 mb-2 md:block hidden">
          기관
        </p>
        {SIDEBAR_SERVICES.map(({ label, group }, i) => {
          const isFirst = group === "sub" && SIDEBAR_SERVICES[i - 1]?.group === "main";
          return (
            <div key={label} className="shrink-0">
              {isFirst && <div className="h-px bg-bluegrey-2 mx-3 my-1.5 md:block hidden" />}
              <button
                onClick={() => setSelected(label)}
                className={`w-full text-left px-3 py-2 text-caption transition-colors ${
                  selected === label
                    ? "bg-primary text-white font-semibold"
                    : "text-grey-9 hover:bg-bluegrey-2 font-medium"
                }`}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {/* 예배 순서 */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex items-baseline gap-2 mb-5">
          <h3 className="text-body-2 font-bold text-grey-11">예배 순서</h3>
          <p className="text-body-5 text-grey-6">
            {selected === "주일 오전예배" && "주일 오전 예배 (1부 - 오전 09:00, 2부 - 오전 11:00)"}
            {selected === "주일 오후예배" && "주일 오후 예배 (오후 2:00)"}
            {selected === "새벽기도회" && "새벽기도회 (오전 5:30)"}
            {selected === "수요예배" && "수요 예배 (오전 11:00)"}
            {selected === "금요기도회" && "금요기도회 (오후 8:00)"}
          </p>
        </div>
        <div className="border-t border-grey-11 mb-1" />
        <table className="w-full text-caption">
          <thead>
            <tr className="border-b border-bluegrey-2">
              <th className="text-left py-2.5 px-3 text-grey-7 font-semibold w-1/4" />
              <th className="py-2.5 px-3 text-grey-7 font-semibold text-center">1부</th>
              <th className="py-2.5 px-3 text-grey-7 font-semibold text-center">2부</th>
            </tr>
          </thead>
          <tbody>
            {worshipOrder.map(({ order, part1, part2 }, i) => (
              <tr key={i} className="border-b border-grey-3">
                <td className="py-3 px-3 text-grey-9 font-medium tracking-widest">{order}</td>
                <td className="py-3 px-3 text-grey-7 text-center whitespace-pre-line">{part1}</td>
                <td className="py-3 px-3 text-grey-7 text-center whitespace-pre-line">{part2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 예배 및 모임 안내 */}
      <div className="md:w-44 md:shrink-0 border-t md:border-t-0 md:border-l border-bluegrey-2 p-4 md:p-5">
        <h4 className="text-body-5 font-bold text-grey-10 mb-4">예배 및 모임 안내</h4>
        {worshipScheduleSummary.map(({ label, time }) => (
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

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Worship.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Worship from "./Worship";

describe("Worship — 예배", () => {
  it("기본값(주일 오전예배)의 예배 순서와 안내 요약을 렌더한다", () => {
    render(<Worship />);
    expect(
      screen.getByText("주일 오전 예배 (1부 - 오전 09:00, 2부 - 오전 11:00)"),
    ).toBeInTheDocument();
    expect(screen.getByText(juboConfig.worshipOrder[0].order)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.worshipScheduleSummary[0].label)).toBeInTheDocument();
  });

  it("사이드바에서 다른 예배를 선택하면 안내 문구가 바뀐다", () => {
    render(<Worship />);
    fireEvent.click(screen.getByRole("button", { name: "수요예배" }));
    expect(screen.getByText("수요 예배 (오전 11:00)")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Worship.test.jsx`
Expected: PASS (2/2)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Worship.jsx src/components/jubo/Worship.test.jsx
git commit -m "refactor: 스마트 주보 예배 탭을 Worship.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 4: `News.jsx` — 소식

**Files:**
- Create: `src/components/jubo/News.jsx`
- Create: `src/components/jubo/News.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `news`, `shared.jsx`의 `SectionTitle`
- Produces: `News` 컴포넌트(default export, props 없음) — Task 15가 `<News />`로 마운트한다.

- [ ] **Step 1: `News.jsx` 작성**

`src/components/jubo/News.jsx`를 새로 만든다:

```jsx
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function News() {
  const { news } = juboConfig;
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z"
            />
          </svg>
        }
      >
        교회 소식
      </SectionTitle>
      <table className="w-full text-caption mt-1">
        {news.map((section, i) => (
          <tbody key={i}>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <td colSpan={2} className="py-2 px-4 font-semibold text-grey-8">
                {i + 1}. {section.title}
              </td>
            </tr>
            {section.items.map((item, j) => (
              <tr key={j} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-9 w-48">{item}</td>
                <td className="py-3 px-4 text-grey-6">내용을 입력하세요.</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/News.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import News from "./News";

describe("News — 소식", () => {
  it("모든 소식 섹션 제목을 렌더한다", () => {
    render(<News />);
    juboConfig.news.forEach((section) => {
      expect(screen.getByText(new RegExp(section.title))).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/News.test.jsx`
Expected: PASS (1/1)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/News.jsx src/components/jubo/News.test.jsx
git commit -m "refactor: 스마트 주보 소식 탭을 News.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 5: `Service.jsx` — 봉사

**Files:**
- Create: `src/components/jubo/Service.jsx`
- Create: `src/components/jubo/Service.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `serviceRoles`, `shared.jsx`의 `SectionTitle`
- Produces: `Service` 컴포넌트(default export, props 없음) — Task 15가 `<Service />`로 마운트한다.

- [ ] **Step 1: `Service.jsx` 작성**

`src/components/jubo/Service.jsx`를 새로 만든다:

```jsx
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Service() {
  const { serviceRoles } = juboConfig;
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
    </>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Service.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Service from "./Service";

describe("Service — 봉사", () => {
  it("모든 봉사 역할 행을 렌더한다", () => {
    render(<Service />);
    juboConfig.serviceRoles.forEach(({ role }) => {
      expect(screen.getByText(role)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Service.test.jsx`
Expected: PASS (1/1)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Service.jsx src/components/jubo/Service.test.jsx
git commit -m "refactor: 스마트 주보 봉사 탭을 Service.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 6: `Offering.jsx` — 예물

**Files:**
- Create: `src/components/jubo/Offering.jsx`
- Create: `src/components/jubo/Offering.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `offering`, `shared.jsx`의 `SectionTitle`
- Produces: `Offering` 컴포넌트(default export, props 없음) — Task 15가 `<Offering />`으로 마운트한다.

- [ ] **Step 1: `Offering.jsx` 작성**

`src/components/jubo/Offering.jsx`를 새로 만든다:

```jsx
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Offering() {
  const { offering } = juboConfig;
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
    </>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Offering.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Offering from "./Offering";

describe("Offering — 예물", () => {
  it("모든 예물 항목 제목을 렌더한다", () => {
    render(<Offering />);
    juboConfig.offering.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Offering.test.jsx`
Expected: PASS (1/1)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Offering.jsx src/components/jubo/Offering.test.jsx
git commit -m "refactor: 스마트 주보 예물 탭을 Offering.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 7: `Support.jsx` — 후원

**Files:**
- Create: `src/components/jubo/Support.jsx`
- Create: `src/components/jubo/Support.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `support`, `shared.jsx`의 `SectionTitle`
- Produces: `Support` 컴포넌트(default export, props 없음) — Task 15가 `<Support />`로 마운트한다.

- [ ] **Step 1: `Support.jsx` 작성**

`src/components/jubo/Support.jsx`를 새로 만든다:

```jsx
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Support() {
  const { support } = juboConfig;
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
    </>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Support.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Support from "./Support";

describe("Support — 후원", () => {
  it("모든 후원 기관 행을 렌더한다", () => {
    render(<Support />);
    juboConfig.support.forEach(({ organization }) => {
      expect(screen.getByText(organization)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Support.test.jsx`
Expected: PASS (1/1)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Support.jsx src/components/jubo/Support.test.jsx
git commit -m "refactor: 스마트 주보 후원 탭을 Support.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 8: `District.jsx` — 구역

**Files:**
- Create: `src/components/jubo/District.jsx`
- Create: `src/components/jubo/District.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `districts`, `shared.jsx`의 `SectionTitle`
- Produces: `District` 컴포넌트(default export, props 없음) — Task 15가 `<District />`로 마운트한다.

- [ ] **Step 1: `District.jsx` 작성**

`src/components/jubo/District.jsx`를 새로 만든다:

```jsx
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function District() {
  const { districts } = juboConfig;
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
    </>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/District.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import District from "./District";

describe("District — 구역", () => {
  it("모든 구역 행을 렌더한다", () => {
    render(<District />);
    juboConfig.districts.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/District.test.jsx`
Expected: PASS (1/1)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/District.jsx src/components/jubo/District.test.jsx
git commit -m "refactor: 스마트 주보 구역 탭을 District.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 9: `Ministers.jsx` — 섬기는 분들

**Files:**
- Create: `src/components/jubo/Ministers.jsx`
- Create: `src/components/jubo/Ministers.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `ministers`, `shared.jsx`의 `SectionTitle`, `react-router`의 `Link`
- Produces: `Ministers` 컴포넌트(default export, props 없음) — Task 15가 `<Ministers />`로 마운트한다.

- [ ] **Step 1: `Ministers.jsx` 작성**

`src/components/jubo/Ministers.jsx`를 새로 만든다:

```jsx
import { Link } from "react-router";
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Ministers() {
  const { ministers } = juboConfig;
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
    </>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Ministers.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import juboConfig from "@/config/jubo.config";
import Ministers from "./Ministers";

describe("Ministers — 섬기는 분들", () => {
  it("모든 그룹 제목과 첫 항목을 렌더하고 교적부로 링크한다", () => {
    render(
      <MemoryRouter>
        <Ministers />
      </MemoryRouter>,
    );
    juboConfig.ministers.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    const [firstRole, firstName] = juboConfig.ministers[0].items[0].split("|").map((s) => s.trim());
    const link = screen.getByText(firstName || firstRole).closest("a");
    expect(link).toHaveAttribute("href", "/교적부");
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Ministers.test.jsx`
Expected: PASS (1/1)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Ministers.jsx src/components/jubo/Ministers.test.jsx
git commit -m "refactor: 스마트 주보 섬기는 분들 탭을 Ministers.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 10: `Direction.jsx` — 오시는 길

**Files:**
- Create: `src/components/jubo/Direction.jsx`
- Create: `src/components/jubo/Direction.test.jsx`

**Interfaces:**
- Consumes: `useChurch`(`@/contexts/ChurchContext`), `KakaoMap`(`@/components/common/KakaoMap`)
- Produces: `Direction` 컴포넌트(default export, props 없음) — Task 15가 `<Direction />`으로 마운트한다.

- [ ] **Step 1: `Direction.jsx` 작성**

`src/components/jubo/Direction.jsx`를 새로 만든다:

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import { SectionTitle } from "./shared";

export default function Direction() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <KakaoMap
          level={church.location.level}
          address={church.address}
          className="w-full rounded-xl overflow-hidden mb-3"
          style={{ height: 320 }}
        />
        <p className="text-right text-caption text-grey-7">{church.address}</p>
      </div>
      <div>
        <SectionTitle
          icon={
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 3v5h-7V8zM5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm12 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
            </svg>
          }
        >
          셔틀 안내
        </SectionTitle>
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">운행 코스</th>
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">시간 및 경유지</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(({ name, schedule }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3.5 px-4 font-semibold text-grey-10 w-36">{name}</td>
                <td className="py-3.5 px-4 text-grey-6">{schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/jubo/Direction.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Direction from "./Direction";

describe("Direction — 오시는 길", () => {
  it("교회 주소와 셔틀 운행 코스를 렌더한다", () => {
    renderWithChurch(<Direction />);
    expect(screen.getByText(churchConfig.address)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.transportGuide.routes[0].name)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Direction.test.jsx`
Expected: PASS (1/1) — `window.kakao`가 테스트 환경에 없어 `KakaoMap`은 에러 안내 문구를 표시할 뿐 크래시하지 않는다(`src/components/church/Direction.test.jsx`에서 이미 검증된 안전한 패턴).

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/jubo/Direction.jsx src/components/jubo/Direction.test.jsx
git commit -m "refactor: 스마트 주보 오시는 길 탭을 Direction.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 11: `jubo.config.js`에 신규 3탭 데이터 추가

**Files:**
- Modify: `src/config/jubo.config.js`

**Interfaces:**
- Produces: `juboConfig.sermon`(`{ title, scripture, outline: [] }`), `juboConfig.giving`(`{ bankAccount: { bank, accountNumber, holder }, qrCodeUrl }`), `juboConfig.prayerTopics`(배열) — Task 12~14가 이 세 섹션을 소비한다.

이 태스크는 기존 섹션(`cover`~`ministers`)을 전혀 건드리지 않고 새 섹션 3개만 파일 끝에 추가하는 것이라 별도 테스트가 필요 없다(Task 12~14의 테스트가 검증한다).

- [ ] **Step 1: 신규 섹션 추가**

`src/config/jubo.config.js`의 마지막 부분:

```js
  // ── 섬기는 분들 ───────────────────────────────────────
  ministers: [
    {
      title: "교역자",
      items: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
    },
    {
      title: "장 로",
      items: [
        "시무장로 | OOO",
        "시무장로 | OOO",
        "협동장로 | OOO",
        "사역장로 | OOO",
        "은퇴장로 | OOO",
      ],
    },
    {
      title: "찬 양",
      items: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"],
    },
  ],
};

export default juboConfig;
```

다음으로 교체한다(`ministers` 배열은 그대로 두고, 그 뒤에 신규 3개 섹션을 추가한다):

```js
  // ── 섬기는 분들 ───────────────────────────────────────
  ministers: [
    {
      title: "교역자",
      items: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
    },
    {
      title: "장 로",
      items: [
        "시무장로 | OOO",
        "시무장로 | OOO",
        "협동장로 | OOO",
        "사역장로 | OOO",
        "은퇴장로 | OOO",
      ],
    },
    {
      title: "찬 양",
      items: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"],
    },
  ],

  // ── 말씀 ─────────────────────────────────────────────
  sermon: {
    title: "이러한 율법을 행하는 이방인이 정죄하리라",
    scripture: "로마서 2장 27절",
    outline: ["율법의 참된 의미", "마음의 할례", "이방인과 유대인의 구별 없음"],
  },

  // ── 헌금 ─────────────────────────────────────────────
  giving: {
    bankAccount: {
      bank: "국민은행",
      accountNumber: "123456-78-901234",
      holder: "알곡교회",
    },
    qrCodeUrl: null,
  },

  // ── 기도제목 ──────────────────────────────────────────
  prayerTopics: [
    { title: "다음 세대를 위한 기도", subtitle: "주일학교 교사 헌신자", category: "사역" },
    { title: "투병 중인 성도를 위한 기도", subtitle: "OOO 권사님", category: "병중" },
    { title: "선교사 파송을 위한 기도", subtitle: "단기선교팀", category: "선교" },
    { title: "구역 모임 부흥을 위한 기도", subtitle: "1구역", category: "소그룹" },
  ],
};

export default juboConfig;
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 3: 전체 스위트 확인**

Run: `pnpm test:run`
Expected: 전부 통과(기존 섹션을 안 건드렸으므로 Task 2~10의 테스트가 그대로 통과해야 함)

- [ ] **Step 4: Commit**

```bash
git add src/config/jubo.config.js
git commit -m "feat: jubo.config.js에 신규 3탭(말씀/헌금/기도제목) 데이터 추가

업데이트된 CSV 스펙(예배순서/말씀/공지/헌금/기도제목/섬기는 분들 6탭)
중 기존 주보에 없던 3개 콘텐츠의 정적 데이터를 기존 9탭과 동일한 패턴
(jubo.config.js)으로 추가했다. sermon.outline이 빈 배열이면 설교
개요 영역 비표시, giving.qrCodeUrl이 null이면 QR 카드 비표시,
prayerTopics가 빈 배열이면 빈 상태 문구 표시 — CSV의 옵션 처리 규칙을
그대로 데이터 기본값에 반영했다(예: outline은 실제로 값이 있는
예시, qrCodeUrl은 옵션이라 기본 null)."
```

---

## Task 12: `Sermon.jsx` — 말씀 (TDD)

**Files:**
- Create: `src/components/jubo/Sermon.jsx`
- Create: `src/components/jubo/Sermon.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `sermon`(Task 11), `shared.jsx`의 `SectionTitle`(Task 1)
- Produces: `Sermon` 컴포넌트(default export, props 없음) — Task 15가 `<Sermon />`으로 마운트한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/jubo/Sermon.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Sermon from "./Sermon";

describe("Sermon — 말씀", () => {
  it("설교 제목과 본문 말씀 참조를 렌더한다", () => {
    render(<Sermon />);
    expect(screen.getByText(juboConfig.sermon.title)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.sermon.scripture)).toBeInTheDocument();
  });

  it("설교 개요가 있으면 목록을 렌더한다", () => {
    render(<Sermon />);
    juboConfig.sermon.outline.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("좋아요 버튼을 클릭하면 하트 상태가 토글된다(로컬 상태만, 새로고침 시 초기화)", () => {
    render(<Sermon />);
    const likeBtn = screen.getByRole("button", { name: "좋아요" });
    fireEvent.click(likeBtn);
    expect(screen.getByRole("button", { name: "좋아요 취소" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "좋아요 취소" }));
    expect(screen.getByRole("button", { name: "좋아요" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/jubo/Sermon.test.jsx`
Expected: `Sermon.jsx`가 아직 없어 import 에러로 3개 테스트 전부 FAIL.

- [ ] **Step 3: `Sermon.jsx` 작성**

`src/components/jubo/Sermon.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import IcoHeartRed from "@/assets/icon-svg/heart-red.svg";
import IcoHeartStroke from "@/assets/icon-svg/heart-stroke.svg";
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Sermon() {
  const { sermon } = juboConfig;
  const [liked, setLiked] = useState(false);

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
            <path d="M12 6.253v13M12 6.253C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      >
        말씀
      </SectionTitle>
      <div className="mt-4 flex items-start justify-between gap-4">
        <h2 className="text-sub-tit-3 font-bold text-grey-11">{sermon.title}</h2>
        <button
          onClick={() => setLiked((prev) => !prev)}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          className="shrink-0 print:hidden"
        >
          <img src={liked ? IcoHeartRed : IcoHeartStroke} className="w-6 h-6" alt="" />
        </button>
      </div>
      <blockquote className="mt-5 pl-5 border-l-4 border-primary text-body-3 text-grey-9 leading-relaxed">
        {sermon.scripture}
      </blockquote>
      {sermon.outline?.length > 0 && (
        <div className="mt-6">
          <p className="text-body-5 font-bold text-grey-9 mb-2">설교 개요</p>
          <ul className="list-disc list-inside space-y-1">
            {sermon.outline.map((item, i) => (
              <li key={i} className="text-caption text-grey-7">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Sermon.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/components/jubo/Sermon.jsx src/components/jubo/Sermon.test.jsx
git commit -m "feat: 스마트 주보 말씀 탭(Sermon.jsx) 추가 — 좋아요는 로컬 토글 (TDD)

CSV 신규 스펙(설교 제목/본문 말씀 참조/옵션 설교개요/좋아요 버튼)을
구현했다. 좋아요는 사용자 확인에 따라 주보 탭 내부 로컬 상태로만
동작하고 성경읽기(BibleRead.jsx)의 savedVerses와는 연동하지 않는다
(savedVerses가 세션 전용 상태라 페이지 간 공유가 애초에 불가능함)."
```

---

## Task 13: `Giving.jsx` — 헌금 (TDD)

**Files:**
- Create: `src/components/jubo/Giving.jsx`
- Create: `src/components/jubo/Giving.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `giving`(Task 11), `shared.jsx`의 `SectionTitle`(Task 1)
- Produces: `Giving` 컴포넌트(default export, props 없음) — Task 15가 `<Giving />`으로 마운트한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/jubo/Giving.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Giving from "./Giving";

describe("Giving — 헌금", () => {
  beforeEach(() => {
    // jsdom의 navigator.clipboard는 getter만 있는 접근자 프로퍼티라 Object.assign으로는
    // 덮어쓸 수 없다 — Register.test.jsx에서 이미 검증된 patterns대로 configurable: true인
    // 값 프로퍼티로 재정의한다.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("은행명·계좌번호·예금주와 연말정산 안내 문구를 렌더한다", () => {
    render(<Giving />);
    expect(screen.getByText(juboConfig.giving.bankAccount.bank)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.giving.bankAccount.accountNumber)).toBeInTheDocument();
    expect(screen.getByText(/예금주/)).toBeInTheDocument();
    expect(screen.getByText(/연말정산/)).toBeInTheDocument();
  });

  it("계좌 카드를 클릭하면 계좌번호가 클립보드에 복사되고 '복사되었습니다'가 표시된다", async () => {
    render(<Giving />);
    fireEvent.click(screen.getByText(juboConfig.giving.bankAccount.accountNumber));

    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      juboConfig.giving.bankAccount.accountNumber,
    );
  });

  it("qrCodeUrl이 없으면 QR 카드가 렌더되지 않는다", () => {
    render(<Giving />);
    expect(screen.queryByAltText("헌금 QR 코드")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/jubo/Giving.test.jsx`
Expected: `Giving.jsx`가 아직 없어 import 에러로 3개 테스트 전부 FAIL.

- [ ] **Step 3: `Giving.jsx` 작성**

`src/components/jubo/Giving.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Giving() {
  const { giving } = juboConfig;
  const { bankAccount, qrCodeUrl } = giving;
  const [copied, setCopied] = useState(false);

  async function handleCopyAccount() {
    try {
      await navigator.clipboard.writeText(bankAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 조용히 무시(계좌번호는 여전히 화면에 보임)
    }
  }

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
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        }
      >
        헌금
      </SectionTitle>
      <div className="mt-5 flex flex-col gap-4">
        <button
          onClick={handleCopyAccount}
          className="text-left border border-bluegrey-2 rounded-xl p-5 hover:border-primary transition-colors print:pointer-events-none"
        >
          <p className="text-body-5 text-grey-6 mb-1">{bankAccount.bank}</p>
          <p className="text-sub-tit-4 font-bold text-grey-11 mb-1">
            {copied ? "복사되었습니다" : bankAccount.accountNumber}
          </p>
          <p className="text-body-5 text-grey-7">예금주: {bankAccount.holder}</p>
        </button>

        {qrCodeUrl && (
          <div className="border border-bluegrey-2 rounded-xl p-5 flex flex-col items-center gap-3">
            <img src={qrCodeUrl} alt="헌금 QR 코드" className="w-40 h-40 object-contain" />
            <p className="text-body-5 text-grey-6">QR 코드를 스캔해 온라인 헌금 페이지로 이동</p>
          </div>
        )}
      </div>
      <p className="mt-6 text-caption text-grey-6">
        헌금 영수증은 연말정산 시 자동 반영되며, 별도 발급이 필요한 경우 사무국으로 문의해 주세요.
      </p>
    </>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/Giving.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/components/jubo/Giving.jsx src/components/jubo/Giving.test.jsx
git commit -m "feat: 스마트 주보 헌금 탭(Giving.jsx) 추가 — 계좌 클립보드 복사 (TDD)

CSV 신규 스펙(계좌이체 카드+탭시 클립보드복사, 옵션 QR카드, 연말정산
안내문구)을 구현했다. 클립보드 복사는 Register.jsx의 기존 패턴
(navigator.clipboard.writeText + try/catch 미지원환경 방어)을
재사용했다."
```

---

## Task 14: `PrayerTopics.jsx` — 기도제목 (TDD)

**Files:**
- Create: `src/components/jubo/PrayerTopics.jsx`
- Create: `src/components/jubo/PrayerTopics.test.jsx`

**Interfaces:**
- Consumes: `jubo.config.js`의 `prayerTopics`(Task 11), `shared.jsx`의 `SectionTitle`(Task 1)
- Produces: `PrayerTopics` 컴포넌트(default export, props 없음) — Task 15가 `<PrayerTopics />`로 마운트한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/jubo/PrayerTopics.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import PrayerTopics from "./PrayerTopics";

describe("PrayerTopics — 기도제목", () => {
  it("모든 기도제목 항목과 카테고리 이모지를 렌더한다", () => {
    render(<PrayerTopics />);
    juboConfig.prayerTopics.forEach(({ title, subtitle }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });
    expect(screen.getByText("🙏")).toBeInTheDocument();
  });

  it("기도제목이 없으면 빈 상태 문구를 표시한다", () => {
    const original = [...juboConfig.prayerTopics];
    juboConfig.prayerTopics.length = 0;

    render(<PrayerTopics />);
    expect(screen.getByText("이번 주 기도제목을 준비 중입니다")).toBeInTheDocument();

    juboConfig.prayerTopics.push(...original);
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/jubo/PrayerTopics.test.jsx`
Expected: `PrayerTopics.jsx`가 아직 없어 import 에러로 2개 테스트 전부 FAIL.

- [ ] **Step 3: `PrayerTopics.jsx` 작성**

`src/components/jubo/PrayerTopics.jsx`를 새로 만든다:

```jsx
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

const CATEGORY_EMOJI = { 사역: "🙏", 병중: "❤️‍🩹", 선교: "🌍", 소그룹: "🏠" };

export default function PrayerTopics() {
  const { prayerTopics } = juboConfig;

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
            <path d="M12 21c-4-3.5-8-6.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4.5-4 7.5-8 11z" />
          </svg>
        }
      >
        기도제목
      </SectionTitle>
      {prayerTopics.length === 0 ? (
        <p className="mt-8 text-center text-body-4 text-grey-5">
          이번 주 기도제목을 준비 중입니다
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {prayerTopics.map((item, i) => (
            <div
              key={i}
              className="border border-bluegrey-2 rounded-xl p-4 flex items-start gap-3"
            >
              {item.category && (
                <span className="text-xl shrink-0" aria-hidden="true">
                  {CATEGORY_EMOJI[item.category] ?? "🙏"}
                </span>
              )}
              <div>
                <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                <p className="text-body-5 text-grey-6 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/jubo/PrayerTopics.test.jsx`
Expected: PASS (2/2)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/components/jubo/PrayerTopics.jsx src/components/jubo/PrayerTopics.test.jsx
git commit -m "feat: 스마트 주보 기도제목 탭(PrayerTopics.jsx) 추가 (TDD)

CSV 신규 스펙(카테고리 이모지+제목+부제목, 미등록 시 빈 상태 문구)을
구현했다."
```

---

## Task 15: `Jubo.jsx` 재작성 — 12탭 마운트 + 탭 전환 회귀 테스트

**Files:**
- Modify: `src/pages/Jubo/Jubo.jsx` (전체 교체)
- Create: `src/pages/Jubo/Jubo.test.jsx`

**Interfaces:**
- Consumes: Task 1~14에서 만든 `shared.jsx`의 `JuboPage`와 12개 탭 컴포넌트(전부 default export) — **Task 1~14 전부 완료 후 시작**
- Produces: 없음

- [ ] **Step 1: `Jubo.jsx` 전체 교체**

`src/pages/Jubo/Jubo.jsx`의 전체 내용을 다음으로 교체한다(기존 732줄 전체를 이 내용으로 덮어쓴다):

```jsx
import { useSearchParams } from "react-router";
import { JuboPage } from "@/components/jubo/shared";
import Cover from "@/components/jubo/Cover";
import Worship from "@/components/jubo/Worship";
import News from "@/components/jubo/News";
import Service from "@/components/jubo/Service";
import Offering from "@/components/jubo/Offering";
import Support from "@/components/jubo/Support";
import District from "@/components/jubo/District";
import Ministers from "@/components/jubo/Ministers";
import Direction from "@/components/jubo/Direction";
import Sermon from "@/components/jubo/Sermon";
import Giving from "@/components/jubo/Giving";
import PrayerTopics from "@/components/jubo/PrayerTopics";

const TABS = [
  "표지",
  "예배",
  "소식",
  "봉사",
  "예물",
  "후원",
  "구역",
  "섬기는 분들",
  "오시는 길",
  "말씀",
  "헌금",
  "기도제목",
];

// ── 탭별 렌더 ──────────────────────────────────────────
function renderTab(tab) {
  switch (tab) {
    case "표지":
      return (
        <JuboPage noPadding>
          <Cover />
        </JuboPage>
      );
    case "예배":
      return (
        <JuboPage>
          <Worship />
        </JuboPage>
      );
    case "소식":
      return (
        <JuboPage>
          <News />
        </JuboPage>
      );
    case "봉사":
      return (
        <JuboPage>
          <Service />
        </JuboPage>
      );
    case "예물":
      return (
        <JuboPage>
          <Offering />
        </JuboPage>
      );
    case "후원":
      return (
        <JuboPage>
          <Support />
        </JuboPage>
      );
    case "구역":
      return (
        <JuboPage>
          <District />
        </JuboPage>
      );
    case "섬기는 분들":
      return (
        <JuboPage>
          <Ministers />
        </JuboPage>
      );
    case "오시는 길":
      return (
        <JuboPage>
          <Direction />
        </JuboPage>
      );
    case "말씀":
      return (
        <JuboPage>
          <Sermon />
        </JuboPage>
      );
    case "헌금":
      return (
        <JuboPage>
          <Giving />
        </JuboPage>
      );
    case "기도제목":
      return (
        <JuboPage>
          <PrayerTopics />
        </JuboPage>
      );
    default:
      return null;
  }
}

// ── 메인 ───────────────────────────────────────────────
export default function Jubo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "표지";

  return (
    <>
      <style>{`
        @media print {
          header, footer, .jubo-no-print, .jubo-single-tab { display: none !important; }
          body { margin: 0; background: white; }
          @page { size: A4; margin: 0; }

          .jubo-print-all { display: block !important; }

          .jubo-page {
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          .jubo-page > div {
            height: 100% !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* 헤더 — 프린트 시 숨김 */}
        <div className="jubo-no-print">
          <h1 className="text-sub-tit-1 font-bold text-grey-12 mb-6">스마트 주보</h1>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchParams({ tab })}
                  className={`shrink-0 px-5 py-2 rounded-full text-body-3 border transition-colors font-medium ${
                    activeTab === tab
                      ? "bg-primary border-primary text-white font-semibold"
                      : "bg-white border-bluegrey-3 text-grey-8 hover:border-primary hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 인쇄 / PDF 저장 버튼 */}
            <button
              onClick={() => window.print()}
              title="인쇄 / PDF 저장"
              className="bg-bluegrey-1 border border-bluegrey-3 rounded-lg p-2 hover:bg-bluegrey-2 transition-colors"
            >
              <svg
                className="w-5 h-5 text-grey-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 화면: 현재 탭만 표시 */}
        <div className="jubo-single-tab">{renderTab(activeTab)}</div>

        {/* 인쇄 전용: 모든 탭을 순서대로 렌더 (화면에서는 숨김) */}
        <div className="jubo-print-all" style={{ display: "none" }}>
          <JuboPage noPadding>
            <Cover />
          </JuboPage>
          <JuboPage>
            <Worship />
          </JuboPage>
          <JuboPage>
            <News />
          </JuboPage>
          <JuboPage>
            <Service />
          </JuboPage>
          <JuboPage>
            <Offering />
          </JuboPage>
          <JuboPage>
            <Support />
          </JuboPage>
          <JuboPage>
            <District />
          </JuboPage>
          <JuboPage>
            <Ministers />
          </JuboPage>
          <JuboPage>
            <Direction />
          </JuboPage>
          <JuboPage>
            <Sermon />
          </JuboPage>
          <JuboPage>
            <Giving />
          </JuboPage>
          <JuboPage>
            <PrayerTopics />
          </JuboPage>
        </div>
      </div>
    </>
  );
}
```

이 파일은 더 이상 `useChurch`/`juboConfig`/`KakaoMap`/`Link`를 직접 쓰지 않는다(전부 각 탭 컴포넌트 안으로 이동 완료) — 그 심볼들에 대한 import도 전부 제거됐다.

- [ ] **Step 2: 테스트 작성**

`src/pages/Jubo/Jubo.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Jubo from "./Jubo";

const TABS = [
  "표지",
  "예배",
  "소식",
  "봉사",
  "예물",
  "후원",
  "구역",
  "섬기는 분들",
  "오시는 길",
  "말씀",
  "헌금",
  "기도제목",
];

describe("Jubo — 탭 전환", () => {
  it("12개 탭 버튼을 전부 렌더하고 기본 탭(표지)이 활성화된다", () => {
    renderWithChurch(<Jubo />, { withRouter: true });
    TABS.forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "표지" })).toHaveClass("bg-primary");
  });

  it("'말씀' 탭을 클릭하면 Sermon 콘텐츠로 전환된다", () => {
    renderWithChurch(<Jubo />, { withRouter: true });
    fireEvent.click(screen.getByRole("button", { name: "말씀" }));
    expect(screen.getByRole("button", { name: "말씀" })).toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: "좋아요" })).toBeInTheDocument();
  });

  it("'헌금' 탭을 클릭하면 Giving 콘텐츠로 전환된다", () => {
    renderWithChurch(<Jubo />, { withRouter: true });
    fireEvent.click(screen.getByRole("button", { name: "헌금" }));
    expect(screen.getByText(/연말정산/)).toBeInTheDocument();
  });

  it("'기도제목' 탭을 클릭하면 PrayerTopics 콘텐츠로 전환된다", () => {
    renderWithChurch(<Jubo />, { withRouter: true });
    fireEvent.click(screen.getByRole("button", { name: "기도제목" }));
    expect(screen.getByRole("heading", { name: "기도제목" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Jubo/Jubo.test.jsx`
Expected: PASS (4/4)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과 — 특히 옛 `Jubo.jsx`가 갖고 있던 import들이 각 탭 파일로 정확히 옮겨져서 미사용 import나 누락된 import가 없는지 이 빌드가 검증한다.

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/pages/Jubo/Jubo.jsx src/pages/Jubo/Jubo.test.jsx
git commit -m "feat: 스마트 주보 12탭(기존9+신규3) 마운트하는 얇은 부모로 Jubo.jsx 재작성

Jubo.jsx(732줄)가 탭별 컴포넌트를 마운트만 하는 얇은 부모가 됐다.
TABS 배열에 말씀/헌금/기도제목을 기존 9탭 뒤에 추가하고, 화면 전환용
renderTab과 인쇄용 전체렌더 두 곳 모두에 신규 3개 컴포넌트를 연결해
인쇄 시에도 12개 섹션이 전부 출력되도록 기존 인쇄 동작과 일관성을
유지했다."
```

---

## 태스크 의존 관계

```
Task 1 (shared.jsx 추출, 공용 기반)
  ├─→ Task 2 (Cover.jsx)
  ├─→ Task 3 (Worship.jsx)
  ├─→ Task 4 (News.jsx)
  ├─→ Task 5 (Service.jsx)
  ├─→ Task 6 (Offering.jsx)
  ├─→ Task 7 (Support.jsx)
  ├─→ Task 8 (District.jsx)
  ├─→ Task 9 (Ministers.jsx)
  ├─→ Task 10 (Direction.jsx)
  │
  ├─→ Task 11 (jubo.config.js에 신규 3탭 데이터 추가)
  │     ├─→ Task 12 (Sermon.jsx, TDD)
  │     ├─→ Task 13 (Giving.jsx, TDD)
  │     └─→ Task 14 (PrayerTopics.jsx, TDD)
  │
  └─→ Task 15 (Jubo.jsx 재작성 — Task 2~14 전부 필요)
```

Task 2~10과 Task 11(및 그 자식 12~14)은 서로 다른 파일만 건드리며 서로 의존하지 않는다(전부 Task 1만 의존) — 병렬 세션이라면 Task 1 완료 후 동시 진행 가능하다. Subagent-Driven Development는 구현자를 순차 디스패치하므로 순서상 1→2→3→…→14→15로 진행한다.

## Self-Review 메모

- **스펙 커버리지**: 설계 문서의 기존 9탭 순수 이동(Task 2~10), 신규 3탭 데이터(Task 11)+구현(Task 12~14), 탭 통합+회귀 테스트(Task 15) 전부 태스크로 매핑됨. 비목표(기존 탭 재설계, `juboService.js` 정리, 성경읽기 실제 연동, 관리자 CRUD, `JuboPreviewSection.jsx` 변경, "공지" 탭 통합)는 어떤 태스크에도 포함되지 않음 — 의도된 누락.
- **플레이스홀더 스캔**: 코드 블록에 TODO/TBD 없음. 모든 코드가 원본에서 검증된 그대로 옮겨졌으며(Task 2~10), 신규 로직(Task 12~14의 좋아요 토글/클립보드복사/빈상태)과 통합(Task 15)만 새로 작성됨.
- **타입/시그니처 일관성**: `shared.jsx`의 `JuboPage`/`SectionTitle` export 이름이 Task 2~14 전체에서 import하는 이름과 정확히 일치. `jubo.config.js`의 `sermon`/`giving`/`prayerTopics` 필드명이 Task 12~14의 소비 코드와 정확히 일치. Task 15의 12개 탭 컴포넌트 import 경로(`@/components/jubo/*`)가 Task 2~14가 실제로 만드는 파일 위치와 정확히 일치.
