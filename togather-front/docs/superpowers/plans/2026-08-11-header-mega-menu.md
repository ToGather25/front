# 헤더 메가메뉴(전체 탭 동시 표시) 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/layouts/RootLayout.jsx`의 `DesktopHeader` 드롭다운 메뉴를 "마우스오버한 상단탭 하나만 표시"에서 "하위메뉴 있는 상단탭 전부를 구분선으로 나뉜 컬럼으로 동시에 표시, 마우스오버 중인 컬럼만 하이라이트"로 바꾼다.

**Architecture:** `DesktopHeader` 내부의 드롭다운 패널 렌더 로직만 교체한다(파일 분리 없음). `NAV_ITEMS.find(단일 탭)` 대신 `NAV_ITEMS.filter(children 있는 항목)`으로 전체 순회하며, CSS Grid(`grid-template-columns: repeat(N,1fr)`, 인라인 스타일)+Tailwind `divide-x`로 컬럼과 구분선을 만든다. `openMenu` state 자체(설정·해제 트리거)는 그대로 두고 용도만 "표시 필터"에서 "하이라이트 대상"으로 바뀐다.

**Tech Stack:** React 19, React Router v7, Tailwind CSS v4, Vitest + Testing Library.

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-08-11-header-mega-menu-design.md`
- 컬럼 사이 세로 구분선 + 마우스오버 중인 컬럼에만 연한 배경 틴트(`bg-blue-1`), 둘 다 적용한다.
- 배경은 흰색 유지 — 히어로 이미지 오버레이 스타일 도입하지 않는다.
- 각 컬럼 상단에 그 컬럼이 속한 상위 탭 이름을 굵은 제목 헤더로 표시한다(`item.label`, 링크는 `item.to ?? item.children[0].to`).
- 기존 CSS `columns-*`(1~3단 반응형) 로직은 완전히 제거한다 — 컬럼 폭이 좁아져 항목이 몇 개든 단일 세로 목록으로 충분하다.
- 컬럼 헤더·하위 항목 링크 클릭 시 기존처럼 `setOpenMenu(null)`로 패널을 닫는다.
- 애니메이션(`megaFadeIn`)과 패널 닫힘 트리거(헤더 `onMouseLeave`)는 변경하지 않는다.
- 다음은 이번 사이클에서 절대 건드리지 않는다: `MobileHeader`/`MobileDrawer`, `DesktopFooter`, `BottomNav`, 우측 로그인/회원가입 버튼 영역, `church.config.js`의 `nav` 데이터(라벨·구조·경로).
- `church.config.js`의 현재 `nav` 배열은 6개 항목이며 전부 `children`을 가진다: 교회소개(7개 하위항목), 예배·방송(4개), 주일학교(4개), 전도·선교(4개), 양육·훈련(6개), 교회소식(4개). 테스트는 이 실제 데이터를 그대로 쓰되 개수를 하드코딩 가정하지 않고 `church.config.js`에서 직접 import해 비교한다.

---

## 파일 구조

- **수정**: `src/layouts/RootLayout.jsx` — `DesktopHeader` 함수 내 드롭다운 패널 렌더 블록(현재 142~191행)만 교체. 다른 함수(`DesktopFooter`/`MobileHeader`/`MobileDrawer`/`BottomNav`/`Layout`/`RootLayout`)는 무변경.
- **신규**: `src/layouts/RootLayout.test.jsx` — 이 컴포넌트를 검증하는 첫 전용 테스트 파일.

## Task 1: DesktopHeader 드롭다운을 전체 컬럼 동시 표시로 교체 (TDD)

**Files:**
- Modify: `src/layouts/RootLayout.jsx:142-191` (드롭다운 패널 렌더 블록)
- Test: `src/layouts/RootLayout.test.jsx` (신규)

**Interfaces:**
- Consumes: `church.config.js`의 `nav` 배열(`{label, to?, children?: [{label, to}]}[]`) — 기존 구조 그대로, 변경 없음. `src/routes.jsx`의 `routes` export(`createMemoryRouter`에 그대로 꽂는 배열) — 기존 `routes.test.jsx`가 이미 이 패턴을 씀.
- Produces: 없음(이 계획의 유일한 태스크 — 이후 태스크가 이 인터페이스에 의존하지 않음).

### Step 1: 실패하는 테스트 작성

`src/layouts/RootLayout.test.jsx`를 새로 만든다. `RootLayout`은 `<Outlet/>`을 쓰므로(react-router route 트리 안에서만 렌더 가능) `createMemoryRouter(routes, {...})` + `<RouterProvider>` 패턴을 쓴다(이미 `src/routes.test.jsx`에 동일 패턴 존재 — `ChurchProvider`+`SearchProvider`로 감싸는 이유는 `RootLayout`이 라우트 트리 밖에서 `main.jsx`가 제공하는 두 Provider에 의존하기 때문). `AuthProvider`는 `RootLayout` 자신이 내부에서 감싸므로 별도로 씌울 필요 없다.

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/routes";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { SearchProvider } from "@/contexts/SearchContext";
import churchConfig from "@/config/church.config";

function renderRootLayout(initialEntries = ["/"]) {
  const router = createMemoryRouter(routes, { initialEntries });
  return render(
    <ChurchProvider>
      <SearchProvider>
        <RouterProvider router={router} />
      </SearchProvider>
    </ChurchProvider>,
  );
}

const NAV_WITH_CHILDREN = churchConfig.nav.filter((item) => item.children);

describe("RootLayout — DesktopHeader 메가메뉴", () => {
  it("상단탭 하나에 마우스오버하면 하위메뉴 있는 모든 탭의 컬럼이 동시에 렌더된다", () => {
    renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    const lastTab = NAV_WITH_CHILDREN[NAV_WITH_CHILDREN.length - 1];

    fireEvent.mouseEnter(screen.getByRole("button", { name: firstTab.label }));

    // 마우스오버한 탭(교회소개)뿐 아니라, 마지막 탭(교회소식)의 하위항목도 동시에 보여야 한다.
    expect(screen.getByText(firstTab.children[0].label)).toBeInTheDocument();
    expect(screen.getByText(lastTab.children[0].label)).toBeInTheDocument();
  });

  it("마우스오버한 컬럼에만 하이라이트 배경 클래스가 적용된다", () => {
    renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    const secondTab = NAV_WITH_CHILDREN[1];

    fireEvent.mouseEnter(screen.getByRole("button", { name: firstTab.label }));

    const activeHeader = screen.getByRole("link", { name: firstTab.label });
    const inactiveHeader = screen.getByRole("link", { name: secondTab.label });
    // 컬럼 wrapper는 헤더 링크의 부모.
    expect(activeHeader.closest("div").className).toContain("bg-blue-1");
    expect(inactiveHeader.closest("div").className).not.toContain("bg-blue-1");
  });

  // 두 테스트 모두 클릭한 컬럼이 아니라 "다른" 컬럼(lastTab)의 하위 항목이 사라지는지로
  // 검증한다 — 클릭한 컬럼 자신의 라벨로 검증하면, 이동한 목적지 페이지(예: /교회소개)가
  // 자체 탭 바에 동일한 라벨들을 계속 표시하고 있어 "패널이 안 닫혀도 텍스트가 남아있는"
  // 오탐이 날 수 있다. lastTab(교회소식)의 하위 항목은 firstTab의 목적지 페이지와
  // 무관하므로, 사라졌다면 그건 확실히 드롭다운이 닫혔기 때문이다.
  it("컬럼 헤더 링크를 클릭하면 패널이 닫힌다", () => {
    renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    const lastTab = NAV_WITH_CHILDREN[NAV_WITH_CHILDREN.length - 1];
    fireEvent.mouseEnter(screen.getByRole("button", { name: firstTab.label }));
    expect(screen.getByText(lastTab.children[0].label)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: firstTab.label }));

    expect(screen.queryByText(lastTab.children[0].label)).not.toBeInTheDocument();
  });

  it("하위 항목 링크를 클릭하면 패널이 닫힌다", () => {
    renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    const lastTab = NAV_WITH_CHILDREN[NAV_WITH_CHILDREN.length - 1];
    fireEvent.mouseEnter(screen.getByRole("button", { name: firstTab.label }));
    expect(screen.getByText(lastTab.children[0].label)).toBeInTheDocument();

    fireEvent.click(screen.getByText(firstTab.children[0].label));

    expect(screen.queryByText(lastTab.children[0].label)).not.toBeInTheDocument();
  });

  it("헤더 밖으로 마우스가 나가면 패널이 닫힌다", () => {
    const { container } = renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    fireEvent.mouseEnter(screen.getByRole("button", { name: firstTab.label }));
    expect(screen.getByText(firstTab.children[0].label)).toBeInTheDocument();

    fireEvent.mouseLeave(container.querySelector("header"));

    expect(screen.queryByText(firstTab.children[0].label)).not.toBeInTheDocument();
  });

  it("church.config.js의 실제 nav 데이터 개수만큼 컬럼이 렌더된다", () => {
    renderRootLayout();
    fireEvent.mouseEnter(screen.getByRole("button", { name: NAV_WITH_CHILDREN[0].label }));

    NAV_WITH_CHILDREN.forEach((item) => {
      const header = screen.getByRole("link", { name: item.label });
      const column = header.closest("div");
      item.children.forEach((child) => {
        expect(within(column).getByText(child.label)).toBeInTheDocument();
      });
    });
  });
});
```

