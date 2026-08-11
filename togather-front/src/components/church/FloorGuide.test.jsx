import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import FloorGuide from "./FloorGuide";

describe("FloorGuide", () => {
  it("층 목록을 렌더하고 기본으로 첫 번째 층 사진을 보여준다", () => {
    renderWithChurch(<FloorGuide />);
    expect(screen.getByText("청년부실, 사무실")).toBeInTheDocument();
    expect(screen.getByAltText("4층 사진")).toBeInTheDocument();
  });

  it("다른 층 행을 클릭하면 우측 사진이 전환된다", () => {
    renderWithChurch(<FloorGuide />);
    fireEvent.click(screen.getByText("1층").closest("tr"));
    expect(screen.getByAltText("1층 사진")).toBeInTheDocument();
    expect(screen.queryByAltText("4층 사진")).not.toBeInTheDocument();
  });

  it("선택한 층에 이미지가 없으면 대체 아이콘 문구를 보여준다", () => {
    renderWithChurch(<FloorGuide />, {
      church: { floorGuide: [{ floor: "5층", rooms: "테스트실", image: null }] },
    });
    expect(screen.getByText("5층 사진")).toBeInTheDocument();
    expect(screen.queryByAltText("5층 사진")).not.toBeInTheDocument();
  });
});
