# 모바일 디자인 개편 Phase 1(공용 셸 + 메인 화면) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 공용 셸(헤더/드로어/바텀탭/푸터)과 메인(홈) 화면을 Figma `ToGather_Design`
(fileKey `cjB2vAxWxHDuRIQbIPgDdy`)의 `m_Main`(`999:10366`)/`m_Main_menu`(`1058:7229`) 디자인대로
재구성한다.

**Architecture:** 기존 `RootLayout.jsx` 안의 `MobileHeader`/`MobileDrawer`/`BottomNav` 함수 컴포넌트와
`src/pages/Home/MobileHome.jsx`를 그대로 두고 내부만 교체한다. 새 파일은 만들지 않고(섹션 하나당
컴포넌트 함수를 같은 파일 안에 유지하는 기존 스타일 그대로), 공용 유틸 하나(`lookupVerseText`)만
새로 뽑아낸다. 데이터는 전부 기존 서비스 함수(`searchSermons`, `getNotices`, `getPhotos`)로 채운다.

**Tech Stack:** React 19, React Router v7, Tailwind v4 (유틸리티 클래스, 토큰은 `tokens.css` 기존 값
그대로), Vite+/Vitest(`vite-plus/test`), Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-11-mobile-redesign-phase1-main-design.md`

## Global Constraints

- 데스크톱(`md:` 이상) 레이아웃·라우팅·데이터 계약은 변경하지 않는다.
- 색상은 `tokens.css`의 기존 `blue-*`/`bluegrey-*`/`grey-*` 유틸리티 클래스만 쓴다 — 새 토큰 추가 금지.
- 아이콘은 `mob-icon`(1순위) → `web-icon`(보완) → 기존 인라인 SVG 재사용(바텀탭류) 순으로 채운다 —
  새 아이콘 파일을 추가하지 않는다.
- 홈 화면의 모든 섹션(이번주 말씀/공지 알림/예배 영상/갤러리)은 실제 API 데이터로 채운다 — 목업
  텍스트를 화면에 남기지 않는다.
- 폰트는 추가 로드하지 않는다 — 말씀 인용은 이미 로드된 `Gowun Batang`을 쓴다(`JuboV1Page1.jsx`/
  `JuboV2Page1.jsx`가 이미 `style={{ fontFamily: '"Gowun Batang", serif' }}`로 쓰는 것과 동일).
- `/교적부` 라우트 접근은 홈 퀵메뉴 4번째 자리로 보존한다(드로어에는 추가하지 않는다).

## Review Focus

- **비로그인 상태로 드로어를 열었을 때** 프로필 자리에 로그인/회원가입 버튼이 뜨고, `church.nav`나
  `currentUser` 관련 참조에서 에러 없이 렌더되는지 — `MobileDrawer`를 비로그인 컨텍스트로 테스트.
- **`/말씀/읽기`, `/말씀/필사` 페이지에서 바텀탭의 "성경"과 "예배" 탭 활성 상태가 서로 겹치지 않는지**
  (둘 다 `/말씀` 접두사라 match 함수를 정확히 분리해야 함) — 각 경로에서 활성 탭이 정확히 하나만
  표시되는지 테스트.
- **공지/설교/사진 API가 빈 배열을 반환할 때** 홈 화면의 "이번주 말씀"/"공지 알림"/"갤러리" 섹션이
  깨지지 않고 빈 상태를 보여주는지 — 현재 `MessageSection.jsx`의 `sermon ? ... : "아직 준비된
  말씀이 없습니다"` 패턴을 그대로 따르는지 확인.
- **`church.fax`가 없는 교회(desktop Footer가 이미 `church.fax &&` 조건부로 처리하는 필드)**에서
  모바일 푸터의 TEL/FAX 줄이 깨지지 않는지.
- **`lookupVerseText`가 `BOOK_ABBREV`에 없는 책 이름이나 파싱 실패하는 `scripture` 문자열**을
  받았을 때 `null`을 반환해 호출부가 안전하게 fallback 하는지(추출 시 동작 변경 없이 그대로
  옮기는지) — 유닛 테스트로 고정.

---

## Task 1: `lookupVerseText` 공용 유틸 추출

