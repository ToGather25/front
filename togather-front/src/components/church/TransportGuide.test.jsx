import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import churchConfig from "@/config/church.config";
import { renderWithChurch } from "@/test/renderWithChurch";
import TransportGuide from "./TransportGuide";

describe("TransportGuide", () => {
  it("코스별 이름과 일정을 렌더한다", () => {
    renderWithChurch(<TransportGuide />);
    churchConfig.transportGuide.routes.forEach(({ name, schedule }) => {
      const row = screen
        .getAllByText(name)
        .find((el) => el.closest("tr"))
        ?.closest("tr");
      expect(row).toHaveTextContent(schedule);
    });
  });

  it("경유지가 있는 코스가 하나라도 있으면 범례를 보여준다", () => {
    renderWithChurch(<TransportGuide />);
    expect(screen.getAllByText("운행코스 1")).toHaveLength(2);
    expect(
      screen.queryByText("경유지 좌표를 입력하면 지도에 경로가 표시됩니다."),
    ).not.toBeInTheDocument();
  });

  it("모든 코스에 경유지가 없으면 안내 문구를 보여준다", () => {
    renderWithChurch(<TransportGuide />, {
      church: {
        address: "테스트 주소",
        location: { level: 5 },
        transportGuide: {
          routes: [{ name: "운행코스 1", schedule: "시간 미정", color: "#3B5280", waypoints: [] }],
        },
      },
    });
    expect(
      screen.getByText("경유지 좌표를 입력하면 지도에 경로가 표시됩니다."),
    ).toBeInTheDocument();
  });
});
