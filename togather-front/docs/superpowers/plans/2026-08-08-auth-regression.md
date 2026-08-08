# 회원가입/로그인 회귀 테스트 + 명세 gap 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 회원가입(1·2단계)·로그인·비밀번호 찾기 4개 기존 페이지에 회귀 테스트를 추가하고, 신규 아이디 찾기 페이지를 만들고, 명세서 gap 2건(중복가입 모달 연락처 복사, 가입완료 모달 문구)을 TDD로 수정한다.

**Architecture:** 5개 파일 모두 이미 독립적인 페이지 컴포넌트라 컴포넌트 분리는 불필요하다. 신규 `FindId.jsx`는 `FindPassword.jsx`의 폼→완료화면 전환 패턴을 그대로 재사용한다. 5개 태스크는 서로 다른 파일을 다루므로 완전히 병렬 실행 가능하다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event` + `jest-dom`, `react-router` v7(`MemoryRouter`), 기존 `ChurchProvider`/`AuthProvider`.

## Global Constraints

- 이 계획 밖의 다른 도메인(교회소개는 이미 완료, 성경활동/예배·방송/교적부/마이페이지/스마트주보)은 범위 밖이다.
- 실제 API 연동은 하지 않는다 — 모든 폼 제출은 기존처럼 `setTimeout` 기반 목업 처리 흐름을 유지한다.
- `describe`/`it`/`expect`/`vi`/`beforeEach`는 `"vite-plus/test"`에서 import한다.
- 테스트는 각 페이지 파일과 co-located(`Xxx.jsx` 옆 `Xxx.test.jsx`)로 작성한다.
- 기존 파일의 로직/스타일은 이번 계획에서 명시적으로 언급한 부분(클립보드 복사, 완료 모달 문구) 외에는 변경하지 않는다.
- 새로 만드는 `FindId.jsx`는 `FindPassword.jsx`와 동일한 Tailwind 클래스/레이아웃 패턴(좌측 브랜드 패널 + 우측 폼)을 따른다.

---

## Task 1: FindId 신규 페이지 + 라우트 등록

**Files:**
- Create: `src/pages/FindId/FindId.jsx`
- Test: `src/pages/FindId/FindId.test.jsx`
- Modify: `src/App.jsx` (import 추가 + 라우트 등록)

**Interfaces:**
- Consumes: 없음 (다른 태스크와 독립, 병렬 가능)
- Produces: `FindId` default export, props 없음. `App.jsx`에 `{ path: "find-id", element: <FindId /> }` 라우트로 등록됨 — Task 3(Login.jsx)의 "아이디 찾기" 링크(`/find-id`)가 이제 유효한 라우트를 가리키게 됨(단, Task 3은 이 등록 여부를 테스트하지 않으므로 두 태스크는 실행 순서 무관하게 병렬 가능).

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/pages/FindId/FindId.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import FindId from "./FindId";

function renderFindId() {
  return render(
    <MemoryRouter>
      <ChurchProvider>
        <FindId />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("FindId", () => {
  it("이름·휴대폰 번호를 입력하고 제출하면 마스킹된 아이디를 보여준다", async () => {
    const user = userEvent.setup();
    renderFindId();

    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    await user.click(screen.getByRole("button", { name: "아이디 찾기" }));

    await waitFor(() => expect(screen.getByText("test****")).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(screen.getByText("아이디를 찾았습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderFindId();

    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    const submitBtn = screen.getByRole("button", { name: "아이디 찾기" });
    await user.click(submitBtn);

    expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/FindId/FindId.test.jsx`
Expected: FAIL — `./FindId` 모듈 없음

- [ ] **Step 3: `FindId.jsx` 구현**

