import { describe, it, expect } from "vite-plus/test";
import { render, fireEvent, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/routes";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { SearchProvider } from "@/contexts/SearchContext";
import churchConfig from "@/config/church.config";

// RootLayout은 DesktopHeader(<header class="... hidden md:block">)와 MobileHeader
// (<header class="... md:hidden">) 두 개의 <header>를 함께 렌더하고, MobileDrawer의
// 네비게이션(항상 DOM에 존재하며 열림 여부는 CSS transform으로만 제어됨)과 Home 페이지의
// SubMenu 바로가기 카드도 nav와 동일한 라벨("인사말", "교회소개", "스마트 주보" 등)을
// 페이지 전역에 렌더한다. jsdom은 CSS로 인한 시각적 숨김을 반영하지 않으므로
// screen.getByText/getByRole처럼 document 전체를 뒤지는 쿼리는 이 중복과 충돌한다.
// 그래서 모든 쿼리를 데스크탑 메가메뉴가 실제로 위치한 첫 번째 <header>로 스코프한다.
function renderRootLayout(initialEntries = ["/"]) {
  const router = createMemoryRouter(routes, { initialEntries });
  const utils = render(
    <ChurchProvider>
      <SearchProvider>
        <RouterProvider router={router} />
      </SearchProvider>
    </ChurchProvider>,
  );
  const header = utils.container.querySelector("header");
  return { ...utils, header };
}

const NAV_WITH_CHILDREN = churchConfig.nav.filter((item) => item.children);

// church.config.js의 실제 nav 데이터는 "스마트 주보"처럼 서로 다른 두 컬럼
// (예배·방송/교회소식)에 동일한 하위 항목 라벨을 중복으로 갖고 있다. "다른 컬럼의
// 하위 항목이 사라졌는지"를 판정하려는 테스트가 하필 그 중복 라벨을 대표값으로 뽑으면
// 같은 라벨이 다른 컬럼에도 남아 있어 getByText가 모호해진다. church.config.js는
// 이번 태스크에서 변경하지 않으므로, nav 전체에서 유일하게 등장하는 라벨을 골라
// "다른 컬럼" 대표값으로 사용한다.
const ALL_CHILD_LABELS = churchConfig.nav.flatMap(
  (item) => item.children?.map((c) => c.label) ?? [],
);
function uniqueChild(item) {
  return item.children.find(
    (child) => ALL_CHILD_LABELS.filter((label) => label === child.label).length === 1,
  );
}

describe("RootLayout — DesktopHeader 메가메뉴", () => {
  it("상단탭 하나에 마우스오버하면 하위메뉴 있는 모든 탭의 컬럼이 동시에 렌더된다", () => {
    const { header } = renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    const lastTab = NAV_WITH_CHILDREN[NAV_WITH_CHILDREN.length - 1];

    fireEvent.mouseEnter(within(header).getByRole("button", { name: firstTab.label }));

    // 마우스오버한 탭(교회소개)뿐 아니라, 마지막 탭(교회소식)의 하위항목도 동시에 보여야 한다.
    expect(within(header).getByText(firstTab.children[0].label)).toBeInTheDocument();
    expect(within(header).getByText(uniqueChild(lastTab).label)).toBeInTheDocument();
  });

  // 클릭한 컬럼이 아니라 "다른" 컬럼(lastTab)의 하위 항목이 사라지는지로 검증한다 —
  // 클릭한 컬럼 자신의 라벨로 검증하면, 이동한 목적지 페이지(예: /교회소개)가 자체
  // 탭 바에 동일한 라벨들을 계속 표시하고 있어 "패널이 안 닫혀도 텍스트가 남아있는"
  // 오탐이 날 수 있다. lastTab(교회소식)의 하위 항목은 firstTab의 목적지 페이지와
  // 무관하므로, 사라졌다면 그건 확실히 드롭다운이 닫혔기 때문이다.
  it("하위 항목 링크를 클릭하면 패널이 닫힌다", () => {
    const { header } = renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    const lastTab = NAV_WITH_CHILDREN[NAV_WITH_CHILDREN.length - 1];
    fireEvent.mouseEnter(within(header).getByRole("button", { name: firstTab.label }));
    expect(within(header).getByText(uniqueChild(lastTab).label)).toBeInTheDocument();

    fireEvent.click(within(header).getByText(firstTab.children[0].label));

    expect(within(header).queryByText(uniqueChild(lastTab).label)).not.toBeInTheDocument();
  });

  it("헤더 밖으로 마우스가 나가면 패널이 닫힌다", () => {
    const { header } = renderRootLayout();
    const firstTab = NAV_WITH_CHILDREN[0];
    fireEvent.mouseEnter(within(header).getByRole("button", { name: firstTab.label }));
    expect(within(header).getByText(firstTab.children[0].label)).toBeInTheDocument();

    fireEvent.mouseLeave(header);

    expect(within(header).queryByText(firstTab.children[0].label)).not.toBeInTheDocument();
  });

  it("church.config.js의 실제 nav 데이터 개수만큼 컬럼이 렌더된다", () => {
    const { header } = renderRootLayout();
    fireEvent.mouseEnter(within(header).getByRole("button", { name: NAV_WITH_CHILDREN[0].label }));

    // 컬럼에는 더 이상 상위 메뉴명을 표시하는 헤더 링크가 없으므로(하위 항목만 나열),
    // 컬럼 컨테이너의 각 자식 div를 순서대로 하나의 컬럼으로 보고 그 안의 링크 개수/순서로 검증한다.
    // aria-hidden 배경 강조 div는 실제 컬럼이 아니므로 제외한다.
    const container = within(header).getByTestId("mega-menu-columns");
    const columns = Array.from(container.children).filter(
      (el) => el.getAttribute("aria-hidden") !== "true",
    );
    expect(columns).toHaveLength(NAV_WITH_CHILDREN.length);
    NAV_WITH_CHILDREN.forEach((item, i) => {
      const links = within(columns[i]).getAllByRole("link");
      expect(links).toHaveLength(item.children.length);
      item.children.forEach((child, j) => {
        expect(links[j]).toHaveTextContent(child.label);
      });
    });
  });
});