**Files:**
- Create: `src/utils/bibleVerse.js`
- Create: `src/utils/bibleVerse.test.js`
- Modify: `src/components/home/MessageSection.jsx` (12~27행의 `lookupVerseText` 정의 삭제, import로 교체)

**Interfaces:**
- Produces: `lookupVerseText(scripture: string | null | undefined): string | null` — `src/utils/bibleVerse.js`의 named export. Task 6(`MobileHome.jsx`)이 그대로 import해서 쓴다.

- [ ] **Step 1: 실패하는 테스트 작성**

```js
// src/utils/bibleVerse.test.js
import { describe, it, expect } from "vite-plus/test";
import { lookupVerseText } from "./bibleVerse";

describe("lookupVerseText", () => {
  it("단일 구절 참조를 본문으로 변환한다", () => {
    expect(lookupVerseText("로마서 9:15")).toEqual(expect.any(String));
  });

  it("범위 참조(-17)는 구절을 이어붙인다", () => {
    const text = lookupVerseText("골로새서 3:15-17");
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("BOOK_ABBREV에 없는 책 이름이면 null을 반환한다", () => {
    expect(lookupVerseText("없는책 1:1")).toBeNull();
  });

  it("파싱 불가능한 문자열이면 null을 반환한다", () => {
    expect(lookupVerseText("")).toBeNull();
    expect(lookupVerseText(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/utils/bibleVerse.test.js`
Expected: FAIL — `bibleVerse.js`가 없어 import 에러.

- [ ] **Step 3: `src/utils/bibleVerse.js`에 `lookupVerseText` 구현**