```jsx
// src/pages/FindId/FindId.jsx
import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

function maskId(id) {
  if (id.length <= 4) return `${id[0]}${"*".repeat(Math.max(id.length - 1, 3))}`;
  return `${id.slice(0, 4)}${"*".repeat(id.length - 4)}`;
}

const MOCK_FOUND_ID = "test1234";

export default function FindId() {
  const { church } = useChurch();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | found
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 800));
      // TODO: API 연동 — 이름+휴대폰 번호로 계정 조회
      setStatus("found");
    } catch {
      setStatus("idle");
      setError("일치하는 계정을 찾을 수 없습니다. 다시 시도해 주세요.");
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-9 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10 via-blue-9 to-blue-7 opacity-90" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-40 right-8 w-40 h-40 rounded-full bg-blue-7/40" />

        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
          </div>
          <h1 className="text-headline-4 font-bold text-white mb-3">
            {church?.name ?? "ToGather"}
          </h1>
          <p className="text-body-2 text-white/70 leading-relaxed">
            등록하신 정보로
            <br />
            아이디를 찾아드려요
          </p>
        </div>
      </div>

      {/* 오른쪽 폼 영역 */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {status === "found" ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center mx-auto mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3B5280"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-headline-5 font-bold text-grey-11 mb-3">아이디를 찾았습니다</h2>
              <p className="text-body-3 text-grey-6 leading-relaxed mb-6">
                입력하신 정보와 일치하는 아이디입니다.
              </p>
              <p className="text-sub-tit-3 font-bold text-blue-7 bg-blue-1 rounded-xl py-4 mb-8">
                {maskId(MOCK_FOUND_ID)}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
                >
                  로그인으로 돌아가기
                </Link>
                <Link
                  to="/find-password"
                  className="text-body-4 text-grey-6 hover:text-blue-7 transition-colors"
                >
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-headline-5 font-bold text-grey-11 mb-2">아이디 찾기</h2>
                <p className="text-body-3 text-grey-6">
                  가입 시 등록한 이름과 휴대폰 번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                    이름
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                    휴대폰 번호
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className={inputCls}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-4 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-bold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
                >
                  {status === "submitting" ? "확인 중..." : "아이디 찾기"}
                </button>
              </form>

              <p className="text-center text-body-4 text-grey-6 mt-8 border-t border-grey-2 pt-6">
                <Link to="/login" className="text-blue-7 hover:underline font-semibold">
                  로그인으로 돌아가기
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/FindId/FindId.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: `App.jsx`에 라우트 등록**

`src/App.jsx`에서 `import FindPassword from "@/pages/FindPassword/FindPassword";` 바로 아래에 추가:

```jsx
import FindId from "@/pages/FindId/FindId";
```

그리고 `{ path: "find-password", element: <FindPassword /> },` 바로 아래에 추가:

```jsx
      { path: "find-id", element: <FindId /> },
```

- [ ] **Step 6: 빌드 확인**

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 7: Commit**

```bash
git add src/pages/FindId/FindId.jsx src/pages/FindId/FindId.test.jsx src/App.jsx
git commit -m "feat: 아이디 찾기 페이지 신규 추가 + /find-id 라우트 등록

Login.jsx의 '아이디 찾기' 링크가 가리키던 미등록 라우트를 채움"
```

---

## Task 2: Login.jsx 회귀 테스트

**Files:**
- Test: `src/pages/Login/Login.test.jsx`

**Interfaces:**
- Consumes: 없음 (Task 1과 독립 — 이 태스크는 라우트가 실제로 존재하는지까지는 검증하지 않고 `href` 값만 확인하므로 Task 1 완료 여부와 무관하게 병렬 진행 가능)
- Produces: 없음 (다른 태스크가 이 파일에 의존하지 않음)

**참고:** `AuthProvider`(`src/contexts/auth.jsx`)는 내부적으로 `useNavigate`를 쓰므로 `MemoryRouter` 안에 있어야 하고, `localStorage`를 읽고 쓴다. 매 테스트 전에 `localStorage.clear()`로 초기화한다. 틀린 자격증명으로 로그인을 시도하면 `AuthProvider.login()`이 실제 `axios.post("/auth/login", ...)`를 호출하는데, 테스트 환경에는 서버가 없으므로 이 요청은 자연스럽게 실패(reject)한다 — 이 실패가 `Login.jsx`의 `catch` 블록으로 이어져 에러 문구를 띄우므로 별도 모킹 없이 테스트 가능하다.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/pages/Login/Login.test.jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { AuthProvider } from "@/contexts/auth";
import LoginPage from "./Login";

function renderLogin() {
  return render(
    <MemoryRouter>
      <ChurchProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("올바른 테스트 계정으로 로그인하면 에러가 뜨지 않는다", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("example@email.com"), "test@togather.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "test1234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() =>
      expect(
        screen.queryByText("이메일 또는 비밀번호가 일치하지 않습니다."),
      ).not.toBeInTheDocument(),
    );
  });

  it("잘못된 자격증명으로 로그인하면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("example@email.com"), "wrong@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() =>
      expect(screen.getByText("이메일 또는 비밀번호가 일치하지 않습니다.")).toBeInTheDocument(),
    );
  });

  it("아이디 찾기·비밀번호 찾기 링크가 올바른 경로를 가리킨다", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: "아이디 찾기" })).toHaveAttribute("href", "/find-id");
    expect(screen.getByRole("link", { name: "비밀번호 찾기" })).toHaveAttribute(
      "href",
      "/find-password",
    );
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Login/Login.test.jsx`
Expected: 첫 실행은 실제로는 기존 `Login.jsx`가 이미 정상 동작하므로 3개 다 PASS할 수도 있다 — 이 태스크는 새 기능이 아니라 회귀 테스트이므로 "실패를 먼저 보는 것"이 목적이 아니라 "현재 동작을 고정하는 것"이 목적이다. 만약 실패한다면(예: 링크 텍스트/placeholder가 실제 코드와 달라서) 실제 `Login.jsx`를 열어 정확한 텍스트로 테스트를 맞춘다 — 컴포넌트 코드를 테스트에 맞추지 않는다.

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Login/Login.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login/Login.test.jsx
git commit -m "test: Login 페이지 회귀 테스트 추가"
```

---

## Task 3: FindPassword.jsx 회귀 테스트

**Files:**
- Test: `src/pages/FindPassword/FindPassword.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/pages/FindPassword/FindPassword.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import FindPassword from "./FindPassword";

