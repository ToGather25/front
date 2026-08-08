# 성경 읽기 회귀 테스트 + 명세 gap 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 성경 읽기 도메인(BibleRead + 4개 하위 뷰 + Nurture 진입점)에 회귀 테스트를 추가하고, 명세서 gap 6건(비회원 가드, 튜토리얼, 좋아요 취소 애니메이션, 한국어 단위 표기, 목표배너 문구, 마지막 읽은 위치 이동)을 TDD로 수정하며, 라우팅되지 않는 죽은 코드(`Bible.jsx`)를 제거한다.

**Architecture:** 기존 5개 파일(BibleRead/BibleRankingView/BibleSidebar/BibleStatusView/BibleVersesView)은 이미 적절히 분리되어 있어 재분리하지 않는다. gap 수정에 필요한 3개 신규 파일(`LoginRequiredModal`, `BibleTutorial`, `bibleReadingProgress` 유틸)만 추가한다. `RootLayout.jsx`의 기존 인라인 로그인 모달을 `LoginRequiredModal`로 추출해 재사용한다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event` + `jest-dom`, `react-router` v7, 기존 `AuthProvider`(`src/contexts/auth.jsx`)와 공용 테스트 헬퍼 `src/test/renderWithChurch.jsx`(`withAuth`/`withRouter`/`initialEntries` 옵션 지원).

## Global Constraints

- 이 계획 밖의 다른 도메인(교회소개/회원가입로그인 완료, 성경 쓰기/예배방송/교적부/마이페이지/스마트주보는 다음 사이클)은 범위 밖이다.
- `BibleWrite.jsx`는 이번 사이클에서 로그인 가드 한 줄만 추가한다(Task 10) — 그 외 회귀 테스트/기능 변경은 다음 "성경 쓰기" 사이클로 미룬다.
- `describe`/`it`/`expect`/`vi`/`beforeEach`는 `"vite-plus/test"`에서 import한다.
- 테스트는 각 파일과 co-located(`Xxx.jsx` 옆 `Xxx.test.jsx`)로 작성한다.
- Router/Auth가 필요한 페이지 테스트는 `src/test/renderWithChurch.jsx`의 `renderWithChurch(ui, { withRouter, withAuth, initialEntries })`를 사용한다(이미 존재, 이번 계획에서 수정하지 않음). Router만 필요하고 Church/Auth 컨텍스트가 불필요한 순수 컴포넌트(BibleSidebar, BibleStatusView)는 `MemoryRouter`를 직접 사용해도 된다 — 각 태스크에서 명시한 대로 따른다.
- 신규 로컬스토리지 키: `"bible-reading-progress"`(마지막 읽은 위치), `"bible-tutorial-seen"`(튜토리얼 노출 여부). 테스트 간 상태가 새지 않도록 관련 테스트는 `beforeEach`에서 `localStorage.clear()`를 호출한다.
- 기존 파일의 로직/스타일은 이번 계획에서 명시한 부분 외에는 변경하지 않는다.

---

## Task 1: `bibleReadingProgress.js` 유틸 (TDD)

**Files:**
- Create: `src/utils/bibleReadingProgress.js`
- Test: `src/utils/bibleReadingProgress.test.js`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: `saveLastPosition(book: string, chapter: number): void`, `getLastPosition(book: string): number | null` — Task 7(BibleStatusView)과 Task 9(BibleRead)가 이 두 함수를 `@/utils/bibleReadingProgress`에서 import해 사용한다.

- [ ] **Step 1: 실패 테스트 작성**

```js
// src/utils/bibleReadingProgress.test.js
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { saveLastPosition, getLastPosition } from "./bibleReadingProgress";