`MessageSection.jsx`의 현재 12~27행 로직(정규식으로 "책 N:M" 또는 "책 N:M-K" 파싱 →
`BOOK_ABBREV`로 약어 변환 → `bibleData[\`${abbrev}${chapter}:${v}\`]` 조회 → 공백 join)을 그대로
옮긴다. `import { BOOK_ABBREV } from "@/config/bible.config";` `import bibleData from
"@/data/bible.json";` 그대로 유지.

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/utils/bibleVerse.test.js`
Expected: PASS

- [ ] **Step 5: `MessageSection.jsx` 수정 — 로컬 정의 삭제하고 import로 교체**

`import { lookupVerseText } from "@/utils/bibleVerse";` 추가, 12~27행의 함수 정의 삭제. 그 외
로직 변경 없음.

- [ ] **Step 6: 기존 테스트 확인**

Run: `pnpm vitest run src/components/home/MessageSection.test.jsx` (있으면) 그리고
`pnpm vitest run src/pages/Home/Home.test.jsx` (있으면)
Expected: PASS (동작 변화 없음)

- [ ] **Step 7: 커밋**

```bash
git add src/utils/bibleVerse.js src/utils/bibleVerse.test.js src/components/home/MessageSection.jsx
git commit -m "refactor: lookupVerseText를 공용 유틸로 추출"
```

---

## Task 2: 모바일 헤더 재구성 (`MobileHeader`)

**Files:**
- Modify: `src/layouts/RootLayout.jsx:484-527` (`MobileHeader` 함수 전체)

**Interfaces:**
- Consumes: 기존 props 그대로 — `onMenuOpen: () => void`, `visible: boolean`, `barRef: Ref`.
- Produces: 변경 없음(다른 컴포넌트가 `MobileHeader`를 더 참조하지 않음).

- [ ] **Step 1: 기존 `RootLayout.test.jsx` 베이스라인 확인(변경 없음, 참고용)**

`src/layouts/RootLayout.test.jsx`가 이미 있지만 `DesktopHeader` 메가메뉴만 테스트한다
(`within(header)`에서 `header`는 `container.querySelector("header")` — DOM상 첫 번째
`<header>`인 DesktopHeader로 고정 스코프됨, `MobileHeader`/`MobileDrawer`/`BottomNav`는 이
파일에서 아예 쿼리하지 않는다). 지금 이 파일은 베이스라인에서 이미 4/5 테스트가 무관한 사유로
실패 중(`within(header).getByRole`에서 "container is null" 에러 — 이번 작업과 무관). 이 Task는
`MobileHeader`만 건드리므로 이 테스트 파일을 수정하지 않고, Step 4에서 실행해 실패 개수가
그대로(4개)인지만 확인한다(더 늘어나면 안 됨).

- [ ] **Step 2: 좌측을 교적부 아이콘에서 "로고 + 교회명"으로 교체**

`ChurchLogo` import는 이미 있음. 좌측 `<Link to="/교적부">` 블록을 제거하고, 대신
`<Link to="/" className="flex items-center gap-2"><ChurchLogo className="h-6 w-6
object-contain" alt="" /><span className="text-[17px] font-bold text-grey-10">{church.name}
</span></Link>`로 교체(가운데 절대배치였던 기존 로고 `<Link>`는 삭제 — 이제 좌측 고정 배치이므로
`absolute left-1/2 -translate-x-1/2`를 쓰지 않는다).

- [ ] **Step 3: 우측에 알림 벨 아이콘 추가(비활성)**

기존 햄버거 `<button onClick={onMenuOpen} ...>` 앞에 알림 아이콘을 추가한다. `import IcoBell from
"@/assets/mob-icon/bell-01.svg";` 후 `<span aria-hidden="true" className="p-1.5"><img src=
{IcoBell} className="w-6 h-6" alt="" /></span>` — `button`이 아니라 `span`으로 둬서 클릭해도
아무 동작이 없음을 명확히 한다(스펙의 "비활성" 결정). 햄버거 쪽은 `mob-icon/menu-01.svg`로 교체
(지금은 인라인 svg path) — `<button onClick={onMenuOpen} aria-label="메뉴 열기"><img
src={IcoMenu} className="w-6 h-6" alt="" /></button>`.

- [ ] **Step 4: 린트 + 베이스라인 테스트 확인**

Run: `pnpm run lint` (RootLayout.jsx 관련 새 에러 없는지만 확인 — 기존에 있던 무관한 에러는 무시)
Expected: `RootLayout.jsx`에 새로 생긴 에러 없음

Run: `pnpm vitest run src/layouts/RootLayout.test.jsx`
Expected: 4 failed | 1 passed (베이스라인과 동일 — 더 늘어나면 이 Task의 변경이 원인이니 되돌아가
확인한다)

- [ ] **Step 5: 커밋**

```bash
git add src/layouts/RootLayout.jsx
git commit -m "feat(mobile): 헤더를 Figma 디자인대로 재구성(로고+교회명 / 알림·햄버거)"
```

---

## Task 3: 모바일 드로어 재구성 (`MobileDrawer`)

**Files:**
- Modify: `src/layouts/RootLayout.jsx:529-645` (`MobileDrawer` 함수 전체), 그 바로 위에 `MOBILE_NAV` 상수 추가

**Interfaces:**
- Consumes: 기존 props 그대로 — `isOpen: boolean`, `onClose: () => void`.
- Produces: 변경 없음.

- [ ] **Step 1: `MOBILE_NAV` 상수 정의**

`MobileDrawer` 함수 정의 바로 위에 추가:

```js
const MOBILE_NAV = [
  {
    section: "교회소개",
    items: [
      { label: "예배시간", to: "/말씀?tab=예배 안내" },
      { label: "섬기는 사람들", to: "/교회소개?tab=섬기는 사람들" },
      { label: "안내", to: "/교회소개?tab=오시는 길" },
    ],
  },
  {
    section: "주일학교",
    items: [
      { label: "유치부", to: "/주일학교?tab=유치부" },
      { label: "초등부", to: "/주일학교?tab=초등부" },
      { label: "중고등부", to: "/주일학교?tab=중·고등부" },
      { label: "대학청년부", to: "/주일학교?tab=대학·청년부" },
    ],
  },
  {
    section: "전도・선교",
    items: [
      { label: "전도회 소개", to: "/전도선교?tab=전도회 소개" },
      { label: "국내외 선교", to: "/전도선교?tab=국내외 선교" },
      { label: "선교지 소식", to: "/전도선교?tab=선교지 소식" },
    ],
  },
  {
    section: "양육・훈련 게시판",
    items: [
      { label: "구역 모임", to: "/양육훈련?tab=구역모임" },
      { label: "오늘의 묵상", to: "/양육훈련?tab=오늘의 묵상" },
      { label: "제자 훈련", to: "/양육훈련?tab=제자훈련" },
      { label: "양육 프로그램", to: "/양육훈련?tab=양육프로그램" },
      { label: "양육・훈련 게시판", to: "/양육훈련?tab=양육/훈련 게시판" },
      { label: "성경 읽기/쓰기", to: "/양육훈련?tab=성경읽기/쓰기" },
    ],
  },
  {
    section: "교회 소식",
    items: [
      { label: "공지사항", to: "/공지사항" },
      { label: "교회행사", to: "/교회행사" },
      { label: "갤러리", to: "/갤러리" },
    ],
  },
];
```

(각 `to` 값의 tab 쿼리 문자열은 `Church.jsx`/`WordSermon.jsx`/`SundaySchool.jsx`/`Mission.jsx`/
`Nurture.jsx`의 기존 `TABS` 배열 문자열과 정확히 일치해야 한다 — 다른 값을 쓰면 해당 페이지가
기본 탭으로 떨어진다.)

- [ ] **Step 2: 드로어 상단을 "프로필 / 로그인·회원가입"으로 교체**

`church.nav.map(...)` 블록(570~597행)을 `MOBILE_NAV.map(({ section, items }) => (...))`로
교체한다 — 섹션 라벨은 `<p className="px-5 pt-4 pb-1 text-[12px] font-semibold text-grey-5">
{section}</p>`, 각 item은 `<Link to={item.to} onClick={onClose} className="block px-5 py-3
text-[15px] font-medium text-grey-10">{item.label}</Link>`.

