import { describe, it, expect, vi } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import BibleSidebar from "./BibleSidebar";

const MENUS = ["성경읽기", "랭킹", "내 구절", "내 현황"];

function renderSidebar(props = {}) {
  return renderWithChurch(
    <BibleSidebar
      sidebarOpen={true}
      onToggle={vi.fn()}
      menus={MENUS}
      activeMenu="성경읽기"
      onMenuChange={vi.fn()}
      switchTo={{ to: "/말씀/필사", label: "쓰기로 전환" }}
      {...props}
    />,
    { withRouter: true },
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
    expect(screen.getByRole("link", { name: "쓰기로 전환" })).toHaveAttribute("href", "/말씀/필사");
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
