# 예배·방송 탭 구조 정비 + 회귀 테스트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `WordTabBar`를 CSV 명세(실시간 예배/예배 목록/예배 안내/스마트 주보)에 맞는 4탭으로 정정하고, "예배 안내"를 교회소개에서 예배·방송으로 이전하는 신규 페이지를 만들고, `/말씀` 리다이렉트 버그를 고치고, 죽은 코드(`WordPraise`)를 삭제하고, 예배·방송 도메인 전체(`WordTabBar`/`WordSermon`/`WordBroadcast`/`WordSermonDetail`/`WordInfo`)에 회귀 테스트를 추가한다.

**Architecture:** 기존 `WordSermon.jsx`/`WordBroadcast.jsx`의 Hero+`WordTabBar` 패턴을 그대로 따르는 신규 `WordInfo.jsx`를 만들고, 그 안에는 이미 테스트된 `WorshipInfo` 컴포넌트(`src/components/church/WorshipInfo.jsx`)를 재사용한다. 이 컴포넌트 자체는 수정하지 않는다. `Church.jsx`에서는 "예배 안내" 탭만 제거한다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react`, `react-router` v7, `src/test/renderWithChurch.jsx`(`initialEntries` 옵션으로 자동 `MemoryRouter` 래핑).

## Global Constraints

- `describe`/`it`/`expect`/`beforeEach`는 `"vite-plus/test"`에서 import한다.
- `sermonService.getLiveSermon`/`getPastSermons`는 테스트 환경에서 `USE_DUMMY=true`(기본값)라 결정론적 더미 데이터를 반환한다: `DUMMY_LIVE_SERMON = null`(`src/data/dummy/sermons.js`), `DUMMY_PAST_SERMONS` 6건(`id`/`videoId`(전부 `null`)/`title`/`date`/`thumbnail`). 테스트에서 실제 성경 데이터를 참조했던 것과 같은 원칙으로, 이 배열을 직접 import해서 단언 대상 문자열을 얻는다 — 타이틀 텍스트를 하드코딩해서 베끼지 않는다.
- `DUMMY_LIVE_SERMON = null`이므로 `WordBroadcast`는 테스트에서 항상 `status === "ended"` 분기로 렌더된다(`DUMMY_PAST_SERMONS[0]`이 존재하므로). `status === "live"`/`"none"` 분기는 이 더미 데이터로 도달 불가 — 이번 사이클의 테스트 범위 밖이다.
- 기본 `church.config.js`의 `social.youtube`는 `"https://www.youtube.com/channel/UCEqVXU3lm5RbDRWbTSPc_yg"`로 항상 값이 있다(null 아님) — `videoId`가 없을 때의 "YouTube에서 보기"/"유튜브 채널에서 보기" 링크가 항상 렌더된다는 뜻이다.
- 페이지 컴포넌트 테스트는 `renderWithChurch(ui, { initialEntries: [...] })`를 쓴다 — `initialEntries`를 넘기면 헬퍼가 자동으로 `MemoryRouter`로 감싼다(`withRouter: true`를 별도로 넘길 필요 없음).
- `useParams()`를 쓰는 컴포넌트(`WordSermonDetail`)는 `renderWithChurch`에 넘기는 `ui` 자체를 `<Routes><Route path="..." element={...} /></Routes>`로 감싸야 한다 — 그냥 `initialEntries`만으로는 라우트 매칭이 안 돼 `useParams()`가 빈 객체를 반환한다.

---

## Task 1: `WordTabBar` 4탭 정정 (TDD)

**Files:**
- Modify: `src/components/word/WordTabBar.jsx`
- Test: `src/components/word/WordTabBar.test.jsx` (신규)

**Interfaces:**
- Consumes: 없음
- Produces: `TABS` 배열의 최종 `to` 경로(`/말씀/방송`, `/말씀/설교`, `/말씀/안내`, `/주보`) — Task 2(WordInfo)·Task 3(routes.jsx)가 이 경로들과 일치해야 탭이 실제로 동작한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/word/WordTabBar.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import WordTabBar from "./WordTabBar";

function renderTabBar(path = "/말씀/방송") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <WordTabBar />
    </MemoryRouter>,
  );
}

describe("WordTabBar", () => {
  it("4개 탭을 CSV 명세 순서·라벨대로 렌더한다", () => {
    renderTabBar();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "실시간 예배",
      "예배 목록",
      "예배 안내",
      "스마트 주보",
    ]);
  });

  it("각 탭이 올바른 경로로 연결된다", () => {
    renderTabBar();
    expect(screen.getByRole("link", { name: "실시간 예배" })).toHaveAttribute(
      "href",
      "/말씀/방송",
    );
    expect(screen.getByRole("link", { name: "예배 목록" })).toHaveAttribute(
      "href",
      "/말씀/설교",
    );
    expect(screen.getByRole("link", { name: "예배 안내" })).toHaveAttribute(
      "href",
      "/말씀/안내",
    );
    expect(screen.getByRole("link", { name: "스마트 주보" })).toHaveAttribute("href", "/주보");
  });

  it("현재 경로와 일치하는 탭만 활성 스타일을 갖는다", () => {
    renderTabBar("/말씀/방송");
    expect(screen.getByRole("link", { name: "실시간 예배" })).toHaveClass("border-blue-8");
    expect(screen.getByRole("link", { name: "예배 목록" })).not.toHaveClass("border-blue-8");
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/word/WordTabBar.test.jsx`
Expected: 3개 테스트 전부 FAIL — 현재 `TABS`는 2개 항목(`예배 다시보기`/`실시간 설교 보기`)뿐이고 라벨·경로·순서가 다르다.

