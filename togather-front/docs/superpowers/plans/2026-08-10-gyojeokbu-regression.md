# 교적부 인증 가드 + 민감정보 제한 + 데이터 소스 통합 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/교적부`에 인증 가드를 추가하고(TDD) 목회 메모를 관리자 전용으로 제한하며, `/교적부`·`/admin/members` 전반에 회귀 테스트를 추가하고, `MembersManage.jsx`의 하드코딩 더미 데이터를 `members.config.js`(교적부와 동일 소스)로 통합한다.

**Architecture:** `Gyojeokbu.jsx`는 재분리하지 않는다 — 이미 `RootLayout` 하위(전체 `AuthProvider` 상속)라 `BibleRead.jsx`와 동일한 컴포넌트 레벨 로그인 가드(`useAuth` + `LoginRequiredModal`)만 추가한다. `MembersManage.jsx`는 하드코딩 더미 배열을 `members.config.js`의 `MEMBERS`(default export)로 교체하고, 실제 데이터 값과 무관했던 하드코딩 필터 옵션을 동적 파생으로 바꾼다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event`, `react-router` v7, `src/test/renderWithChurch.jsx`(`withAuth` 옵션 — `AuthProvider`+`MemoryRouter`+`ChurchProvider` 자동 래핑).

## Global Constraints

- `describe`/`it`/`expect`/`beforeEach`는 `"vite-plus/test"`에서 import한다.
- `members.config.js`는 **default export**다 — `import MEMBERS from "@/config/members.config";` (named import 아님, `import { MEMBERS } from ...`는 틀린 코드다).
- 실제 교인 데이터는 총 12명(`m01`~`m12`)이며, 이 중 `m04`(김도현)·`m06`(한기준)·`m08`(오재훈)·`m11`(임혜숙)은 `email` 필드가 없다(`undefined`) — 이메일 관련 로직은 반드시 옵셔널 체이닝으로 null-safe해야 한다.
- 하드코딩된 성경 본문/교인 정보를 베끼지 않는다 — `MEMBERS`(`@/config/members.config`)를 직접 import해서 동적으로 참조한다(이전 사이클들의 "실제 데이터 직접 참조" 원칙과 동일).
- 로그인 상태를 만드는 테스트는 `localStorage.setItem("user", JSON.stringify({ email: "...", isAdmin: true }))` 형태를 쓴다(`auth.jsx`의 `currentUser` 셰이프와 동일 — `isAdmin: true`가 있으면 관리자, 없으면 일반 로그인 교인).
- `renderWithChurch(ui, { withAuth: true })`는 `AuthProvider`+`MemoryRouter`+`ChurchProvider`를 자동으로 씌운다 — `Gyojeokbu.jsx`가 이번 사이클에서 `useNavigate()`를 새로 쓰게 되므로 반드시 이 옵션으로 렌더해야 한다.

---

## Task 1: `Gyojeokbu.jsx` 로그인 가드 + 목회 메모 관리자 전용 제한 (TDD)

**Files:**
- Modify: `src/pages/Gyojeokbu/Gyojeokbu.jsx`
- Test: `src/pages/Gyojeokbu/Gyojeokbu.test.jsx` (신규)

**Interfaces:**
- Consumes: `useAuth`(`@/contexts/auth`), `LoginRequiredModal`(`@/components/common/LoginRequiredModal`, 이미 존재 — 성경 읽기 사이클에서 검증됨), `MEMBERS`(`@/config/members.config`, default export)
- Produces: `DetailBody`가 `isAdmin` prop을 받는다(불리언) — Task 2가 이 인터페이스를 그대로 소비한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/pages/Gyojeokbu/Gyojeokbu.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MEMBERS from "@/config/members.config";
import Gyojeokbu from "./Gyojeokbu";

describe("Gyojeokbu — 로그인 가드 + 민감정보 제한", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("비로그인 상태면 로그인 필요 모달을 보여주고 교인 정보는 렌더되지 않는다", () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText(MEMBERS[0].name)).not.toBeInTheDocument();
  });

  it("일반 교인으로 로그인하면 교인 목록이 보이고 목회 메모는 보이지 않는다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com", name: "홍길동" }));
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    expect(screen.getByText(MEMBERS[0].name)).toBeInTheDocument();

    await user.click(screen.getByText(MEMBERS[0].name));
    expect(screen.queryByText("목회 메모")).not.toBeInTheDocument();
  });

  it("관리자로 로그인하면 상세 드로어에서 목회 메모가 보인다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "admin@togather.com", isAdmin: true }));
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    await user.click(screen.getByText(MEMBERS[0].name));
    expect(screen.getByText("목회 메모")).toBeInTheDocument();
    expect(screen.getByText(MEMBERS[0].notes)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Gyojeokbu/Gyojeokbu.test.jsx`
