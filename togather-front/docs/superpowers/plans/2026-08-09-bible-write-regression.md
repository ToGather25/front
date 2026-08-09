# 성경 쓰기 회귀 테스트 + BOOK_MAP 불일치 버그 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `BibleWrite.jsx`의 책 이름 약어/전체이름 불일치 버그를 TDD로 수정하고, 필사 로직(책·장·절 선택, 타이핑 판정, 자동 다음 절 이동, 장 진행률, 탭 전환) 전반에 회귀 테스트를 추가한다.

**Architecture:** `BibleWrite.jsx`는 재분리하지 않는다. 하위 뷰(`BibleSidebar`/`BibleRankingView`/`BibleVersesView`/`BibleStatusView`)와 로그인 가드는 이전 사이클에서 이미 테스트됨 — 이번엔 `BibleWrite.jsx` 고유 로직만 다룬다. 2개 태스크로 나누되 같은 파일(`BibleWrite.jsx`/`BibleWrite.test.jsx`)을 다루므로 순차 진행한다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event` + `jest-dom`, `react-router` v7, `src/test/renderWithChurch.jsx`(`withAuth`/`initialEntries` 옵션).

## Global Constraints

- `describe`/`it`/`expect`/`beforeEach` 는 `"vite-plus/test"`에서 import한다.
- `BibleWrite.test.jsx`는 이미 존재한다(이전 "성경 읽기" 사이클의 Task 10에서 로그인 가드 테스트 2개가 작성됨). **기존 2개 테스트를 절대 삭제·수정하지 않는다** — 새 `describe` 블록으로 아래에 추가한다.
- 실제 성경 본문 텍스트(정답 문자열)를 하드코딩하지 않는다 — `import bibleData from "@/data/bible.json"`으로 실제 데이터를 직접 읽어 사용한다(컴포넌트가 쓰는 것과 동일한 소스). 키 형식은 `${약어}${장}:${절}` (예: `"창1:1"`), 값은 `.trim()` 후 사용(컴포넌트의 `getVerses`와 동일).
- `BibleWrite.jsx`는 상단 검색창(`<input>`, 플레이스홀더만 있고 기능 없음)과 필사 입력창(시각적으로 숨겨진 `<textarea>`)이 둘 다 `role="textbox"`를 가진다 — 필사 입력창을 특정할 때는 `container.querySelector("textarea")`를 쓴다.
- 테스트는 `renderWithChurch(<BibleWrite />, { withAuth: true })`로 렌더한다(로그인 가드가 있으므로 필수). 각 테스트 전 `localStorage.clear()` 후 `localStorage.setItem("user", ...)`로 로그인 상태를 만든다.
- 자동 다음 절 이동은 실제 700ms `setTimeout`을 쓴다 — `waitFor`에 `{ timeout: 2000 }`(2배 이상 여유)를 명시한다.

---

## Task 1: `BOOK_MAP` 약어/전체이름 불일치 버그 수정 (TDD)

**Files:**
- Modify: `src/pages/BibleWrite/BibleWrite.jsx`
- Modify: `src/pages/BibleWrite/BibleWrite.test.jsx` (기존 파일에 새 테스트 추가)

**Interfaces:**
- Consumes: `BOOK_ABBREV`(전체이름→약어 역방향 맵, `@/config/bible.config`에 이미 존재 — 신규 아님)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성**

`BibleWrite.test.jsx` 파일의 기존 `describe("BibleWrite — 로그인 가드", () => { ... });` 블록 **아래에** 새 블록을 추가한다(기존 블록은 그대로 둔다):

```jsx
describe("BibleWrite — state.book 변환", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
  });

  it("BibleStatusView에서 넘어온 전체 이름(state.book)을 약어로 변환해 정상 표시한다", () => {
    renderWithChurch(<BibleWrite />, {
      withAuth: true,
      initialEntries: [{ pathname: "/말씀/필사", state: { book: "창세기" } }],
    });
    expect(screen.getByRole("button", { name: "창세기" })).toBeInTheDocument();
  });

  it("전체 이름이 약어로 변환된 뒤에는 해당 책의 장·절이 정상 조회된다", () => {
    const { container } = renderWithChurch(<BibleWrite />, {
      withAuth: true,
      initialEntries: [{ pathname: "/말씀/필사", state: { book: "출애굽기" } }],
    });
    expect(screen.getByRole("button", { name: "출애굽기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1장" })).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });
});
```

(`describe`/`it`/`expect`/`beforeEach`, `screen`, `renderWithChurch`, `BibleWrite` import는 파일 상단에 이미 있으므로 추가 import 불필요 — 없다면 기존 import 블록에 맞춰 추가할 것.)

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/BibleWrite/BibleWrite.test.jsx`
Expected: 새 테스트 2개 FAIL — `BOOK_MAP["창세기"]`/`BOOK_MAP["출애굽기"]`가 `undefined`라서 버튼 텍스트가 비어있음(`getByRole("button", { name: "창세기" })`가 못 찾음). 기존 로그인 가드 테스트 2개는 계속 PASS해야 한다.