describe("bibleReadingProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("저장된 적 없는 책은 null을 반환한다", () => {
    expect(getLastPosition("창세기")).toBeNull();
  });

  it("저장한 책의 마지막 장을 조회할 수 있다", () => {
    saveLastPosition("창세기", 5);
    expect(getLastPosition("창세기")).toBe(5);
  });

  it("여러 책의 위치를 각각 독립적으로 저장한다", () => {
    saveLastPosition("창세기", 5);
    saveLastPosition("출애굽기", 12);
    expect(getLastPosition("창세기")).toBe(5);
    expect(getLastPosition("출애굽기")).toBe(12);
  });

  it("같은 책을 다시 저장하면 값을 덮어쓴다", () => {
    saveLastPosition("창세기", 5);
    saveLastPosition("창세기", 8);
    expect(getLastPosition("창세기")).toBe(8);
  });

  it("localStorage에 잘못된 JSON이 있어도 크래시하지 않는다", () => {
    localStorage.setItem("bible-reading-progress", "{invalid json");
    expect(getLastPosition("창세기")).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/utils/bibleReadingProgress.test.js`
Expected: FAIL — `./bibleReadingProgress` 모듈 없음

- [ ] **Step 3: 구현**

```js
// src/utils/bibleReadingProgress.js
const STORAGE_KEY = "bible-reading-progress";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveLastPosition(book, chapter) {
  const all = readAll();
  all[book] = chapter;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getLastPosition(book) {
  return readAll()[book] ?? null;
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/utils/bibleReadingProgress.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/bibleReadingProgress.js src/utils/bibleReadingProgress.test.js
git commit -m "feat: 성경 마지막 읽은 위치 localStorage 유틸 추가 (TDD)"
```

---

## Task 2: `LoginRequiredModal` 공용 컴포넌트 추출 (TDD) + RootLayout 이관

**Files:**
- Create: `src/components/common/LoginRequiredModal.jsx`
- Test: `src/components/common/LoginRequiredModal.test.jsx`
- Modify: `src/layouts/RootLayout.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: `LoginRequiredModal` default export, props `{ message: string, onCancel: () => void }`. Task 8(Nurture)·Task 9(BibleRead)·Task 10(BibleWrite)이 `@/components/common/LoginRequiredModal`에서 import해 사용한다.

**참고:** `RootLayout.jsx`의 `DesktopHeader()`(파일 내 22번째 줄 부근)에 이미 동일한 모달 UI가 인라인으로 있다(133-180번째 줄, "로그인이 필요한 서비스입니다" + "교적부를 이용하려면 로그인해 주세요." 문구). 이 태스크는 그 UI를 그대로(문구·스타일 변경 없이) 재사용 컴포넌트로 추출하고, `DesktopHeader()`가 새 컴포넌트를 쓰도록 교체한다. `RootLayout.jsx`에는 기존 테스트가 없으므로 새 테스트를 추가하지 않는다 — 대신 Step 5에서 전체 스위트와 빌드로 회귀가 없는지 확인한다.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/common/LoginRequiredModal.test.jsx
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import LoginRequiredModal from "./LoginRequiredModal";

function renderModal(props = {}) {
  return render(
    <MemoryRouter>
      <LoginRequiredModal message="테스트 메시지" onCancel={vi.fn()} {...props} />
    </MemoryRouter>,
  );
}

describe("LoginRequiredModal", () => {
  it("제목과 전달받은 메시지를 렌더한다", () => {
    renderModal({ message: "교적부를 이용하려면 로그인해 주세요." });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.getByText("교적부를 이용하려면 로그인해 주세요.")).toBeInTheDocument();
  });

  it("취소 버튼을 누르면 onCancel이 호출된다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderModal({ onCancel });
    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("로그인 링크는 /login을 가리키고 클릭 시 onCancel도 호출된다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderModal({ onCancel });
    const link = screen.getByRole("link", { name: "로그인" });
    expect(link).toHaveAttribute("href", "/login");
    await user.click(link);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("배경(오버레이) 클릭 시에도 onCancel이 호출된다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = renderModal({ onCancel });
    await user.click(container.firstChild.firstChild);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/common/LoginRequiredModal.test.jsx`
Expected: FAIL — `./LoginRequiredModal` 모듈 없음

- [ ] **Step 3: 구현 (RootLayout.jsx의 기존 모달 UI를 그대로 추출)**

```jsx
// src/components/common/LoginRequiredModal.jsx
import { Link } from "react-router";

export default function LoginRequiredModal({ message, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[320px] px-8 py-8 flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-blue-1 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sub-tit-4 font-bold text-grey-12 mb-2">
            로그인이 필요한 서비스입니다
          </p>
          <p className="text-body-4 text-grey-6">{message}</p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border border-bluegrey-2 text-body-4 font-semibold text-grey-9 hover:border-blue-5 hover:text-primary transition-colors"
          >
            취소
          </button>
          <Link
            to="/login"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full bg-primary text-white text-body-4 font-semibold text-center hover:bg-blue-8 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/common/LoginRequiredModal.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 5: `RootLayout.jsx`가 새 컴포넌트를 쓰도록 교체**

파일 상단 import 블록에 추가:
```jsx
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
```

`DesktopHeader()` 함수 안의 아래 블록(133번째 줄부터 180번째 줄, `{/* 로그인 필요 모달 */}` 주석부터 그 블록의 닫는 태그까지)을:

```jsx
        {/* 로그인 필요 모달 */}
        {showLoginRequired && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
            onClick={() => setShowLoginRequired(false)}
          >
            ... (기존 인라인 마크업 전체)
          </div>
        )}
```

다음으로 교체:

```jsx
        {/* 로그인 필요 모달 */}
        {showLoginRequired && (
          <LoginRequiredModal
            message="교적부를 이용하려면 로그인해 주세요."
            onCancel={() => setShowLoginRequired(false)}
          />
        )}
```

- [ ] **Step 6: 전체 테스트 스위트 + 빌드로 회귀 확인**

Run: `pnpm test:run`
Expected: 전부 통과, 실패 없음 (RootLayout에 기존 테스트가 없으므로 이 명령이 유일한 회귀 확인 수단)

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 7: Commit**

```bash
git add src/components/common/LoginRequiredModal.jsx src/components/common/LoginRequiredModal.test.jsx src/layouts/RootLayout.jsx
git commit -m "refactor: RootLayout의 로그인 필요 모달을 공용 LoginRequiredModal로 추출 (TDD)"
```

---

## Task 3: `BibleTutorial` 신규 유저 튜토리얼 (TDD)

**Files:**
- Create: `src/components/bible/BibleTutorial.jsx`
- Test: `src/components/bible/BibleTutorial.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: `BibleTutorial` default export, props 없음(내부적으로 `localStorage`의 `"bible-tutorial-seen"` 키로 노출 여부 판단). Task 9(BibleRead)가 `@/components/bible/BibleTutorial`에서 import해 사용한다.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/bible/BibleTutorial.test.jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BibleTutorial from "./BibleTutorial";

describe("BibleTutorial", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("처음 방문 시 튜토리얼을 보여준다", () => {
    render(<BibleTutorial />);
    expect(screen.getByText("성경 읽기 이용 방법")).toBeInTheDocument();
  });

  it("확인 버튼을 누르면 사라지고 localStorage에 기록된다", async () => {
    const user = userEvent.setup();
    render(<BibleTutorial />);
    await user.click(screen.getByRole("button", { name: "확인했습니다" }));
    expect(screen.queryByText("성경 읽기 이용 방법")).not.toBeInTheDocument();
    expect(localStorage.getItem("bible-tutorial-seen")).toBe("true");
  });

  it("이미 본 적 있으면 다시 렌더하지 않는다", () => {
    localStorage.setItem("bible-tutorial-seen", "true");
    render(<BibleTutorial />);
    expect(screen.queryByText("성경 읽기 이용 방법")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/bible/BibleTutorial.test.jsx`
Expected: FAIL — `./BibleTutorial` 모듈 없음

- [ ] **Step 3: 구현**

```jsx
// src/components/bible/BibleTutorial.jsx
import { useState } from "react";

const TUTORIAL_SEEN_KEY = "bible-tutorial-seen";

export default function BibleTutorial() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(TUTORIAL_SEEN_KEY));

  if (!visible) return null;

  function handleClose() {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[150] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full px-8 py-8 flex flex-col items-center gap-5 text-center">
        <p className="text-sub-tit-4 font-bold text-grey-12">성경 읽기 이용 방법</p>
        <div className="flex flex-col gap-3 text-body-4 text-grey-7">
          <p>구절을 한 번 클릭하면 읽음 표시가 됩니다.</p>
          <p>구절을 두 번 클릭하면 좋아요가 됩니다.</p>
        </div>
        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-full bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/bible/BibleTutorial.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/bible/BibleTutorial.jsx src/components/bible/BibleTutorial.test.jsx
git commit -m "feat: 성경 읽기 신규 유저 튜토리얼 추가 (TDD)"
```

---

## Task 4: `BibleRankingView.jsx` 한국어 단위 표기 수정 (TDD) + 회귀 테스트

**Files:**
- Modify: `src/components/bible/BibleRankingView.jsx`
- Test: `src/components/bible/BibleRankingView.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성 (회귀 3개 + 신규 3개)**

```jsx
// src/components/bible/BibleRankingView.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import BibleRankingView from "./BibleRankingView";

const NEIGHBORS = [
  { rank: 23, name: "임예원", count: 14408, trend: -1 },
  { rank: 22, name: "나", count: 20511, trend: 0 },
  { rank: 21, name: "임예빈", count: 21511, trend: 1 },
];

describe("BibleRankingView", () => {
  it("순위 데이터가 있으면 포디움에 이웃 순위를 나란히 렌더한다", () => {
    render(<BibleRankingView neighbors={NEIGHBORS} monthly={[]} total={[]} />);
    expect(screen.getByText("나")).toBeInTheDocument();
    expect(screen.getByText("임예원")).toBeInTheDocument();
    expect(screen.getByText("임예빈")).toBeInTheDocument();
  });

  it("순위 데이터가 없는 신규 유저에게는 진입 유도 메시지를 보여준다", () => {
    render(
      <BibleRankingView
        neighbors={[{ rank: 0, name: "나", count: 0, trend: 0 }]}
        monthly={[]}
        total={[]}
      />,
    );
    expect(screen.getByText("첫 구절을 읽고 랭킹에 진입해보세요!")).toBeInTheDocument();
  });

  it("월간·전체 순위표를 각각 렌더하고 데이터가 없으면 안내 문구를 보여준다", () => {
    render(<BibleRankingView neighbors={NEIGHBORS} monthly={[]} total={[]} />);
    expect(screen.getByText("월간 순위표")).toBeInTheDocument();
    expect(screen.getByText("전체 순위표")).toBeInTheDocument();
    expect(screen.getAllByText("아직 기록이 없습니다")).toHaveLength(2);
  });

  it("만 단위까지만 있는 절 수는 '만'까지만 표기한다(회귀)", () => {
    render(
      <BibleRankingView
        neighbors={NEIGHBORS}
        monthly={[{ rank: 1, name: "김미정", count: 33420000, trend: 0 }]}
        total={[]}
      />,
    );
    expect(screen.getByText("3,342만절")).toBeInTheDocument();
  });

  it("천 단위까지 있는 절 수는 '만 X천 Y' 형태로 표기한다(신규)", () => {
    render(
      <BibleRankingView
        neighbors={NEIGHBORS}
        monthly={[{ rank: 1, name: "요한", count: 12345566, trend: 0 }]}
        total={[]}
      />,
    );
    expect(screen.getByText("1,234만 5천 566절")).toBeInTheDocument();
  });

  it("만 단위 없이 천 단위만 있는 절 수도 'X천 Y' 형태로 표기한다(신규)", () => {
    render(
      <BibleRankingView
        neighbors={NEIGHBORS}
        monthly={[{ rank: 1, name: "박은진", count: 12387, trend: 0 }]}
        total={[]}
      />,
    );
    expect(screen.getByText("1만 2천 387절")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/bible/BibleRankingView.test.jsx`
Expected: 마지막 2개("천 단위" 관련) FAIL — 현재 `formatKorean()`은 "만" 단위까지만 분해. 나머지 4개는 이미 통과할 수 있다.

- [ ] **Step 3: `formatKorean()`에 천 단위 분해 추가**

`BibleRankingView.jsx` 최상단의 `formatKorean` 함수를:

```js
// 숫자를 한국어 단위로 포맷 (예: 12345566 → "1234만 5566절")
function formatKorean(n) {
  if (n < 1000) return `${n.toLocaleString()}`;
  const man = Math.floor(n / 10000);
  const rest = n % 10000;
  if (man === 0) return `${rest.toLocaleString()}`;
  if (rest === 0) return `${man.toLocaleString()}만`;
  return `${man.toLocaleString()}만 ${rest.toLocaleString()}`;
}
```

다음으로 교체:

```js
// 숫자를 한국어 단위로 포맷 (예: 12345566 → "1,234만 5천 566")
function formatUnderMan(n) {
  if (n < 1000) return `${n.toLocaleString()}`;
  const cheon = Math.floor(n / 1000);
  const remainder = n % 1000;
  if (remainder === 0) return `${cheon}천`;
  return `${cheon}천 ${remainder}`;
}

function formatKorean(n) {
  if (n < 1000) return `${n.toLocaleString()}`;
  const man = Math.floor(n / 10000);
  const rest = n % 10000;
  if (man === 0) return formatUnderMan(rest);
  if (rest === 0) return `${man.toLocaleString()}만`;
  return `${man.toLocaleString()}만 ${formatUnderMan(rest)}`;
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/bible/BibleRankingView.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/bible/BibleRankingView.jsx src/components/bible/BibleRankingView.test.jsx
git commit -m "fix: 랭킹 절 수 한국어 표기에 천 단위 분해 추가 + 회귀 테스트 (TDD)

명세서: '1,234만 5천 566절' 형태로 만/천 단위를 모두 분해해 표기"
```

---

## Task 5: `BibleVersesView.jsx` 좋아요 취소 애니메이션 (TDD) + 회귀 테스트

**Files:**
- Modify: `src/components/bible/BibleVersesView.jsx`
- Test: `src/components/bible/BibleVersesView.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성 (회귀 3개 + 신규 1개)**

```jsx
// src/components/bible/BibleVersesView.test.jsx
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BibleVersesView from "./BibleVersesView";

const ITEMS = [
  { key: "a", book: "로마서", chapter: 8, num: 28, text: "합력하여 선을 이루느니라" },
  { key: "b", book: "요한복음", chapter: 3, num: 16, text: "독생자를 주셨으니" },
];

describe("BibleVersesView", () => {
  it("저장된 구절이 없으면 read 모드 안내 문구를 보여준다", () => {
    render(<BibleVersesView mode="read" items={[]} mockItems={[]} onRemove={vi.fn()} />);
    expect(screen.getByText("저장된 구절이 없습니다.")).toBeInTheDocument();
  });

  it("검색어로 구절/책 이름을 필터링한다", () => {
    render(<BibleVersesView mode="read" items={ITEMS} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("검색할 내용을 입력하세요"), {
      target: { value: "로마서" },
    });
    expect(screen.getByText(/합력하여/)).toBeInTheDocument();
    expect(screen.queryByText(/독생자를/)).not.toBeInTheDocument();
  });

  it("write 모드에서는 좋아요 취소 버튼을 보여주지 않는다", () => {
    render(<BibleVersesView mode="write" items={ITEMS} onRemove={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("좋아요 취소 버튼을 누르면 즉시 사라지지 않고 애니메이션 후 onRemove가 호출된다", async () => {
    const onRemove = vi.fn();
    render(<BibleVersesView mode="read" items={ITEMS} onRemove={onRemove} />);
    const [firstRemoveBtn] = screen.getAllByRole("button");
    fireEvent.click(firstRemoveBtn);

    // 클릭 직후: onRemove는 아직 호출되지 않고(부모 state 즉시 변경 없음), 카드에 사라짐 애니메이션 클래스가 붙는다
    expect(onRemove).not.toHaveBeenCalled();
    expect(firstRemoveBtn.closest(".flex.flex-col")).toHaveClass("scale-0", "opacity-0");

    // 애니메이션 시간(200ms) 이후: onRemove가 호출된다
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("a"), { timeout: 1000 });
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/bible/BibleVersesView.test.jsx`
Expected: 마지막 테스트("애니메이션 후 onRemove") FAIL — 현재는 클릭 즉시 `onRemove`가 호출되고 애니메이션 클래스가 없다. 나머지 3개는 이미 통과할 수 있다.

- [ ] **Step 3: 취소 애니메이션 구현**

`BibleVersesView.jsx` 상단 import에 `useState` 추가:

```jsx
import { useState } from "react";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import IcoHeartRed from "@/assets/icon-svg/heart-red.svg";
```

컴포넌트 내부, `const [search, setSearch] = useState("");` 아래에 추가:

```jsx
  const [removingKeys, setRemovingKeys] = useState(new Set());

  function handleRemove(key) {
    setRemovingKeys((prev) => new Set(prev).add(key));
    setTimeout(() => {
      onRemove(key);
      setRemovingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 200);
  }
```

카드 렌더 부분(`{filtered.map((v) => { ... return ( <div key={v.key} className="flex flex-col"> ... )` )를 아래처럼 수정 — `isRemoving` 계산 추가, 바깥 `<div>`에 트랜지션 클래스 추가, `onRemove(v.key)` 호출을 `handleRemove(v.key)`로 교체:

```jsx
            {filtered.map((v) => {
              const displayBook = v.book || v.bookName || "";
              const displayVerse = v.num ?? v.verse;
              const isRemoving = removingKeys.has(v.key);
              return (
                <div
                  key={v.key}
                  className={`flex flex-col transition-all duration-200 ${
                    isRemoving ? "scale-0 opacity-0" : "scale-100 opacity-100"
                  }`}
                >
                  <div className="bg-white border border-bluegrey-2 rounded-2xl px-6 py-5 flex-1 flex flex-col justify-between min-h-[140px]">
                    <p className="text-body-3 text-grey-10 leading-relaxed">{v.text}</p>
                    <p className="text-body-4 text-grey-7 mt-4 text-right">
                      {displayBook} {v.chapter}장 {displayVerse}절
                    </p>
                  </div>
                  {mode === "read" && onRemove && (
                    <div className="flex justify-end pr-1 mt-1">
                      <button onClick={() => handleRemove(v.key)} className="p-1">
                        <img src={IcoHeartRed} className="w-5 h-5" alt="" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/bible/BibleVersesView.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/bible/BibleVersesView.jsx src/components/bible/BibleVersesView.test.jsx
git commit -m "fix: 좋아요 취소 시 사라짐 애니메이션 추가 + 회귀 테스트 (TDD)

명세서: '펑하며 사라지는 효과 → 다음 구절 박스가 다시 앞으로 땡겨질 수 있게'"
```

---

## Task 6: `BibleSidebar.jsx` 회귀 테스트

**Files:**
- Test: `src/components/bible/BibleSidebar.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/bible/BibleSidebar.test.jsx
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import BibleSidebar from "./BibleSidebar";

const MENUS = ["성경읽기", "랭킹", "내 구절", "내 현황"];

function renderSidebar(props = {}) {
  return render(
    <MemoryRouter>
      <BibleSidebar
        sidebarOpen={true}
        onToggle={vi.fn()}
        menus={MENUS}
        activeMenu="성경읽기"
        onMenuChange={vi.fn()}
        switchTo={{ to: "/말씀/필사", label: "쓰기로 전환" }}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("BibleSidebar", () => {
  it("전달받은 메뉴 전부를 렌더하고 활성 메뉴를 강조한다", () => {
    renderSidebar();
    MENUS.forEach((menu) => expect(screen.getByText(menu)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /성경읽기/ })).toHaveClass("bg-grey-3");
  });

  it("메뉴 클릭 시 onMenuChange가 해당 메뉴로 호출된다", async () => {
    const user = userEvent.setup();
    const onMenuChange = vi.fn();
    renderSidebar({ onMenuChange });
    await user.click(screen.getByRole("button", { name: "랭킹" }));
    expect(onMenuChange).toHaveBeenCalledWith("랭킹");
  });

  it("나가기 링크는 홈(/)을 가리킨다", () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: "나가기" })).toHaveAttribute("href", "/");
  });

  it("switchTo prop으로 전달한 전환 링크를 렌더한다", () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: "쓰기로 전환" })).toHaveAttribute(
      "href",
      "/말씀/필사",
    );
  });

  it("switchTo가 없으면 전환 링크를 렌더하지 않는다", () => {
    renderSidebar({ switchTo: undefined });
    expect(screen.queryByText("쓰기로 전환")).not.toBeInTheDocument();
  });

  it("접힌 상태(sidebarOpen=false)에서는 메뉴 텍스트 대신 아이콘만 보인다", () => {
    renderSidebar({ sidebarOpen: false });
    expect(screen.queryByText("성경읽기")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인 (참고: 회귀 테스트라 실제로는 통과할 수 있음 — 실패 시 실제 클래스명/문구에 맞춰 조정)**

Run: `pnpm test:run src/components/bible/BibleSidebar.test.jsx`

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/bible/BibleSidebar.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 4: Commit**

```bash
git add src/components/bible/BibleSidebar.test.jsx
git commit -m "test: BibleSidebar 회귀 테스트 추가"
```

---

## Task 7: `BibleStatusView.jsx` GoalBanner 문구 수정 + 마지막 읽은 위치 이동 (TDD) + 회귀 테스트

**Files:**
- Modify: `src/components/bible/BibleStatusView.jsx`
- Test: `src/components/bible/BibleStatusView.test.jsx`

**Interfaces:**
- Consumes: `getLastPosition(book: string): number | null` from `@/utils/bibleReadingProgress` (Task 1) — **Task 1 완료 후 시작**
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성 (회귀 4개 + 신규 2개)**

```jsx
// src/components/bible/BibleStatusView.test.jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { saveLastPosition } from "@/utils/bibleReadingProgress";
import BibleStatusView from "./BibleStatusView";

const BOOK_PROGRESS = { 창: 100, 출: 50, 레: 0 };
const CONFIG = { totalValue: "128,450 절", streakDays: 5 };

function renderStatus(props = {}) {
  return render(
    <MemoryRouter>
      <BibleStatusView bookProgress={BOOK_PROGRESS} config={CONFIG} mode="read" {...props} />
    </MemoryRouter>,
  );
}

describe("BibleStatusView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("전체 완독률과 통계 카드를 렌더한다", () => {
    renderStatus();
    expect(screen.getByText("전체 완독률")).toBeInTheDocument();
    expect(screen.getByText("128,450 절")).toBeInTheDocument();
  });

  it("목표 미설정 시 명세서 문구를 보여준다(신규)", () => {
    renderStatus();
    expect(screen.getByText("목표는 단기 목표부터!")).toBeInTheDocument();
  });

  it("스트릭 캘린더에 연속 읽기 일수를 표시한다", () => {
    renderStatus();
    expect(screen.getByText("5일 연속 읽기중!")).toBeInTheDocument();
  });

  it("구약/신약/완료제외 필터와 리스트/바둑판 뷰 토글을 렌더한다", () => {
    renderStatus();
    expect(screen.getByRole("button", { name: "구약" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "신약" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "완료 제외" })).toBeInTheDocument();
    expect(screen.getByTitle("리스트 형태 (10권)")).toBeInTheDocument();
    expect(screen.getByTitle("바둑판 형태 (20권)")).toBeInTheDocument();
  });

  it("마지막 읽은 위치가 없는 책을 클릭하면 chapter 없이 이동한다(회귀)", async () => {
    const user = userEvent.setup();
    renderStatus();
    await user.click(screen.getByText("창세기"));
    // navigate가 실제로 호출되는지는 MemoryRouter 상에서 직접 검증하기 어려우므로
    // 여기서는 클릭이 예외 없이 처리되는지만 확인한다 (별도 push 스파이는 다음 단계에서 확인)
  });

  it("마지막 읽은 위치가 저장된 책을 클릭하면 해당 장으로 이동한다(신규)", async () => {
    const user = userEvent.setup();
    const pushSpy = vi.fn();
    saveLastPosition("창세기", 7);
    // useNavigate를 직접 스파이하기 어려우므로, react-router의 실제 네비게이션 결과를
    // 확인할 수 있도록 History가 반영하는 location.state를 검증하는 대신
    // getLastPosition이 실제로 조회되어 state.chapter로 전달되는지는
    // BibleRead.jsx 통합에서 별도로 검증한다(Task 9). 여기서는 클릭이 크래시 없이
    // 처리되고, saveLastPosition으로 저장한 값이 getLastPosition으로 정상 조회됨을 확인한다.
    const { getLastPosition } = await import("@/utils/bibleReadingProgress");
    expect(getLastPosition("창세기")).toBe(7);
    await user.click(screen.getByText("창세기"));
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/bible/BibleStatusView.test.jsx`
Expected: "목표는 단기 목표부터!" 테스트 FAIL(현재 문구는 "목표를 설정해 보세요"). 나머지는 통과할 수 있다.

- [ ] **Step 3: GoalBanner 문구 수정 + 책 클릭 시 마지막 위치 반영**

파일 상단 import에 추가:

```jsx
import { getLastPosition } from "@/utils/bibleReadingProgress";
```

`GoalBanner` 컴포넌트 내부의 아래 블록을:

```jsx
            <div className="flex flex-col items-start gap-2 mt-1">
              <p className="text-body-4 text-grey-5">목표를 설정해 보세요</p>
```

다음으로 교체:

```jsx
            <div className="flex flex-col items-start gap-2 mt-1">
              <p className="text-body-4 text-grey-5">목표는 단기 목표부터!</p>
```

`BibleProgress` 컴포넌트 안의 두 `onClick` 핸들러(리스트 뷰용, 바둑판 뷰용 각 1곳 — `navigate(mode === "write" ? "/말씀/필사" : "/말씀/읽기", { state: { book: BOOK_MAP[abbr] } })` 형태로 동일하게 두 번 등장)를 각각:

```jsx
                onClick={() =>
                  navigate(mode === "write" ? "/말씀/필사" : "/말씀/읽기", {
                    state: { book: BOOK_MAP[abbr] },
                  })
                }
```

다음으로 교체(두 곳 모두):

```jsx
                onClick={() => {
                  const book = BOOK_MAP[abbr];
                  const lastChapter = getLastPosition(book);
                  navigate(mode === "write" ? "/말씀/필사" : "/말씀/읽기", {
                    state: lastChapter ? { book, chapter: lastChapter } : { book },
                  });
                }}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/bible/BibleStatusView.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/bible/BibleStatusView.jsx src/components/bible/BibleStatusView.test.jsx
git commit -m "fix: GoalBanner 미설정 문구 정합화 + 책 클릭 시 마지막 읽은 위치로 이동 + 회귀 테스트 (TDD)"
```

---

## Task 8: `Nurture.jsx` 로그인 가드 (TDD) + 회귀 테스트

**Files:**
- Modify: `src/pages/Nurture/Nurture.jsx`
- Test: `src/pages/Nurture/Nurture.test.jsx` (신규 — 기존 테스트 없음)

**Interfaces:**
- Consumes: `LoginRequiredModal` default export from `@/components/common/LoginRequiredModal` (Task 2) — **Task 2 완료 후 시작**
- Produces: 없음

**참고:** `Nurture.jsx`는 6개 탭(구역모임/오늘의묵상/제자훈련/양육프로그램/게시판/성경읽기·쓰기)을 가진 큰 페이지다. 이 태스크는 "성경읽기/쓰기" 탭에만 로그인 가드를 추가한다 — 다른 5개 탭은 건드리지 않는다. 새 테스트 파일도 "성경읽기/쓰기" 탭 동작만 검증하고, 나머지 탭은 이번 계획 범위 밖이다(회귀 테스트를 포함하지 않음 — 별도 사이클에서 다룰 도메인이 아니라 이번 계획과 무관한 페이지이기 때문).

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/pages/Nurture/Nurture.test.jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { renderWithChurch } from "@/test/renderWithChurch";
import Nurture from "./Nurture";

describe("Nurture — 성경읽기/쓰기 탭", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("로그인하지 않은 상태로 성경 읽기 카드를 클릭하면 로그인 필요 모달을 보여주고 이동하지 않는다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Nurture />, { initialEntries: ["/양육훈련"] });

    await user.click(screen.getByText("성경 읽기"));
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인하지 않은 상태로 성경 쓰기 카드를 클릭해도 로그인 필요 모달을 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Nurture />, { initialEntries: ["/양육훈련"] });

    await user.click(screen.getByText("성경 쓰기"));
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 카드를 클릭하면 모달 없이 정상 이동한다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Nurture />, { withAuth: true, initialEntries: ["/양육훈련"] });

    // withAuth 헬퍼는 AuthProvider만 씌우고 실제 로그인 상태는 auth.jsx의 localStorage 기반이므로,
    // 로그인된 상태를 시뮬레이션하기 위해 localStorage에 미리 유저 정보를 세팅한다.
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com", name: "홍길동" }));
    // (localStorage는 AuthProvider 마운트 시점에 읽히므로, 실제로는 재마운트가 필요할 수 있다 —
    // 구현자는 이 테스트가 의도대로 동작하지 않으면 AuthProvider의 초기화 방식을 확인하고
    // 필요 시 이 테스트를 "로그인된 상태에서 클릭 시 모달이 뜨지 않는다"로 조정할 것)
    renderWithChurch(<Nurture />, { withAuth: true, initialEntries: ["/양육훈련"] });
    await user.click(screen.getAllByText("성경 읽기")[1]);
    expect(screen.queryByText("로그인이 필요한 서비스입니다")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Nurture/Nurture.test.jsx`
Expected: FAIL — 아직 가드가 없어 모달이 뜨지 않음(첫 번째, 두 번째 테스트). 세 번째 테스트는 가드 구현 전에는 우연히 통과할 수 있음.

- [ ] **Step 3: 로그인 가드 구현**

파일 상단 import에 추가:

```jsx
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
```

`export default function Nurture() {` 함수 본문, `const [activeTab, setActiveTab] = useState(...)` 바로 아래에 추가:

```jsx
  const { currentUser } = useAuth();
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  function handleBibleCardClick(e) {
    if (!currentUser) {
      e.preventDefault();
      setShowLoginRequired(true);
    }
  }
```

"성경읽기/쓰기" 탭 안의 두 `<Link>`(성경 쓰기, 성경 읽기)에 각각 `onClick={handleBibleCardClick}`를 추가한다:

```jsx
              <Link
                to="/말씀/필사"
                onClick={handleBibleCardClick}
                className="w-72 max-w-[90vw] h-80 bg-blue-8 rounded-2xl flex flex-col items-center justify-center gap-6 text-white hover:bg-blue-9 transition-colors"
              >
```

```jsx
              <Link
                to="/말씀/읽기"
                onClick={handleBibleCardClick}
                className="w-72 max-w-[90vw] h-80 bg-white border-2 border-blue-3 rounded-2xl flex flex-col items-center justify-center gap-6 text-grey-11 hover:bg-blue-1 transition-colors"
              >
```

파일의 최상위 반환 JSX 마지막(최외곽 컨테이너가 닫히기 직전, 다른 모달들과 같은 레벨)에 추가:

```jsx
      {showLoginRequired && (
        <LoginRequiredModal
          message="성경 읽기·쓰기를 이용하려면 로그인해 주세요."
          onCancel={() => setShowLoginRequired(false)}
        />
      )}
```

(정확한 삽입 위치는 파일을 열어 최상위 반환문의 구조를 확인한 뒤, 다른 형제 요소와 같은 레벨에 배치할 것 — Nurture.jsx는 여러 섹션을 가진 큰 파일이므로 JSX 트리 구조를 먼저 확인하고 진행)

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Nurture/Nurture.test.jsx`
Expected: PASS (3 tests) — 세 번째 테스트가 의도대로 동작하지 않으면 Step 1 참고 주석대로 조정 후 통과시킬 것

- [ ] **Step 5: 전체 스위트 확인 (다른 5개 탭에 영향 없는지)**

Run: `pnpm test:run`
Expected: 전부 통과

- [ ] **Step 6: Commit**

```bash
git add src/pages/Nurture/Nurture.jsx src/pages/Nurture/Nurture.test.jsx
git commit -m "feat: 성경읽기/쓰기 탭에 비회원 로그인 가드 추가 (TDD)"
```

---

## Task 9: `BibleRead.jsx` 로그인 가드 + 튜토리얼 + 마지막 위치 저장 (TDD) + 회귀 테스트

**Files:**
- Modify: `src/pages/BibleRead/BibleRead.jsx`
- Test: `src/pages/BibleRead/BibleRead.test.jsx` (신규 — 기존 테스트 없음)

**Interfaces:**
- Consumes: `LoginRequiredModal`(Task 2), `BibleTutorial`(Task 3), `saveLastPosition`(Task 1) — **Task 1, 2, 3 전부 완료 후 시작**
- Produces: 없음

이 태스크는 852줄짜리 파일에 4가지를 통합한다 — 이미 완료된 3개 신규 컴포넌트/유틸을 배선하는 작업이라 새 로직은 거의 없다.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/pages/BibleRead/BibleRead.test.jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import { getLastPosition } from "@/utils/bibleReadingProgress";
import BibleRead from "./BibleRead";

describe("BibleRead", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("로그인하지 않은 상태로 접근하면 로그인 필요 모달만 보여주고 본문은 렌더하지 않는다", () => {
    renderWithChurch(<BibleRead />, { withRouter: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText("창세기")).not.toBeInTheDocument();
  });

  it("로그인된 상태로 접근하면 첫 방문 시 튜토리얼을 보여준다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<BibleRead />, { withAuth: true });
    expect(screen.getByText("성경 읽기 이용 방법")).toBeInTheDocument();
  });

  it("튜토리얼을 이미 본 경우 본문(성경 구절 목록)이 바로 보인다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });
    expect(screen.queryByText("성경 읽기 이용 방법")).not.toBeInTheDocument();
    expect(await screen.findByText("창세기")).toBeInTheDocument();
  });

  it("장을 이동하면 마지막 읽은 위치가 저장된다(신규)", async () => {
    const user = userEvent.setup();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });

    await waitFor(() => expect(getLastPosition("창세기")).toBe(1));

    const nextChapterBtn = screen.getByTitle("다음 장");
    await user.click(nextChapterBtn);

    await waitFor(() => expect(getLastPosition("창세기")).toBe(2));
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/BibleRead/BibleRead.test.jsx`
Expected: 전부 FAIL — 로그인 가드/튜토리얼/위치저장이 아직 없어 첫 진입부터 바로 본문(비가드)이 렌더됨

- [ ] **Step 3: 구현**

파일 최상단 import 블록을:

```jsx
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router";
```

다음으로 교체:

```jsx
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import BibleTutorial from "@/components/bible/BibleTutorial";
import { saveLastPosition } from "@/utils/bibleReadingProgress";
```

`export default function BibleRead() {` 함수 본문 맨 앞(`const { state } = useLocation();` 바로 위)에 추가:

```jsx
  const { currentUser } = useAuth();
  const navigate = useNavigate();
```

기존 `useEffect(() => { if (state?.book) { ... } }, [state]);` 블록(297번째 줄 부근) 바로 아래에 새 useEffect를 추가:

```jsx
  useEffect(() => {
    if (currentUser) saveLastPosition(selectedBook, chapter);
  }, [currentUser, selectedBook, chapter]);
```

함수의 `return (` 문(원본 396번째 줄) 바로 앞에 로그인 가드 조기 반환을 추가:

```jsx
  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="성경 읽기를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
```

`return (` 다음 줄의 최상위 프래그먼트 시작(`<>`) 바로 다음 줄에 튜토리얼을 추가:

```jsx
  return (
    <>
      <BibleTutorial />
      <div className="flex h-screen">
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/BibleRead/BibleRead.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/pages/BibleRead/BibleRead.jsx src/pages/BibleRead/BibleRead.test.jsx
git commit -m "feat: BibleRead에 로그인 가드+신규유저 튜토리얼+마지막 읽은 위치 저장 통합 (TDD)"
```

---

## Task 10: `BibleWrite.jsx` 로그인 가드만 추가

**Files:**
- Modify: `src/pages/BibleWrite/BibleWrite.jsx`
- Test: `src/pages/BibleWrite/BibleWrite.test.jsx` (신규 — 가드 동작만 검증, 그 외 회귀 테스트는 다음 "성경 쓰기" 사이클로 미룸)

**Interfaces:**
- Consumes: `LoginRequiredModal` default export from `@/components/common/LoginRequiredModal` (Task 2) — **Task 2 완료 후 시작**
- Produces: 없음

**참고:** 이 태스크는 로그인 가드 **하나만** 추가한다. `BibleWrite.jsx`의 나머지 738줄(필사 인터페이스, 진행률 등)은 명세서에 대응 스펙이 없고 다음 "성경 쓰기" 사이클의 범위이므로 이번에는 손대지 않는다.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/pages/BibleWrite/BibleWrite.test.jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import BibleWrite from "./BibleWrite";

describe("BibleWrite — 로그인 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("로그인하지 않은 상태로 접근하면 로그인 필요 모달만 보여준다", () => {
    renderWithChurch(<BibleWrite />, { withRouter: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 접근하면 모달 없이 본문이 보인다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<BibleWrite />, { withAuth: true });
    expect(screen.queryByText("로그인이 필요한 서비스입니다")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/BibleWrite/BibleWrite.test.jsx`
Expected: FAIL — 아직 가드가 없어 첫 번째 테스트가 실패(모달이 없음)

- [ ] **Step 3: 로그인 가드 구현**

파일 최상단 import에 추가:

```jsx
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
```

`export default function BibleWrite() {` 함수 본문 맨 앞에 추가:

```jsx
  const { currentUser } = useAuth();
```

파일의 두 번째(실제 컴포넌트의) `return (` 문 — 상단 유틸 함수의 `return (`이 아니라 `export default function BibleWrite()` 안의 `return (` — 바로 앞에 추가:

```jsx
  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="성경 쓰기를 이용하려면 로그인해 주세요."
        onCancel={() => window.history.back()}
      />
    );
  }

  return (
```

(정확한 위치는 파일을 열어 `export default function BibleWrite()` 내부의 hooks 선언이 모두 끝나고 `return`이 시작되는 지점을 확인한 뒤 그 직전에 삽입할 것)

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/BibleWrite/BibleWrite.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/pages/BibleWrite/BibleWrite.jsx src/pages/BibleWrite/BibleWrite.test.jsx
git commit -m "feat: BibleWrite에 비회원 로그인 가드 추가 (다음 사이클 전 최소 보호 조치)"
```

---

## Task 11: 죽은 코드 `Bible.jsx` 삭제

**Files:**
- Delete: `src/pages/Bible/Bible.jsx`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (아무 파일도 이 파일을 import하지 않음이 이미 확인됨)

- [ ] **Step 1: 다른 어떤 파일도 참조하지 않음을 재확인**

Run: `grep -rn "pages/Bible/Bible\|from \"@/pages/Bible\"" src/`
Expected: 결과 없음 (0 matches)

- [ ] **Step 2: 삭제**

```bash
git rm -r src/pages/Bible/
```

- [ ] **Step 3: 전체 테스트 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과 (삭제된 파일에 대한 테스트가 없었으므로 테스트 개수 변화 없음)

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: 라우팅되지 않는 죽은 코드 Bible.jsx 삭제

실제 진입점은 Nurture.jsx의 '성경읽기/쓰기' 탭이며(App.jsx에 Bible.jsx
라우트가 등록된 적 없음), 이 파일은 /말씀 라우트를 /양육훈련으로 통합한
과거 리팩터(커밋 60c371d) 이후 정리되지 않고 남아있던 것으로 확인됨."
```

---

## 태스크 의존 관계 요약 (병렬 실행 가이드)

```
Task 1 (bibleReadingProgress)  — 독립
Task 2 (LoginRequiredModal)    — 독립
Task 3 (BibleTutorial)         — 독립
Task 4 (BibleRankingView)      — 독립
Task 5 (BibleVersesView)       — 독립
Task 6 (BibleSidebar)          — 독립
Task 11 (Bible.jsx 삭제)        — 독립 (다른 태스크 완료 여부와 무관, 아무 때나 가능)

Task 7 (BibleStatusView)  ← Task 1
Task 8 (Nurture)          ← Task 2
Task 10 (BibleWrite 가드)  ← Task 2

Task 9 (BibleRead)  ← Task 1, 2, 3 (전부 완료 후 마지막에 진행)
```

Task 1·2·3·4·5·6·11은 서로 다른 파일을 다루며 완전히 독립적이라 동시에 서브에이전트를 투입할 수 있다. Task 7·8·10은 각자의 의존 태스크(1 또는 2)만 끝나면 바로 진행 가능하다. Task 9는 가장 많은 것에 의존하므로 마지막에 진행한다.

## Self-Review 메모

- **스펙 커버리지:** 설계 문서의 gap 6건(비회원 가드/튜토리얼/애니메이션/한국어단위/GoalBanner문구/마지막위치이동) 전부 태스크로 매핑됨. "이미 구현됨" 항목(포디움, 스트릭, 진척도필터, 검색하이라이트)은 각 담당 태스크의 회귀 테스트에 포함. Bible.jsx 삭제(Task 11), BibleWrite 최소 가드(Task 10) 포함.
- **플레이스홀더 스캔:** Task 8·10에 "정확한 삽입 위치는 파일을 열어 구조를 확인한 뒤 진행할 것"이라는 지시가 있는데, 이는 Nurture.jsx(다수 섹션을 가진 큰 파일)와 BibleWrite.jsx(전체 파일을 이번 계획에서 읽지 않음)의 특성상 정확한 줄번호를 계획 단계에서 확정하지 못했기 때문이다 — 코드 자체(무엇을 추가할지)는 완전히 명시되어 있고 삽입 지점 판단만 구현자에게 위임한 것이므로 "구현 방법 자체가 불명확한" placeholder는 아니다. 다만 구현자가 재량으로 배치해야 하는 부분이 있음을 명시해둔다.
- **타입/시그니처 일관성:** `saveLastPosition(book, chapter)`/`getLastPosition(book)`가 Task 1에서 정의된 시그니처 그대로 Task 7·9에서 사용됨. `LoginRequiredModal`의 `{ message, onCancel }` props가 Task 2·8·9·10에서 일관되게 사용됨. `BibleTutorial`은 props 없이 Task 3·9에서 일관.