드로어 헤더(553~567행, 지금은 교회명+닫기 버튼)는 그대로 두되 그 아래에 프로필 블록을 추가한다:
`currentUser`가 있으면 아바타(이니셜 또는 기본 아이콘) + `{currentUser.name}님`, 없으면 기존처럼
"로그인/회원가입" 두 버튼(지금 599~640행의 `currentUser ? ... : ...` 블록 중 **버튼 두 개
렌더하는 쪽만** 프로필 블록 자리로 옮긴다).

- [ ] **Step 3: 하단 버튼 — 로그인 시 "로그아웃"만, 비로그인 시 기존 로그인/회원가입 유지**

지금 599~640행의 조건부 블록에서 `currentUser` 분기의 "마이페이지" 버튼은 제거하고(Figma엔
없음, 바텀탭에 이미 마이페이지 탭이 있어 중복) "로그아웃" 버튼만 남긴다. 비로그인 분기(624~639행)는
변경하지 않는다.

- [ ] **Step 4: 수동 확인**

개발 서버로 로그인 상태/비로그인 상태 각각에서 드로어를 열어 프로필·섹션·하단 버튼이 의도대로
나오는지 확인한다(자동 테스트는 Task 6에서 `MobileHome`과 함께 간접 커버되는 정도로 충분 —
드로어 자체는 로그인 상태 분기가 이미 `currentUser` 하나뿐이라 과한 전용 테스트 파일은 만들지
않는다. YAGNI).

- [ ] **Step 5: 커밋**

```bash
git add src/layouts/RootLayout.jsx
git commit -m "feat(mobile): 드로어를 Figma 섹션 구조로 재구성"
```

---

## Task 4: 바텀 네비게이션 재구성 (`BottomNav`)

**Files:**
- Modify: `src/layouts/RootLayout.jsx:650-820` (아이콘 함수들 + `BottomNav` 함수)

**Interfaces:**
- Produces: 변경 없음(다른 파일이 `BottomNav`를 참조하지 않음).

- [ ] **Step 1: 탭 구성을 5개(홈/예배/성경/캘린더/마이페이지)로, match 함수를 서로 안 겹치게 교체**

```js
const tabs = [
  { label: "홈", to: "/", icon: (a) => <IconHome active={a} />, match: (p) => p === "/" },
  {
    label: "예배",
    to: "/말씀",
    icon: (a) => <IconWorship active={a} />,
    match: (p) => p === "/말씀" || (p.startsWith("/말씀") && !p.startsWith("/말씀/읽기") && !p.startsWith("/말씀/필사")),
  },
  {
    label: "성경",
    to: "/말씀/읽기",
    icon: (a) => <IconBible active={a} />,
    match: (p) => p.startsWith("/말씀/읽기") || p.startsWith("/말씀/필사"),
  },
  { label: "캘린더", to: "/교회행사", icon: (a) => <IconCalendar active={a} />, match: (p) => p.startsWith("/교회행사") },
  { label: "마이페이지", to: "/mypage", icon: (a) => <IconMyPage active={a} />, match: (p) => p.startsWith("/mypage") },
];
```