Expected: 3개 테스트 전부 FAIL — 현재 `Gyojeokbu.jsx`는 로그인 여부와 무관하게 항상 교인 목록을 렌더하고(첫 테스트 실패: 모달이 없고 데이터가 보임), "목회 메모"는 로그인 상태와 무관하게 항상 렌더된다(두 번째 테스트 실패: 일반 교인에게도 보임).

- [ ] **Step 3: 로그인 가드 추가**

`src/pages/Gyojeokbu/Gyojeokbu.jsx` 최상단 import 블록을:

```jsx
import { useState, useMemo } from "react";
import { Link } from "react-router";
import MEMBERS from "@/config/members.config";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
```

다음으로 교체한다:

```jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import MEMBERS from "@/config/members.config";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
```

`export default function Gyojeokbu() {` 바로 다음 줄(`const [q, setQ] = useState("");` 앞)에 두 줄을 추가한다:

```jsx
export default function Gyojeokbu() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [q, setQ] = useState("");
```

`const nextId = idx >= 0 && idx < matches.length - 1 ? matches[idx + 1].id : null;` 바로 다음, `return (` 바로 앞에 가드를 추가한다:

```jsx
  const nextId = idx >= 0 && idx < matches.length - 1 ? matches[idx + 1].id : null;

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="교적부를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
```

`<DetailBody m={member} onSelect={setSelectedId} />` 호출부(파일 하단, side drawer 안)를:

```jsx
              <DetailBody m={member} onSelect={setSelectedId} />
```

다음으로 교체한다:

```jsx
              <DetailBody m={member} onSelect={setSelectedId} isAdmin={currentUser?.isAdmin} />
```

- [ ] **Step 4: 목회 메모를 관리자 전용으로 제한**

`DetailBody` 함수 시그니처(`function DetailBody({ m, onSelect }) {`)를:

```jsx
function DetailBody({ m, onSelect }) {
```

다음으로 교체한다:

```jsx
function DetailBody({ m, onSelect, isAdmin }) {
```

`DetailBody` 내부의 "메모" `Section`(파일 하단 쪽, `{/* 메모 */}` 주석 바로 아래)을:

```jsx
        {/* 메모 */}
        <Section title="목회 메모">
          {m.notes ? (
            <p className="text-body-3 text-grey-9 leading-[1.6] bg-bluegrey-1 rounded-xl p-4 m-0">
              {m.notes}
            </p>
          ) : (
            <p className="text-caption text-grey-5 m-0">저장된 메모가 없습니다.</p>
          )}
        </Section>
```

다음으로 교체한다:

```jsx
        {/* 메모 (관리자 전용) */}
        {isAdmin && (
          <Section title="목회 메모">
            {m.notes ? (
              <p className="text-body-3 text-grey-9 leading-[1.6] bg-bluegrey-1 rounded-xl p-4 m-0">
                {m.notes}
              </p>
            ) : (
              <p className="text-caption text-grey-5 m-0">저장된 메모가 없습니다.</p>
            )}
          </Section>
        )}
```

- [ ] **Step 5: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Gyojeokbu/Gyojeokbu.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 6: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 7: Commit**

```bash
git add src/pages/Gyojeokbu/Gyojeokbu.jsx src/pages/Gyojeokbu/Gyojeokbu.test.jsx
git commit -m "fix: 교적부에 로그인 가드 추가 + 목회 메모를 관리자 전용으로 제한 (TDD)

/교적부가 인증 가드 없이 실제 교인 12명의 전체 개인정보(연락처·주소·
가족관계·목회 메모)를 누구나 볼 수 있는 상태였다. RootLayout 하위라
AuthProvider는 이미 상속받으므로 BibleRead.jsx와 동일한 컴포넌트 레벨
가드(useAuth + LoginRequiredModal)를 추가했다. 목회 메모는 로그인
교인 중에서도 관리자(currentUser?.isAdmin)에게만 노출하도록 제한했다."
```

---