- [ ] **Step 3: `TABS` 배열 정정**

`src/components/word/WordTabBar.jsx`의 다음 블록을:

```jsx
const TABS = [
  { label: "예배 다시보기", to: "/말씀/설교" },
  { label: "실시간 설교 보기", to: "/말씀/방송" },
  // { label: "찬양 리스트", to: "/말씀/찬양" },
];
```

다음으로 교체한다(나머지 `WordTabBar` 함수 본문은 그대로 둔다 — `TABS.map`이 그대로 4개 항목을 순회하므로 렌더 로직 변경 불필요):

```jsx
const TABS = [
  { label: "실시간 예배", to: "/말씀/방송" },
  { label: "예배 목록", to: "/말씀/설교" },
  { label: "예배 안내", to: "/말씀/안내" },
  { label: "스마트 주보", to: "/주보" },
];
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/word/WordTabBar.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 5: 전체 스위트 확인**

Run: `pnpm test:run`
Expected: 전부 통과(다른 파일은 아직 안 건드렸으므로 기존 테스트 그대로 통과해야 함)

- [ ] **Step 6: Commit**

```bash
git add src/components/word/WordTabBar.jsx src/components/word/WordTabBar.test.jsx
git commit -m "fix: WordTabBar를 CSV 명세대로 4탭(실시간 예배/예배 목록/예배 안내/스마트 주보)으로 정정 (TDD)

기존엔 2탭(예배 다시보기/실시간 설교 보기)뿐이었고 라벨·순서도 CSV
149행과 달랐다. 명세대로 라벨·순서를 정정하고 예배 안내·스마트 주보
탭을 추가했다(대상 페이지는 후속 태스크에서 연결)."
```

---

## Task 2: `WordInfo` 신규 페이지 (예배 안내)

**Files:**
- Create: `src/pages/WordInfo/WordInfo.jsx`
- Test: `src/pages/WordInfo/WordInfo.test.jsx`

**Interfaces:**
- Consumes: `WordTabBar`(Task 1에서 4탭으로 정정 완료 — `"예배 안내"` 탭의 `to`가 `/말씀/안내`), 기존 `WorshipInfo`(`src/components/church/WorshipInfo.jsx`, 수정하지 않고 그대로 렌더)
- Produces: `WordInfo` 컴포넌트(default export) — Task 3(routes.jsx)이 `말씀/안내` 라우트에 이 컴포넌트를 연결한다.

- [ ] **Step 1: 페이지 컴포넌트 작성**

`src/pages/WordInfo/WordInfo.jsx`를 새로 만든다(`WordSermon.jsx`/`WordBroadcast.jsx`와 동일한 Hero 마크업, 본문에 기존 `WorshipInfo` 재사용):

```jsx
import WordTabBar from "@/components/word/WordTabBar";
import WorshipInfo from "@/components/church/WorshipInfo";

