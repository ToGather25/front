import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import TransportGuide from "./TransportGuide";

const CHURCH_WITH_ROUTES = {
  address: "테스트 주소",
  location: { level: 5 },
  transportGuide: {
    routes: [
      {
        name: "운행코스 1",
        color: "#3B5280",
        waypoints: [
          { lat: 1, lng: 1, label: "신림역", time: "06:00" },
          { lat: 2, lng: 2, label: "방배동", time: "06:20" },
        ],
      },
      { name: "운행코스 2", color: "#E05C2D", waypoints: [] },
    ],
  },
};

describe("TransportGuide", () => {
  it("기본은 전체 선택 — 모든 코스의 시간표가 한 번에 보인다", () => {
    renderWithChurch(<TransportGuide />, { church: CHURCH_WITH_ROUTES });
    expect(screen.getByText("신림역")).toBeInTheDocument();
    expect(screen.getByText("06:00")).toBeInTheDocument();
    expect(screen.getByText("경유지 정보가 없습니다.")).toBeInTheDocument();
  });

  it("전체 선택 시에는 지도를 보여주지 않는다(KakaoMapRoute 미마운트)", () => {
    renderWithChurch(<TransportGuide />, { church: CHURCH_WITH_ROUTES });
    // jsdom엔 window.kakao가 없어 KakaoMapRoute가 마운트되면 이 에러 문구를 띄운다.
    expect(screen.queryByText("카카오맵 SDK를 불러올 수 없습니다.")).not.toBeInTheDocument();
  });

  it("코스를 선택하면 그 코스의 시간표와 지도(KakaoMapRoute)를 보여준다", () => {
    renderWithChurch(<TransportGuide />, { church: CHURCH_WITH_ROUTES });

    fireEvent.click(screen.getByRole("button", { name: /운행코스 1/ }));

    expect(screen.getByText("신림역")).toBeInTheDocument();
    expect(screen.queryByText("경유지 정보가 없습니다.")).not.toBeInTheDocument();
    expect(screen.getByText("카카오맵 SDK를 불러올 수 없습니다.")).toBeInTheDocument();
  });

  it("경유지가 없는 코스를 선택하면 안내 문구만 보이고 지도는 없다", () => {
    renderWithChurch(<TransportGuide />, { church: CHURCH_WITH_ROUTES });

    fireEvent.click(screen.getByRole("button", { name: /운행코스 2/ }));

    expect(screen.getByText("경유지 정보가 없습니다.")).toBeInTheDocument();
  });
});
