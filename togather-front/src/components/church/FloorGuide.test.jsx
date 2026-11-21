import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import defaultConfig from "@/config/church.config";
import defaultBanner from "@/assets/default_banner.png";
import FloorGuide from "./FloorGuide";

describe("FloorGuide", () => {
  it("층 목록을 렌더하고 기본으로 첫 번째 층 사진을 보여준다", () => {
    renderWithChurch(<FloorGuide />);
    const first = defaultConfig.floorGuide[0];
    expect(screen.getByText(first.rooms)).toBeInTheDocument();
    expect(screen.getByAltText(first.floor)).toBeInTheDocument();
  });

  it("다른 층 버튼을 클릭하면 우측 사진이 전환된다", () => {
    renderWithChurch(<FloorGuide />);
    fireEvent.click(screen.getByRole("button", { name: "1층" }));
    expect(screen.getByAltText("1층")).toBeInTheDocument();
    expect(screen.queryByAltText("4층")).not.toBeInTheDocument();
  });

  it("선택한 층에 이미지가 없으면 기본 배너 이미지로 대체된다", () => {
    renderWithChurch(<FloorGuide />, {
      church: { floorGuide: [{ floor: "5층", rooms: "테스트실", image: null }] },
    });
    const img = screen.getByAltText("5층");
    expect(img).toHaveAttribute("src", defaultBanner);
  });
});