- [ ] **Step 3: 버그 수정**

`src/pages/BibleWrite/BibleWrite.jsx` 최상단 import를:

```jsx
import { BOOK_MAP, OT, NT, BIBLE_WRITE_SIDEBAR_MENUS } from "@/config/bible.config";
```

다음으로 교체:

```jsx
import { BOOK_MAP, BOOK_ABBREV, OT, NT, BIBLE_WRITE_SIDEBAR_MENUS } from "@/config/bible.config";
```

컴포넌트 내부 초기 상태 선언(`const [selectedBook, setSelectedBook] = useState(state?.book ?? "창");`)을:

```jsx
  const [selectedBook, setSelectedBook] = useState(BOOK_ABBREV[state?.book] ?? state?.book ?? "창");
```

다음으로 교체(최초 렌더에서도 전체이름이 그대로 들어가는 순간이 없도록 방지).

`useEffect(() => { if (state?.book) { setSelectedBook(state.book); ... } }, [state]);` 블록을:

```jsx
  useEffect(() => {
    if (state?.book) {
      setSelectedBook(state.book);
      setActiveMenu("성경쓰기");
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  }, [state]);
```

다음으로 교체:

```jsx
  useEffect(() => {
    if (state?.book) {
      setSelectedBook(BOOK_ABBREV[state.book] ?? state.book);
      setActiveMenu("성경쓰기");
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  }, [state]);
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/BibleWrite/BibleWrite.test.jsx`
Expected: PASS (기존 2개 + 신규 2개 = 4개 전부)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/pages/BibleWrite/BibleWrite.jsx src/pages/BibleWrite/BibleWrite.test.jsx
git commit -m "fix: BibleWrite가 전체이름 state.book을 약어로 변환하지 않던 버그 수정 (TDD)