function renderFindPassword() {
  return render(
    <MemoryRouter>
      <ChurchProvider>
        <FindPassword />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("FindPassword", () => {
  it("이메일·휴대폰 번호를 제출하면 발송완료 화면으로 전환되고 입력한 이메일을 보여준다", async () => {
    const user = userEvent.setup();
    renderFindPassword();

    await user.type(screen.getByPlaceholderText("example@email.com"), "member@example.com");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    await user.click(screen.getByRole("button", { name: "재설정 링크 받기" }));

    await waitFor(() =>
      expect(screen.getByText("재설정 링크를 보냈습니다")).toBeInTheDocument(),
    );
    expect(screen.getByText(/member@example\.com/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderFindPassword();

    await user.type(screen.getByPlaceholderText("example@email.com"), "member@example.com");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    await user.click(screen.getByRole("button", { name: "재설정 링크 받기" }));

    expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인 (참고: Task 2와 동일하게 회귀 테스트이므로 이미 통과할 수 있음 — 실패 시 실제 코드 문구에 맞춰 조정)**

Run: `pnpm test:run src/pages/FindPassword/FindPassword.test.jsx`

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/FindPassword/FindPassword.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 4: Commit**

```bash
git add src/pages/FindPassword/FindPassword.test.jsx
git commit -m "test: FindPassword 페이지 회귀 테스트 추가"
```

---

## Task 4: Register.jsx 회귀 테스트 + 중복가입 모달 연락처 복사 (TDD)

**Files:**
- Modify: `src/pages/Register/Register.jsx`
- Test: `src/pages/Register/Register.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: 없음

**참고:** `Register.jsx`의 생년월일 select 3개(`birthYear`/`birthMonth`/`birthDay`)는 `<label>`이 `htmlFor`로 연결되어 있지 않아 `getByLabelText`로 조회할 수 없다 — `container.querySelector('select[name="..."]')`로 직접 조회한다. `isNewcomer`/`agreePrivacy` 체크박스는 `htmlFor`가 연결되어 있어 `getByLabelText`가 동작한다.

이 태스크는 먼저 기존 동작(정상 제출, 필수 동의 체크박스, 중복 감지 모달 노출)에 대한 회귀 테스트를 작성하고, 이어서 "중복 모달의 연락처를 클릭하면 클립보드에 복사된다"는 새 요구사항을 실패 테스트로 추가한 뒤 구현한다.

- [ ] **Step 1: 실패 테스트 작성 (회귀 4개 + 신규 2개)**

```jsx
// src/pages/Register/Register.test.jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import Register from "./Register";

function renderRegister() {
  return render(
    <MemoryRouter>
      <ChurchProvider>
        <Register />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

async function fillBasicFields(user, container, { name = "김철수", phone = "010-1111-2222" } = {}) {
  await user.type(screen.getByPlaceholderText("홍길동"), name);
  await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1995");
  await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "5");
  await user.selectOptions(container.querySelector('select[name="birthDay"]'), "10");
  await user.type(screen.getByPlaceholderText("010-0000-0000"), phone);
  await user.click(screen.getByLabelText("새신자입니다"));
  await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
}

describe("Register", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("개인정보 동의 전에는 제출 버튼이 비활성화된다", () => {
    renderRegister();
    expect(screen.getByRole("button", { name: "가입 신청하기" })).toBeDisabled();
  });

  it("필수 정보를 입력하고 동의하면 제출 버튼이 활성화되고, 제출 시 완료 화면으로 전환된다", async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container);
    const submitBtn = screen.getByRole("button", { name: "가입 신청하기" });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText("가입 신청이 완료되었습니다")).toBeInTheDocument(),
    );
  });

  it("승인 대기 중인 정보로 제출하면 중복 신청 모달을 보여준다", async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    // Register.jsx의 PENDING_TEST_MEMBER 목업과 정확히 일치하는 값
    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1999");
    await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "1");
    await user.selectOptions(container.querySelector('select[name="birthDay"]'), "1");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-9999-8888");
    await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    await waitFor(() =>
      expect(screen.getByText("신청을 확인해 주세요")).toBeInTheDocument(),
    );
  });

  it("중복 신청 모달에서 연락처를 클릭하면 클립보드에 복사되고 문구가 바뀐다", async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1999");
    await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "1");
    await user.selectOptions(container.querySelector('select[name="birthDay"]'), "1");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-9999-8888");
    await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    const contactButton = await screen.findByRole("button", { name: "02-2615-4067" });
    await user.click(contactButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("02-2615-4067");
    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Register/Register.test.jsx`
Expected: 마지막 테스트("연락처를 클릭하면 클립보드에 복사")는 FAIL — 현재 연락처는 `<p>` 텍스트일 뿐 버튼이 아니라서 `getByRole("button", { name: "02-2615-4067" })`를 찾지 못함. 나머지 3개는 이미 통과할 수 있다(회귀 테스트이므로).

- [ ] **Step 3: `Register.jsx`에 클립보드 복사 기능 구현**

`const [showDuplicateModal, setShowDuplicateModal] = useState(false);` 바로 아래에 추가:

```jsx
  const [copied, setCopied] = useState(false);

  async function handleCopyContact() {
    try {
      await navigator.clipboard.writeText(ADMIN_CONTACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 조용히 무시(연락처는 여전히 화면에 보임)
    }
  }
```

중복 신청 모달 안의 아래 블록:

```jsx
            <p className="flex items-center justify-center gap-1.5 text-body-4 text-grey-7 mb-6">
              <img src={IcoPhone} className="w-4 h-4 opacity-80" alt="" />
              {ADMIN_CONTACT}
            </p>
```

을 다음으로 교체:

```jsx
            <button
              type="button"
              onClick={handleCopyContact}
              className="flex items-center justify-center gap-1.5 text-body-4 text-grey-7 mb-6 mx-auto hover:text-blue-7 transition-colors"
            >
              <img src={IcoPhone} className="w-4 h-4 opacity-80" alt="" />
              {copied ? "복사되었습니다" : ADMIN_CONTACT}
            </button>
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Register/Register.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/Register/Register.jsx src/pages/Register/Register.test.jsx
git commit -m "feat: 회원가입 중복 신청 모달에 연락처 클립보드 복사 기능 추가 + 회귀 테스트

명세서: '관리팀 누르면 관리팀 연락처 복사'"
```

---

## Task 5: SignupNext.jsx 회귀 테스트 + 완료 모달 문구 정합화 (TDD)

**Files:**
- Modify: `src/pages/Register/SignupNext.jsx`
- Test: `src/pages/Register/SignupNext.test.jsx`

**Interfaces:**
- Consumes: 없음 (완전 독립, 병렬 가능)
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성 (회귀 4개 + 신규 1개)**

```jsx
// src/pages/Register/SignupNext.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import churchConfig from "@/config/church.config";
import SignupNext from "./SignupNext";

function renderSignupNext(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ChurchProvider>
        <SignupNext />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("SignupNext", () => {
  it("URL에 token 파라미터가 없으면 잘못된 접근 화면을 보여준다", () => {
    renderSignupNext("/register/next");
    expect(screen.getByText("잘못된 접근입니다")).toBeInTheDocument();
  });

  it("아이디 중복확인을 하지 않으면 제출 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("4자 이상 영문/숫자"), "myusername");
    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "Passw0rd!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"),
      "Passw0rd!",
    );

    expect(screen.getByRole("button", { name: "가입하기" })).toBeDisabled();
  });

  it("비밀번호 규칙을 지키지 않으면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "abc",
    );

    expect(
      screen.getByText("영문·숫자·특수문자 조합 8자 이상이어야 합니다."),
    ).toBeInTheDocument();
  });

  it("비밀번호와 비밀번호 확인이 다르면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "Passw0rd!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"),
      "Different1!",
    );

    expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
  });

  it("아이디 중복확인 후 정상 제출하면 명세서 문구의 완료 모달을 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("4자 이상 영문/숫자"), "myusername");
    await user.click(screen.getByRole("button", { name: "중복 확인" }));
    await waitFor(() => expect(screen.getByText("사용 가능")).toBeInTheDocument(), {
      timeout: 1000,
    });

    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "Passw0rd!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"),
      "Passw0rd!",
    );
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    await waitFor(
      () =>
        expect(
          screen.getByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/Register/SignupNext.test.jsx`
Expected: 마지막 테스트("명세서 문구의 완료 모달")는 FAIL — 현재 모달 제목은 "회원가입이 완료되었습니다!"라서 `${churchConfig.name}의 일원이 된 것을 축하합니다!` 텍스트를 찾지 못함. 나머지 4개는 이미 통과할 수 있다.

- [ ] **Step 3: `SignupNext.jsx` 완료 모달 문구 정합화**

아래 블록을:

```jsx
            <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">
              회원가입이 완료되었습니다!
            </h2>
            <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
              {church?.name ?? "교회"}의 일원이 된 것을 환영합니다.
              <br />
              이제 모든 교회 서비스를 이용할 수 있습니다.
            </p>
```

다음으로 교체:

```jsx
            <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">
              {church?.name ?? "교회"}의 일원이 된 것을 축하합니다!
            </h2>
            <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
              이제 모든 교회 서비스를 이용할 수 있습니다.
            </p>
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/Register/SignupNext.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/Register/SignupNext.jsx src/pages/Register/SignupNext.test.jsx
git commit -m "fix: 회원가입 완료 모달 문구를 명세서대로 정합화 + 회귀 테스트

명세서: 'OO 교회의 일원이 된 것을 축하합니다!'"
```

---

## 태스크 의존 관계 요약 (병렬 실행 가이드)

```
Task 1 (FindId 신규 + 라우트)         — 독립
Task 2 (Login 회귀)                   — 독립
Task 3 (FindPassword 회귀)            — 독립
Task 4 (Register 회귀 + 클립보드 복사) — 독립
Task 5 (SignupNext 회귀 + 완료문구)   — 독립
```

5개 태스크 전부 서로 다른 파일을 다루며 어떤 태스크도 다른 태스크의 산출물을 import하지 않는다 — **5개 전부 동시에 서브에이전트를 투입할 수 있다.**

## Self-Review 메모

- **스펙 커버리지:** 설계 문서의 "아이디 찾기 신규"(Task 1), "클립보드 복사"(Task 4), "완료 모달 문구"(Task 5), "회귀 테스트"(Task 2·3 및 Task 4·5의 회귀 케이스) 전부 태스크로 매핑됨. "소셜 로그인 버튼 유지"는 변경하지 않는 것이 목표이므로 별도 태스크 불필요(Login 회귀 테스트가 폼 자체의 동작만 검증하고 소셜 버튼은 건드리지 않음으로써 암묵적으로 보장됨).
- **플레이스홀더 스캔:** 전 태스크 코드 블록에 TODO/TBD 없음(단, `FindId.jsx`/`FindPassword.jsx` 내부의 기존 `// TODO: API 연동...` 주석은 실제 원본 파일의 기존 패턴을 유지한 것이며 계획의 placeholder가 아님).
- **타입/시그니처 일관성:** `handleCopyContact()`가 Task 4 Step 3에서 정의한 그대로 테스트(Step 1)에서 기대하는 동작(`navigator.clipboard.writeText` 호출, `copied` 상태로 문구 전환)과 일치. `maskId()`가 Task 1에서 `MOCK_FOUND_ID = "test1234"`에 대해 `"test****"`를 반환함을 손으로 검산 완료(8자 초과분 앞 4자 노출 + 나머지 마스킹).