(`IconJubo`는 더 이상 쓰이지 않으므로 삭제. `isHome` 분기/가운데 떠있는 원형 렌더링 분기도
삭제한다 — 이제 5개 탭 전부 같은 모양.)

- [ ] **Step 2: `IconHome`에 `active` prop 추가 — 더 이상 항상 흰색 고정 아이콘이 아님**

현재 `IconHome`은 `active` 없이 `text-white` 고정이다. `IconBible`/`IconCalendar`/`IconMyPage`와
같은 패턴(`className={... active ? "text-primary" : "text-grey-6"}`)으로 맞춘다.

- [ ] **Step 3: `IconWorship` 신규 추가(예배 탭 아이콘)**

`IconBible` 바로 아래에 같은 시그니처로 추가 — 종이/문서 느낌의 outline 아이콘(Figma
`hugeicons:note`에 해당). 정확한 path 재현보다 "성경"(책 모양)과 구분되는 문서/메모 모양이면
충분:

```jsx
function IconWorship({ active }) {
  return (
    <svg className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.75h7.5L19.5 9v11.25a1 1 0 01-1 1h-11.5a1 1 0 01-1-1V4.75a1 1 0 011-1zM14.5 3.75V9h5M9 13.5h6M9 17h6" />
    </svg>
  );
}
```

- [ ] **Step 4: `select-bg` 알약(pill) 활성 배경 렌더링**

각 탭 `<Link>`를 `flex-1 flex flex-col items-center justify-center gap-1 py-2 mx-1 rounded-full
${active ? "bg-bluegrey-2" : ""}`로 — Figma의 `select-bg`(`#F6F6F8` 배경, 활성 탭 자리만)를
그대로 재현. 텍스트 색은 기존처럼 `active ? "text-primary" : "text-grey-6"`.

- [ ] **Step 5: 수동 확인**

개발 서버에서 `/`, `/말씀`, `/말씀/읽기`, `/말씀/필사`, `/교회행사`, `/mypage` 각각 들어가 활성
탭이 정확히 하나씩만 켜지는지 확인(Review Focus 2번 항목).

- [ ] **Step 6: 커밋**

```bash
git add src/layouts/RootLayout.jsx
git commit -m "feat(mobile): 바텀탭을 홈/예배/성경/캘린더/마이페이지 5개로 재구성"
```

---

## Task 5: 모바일 푸터 재구성 (`Footer.jsx`)

**Files:**
- Modify: `src/components/common/Footer.jsx:114-189` (모바일 분기만)

**Interfaces:**
- Consumes: 기존과 동일 — `isHome: boolean` prop(데스크톱 분기에서는 계속 사용, 모바일 분기에서는
  더 이상 테마 분기에 쓰지 않음).

- [ ] **Step 1: 모바일 분기의 다크 테마 제거 — 항상 밝은 배색 고정**

115행 `<footer className={\`${bgClass} border-t ${borderClass} md:hidden ...\`}>`에서 모바일
전용 고정 클래스로 교체: `<footer className="bg-bluegrey-2 border-t border-bluegrey-3 md:hidden
pb-[calc(64px+env(safe-area-inset-bottom))]">`. 내부에서 `isHome ? ... : ...` 삼항으로 분기하던
텍스트/아이콘 색 클래스(123, 126, 131, 137, 143행 등)도 전부 비분기 고정값으로 교체(`text-grey-7`,
`text-grey-9`, `text-grey-6` 등 기존 "비홈" 쪽 값 그대로 사용).

- [ ] **Step 2: Copyright 줄 추가**

137~144행의 "교회 정보" 블록 마지막에 한 줄 추가:
`<span>Copyright © Togather All rights reserved.</span>`

- [ ] **Step 3: SNS 아이콘 행 — 유지**

Figma 캡처엔 SNS 아이콘이 안 보이지만, 데스크톱 푸터도 `church.social?.*`가 있을 때만 조건부로
그리므로(없으면 아무것도 안 뜸) 그대로 둬도 Figma 스크린샷(마침 SNS 값이 비어 있던 샘플
데이터일 뿐일 수 있음)과 실질적으로 다르지 않다. 코드 수정 없이 유지.