BibleStatusView(성경 읽기 사이클)의 책 클릭 핸들러는 BOOK_MAP[abbr](전체
이름)을 state.book으로 넘기는데, BibleWrite.jsx의 selectedBook은 약어를
기대해 BOOK_MAP[selectedBook] 조회가 깨지고 getChapters/getVerses도 빈
결과를 반환했다. 이미 존재하는 BOOK_ABBREV(전체이름→약어) 역방향 맵으로
변환하도록 수정."
```

---

## Task 2: 필사 로직 회귀 테스트

**Files:**
- Modify: `src/pages/BibleWrite/BibleWrite.test.jsx` (Task 1에서 추가한 블록 아래에 계속 추가)

**Interfaces:**
- Consumes: Task 1에서 수정된 `BibleWrite.jsx`(버그가 고쳐진 상태) — **Task 1 완료 후 시작**
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성 (전부 회귀 — 실제로는 대부분 이미 통과할 수 있음, 실패 시 실제 동작에 맞춰 조정)**

`BibleWrite.test.jsx` 파일 상단 import에 `userEvent`와 `bibleData`, `waitFor`를 추가한다(이미 있다면 생략):

```jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import bibleData from "@/data/bible.json";
import BibleWrite from "./BibleWrite";
```

Task 1의 `describe("BibleWrite — state.book 변환", ...)` 블록 **아래에** 새 블록을 추가한다:

```jsx
describe("BibleWrite — 필사 로직", () => {
  function renderWrite() {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    return renderWithChurch(<BibleWrite />, { withAuth: true });
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("책 선택 모달에서 다른 책을 클릭하면 헤더 표시와 장·절이 갱신된다", async () => {
    const user = userEvent.setup();
    renderWrite();

    await user.click(screen.getByRole("button", { name: "창세기" }));
    await user.click(screen.getByRole("button", { name: "출애굽기" }));

    expect(screen.getByRole("button", { name: "출애굽기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1절" })).toBeInTheDocument();
  });

  it("장 드롭다운에서 다른 장을 클릭하면 해당 장으로 이동하고 입력이 초기화된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    await user.click(screen.getByRole("button", { name: "1장" }));
    await user.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByRole("button", { name: "2장" })).toBeInTheDocument();
    expect(container.querySelector("textarea")).toHaveValue("");
  });

  it("정답을 입력하면 완료 처리되고 오늘 쓴 절 수가 증가한다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    const targetText = bibleData["창1:1"].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    expect(screen.getByText("오늘 쓴 절 수 : 1절")).toBeInTheDocument();
  });

  it("마지막 절이 아니면 정답 입력 후 700ms 뒤 다음 절로 자동 이동한다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    const targetText = bibleData["창1:1"].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    await waitFor(
      () => expect(screen.getByRole("button", { name: "2절" })).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("완료 상태에서 '다시 쓰기'를 누르면 입력이 초기화되고 다시 작성할 수 있다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    const targetText = bibleData["창1:1"].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    await user.click(screen.getByRole("button", { name: "다시 쓰기" }));

    expect(container.querySelector("textarea")).toHaveValue("");
    expect(screen.getByText("오늘 쓴 절 수 : 1절")).toBeInTheDocument();
  });

  it("장의 마지막 절을 완료하면 '다음 장으로' 버튼이 나타난다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    // 절 드롭다운을 열어 이 장(창세기 1장)의 마지막 절 번호를 실제 데이터 기준으로 찾는다
    await user.click(screen.getByRole("button", { name: "1절" }));
    const verseButtons = screen.getAllByRole("button", { name: /^\d+$/ });
    const lastVerseNum = Math.max(...verseButtons.map((b) => Number(b.textContent)));
    await user.click(screen.getByRole("button", { name: String(lastVerseNum) }));

    const targetText = bibleData[`창1:${lastVerseNum}`].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    expect(await screen.findByRole("button", { name: "다음 장으로" })).toBeInTheDocument();
  });

  it("랭킹 탭으로 전환하면 랭킹 뷰가 렌더된다", async () => {
    const user = userEvent.setup();
    renderWrite();
    await user.click(screen.getByRole("button", { name: "랭킹" }));
    expect(screen.getByText("월간 순위표")).toBeInTheDocument();
  });

  it("내 구절 탭으로 전환하면 저장된 구절 뷰가 렌더된다", async () => {
    const user = userEvent.setup();
    renderWrite();
    await user.click(screen.getByRole("button", { name: "내 구절" }));
    expect(screen.getByPlaceholderText("검색할 내용을 입력하세요")).toBeInTheDocument();
  });

  it("내 현황 탭으로 전환하면 현황 뷰가 렌더된다", async () => {
    const user = userEvent.setup();
    renderWrite();
    await user.click(screen.getByRole("button", { name: "내 현황" }));
    expect(screen.getByText("필사 전체 현황")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인 (회귀 테스트이므로 대부분 통과할 수 있음 — 실패하는 항목은 실제 텍스트/구조에 맞춰 조정)**

Run: `pnpm test:run src/pages/BibleWrite/BibleWrite.test.jsx`
Expected: 실제 동작과 비교해 텍스트/셀렉터가 다르면 실패할 수 있다 — 이 경우 컴포넌트가 아니라 테스트를 실제 동작에 맞게 조정한다(이번 태스크는 순수 회귀 테스트이지 동작 변경이 아니다).

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/BibleWrite/BibleWrite.test.jsx`
Expected: PASS (Task 1의 4개 + 이번 9개 = 13개 전부, 로그인 가드 2개 포함 총 15개)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/pages/BibleWrite/BibleWrite.test.jsx
git commit -m "test: BibleWrite 필사 로직(책·장·절 선택, 타이핑 판정, 자동이동, 진행률, 탭전환) 회귀 테스트 추가"
```

---

## 태스크 의존 관계

```
Task 1 (BOOK_MAP 버그 수정) → Task 2 (필사 로직 회귀 테스트)
```

같은 파일(`BibleWrite.jsx`/`BibleWrite.test.jsx`)을 다루므로 순차 진행. Task 2는 Task 1이 고친 `state.book` 처리를 전제하지 않으므로(별도 `describe` 블록, 별도 관심사) 병렬로 봐도 무방하지만, 같은 테스트 파일을 두 태스크가 동시에 수정하면 충돌하므로 순차로 진행한다.

## Self-Review 메모

- **스펙 커버리지:** 설계 문서의 버그 수정(Task 1), 회귀 테스트 대상 표(책/장/절 선택, 타이핑 판정, 자동이동, 다시쓰기, 다음장버튼, 진행률, 탭전환 — Task 2) 전부 태스크로 매핑됨.
- **플레이스홀더 스캔:** 코드 블록에 TODO/TBD 없음. 성경 본문 텍스트는 하드코딩 대신 `bibleData` 직접 참조로 정확성을 보장(설계 문서에서 명시적으로 요구한 방식).
- **타입/시그니처 일관성:** `BOOK_ABBREV[state.book] ?? state.book` 패턴이 초기 `useState`와 `useEffect` 양쪽에서 동일하게 적용됨. Task 2의 `renderWrite()` 헬퍼가 Task 1의 테스트들과 동일한 로그인 세팅 패턴(`localStorage.setItem("user", ...)` + `withAuth: true`)을 따름.