### Step 2: 테스트가 실패하는지 확인

Run: `pnpm test:run src/layouts/RootLayout.test.jsx`
Expected: FAIL — 지금 코드는 `openMenu`인 탭 하나의 컬럼만 렌더하므로, "마지막 탭(교회소식)의 하위항목도 동시에 보여야 한다" 단언과 "church.config.js의 실제 nav 데이터 개수만큼 컬럼이 렌더된다" 단언에서 실패해야 한다. 또한 지금 코드는 각 하위 항목이 활성 컬럼 표시 없이(`bg-blue-1` div-wrapper 구조 자체가 없이) 렌더되므로 하이라이트 단언도 실패해야 한다.

### Step 3: `DesktopHeader`의 드롭다운 패널 블록 교체

`src/layouts/RootLayout.jsx`의 142~191행(현재 `{openMenu && (...)}` 블록 전체)을 다음으로 교체한다:

```jsx
      {openMenu && (
        <div
          className="absolute left-0 right-0 bg-white shadow-xl"
          style={{
            animation: "megaFadeIn 0.15s ease-out",
            borderBottom: "2px solid var(--color-primary)",
          }}
        >
          <style>{`
            @keyframes megaFadeIn {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="max-w-[1920px] mx-auto px-8 py-8">
            <div
              className="grid divide-x divide-bluegrey-2"
              style={{
                gridTemplateColumns: `repeat(${NAV_ITEMS.filter((n) => n.children).length}, 1fr)`,
              }}
            >
              {NAV_ITEMS.filter((item) => item.children).map((item) => {
                const active = openMenu === item.label;
                return (
                  <div
                    key={item.label}
                    className={`px-6 flex flex-col gap-1 rounded-md transition-colors ${
                      active ? "bg-blue-1" : ""
                    }`}
                  >
                    <Link
                      to={item.to ?? item.children[0].to}
                      onClick={() => setOpenMenu(null)}
                      className={`text-sub-tit-4 font-bold mb-2 transition-colors ${
                        active ? "text-primary" : "text-grey-10"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.to}
                        onClick={() => setOpenMenu(null)}
                        className="group flex items-center gap-2 px-2 py-2 rounded-md text-body-3 text-grey-7 hover:text-primary hover:bg-blue-1 transition-colors whitespace-nowrap"
                      >
                        <span className="w-1 h-1 rounded-full bg-bluegrey-3 group-hover:bg-primary transition-colors shrink-0" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
```

이 블록 바로 위(30~141행)의 `openMenu`/`setOpenMenu` state 선언, 각 상단탭의 `onMouseEnter` 트리거, 헤더 전체의 `onMouseLeave` 닫힘 로직은 전혀 손대지 않는다 — 그대로 둔다.

### Step 4: 테스트가 통과하는지 확인

Run: `pnpm test:run src/layouts/RootLayout.test.jsx`
Expected: PASS (6개 테스트 전부)

### Step 5: 전체 테스트 스위트 + 빌드 확인

Run: `pnpm test:run`
Expected: 기존 테스트 전부 통과 + 신규 6개 포함 총 테스트 수 증가. 특히 `src/routes.test.jsx`의 "/말씀 리다이렉트 + 예배 안내 라우트" describe 블록(RootLayout을 거치는 기존 테스트)이 여전히 통과하는지 확인 — 그 테스트는 `getAllByRole("link", { name: "실시간 예배" })`로 헤더 드롭다운과 페이지 본문 양쪽의 동명 링크를 이미 구분해서 처리하고 있으므로(주석 참고), 이번 변경으로 헤더 쪽 "실시간 예배" 링크가 사라지거나 늘어나지 않는지가 핵심이다(하위 항목 라벨·구조는 이번 계획에서 변경하지 않으므로 정상적으로는 영향 없어야 한다).

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료.

### Step 6: 커밋

```bash
git add src/layouts/RootLayout.jsx src/layouts/RootLayout.test.jsx
git commit -m "feat: 헤더 드롭다운을 전체 탭 동시 표시 메가메뉴로 개편

마우스오버한 상단탭 하나의 하위메뉴만 보여주던 것을, 하위메뉴 있는
상단탭 전부를 구분선으로 나뉜 컬럼으로 동시에 표시하도록 바꿨다.
마우스오버 중인 컬럼에만 굵은 파란 헤더 + 연한 배경 틴트로 하이라이트를
준다. church.config.js의 nav 데이터·우측 로그인 영역·모바일 메뉴는
변경하지 않았다."
```

---

## Self-Review 결과

**스펙 커버리지**: 스펙 문서의 5개 사용자 확인 사항(인터랙션 모델/구분선·하이라이트/배경 스타일/우측 영역 불변/컬럼 헤더) 전부 Task 1의 Global Constraints와 Step 3 구현 코드에 반영됨. 테스트 계획 5개 항목(전체 컬럼 동시 렌더/하이라이트/링크 클릭 시 닫힘/외부 마우스아웃 시 닫힘/실제 데이터 기반 렌더) 전부 Step 1의 6개 테스트 케이스로 커버됨(링크 클릭 항목은 컬럼 헤더·하위 항목 두 케이스로 분리).

**플레이스홀더 스캔**: 없음 — 모든 스텝에 실제 코드/명령어 포함.

**타입 일관성**: `NAV_ITEMS`(=`church.nav`)의 `{label, to?, children?: [{label, to}]}` 구조는 기존 코드와 완전히 동일하게 유지되며 이번 계획에서 새로 정의하는 타입/함수 시그니처가 없음 — 단일 태스크라 교차 태스크 참조 불일치 위험 없음.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-11-header-mega-menu.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
