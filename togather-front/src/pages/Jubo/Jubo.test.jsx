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
    // 인쇄용 전체 렌더(.jubo-print-all)는 실제 인쇄 중(isPrinting)에만 마운트되므로
    // 테스트 환경에서는 렌더되지 않지만, 단일 탭 영역으로 범위를 좁혀 조회하는 습관을 유지한다.
    const singleTab = document.querySelector(".jubo-single-tab");
    expect(within(singleTab).getByText(/연말정산/)).toBeInTheDocument();
  });

  it("'기도제목' 탭을 클릭하면 PrayerTopics 콘텐츠로 전환된다", () => {
    renderWithChurch(<Jubo />, { withRouter: true });
    fireEvent.click(screen.getByRole("button", { name: "기도제목" }));
    expect(screen.getByRole("heading", { name: "기도제목" })).toBeInTheDocument();
  });
});