## Task 2: `Gyojeokbu` 나머지 회귀 테스트 (검색·필터·상세 드로어 내비게이션)

**Files:**
- Modify: `src/pages/Gyojeokbu/Gyojeokbu.test.jsx` (Task 1에서 추가한 블록 아래에 계속 추가)

**Interfaces:**
- Consumes: Task 1에서 추가된 로그인 가드(로그인 상태가 있어야 목록이 보이므로 이 테스트들은 전부 로그인 상태로 렌더해야 한다) — **Task 1 완료 후 시작**
- Produces: 없음

- [ ] **Step 1: 회귀 테스트 작성 (전부 이미 통과할 것으로 예상됨 — 실패 시 실제 동작에 맞춰 조정)**

`Gyojeokbu.test.jsx` 파일 상단 import에 `within`을 추가한다(이미 있다면 생략):

```jsx
import { screen, within } from "@testing-library/react";
```

Task 1의 `describe("Gyojeokbu — 로그인 가드 + 민감정보 제한", ...)` 블록 **아래에** 새 블록을 추가한다:

```jsx
describe("Gyojeokbu — 검색·필터·상세 드로어", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
  });

  it("이름으로 검색하면 해당 교인만 표시된다", () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    const target = MEMBERS[0];
    const other = MEMBERS[1];

    const input = screen.getByPlaceholderText("이름 또는 휴대폰 번호로 검색");
    fireEvent.change(input, { target: { value: target.name } });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("검색 결과가 없으면 안내 문구가 표시된다", () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    const input = screen.getByPlaceholderText("이름 또는 휴대폰 번호로 검색");
    fireEvent.change(input, { target: { value: "존재하지않는이름12345" } });

    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  it("구역 필터를 선택하면 해당 구역 교인만 표시된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    const target = MEMBERS.find((m) => m.region === "1구역");
    const other = MEMBERS.find((m) => m.region !== "1구역");

    await user.click(screen.getByRole("button", { name: /^1구역/ }));

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("교인 행을 클릭하면 상세 드로어가 열리고 기본 정보가 보인다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    const target = MEMBERS[0];

    await user.click(screen.getByText(target.name));

    expect(screen.getByText(target.address)).toBeInTheDocument();
  });

  it("상세 드로어의 '다음' 버튼을 클릭하면 다음 교인으로 전환된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });

    await user.click(screen.getByText(MEMBERS[1].name));
    const nextBtn = container.querySelectorAll("aside button")[1];
    await user.click(nextBtn);

    // 주의: m.phone은 드로어 안에 두 곳(Hero의 tel 링크 + 기본정보 InfoRow)에
    // 중복 렌더되어 getByText가 "multiple elements" 에러를 던진다.
    // "생년월일 (만 N세)" InfoRow는 한 곳에만 렌더되므로 이걸로 식별한다.
    const drawer = container.querySelector("aside");
    expect(
      within(drawer).getByText(`${MEMBERS[2].birth} (만 ${MEMBERS[2].age}세)`),
    ).toBeInTheDocument();
  });

  it("가족 구성원을 클릭하면 해당 구성원의 상세로 전환된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });

    const owner = MEMBERS.find((m) => m.family.some((f) => f.id));
    const linkedFamily = owner.family.find((f) => f.id);
    const target = MEMBERS.find((m) => m.id === linkedFamily.id);

    await user.click(screen.getByText(owner.name));
    await user.click(screen.getByRole("button", { name: new RegExp(target.name) }));

    // phone은 중복 렌더되므로(위 테스트와 동일한 이유) 생년월일 조합 텍스트로 식별한다.
    const drawer = container.querySelector("aside");
    expect(
      within(drawer).getByText(`${target.birth} (만 ${target.age}세)`),
    ).toBeInTheDocument();
  });
});
```

Task 1에서 이미 `screen`/`userEvent`/`renderWithChurch`/`MEMBERS`/`Gyojeokbu`는 import돼 있다. 위 코드가 `fireEvent`를 추가로 쓰므로, 파일 상단 import에 다음을 추가한다(이미 있다면 생략):

```jsx
import { screen, within, fireEvent } from "@testing-library/react";
```

- [ ] **Step 2: 테스트 실행해서 실패 확인 (회귀 테스트이므로 대부분 통과할 수 있음 — 실패하는 항목은 실제 텍스트/구조에 맞춰 조정)**