- [ ] **Step 4: 데스크톱 분기(22~112행) 비교 — 변경 없는지 diff로 확인**

Run: `git diff src/components/common/Footer.jsx`
Expected: 22~112행(데스크톱 `<footer>`) 변경 없음, 114행 이후만 변경됨.

- [ ] **Step 5: 수동 확인**

개발 서버 모바일 폭에서 홈(`isHome` true)과 다른 페이지(`isHome` false) 양쪽 다 같은 밝은
배색으로 나오는지, `church.fax`가 없는 경우(테스트용으로 `church.config.js`의 `fax` 값을
일시적으로 지워보고) TEL/FAX 줄이 깨지지 않는지 확인 후 원복.

- [ ] **Step 6: 커밋**

```bash
git add src/components/common/Footer.jsx
git commit -m "fix(mobile): 모바일 푸터를 Figma대로 밝은 배색 고정 + Copyright 추가"
```

---

## Task 6: `MobileHome.jsx` 섹션 재구성 (퀵메뉴 포함)

**Files:**
- Modify: `src/pages/Home/MobileHome.jsx` (전체 — `WeeklySermonSection`/`BibleVerseSection`
  삭제 후 `ThisWeekMessageSection` 신설, 신규 `QuickMenu` 섹션 추가,
  `NoticeAlertSection` 리스트 레이아웃 변경, `GallerySection` 신설, `MobileHome` 본문 조립)
- Modify: `src/pages/Home/MobileHome.test.jsx` (새 섹션에 맞게 테스트 보강)

**Interfaces:**
- Consumes: Task 1의 `lookupVerseText` (`@/utils/bibleVerse`).
- Consumes 서비스: `searchSermons(churchId, { size }) -> Promise<{ sermons: Sermon[] }>`
  (`@/services/sermonService`, `Sermon.worshipType`, `.scripture`, `.sermonDate`),
  `getNotices(churchId, { limit }) -> Promise<{ data: Notice[] }>`(기존과 동일, 변경 없음),
  `getPhotos(churchId, { limit }) -> Promise<Photo[]>`(`@/services/galleryService`,
  `Photo = { id, title, date, imageUrl }`).
- Produces: `QuickMenu()` — 이 태스크 안에서 정의되고 바로 `MobileHome` 본문에서 사용(다른
  태스크가 소비하지 않음).

- [ ] **Step -2: `QuickMenu` 아이콘 4개 import**

```js
import IcoMenu01 from "@/assets/mob-icon/icon-main-menu-01.svg";
import IcoMenu02 from "@/assets/mob-icon/icon-main-menu-02.svg";
import IcoMenu03 from "@/assets/mob-icon/icon-main-menu-03.svg";
```

(4번째 "교적부"는 아이콘 파일이 아니라 인라인 SVG — 다음 Step 참고.)

- [ ] **Step -1: `IconGyojeokbu` 인라인 컴포넌트 + `QuickMenu` 컴포넌트 구현**

`RootLayout.jsx`의 기존 교적부 아이콘 path(`M4.5 19.5A2.5 2.5 0 017 17h11M4.5 19.5A2.5 2.5 0
007 22h11a1 1 0 001-1V4a1 1 0 00-1-1H7a2.5 2.5 0 00-2.5 2.5v14z`)를 그대로 가져와 `MobileHome.jsx`
안에 작게 정의한다(별도 파일 없음 — 이 화면에서만 쓰는 아이콘):