export default function WordInfo() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12">
        <WorshipInfo />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/pages/WordInfo/WordInfo.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import WordInfo from "./WordInfo";

describe("WordInfo — 예배 안내", () => {
  it("Hero 제목과 WordTabBar, 예배 시간표 내용을 렌더한다", () => {
    renderWithChurch(<WordInfo />, { initialEntries: ["/말씀/안내"] });

    expect(screen.getByRole("heading", { name: "예배·방송" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "예배 안내" })).toHaveClass("border-blue-8");
    expect(screen.getByText("정기 예배")).toBeInTheDocument();
    expect(screen.getByText(churchConfig.worshipSchedule.regular[0].name)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/WordInfo/WordInfo.test.jsx`
Expected: PASS (1/1) — 이 태스크는 이미 존재하는 컴포넌트 2개를 조합하는 것뿐이라 실패 없이 바로 통과해야 정상이다.

- [ ] **Step 4: 전체 스위트 확인**

Run: `pnpm test:run`
Expected: 전부 통과

- [ ] **Step 5: Commit**

```bash
git add src/pages/WordInfo/WordInfo.jsx src/pages/WordInfo/WordInfo.test.jsx
git commit -m "feat: 예배 안내 페이지(WordInfo) 추가 — 교회소개에서 이전 예정

WordSermon/WordBroadcast와 동일한 Hero+WordTabBar 패턴이며, 본문은
기존에 이미 테스트된 WorshipInfo 컴포넌트를 그대로 재사용한다(컴포넌트
자체는 수정하지 않음). 라우트 연결은 다음 태스크에서 처리한다."
```

---

## Task 3: `routes.jsx` — 라우트 연결 + 리다이렉트 수정 + 죽은 코드 삭제

**Files:**
- Modify: `src/routes.jsx`
- Modify: `src/routes.test.jsx` (기존 파일에 새 `describe` 블록 추가 — 기존 3개 테스트는 절대 건드리지 않는다)
- Delete: `src/pages/WordPraise/WordPraise.jsx`

**Interfaces:**
- Consumes: `WordInfo`(Task 2에서 만든 default export)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성**

`src/routes.test.jsx` 파일 하단에 새 `describe` 블록을 추가한다(파일 상단 import는 이미 `createMemoryRouter`, `RouterProvider`, `routes`, `render`, `screen`, `describe`/`it`/`expect`/`beforeEach`를 갖고 있으므로 추가 import 불필요):

```jsx
describe("routes — /말씀 리다이렉트 + 예배 안내 라우트", () => {
  it("/말씀 진입 시 /말씀/방송(예배·방송 기본 탭)으로 리다이렉트된다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { name: "예배·방송" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "실시간 예배" })).toHaveClass("border-blue-8");
  });

  it("/말씀/안내 진입 시 예배 안내 페이지가 렌더된다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/안내"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("정기 예배")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/routes.test.jsx`
Expected: 새 2개 테스트 FAIL — 현재 `/말씀`은 `/양육훈련`으로 리다이렉트되고(첫 번째 테스트가 "예배·방송" 헤딩을 못 찾음), `/말씀/안내` 라우트 자체가 없어 `PageNotFound`가 렌더된다(두 번째 테스트가 "정기 예배"를 못 찾음). 기존 3개 테스트는 계속 PASS해야 한다.

- [ ] **Step 3: `routes.jsx` 수정**

`src/routes.jsx` 상단 import 블록에서:

```jsx
import WordSermonDetail from "@/pages/WordSermon/WordSermonDetail";
// import WordPraise from "@/pages/WordPraise/WordPraise";
```

다음으로 교체(주석 처리된 죽은 import 삭제, `WordInfo` import 추가):

```jsx
import WordSermonDetail from "@/pages/WordSermon/WordSermonDetail";
import WordInfo from "@/pages/WordInfo/WordInfo";
```

`routes` 배열 안의 다음 블록을:

```jsx
      // 예배·방송
      { path: "말씀", element: <Navigate to="/양육훈련" replace /> },
      { path: "말씀/방송", element: <WordBroadcast /> },
      { path: "말씀/설교", element: <WordSermon /> },
      { path: "말씀/설교/:id", element: <WordSermonDetail /> },
      // { path: "말씀/찬양", element: <WordPraise /> },
```

다음으로 교체한다:

```jsx
      // 예배·방송
      { path: "말씀", element: <Navigate to="/말씀/방송" replace /> },
      { path: "말씀/방송", element: <WordBroadcast /> },
      { path: "말씀/설교", element: <WordSermon /> },
      { path: "말씀/설교/:id", element: <WordSermonDetail /> },
      { path: "말씀/안내", element: <WordInfo /> },
```

- [ ] **Step 4: 죽은 코드 삭제**

```bash
rm -rf src/pages/WordPraise
```

- [ ] **Step 5: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/routes.test.jsx`
Expected: PASS (5/5 — 기존 3개 + 신규 2개)

- [ ] **Step 6: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료(삭제한 `WordPraise` import가 다른 곳에 남아있지 않은지도 이 빌드가 검증한다)

- [ ] **Step 7: Commit**

```bash
git add src/routes.jsx src/routes.test.jsx
git rm -r src/pages/WordPraise
git commit -m "fix: /말씀 리다이렉트를 /말씀/방송으로 수정 + 예배 안내 라우트 연결 + 죽은 코드 삭제

- /말씀 진입 시 예배·방송과 무관한 /양육훈련으로 가던 레거시 리다이렉트를
  CSV 명세(기본 진입 시 실시간 예배 탭 활성화)에 맞게 /말씀/방송으로 수정
- 말씀/안내 라우트를 WordInfo에 연결
- 라우팅된 적 없는 죽은 코드 WordPraise(찬양 탭, CSV 4탭 목록에 없음) 삭제"
```

---

## Task 4: `Church.jsx` — "예배 안내" 탭 제거

**Files:**
- Modify: `src/pages/Church/Church.jsx`
- Modify: `src/pages/Church/Church.test.jsx` (기존 파일 — 아래 명시된 테스트 1개만 교체, 나머지 2개는 그대로 둔다)

**Interfaces:**
- Consumes: 없음(Task 2/3과 파일이 겹치지 않아 독립적으로 실행 가능하지만, "예배 안내가 예배·방송으로 이전됐다"는 서사 순서상 이 태스크를 Task 2/3 뒤에 둔다)
- Produces: 없음

- [ ] **Step 1: 실패 테스트로 교체**

`src/pages/Church/Church.test.jsx`의 다음 테스트를:

```jsx
  it("8개 탭 버튼이 모두 렌더된다", () => {
    renderChurch();
    [
      "인사말",
      "교회 비전",
      "교회 연혁",
      "예배 안내",
      "섬기는 사람들",
      "층별 안내",
      "오시는 길",
      "차량운행 안내",
    ].forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });
  });
```

다음으로 교체한다(다른 2개 테스트 — "초기 탭은 인사말이고...", "탭 버튼을 클릭하면..." — 는 그대로 둔다):

```jsx
  it("7개 탭 버튼이 렌더되고 예배 안내 탭은 없다(예배·방송으로 이전됨)", () => {
    renderChurch();
    [
      "인사말",
      "교회 비전",
      "교회 연혁",
      "섬기는 사람들",
      "층별 안내",
      "오시는 길",
      "차량운행 안내",
    ].forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "예배 안내" })).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Church/Church.test.jsx`
Expected: 이 테스트 FAIL — 현재 `Church.jsx`에 "예배 안내" 버튼이 여전히 존재하므로 `not.toBeInTheDocument()` 단언이 깨진다. 다른 2개 테스트는 계속 PASS.

- [ ] **Step 3: `Church.jsx`에서 "예배 안내" 탭 제거**

`src/pages/Church/Church.jsx` 상단 import에서 다음 줄을 삭제:

```jsx
import WorshipInfo from "@/components/church/WorshipInfo";
```

`TABS` 배열에서 다음 줄을 삭제:

```jsx
  "예배 안내",
```

`TAB_CONTENT` 객체에서 다음 줄을 삭제:

```jsx
  "예배 안내": <WorshipInfo />,
```

(결과적으로 `TABS`는 `["인사말", "교회 비전", "교회 연혁", "섬기는 사람들", "층별 안내", "오시는 길", "차량운행 안내"]` 7개가 되고, CSV 226행 순서와 정확히 일치한다.)

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Church/Church.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과(`WorshipInfo.test.jsx`는 컴포넌트 자체를 건드리지 않았으므로 그대로 통과해야 함)

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/pages/Church/Church.jsx src/pages/Church/Church.test.jsx
git commit -m "refactor: 교회소개에서 예배 안내 탭 제거 (예배·방송으로 이전)

CSV 226행 교회소개 탭 순서엔 예배 안내가 없다 — WordInfo(예배·방송
도메인)로 이전 완료됨에 따라 Church.jsx에서 제거. 결과 7탭 순서가
CSV와 정확히 일치한다. WorshipInfo 컴포넌트 자체는 변경 없음(재사용처만
바뀜)."
```

---

## Task 5: `WordSermon` 회귀 테스트

**Files:**
- Test: `src/pages/WordSermon/WordSermon.test.jsx` (신규)

**Interfaces:**
- Consumes: `DUMMY_PAST_SERMONS`(`src/data/dummy/sermons.js`)
- Produces: 없음

- [ ] **Step 1: 테스트 작성**

`src/pages/WordSermon/WordSermon.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router";
import { renderWithChurch } from "@/test/renderWithChurch";
import { DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
import WordSermon from "./WordSermon";

describe("WordSermon — 예배 목록", () => {
  it("더미 설교 목록이 카드로 렌더된다", async () => {
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    expect(await screen.findByText(DUMMY_PAST_SERMONS[0].title)).toBeInTheDocument();
    expect(screen.getByText(DUMMY_PAST_SERMONS[5].title)).toBeInTheDocument();
  });

  it("검색어를 입력하고 제출하면 제목에 해당 검색어가 없는 카드가 걸러진다", async () => {
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText(DUMMY_PAST_SERMONS[0].title);

    const target = DUMMY_PAST_SERMONS.find((s) => s.title.includes("새벽기도회"));
    const input = screen.getByPlaceholderText("설교 제목 검색");
    fireEvent.change(input, { target: { value: "새벽기도회" } });
    fireEvent.submit(input.closest("form"));

    expect(screen.getByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText(DUMMY_PAST_SERMONS[0].title)).not.toBeInTheDocument();
  });

  it("예배 종류 필터를 선택하면 해당 종류만 표시된다", async () => {
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText(DUMMY_PAST_SERMONS[0].title);

    const target = DUMMY_PAST_SERMONS.find((s) => s.title.includes("수요기도회"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "수요기도회" } });

    expect(screen.getByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText(DUMMY_PAST_SERMONS[0].title)).not.toBeInTheDocument();
  });

  it("설교 카드를 클릭하면 상세 페이지로 라우팅 이동한다", async () => {
    renderWithChurch(
      <Routes>
        <Route path="/말씀/설교" element={<WordSermon />} />
        <Route path="/말씀/설교/:id" element={<div>상세 페이지 진입 확인용 마커</div>} />
      </Routes>,
      { initialEntries: ["/말씀/설교"] },
    );
    const card = await screen.findByText(DUMMY_PAST_SERMONS[0].title);
    fireEvent.click(card);

    expect(screen.getByText("상세 페이지 진입 확인용 마커")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/WordSermon/WordSermon.test.jsx`
Expected: PASS (4/4) — 이 태스크는 순수 회귀 테스트이므로 기존 동작과 다르면 컴포넌트가 아니라 테스트를 실제 동작에 맞게 조정한다.

- [ ] **Step 3: 전체 스위트 확인**

Run: `pnpm test:run`
Expected: 전부 통과

- [ ] **Step 4: Commit**

```bash
git add src/pages/WordSermon/WordSermon.test.jsx
git commit -m "test: WordSermon(예배 목록) 회귀 테스트 추가 — 목록·검색·필터·상세이동"
```

---

## Task 6: `WordBroadcast` 회귀 테스트

**Files:**
- Test: `src/pages/WordBroadcast/WordBroadcast.test.jsx` (신규)

**Interfaces:**
- Consumes: `DUMMY_PAST_SERMONS`(`src/data/dummy/sermons.js`)
- Produces: 없음

- [ ] **Step 1: 테스트 작성**

`src/pages/WordBroadcast/WordBroadcast.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import { DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
import WordBroadcast from "./WordBroadcast";

describe("WordBroadcast — 실시간 예배(더미: 라이브 없음 → 가장 최근 업로드를 히어로로 표시)", () => {
  it("가장 최근 설교를 히어로로 보여주고 지난 설교 목록엔 나머지가 나온다", async () => {
    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText(DUMMY_PAST_SERMONS[0].title)).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    expect(screen.getByText(DUMMY_PAST_SERMONS[1].title)).toBeInTheDocument();
  });

  it("videoId가 없으면 유튜브 채널 ID 안내 플레이스홀더를 보여준다", async () => {
    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });
    expect(
      await screen.findByText("YouTube 채널 ID가 설정되지 않았습니다."),
    ).toBeInTheDocument();
  });

  it("'스마트 주보 보기' 버튼을 클릭하면 당일 주보 모달이 뜬다", async () => {
    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });
    await screen.findByText(DUMMY_PAST_SERMONS[0].title);

    fireEvent.click(screen.getByRole("button", { name: "스마트 주보 보기" }));

    expect(screen.getByText("이번 주 주보")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/WordBroadcast/WordBroadcast.test.jsx`
Expected: PASS (3/3) — 순수 회귀 테스트. 실패하면 컴포넌트가 아니라 테스트를 실제 동작에 맞게 조정한다.

- [ ] **Step 3: 전체 스위트 확인**

Run: `pnpm test:run`
Expected: 전부 통과

- [ ] **Step 4: Commit**

```bash
git add src/pages/WordBroadcast/WordBroadcast.test.jsx
git commit -m "test: WordBroadcast(실시간 예배) 회귀 테스트 추가 — 히어로·플레이스홀더·스마트주보 모달"
```

---

## Task 7: `WordSermonDetail` 회귀 테스트

**Files:**
- Test: `src/pages/WordSermon/WordSermonDetail.test.jsx` (신규)

**Interfaces:**
- Consumes: `DUMMY_PAST_SERMONS`(`src/data/dummy/sermons.js`)
- Produces: 없음

- [ ] **Step 1: 테스트 작성**

`src/pages/WordSermon/WordSermonDetail.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router";
import { renderWithChurch } from "@/test/renderWithChurch";
import { DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
import WordSermonDetail from "./WordSermonDetail";

function renderDetail(id) {
  return renderWithChurch(
    <Routes>
      <Route path="/말씀/설교/:id" element={<WordSermonDetail />} />
    </Routes>,
    { initialEntries: [`/말씀/설교/${id}`] },
  );
}

describe("WordSermonDetail", () => {
  it("id에 해당하는 설교의 제목과 날짜를 보여준다", async () => {
    const target = DUMMY_PAST_SERMONS[2];
    renderDetail(target.id);

    expect(await screen.findByText(target.title)).toBeInTheDocument();
    expect(screen.getByText(target.date)).toBeInTheDocument();
  });

  it("존재하지 않는 id면 안내 문구와 목록으로 돌아가기 버튼을 보여준다", async () => {
    renderDetail("존재하지-않는-id");
    expect(await screen.findByText("설교를 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "목록으로 돌아가기" })).toBeInTheDocument();
  });

  it("videoId가 없으면 'YouTube에서 보기' 링크로 대체된다", async () => {
    const target = DUMMY_PAST_SERMONS[0];
    renderDetail(target.id);
    await screen.findByText(target.title);
    expect(screen.getByRole("link", { name: "YouTube에서 보기" })).toBeInTheDocument();
  });

  it("'다음 설교' 버튼을 클릭하면 해당 설교로 전환된다", async () => {
    const target = DUMMY_PAST_SERMONS[2]; // index2: prev=index3, next=index1 (둘 다 존재)
    renderDetail(target.id);
    await screen.findByText(target.title);

    const next = DUMMY_PAST_SERMONS[1];
    fireEvent.click(screen.getByRole("button", { name: /다음 설교/ }));

    expect(await screen.findByText(next.title)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/WordSermon/WordSermonDetail.test.jsx`
Expected: PASS (4/4) — 순수 회귀 테스트. 실패하면 컴포넌트가 아니라 테스트를 실제 동작에 맞게 조정한다.

- [ ] **Step 3: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 4: Commit**

```bash
git add src/pages/WordSermon/WordSermonDetail.test.jsx
git commit -m "test: WordSermonDetail(설교 상세) 회귀 테스트 추가 — 조회·404·이전/다음 이동"
```

---

## 태스크 의존 관계

```
Task 1 (WordTabBar 4탭 정정)
  → Task 2 (WordInfo 신규 페이지, WordTabBar 렌더)
    → Task 3 (routes.jsx: WordInfo 연결 + 리다이렉트 수정 + WordPraise 삭제)
      → Task 4 (Church.jsx: 예배 안내 탭 제거 — 파일 겹치지 않아 독립 실행 가능하지만 서사상 이 위치)
        → Task 5 (WordSermon 회귀 테스트, 독립)
        → Task 6 (WordBroadcast 회귀 테스트, 독립)
        → Task 7 (WordSermonDetail 회귀 테스트, 독립)
```

Task 5·6·7은 서로 다른 파일만 건드리며 서로 의존하지 않는다 — Subagent-Driven Development는 구현자를 순차 디스패치하므로 순서상 마지막에 두되, 병렬 세션으로 실행한다면 Task 4 완료 후 동시 진행도 가능하다.

## Self-Review 메모

- **스펙 커버리지**: 설계 문서의 신규 페이지(Task 2), 탭 정정(Task 1), 라우팅 수정 3건(리다이렉트/안내라우트/죽은코드, Task 3), 교회소개 탭 제거(Task 4), 4개 파일 회귀 테스트(Task 1의 WordTabBar 자체 테스트 + Task 5/6/7) 전부 태스크로 매핑됨. 비목표(관리자 CRUD, 스마트주보 모달 콘텐츠, Jubo.jsx, live/none 분기)는 태스크에서 다루지 않음 — 의도된 누락.
- **플레이스홀더 스캔**: 코드 블록에 TODO/TBD 없음. 성경 사이클과 동일하게 더미 데이터를 직접 import해서 참조하고, 필터 테스트는 `.find()`로 동적 탐색해 인덱스 하드코딩을 최소화함.
- **타입/시그니처 일관성**: `WordTabBar`의 `TABS[].to` 값(`/말씀/방송`, `/말씀/설교`, `/말씀/안내`, `/주보`)이 Task 2의 `WordInfo` 라우트 기대값, Task 3의 `routes.jsx` 실제 등록 경로와 정확히 일치함. `WordInfo`가 렌더하는 `<WorshipInfo />`는 Task 4에서 `Church.jsx`가 더 이상 렌더하지 않는 것과 동일한 컴포넌트(import 경로 `@/components/church/WorshipInfo` 그대로, 이동 아님 — 재사용).
