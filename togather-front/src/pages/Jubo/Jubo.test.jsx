import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent, within } from "@testing-library/react";
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
    // 인쇄용 전체 렌더(.jubo-print-all)에도 Giving이 display:none 상태로 함께 렌더되므로,
    // getByText는 화면에 보이는 단일 탭 영역(.jubo-single-tab)으로 범위를 좁혀 조회한다.
    const singleTab = document.querySelector(".jubo-single-tab");
    expect(within(singleTab).getByText(/연말정산/)).toBeInTheDocument();
  });

  it("'기도제목' 탭을 클릭하면 PrayerTopics 콘텐츠로 전환된다", () => {
    renderWithChurch(<Jubo />, { withRouter: true });
    fireEvent.click(screen.getByRole("button", { name: "기도제목" }));
    expect(screen.getByRole("heading", { name: "기도제목" })).toBeInTheDocument();
  });
});