```jsx
function IconGyojeokbu() {
  return (
    <svg className="w-8 h-8 text-grey-10" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5A2.5 2.5 0 017 17h11M4.5 19.5A2.5 2.5 0 007 22h11a1 1 0 001-1V4a1 1 0 00-1-1H7a2.5 2.5 0 00-2.5 2.5v14z" />
    </svg>
  );
}

const QUICK_MENU = [
  { label: "교회소개", to: "/교회소개" },
  { label: "행사・소식", to: "/교회행사" },
  { label: "스마트 주보", to: "/주보" },
  { label: "교적부", to: "/교적부" },
];

function QuickMenu() {
  return (
    <div className="flex justify-center gap-[29px] px-5 pb-6 pt-1">
      {QUICK_MENU.map((item, i) => (
        <Link key={item.label} to={item.to} className="flex flex-col items-center gap-[11px] w-[58px]">
          <div className="w-full h-[58px] rounded-[14px] bg-bluegrey-2 flex items-center justify-center">
            {i === 0 && <img src={IcoMenu01} className="w-8 h-8" alt="" />}
            {i === 1 && <img src={IcoMenu02} className="w-8 h-8" alt="" />}
            {i === 2 && <img src={IcoMenu03} className="w-8 h-8" alt="" />}
            {i === 3 && <IconGyojeokbu />}
          </div>
          <span className="text-[12px] font-semibold text-grey-10 text-center">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 0: 기존 테스트를 URL 분기 mock으로 전환 (선행 작업)**

지금 `MobileHome.test.jsx`의 유일한 테스트는 `api.get.mockResolvedValue({ data: { data: [...] }
})`로 **모든** `api.get` 호출에 같은(공지 배열) 응답을 준다. 이번 Task에서 `MobileHome`이
설교(`searchSermons`)·사진(`getPhotos`) 호출을 추가로 하게 되면, 그 호출들도 똑같이 공지 배열
모양 응답을 받게 되어 `searchSermons`가 기대하는 `res.data.data.content`가 `undefined`가 되고
`sermonResponse.sermons.find(...)`에서 터진다(Review Focus 3번과 별개로, 테스트 자체가 깨지는
회귀). 그 전에 기존 테스트의 `mockResolvedValue`를 Step 1과 같은 `mockImplementation`(URL 문자열
분기) 방식으로 먼저 바꿔서 공지 테스트가 계속 공지 모양만 받도록 고정한다.

- [ ] **Step 1: 실패하는 테스트 추가 — "이번주 말씀" 실데이터**

```js
// MobileHome.test.jsx에 추가
it("이번주 말씀 섹션에서 주일예배 설교를 조회해 성구를 보여준다", async () => {
  api.get.mockImplementation((url) => {
    if (url.includes("/church/sermons")) {
      return Promise.resolve({
        data: { data: { content: [{ id: 1, worshipType: "주일 1부", scripture: "로마서 9:15", sermonDate: "2026-07-12", preacher: "임재호" }], pageInfo: {} } },
      });
    }
    if (url.includes("/gallery")) return Promise.resolve({ data: { data: [] } });
    return Promise.resolve({ data: { data: [] } });
  });
  renderWithChurch(<MobileHome />, { withRouter: true });
  expect(await screen.findByText("이번주 말씀")).toBeInTheDocument();
});
```

(`searchSermons`는 `api.get("/church/sermons", ...)` → `{ sermons: res.data.data.content, pageInfo:
res.data.data.pageInfo }`를 반환한다 — `sermonService.js:124-133` 참고. `getPhotos`는
`api.get(\`/churches/${churchId}/gallery\`, ...)` → `res.data.data`(배열)를 그대로 반환한다 —
`galleryService.js` 참고. 기존 `MobileHome.test.jsx`의 첫 번째 테스트처럼 `api.get`에 전달되는
URL 문자열 패턴으로 분기한다.)

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/pages/Home/MobileHome.test.jsx`
Expected: FAIL (섹션이 아직 mock 텍스트라 성구가 안 뜸)

- [ ] **Step 3: `WeeklySermonSection` + `BibleVerseSection`을 `ThisWeekMessageSection` 하나로 교체**

`MessageSection.jsx`의 `searchSermons` + `주일`로 시작하는 worshipType 필터 로직을 그대로
가져온다(복붙이 아니라 같은 패턴 — 이 컴포넌트 전용으로 짧게 다시 쓴다. 공용 훅으로 더 뽑아내는
건 2곳뿐이라 YAGNI, 하지 않는다). 날짜 chip은 `sermonDate`를 `M. D 주일 예배` 형식으로
포맷(`new Date(...).toLocaleDateString` 활용), 본문은 `lookupVerseText(sermon.scripture) ||
sermon.scripture`에 `style={{ fontFamily: '"Gowun Batang", serif' }}` 적용, 출처는
`sermon.scripture`. 설교가 없으면(`!sermon`) "아직 준비된 말씀이 없습니다" 문구로 폴백(Review
Focus 3번).

- [ ] **Step 4: `NoticeAlertSection` — 가로 스크롤 카드를 세로 리스트로 교체**

`rest.slice(0, 6).map(...)` 가로 스크롤 블록(121~134행)을 Figma 구조(세로 리스트, 각 행 좌측에
얇은 색 바 + 제목/날짜)로 교체. 상단 고정 1건(top) 로직은 그대로 유지.

- [ ] **Step 5: `GallerySection` 신규 추가**

```jsx
function GallerySection({ photos }) {
  if (!photos.length) return null;
  return (
    <section className="px-5 py-6">
      <SectionHeader title="갤러리" to="/갤러리" />
      <div className="flex gap-3 overflow-x-auto -mx-5 px-5 scrollbar-hide">
        {photos.map((p) => (
          <Link key={p.id} to={`/갤러리?community=${encodeURIComponent(p.communityName ?? "")}`} className="relative shrink-0 w-[298px] h-[186px] rounded-[10px] overflow-hidden">
            <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-[14px] font-semibold">{p.title}</p>
              <p className="text-[12px] text-white/70">{p.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

(`Photo`에 `communityName` 필드가 실제로 있는지 `galleryService.js`의 typedef를 다시 확인 —
없으면 링크는 그냥 `/갤러리`로 단순화한다.)

- [ ] **Step 6: `MobileHome` 본문 조립**

```jsx
export default function MobileHome() {
  const { church } = useChurch();
  const { data: noticeResponse = { data: [] } } = useFetch(
    () => getNotices(church.id, { limit: 10 }), [church.id], { data: [] },
  );
  const { data: sermonResponse = { sermons: [] } } = useFetch(
    () => searchSermons(church.id, { size: 10 }), [church.id], { sermons: [] },
  );
  const { data: photos = [] } = useFetch(
    () => getPhotos(church.id, { limit: 6 }), [church.id], [],
  );
  const sundaySermon = sermonResponse.sermons.find((s) => s.worshipType?.startsWith("주일"));

  return (
    <div className="flex flex-col bg-white">
      <MobileSearchBar />
      <ThisWeekMessageSection sermon={sundaySermon} />
      <QuickMenu />
      <VideoSection
        youtubeUrl={sundaySermon?.videoId ? `https://www.youtube.com/watch?v=${sundaySermon.videoId}` : church.social?.youtube}
        pastor={`${sundaySermon?.preacher || church.pastor || "담임목사"} 목사`}
        title={sundaySermon?.title ?? ""}
        isLive={false}
      />
      <NoticeAlertSection notices={noticeResponse.data} />
      <GallerySection photos={photos} />
    </div>
  );
}
```

(기존 하드코딩 `sermon`/`verse` 객체 리터럴은 전부 삭제.)

- [ ] **Step 7: 테스트 통과 확인 + 커밋**

Run: `pnpm vitest run src/pages/Home/MobileHome.test.jsx`
Expected: PASS

```bash
git add src/pages/Home/MobileHome.jsx src/pages/Home/MobileHome.test.jsx
git commit -m "feat(mobile): 홈 화면을 Figma 섹션 구조(말씀/퀵메뉴/영상/공지/갤러리)로 재구성"
```

---

## Task 7: 전체 동작 확인

**Files:** 없음(코드 변경 없음 — 수동 검증 전용 태스크)

- [ ] **Step 1: 전체 테스트 스위트 실행**

Run: `pnpm vitest run`
Expected: 이번 Phase에서 건드린 파일 관련 테스트 전부 PASS, 다른 테스트는 기존 상태와 동일(이번
변경으로 새로 깨진 테스트 없음)

- [ ] **Step 2: lint/typecheck**

Run: `vp check`
Expected: 이번에 수정한 파일에서 새로 생긴 에러 없음(기존에 있던 무관한 에러는 그대로 둠)

- [ ] **Step 3: 개발 서버로 모바일 폭(375px) 수동 확인**

Run: `pnpm run dev`, 브라우저 반응형 모드 375px로 홈(`/`) 진입 — 헤더/퀵메뉴/말씀카드/영상/공지/
갤러리/푸터/바텀탭이 전부 Figma 스크린샷과 비슷한지, 드로어·로그인 전/후 상태, 바텀탭 5개 경로
전환을 눈으로 확인한다.

- [ ] **Step 4: 완료 보고**

이 태스크에는 커밋이 없다(검증 전용).