Run: `pnpm test:run src/pages/Gyojeokbu/Gyojeokbu.test.jsx`
Expected: 실제 동작과 비교해 텍스트/셀렉터가 다르면 실패할 수 있다 — 이 경우 컴포넌트가 아니라 테스트를 실제 동작에 맞게 조정한다(이번 태스크는 순수 회귀 테스트이지 동작 변경이 아니다). 특히 "다음" 버튼의 `container.querySelectorAll("aside button")[1]` 인덱스가 실제 드로어 상단 바 버튼 순서(이전/다음/인쇄/내보내기/닫기)와 맞는지 실제 렌더 결과로 확인해서 필요시 인덱스를 조정한다.

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Gyojeokbu/Gyojeokbu.test.jsx`
Expected: PASS (Task 1의 3개 + 이번 6개 = 9개 전부)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/pages/Gyojeokbu/Gyojeokbu.test.jsx
git commit -m "test: 교적부 검색·필터·상세 드로어(이전/다음, 가족 이동) 회귀 테스트 추가"
```

---

## Task 3: `routes.jsx`에 `/교적부` 인증 가드 회귀 테스트 추가

**Files:**
- Modify: `src/routes.test.jsx` (기존 파일에 새 `describe` 블록 추가 — 기존 블록들은 절대 건드리지 않는다)

**Interfaces:**
- Consumes: Task 1에서 완료된 `Gyojeokbu.jsx`의 로그인 가드(정확한 모달 문구 `"로그인이 필요한 서비스입니다"`, 검색 placeholder `"이름 또는 휴대폰 번호로 검색"`) — **Task 1 완료 후 시작**
- Produces: 없음

**배경**: 이전 사이클(성경 읽기)의 최종 리뷰에서, 컴포넌트 테스트는 `withAuth:true`로 통과했지만 실제 라우트 트리엔 `AuthProvider`가 없어 프로덕션에서 크래시하는 Critical 버그가 있었다. `/교적부`는 `RootLayout` 하위 라우트라 `AuthProvider`는 이미 보장되지만(Task 1에서 확인됨), 실제 라우트 트리로 한 번 더 검증해 이 유형의 회귀를 원천 차단한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/routes.test.jsx` 파일 맨 아래(기존 `describe("routes — /말씀 리다이렉트 + 예배 안내 라우트", ...)` 블록 다음)에 새 블록을 추가한다(파일 상단에 이미 `createMemoryRouter`, `RouterProvider`, `routes`, `render`, `screen`, `ChurchProvider`, `SearchProvider`, `describe`/`it`/`expect`/`beforeEach` import가 있으므로 추가 import 불필요):

```jsx
describe("routes — /교적부 인증 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("/교적부 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/교적부"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 /교적부 진입 시 크래시 없이 교인 목록이 렌더된다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    const router = createMemoryRouter(routes, { initialEntries: ["/교적부"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(await screen.findByPlaceholderText("이름 또는 휴대폰 번호로 검색")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/routes.test.jsx`
Expected: Task 1이 아직 반영 전이라면 둘 다 FAIL(가드 자체가 없어 첫 테스트가 모달을 못 찾음). **이 태스크는 Task 1 완료 후 시작하므로**, 실제로는 두 테스트 모두 이미 PASS할 가능성이 높다 — 그 경우 이 Step은 "실패 확인"이 아니라 "정상적으로 이미 통과함을 확인"으로 간주하고 다음 Step으로 넘어간다. 기존 5개 테스트(말씀 읽기/필사 3개 + 말씀 리다이렉트/안내 2개)는 계속 PASS해야 한다.

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/routes.test.jsx`
Expected: PASS (기존 5개 + 신규 2개 = 7개 전부)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/routes.test.jsx
git commit -m "test: /교적부 실제 라우트 트리에서 인증 가드가 작동하는지 회귀 테스트 추가

이전 사이클(성경 읽기)에서 컴포넌트 테스트만으론 실제 라우트 트리의
AuthProvider 누락을 못 잡았던 사고를 예방하기 위해, createMemoryRouter로
실제 routes 배열을 렌더해 /교적부 가드를 재검증한다."
```

---

## Task 4: `MembersManage.jsx` 데이터 소스 통합 + 동적 필터 (TDD)

**Files:**
- Modify: `src/pages/admin/MembersManage.jsx`
- Test: `src/pages/admin/MembersManage.test.jsx` (신규)

**Interfaces:**
- Consumes: `MEMBERS`(`@/config/members.config`, default export)
- Produces: 없음

**배경**: `MembersManage.jsx`의 하드코딩 `DEPARTMENTS`(`["전체", "청년부", "장년부", ...]`)/`POSITIONS`(`["전체", "집사", "권사", ...]`)는 `members.config.js`의 실제 `department`/`role` 값(`"여전도회 2지회"`, `"청년부 1부"`, `"장로"` 등)과 전혀 매칭되지 않는다 — 데이터 소스를 그대로 바꾸면 필터 클릭 시 결과가 0건이 되는 숨은 버그가 생긴다. 이 태스크는 그 버그를 TDD로 방지하면서 데이터 소스를 통합한다.

- [ ] **Step 1: 실패 테스트 작성**

`src/pages/admin/MembersManage.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import MEMBERS from "@/config/members.config";
import MembersManage from "./MembersManage";

describe("MembersManage — 교인 목록", () => {
  it("members.config의 실제 교인이 목록에 표시된다", () => {
    render(<MembersManage />);
    expect(screen.getByText(MEMBERS[0].name)).toBeInTheDocument();
    expect(screen.getByText(`(${MEMBERS.length})`)).toBeInTheDocument();
  });

  it("부서 필터를 선택하면 해당 부서 교인만 표시된다", () => {
    render(<MembersManage />);
    const target = MEMBERS.find((m) => m.department === "청년부 1부");
    const other = MEMBERS.find((m) => m.department !== "청년부 1부");

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "청년부 1부" } });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("직책 필터를 선택하면 해당 직책 교인만 표시된다", () => {
    render(<MembersManage />);
    const target = MEMBERS.find((m) => m.role === "장로");
    const other = MEMBERS.find((m) => m.role !== "장로");

    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "장로" } });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("이메일이 없는 교인도 검색 시 크래시 없이 정상 필터링된다", () => {
    render(<MembersManage />);
    const target = MEMBERS.find((m) => !m.email);
    const other = MEMBERS.find((m) => m.id !== target.id);

    fireEvent.change(screen.getByPlaceholderText("이름 / 연락처 / 이메일 검색"), {
      target: { value: target.name },
    });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/admin/MembersManage.test.jsx`
Expected: 4개 테스트 전부 FAIL — 현재 `DUMMY_MEMBERS`(더미 10명, `dept`/`position` 필드명)를 쓰고 있어 `MEMBERS[0].name`(실제 데이터, `department`/`role` 필드명)과 전혀 매칭되지 않고, 필터 옵션 값도 실제 데이터와 안 맞는다.

- [ ] **Step 3: 데이터 소스 통합 + 동적 필터**

`src/pages/admin/MembersManage.jsx` 최상단을:

```jsx
import { useState } from "react";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const DEPARTMENTS = ["전체", "청년부", "장년부", "유치부", "초등부", "중고등부", "노년부"];
const POSITIONS = ["전체", "집사", "권사", "장로", "목사", "전도사", "성도"];

const DUMMY_MEMBERS = [
  // ...(id 1~10까지 10개 객체, 생략)
];
```

다음으로 교체한다(`DUMMY_MEMBERS` 배열 전체를 삭제하고 실제 데이터에서 동적으로 파생한 필터 옵션으로 교체 — `DUMMY_PENDING` 배열과 그 아래 나머지 코드는 그대로 둔다):

```jsx
import { useState } from "react";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import MEMBERS from "@/config/members.config";

const DEPARTMENTS = ["전체", ...new Set(MEMBERS.map((m) => m.department))];
const POSITIONS = ["전체", ...new Set(MEMBERS.map((m) => m.role))];
```

(파일에서 `const DUMMY_MEMBERS = [ ... ];` 블록 전체를 삭제한다. `const DUMMY_PENDING = [ ... ];` 블록은 그대로 둔다.)

`filtered` 계산 로직을:

```jsx
  const filtered = DUMMY_MEMBERS.filter((m) => dept === "전체" || m.dept === dept)
    .filter((m) => position === "전체" || m.position === position)
    .filter((m) => m.name.includes(search) || m.email.includes(search) || m.phone.includes(search));
```

다음으로 교체한다(필드명을 `dept`→`department`, `position`→`role`로 바꾸고, `email`이 없는 교인이 있으므로 옵셔널 체이닝으로 null-safe하게 만든다):

```jsx
  const filtered = MEMBERS.filter((m) => dept === "전체" || m.department === dept)
    .filter((m) => position === "전체" || m.role === position)
    .filter(
      (m) => m.name.includes(search) || m.email?.includes(search) || m.phone.includes(search),
    );
```

"교인 목록" 탭 라벨의 카운트를:

```jsx
        <button className={tabCls("active")} onClick={() => setActiveTab("active")}>
          교인 목록
          <span className="ml-1.5 text-body-5 text-grey-5">({DUMMY_MEMBERS.length})</span>
        </button>
```

다음으로 교체한다:

```jsx
        <button className={tabCls("active")} onClick={() => setActiveTab("active")}>
          교인 목록
          <span className="ml-1.5 text-body-5 text-grey-5">({MEMBERS.length})</span>
        </button>
```

테이블 행 렌더 부분의 부서/직책 셀을:

```jsx
                  <span className="text-body-5 text-grey-7">{m.dept}</span>
                  <span className="text-body-5 text-grey-7">{m.position}</span>
```

다음으로 교체한다:

```jsx
                  <span className="text-body-5 text-grey-7">{m.department}</span>
                  <span className="text-body-5 text-grey-7">{m.role}</span>
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/admin/MembersManage.test.jsx`
Expected: PASS (4/4)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/MembersManage.jsx src/pages/admin/MembersManage.test.jsx
git commit -m "fix: MembersManage가 더미 데이터 대신 교적부와 동일한 members.config를 쓰도록 통합 (TDD)

기존 DUMMY_MEMBERS(더미 10명)는 교적부(members.config, 실제 12명)와
완전히 다른 데이터였다. 필드명(dept/position)과 하드코딩 필터 옵션도
실제 데이터 값(department/role, 예: '여전도회 2지회', '청년부 1부')과
안 맞아서 데이터 소스를 그대로 바꾸면 필터가 항상 0건을 반환하는
숨은 버그가 있었다 — 필터 옵션을 실제 데이터에서 동적으로 파생하도록
바꿔 이 문제를 원천 차단했다. email이 없는 교인(m04/m06/m08/m11)도
있어 검색 로직에 옵셔널 체이닝을 추가했다. 승인 대기 큐(DUMMY_PENDING)는
별도 관심사라 그대로 뒀다."
```

---

## 태스크 의존 관계

```
Task 1 (Gyojeokbu 로그인 가드 + 목회 메모 제한, TDD)
  → Task 2 (Gyojeokbu 나머지 회귀 테스트 — 같은 파일, 로그인 가드 전제)
  → Task 3 (routes.jsx 회귀 테스트 — 정확한 모달 문구·placeholder 텍스트 전제)

Task 4 (MembersManage 데이터 통합, TDD) — Task 1~3과 파일이 겹치지 않아 독립적으로 아무 때나 실행 가능
```

Task 1→2는 같은 파일(`Gyojeokbu.test.jsx`)을 다루므로 순차 진행. Task 3은 Task 1이 만든 정확한 문구에 의존하므로 그 뒤에 온다. Task 4는 완전히 다른 파일(`MembersManage.jsx`)을 다루므로 순서상 마지막에 두되 병렬 세션이라면 언제든 실행 가능하다.

## Self-Review 메모

- **스펙 커버리지**: 설계 문서의 인증 가드(Task 1), 민감정보(목회 메모) 관리자 제한(Task 1), 회귀 테스트(Task 2), 라우트 트리 회귀 방지(Task 3), 데이터 소스 통합 + 동적 필터(Task 4) 전부 태스크로 매핑됨. 비목표(가입 승인 큐 연결, 관리자 상세/삭제 신규 구현, UI 변경, AdminGuard 자체 라우팅 테스트)는 의도적으로 어떤 태스크에도 없음.
- **플레이스홀더 스캔**: 코드 블록에 TODO/TBD 없음. 교인 이름/데이터는 전부 `MEMBERS` 직접 참조로 하드코딩을 피함.
- **타입/시그니처 일관성**: `DetailBody`가 Task 1에서 받는 `isAdmin` prop이 호출부(`<DetailBody m={member} onSelect={setSelectedId} isAdmin={currentUser?.isAdmin} />`)와 정확히 일치. Task 2의 `renderWithChurch(<Gyojeokbu />, { withAuth: true })` 렌더 패턴이 Task 1과 동일. Task 4의 `MEMBERS` import(default export)가 Global Constraints에 명시한 정확한 문법과 일치.
