import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Direction from "./Direction";

const SINGLE_LOT_CHURCH = {
  ...churchConfig,
  parking: {
    lots: [{ name: "교회 주차장", details: [{ label: "요금", value: "무료" }] }],
  },
};

const MULTI_LOT_CHURCH = {
  ...churchConfig,
  parking: {
    lots: [
      { name: "본당 주차장", details: [{ label: "요금", value: "무료" }] },
      { name: "제2 주차장", details: [{ label: "요금", value: "유료" }] },
    ],
  },
};

describe("Direction", () => {
  it("주차장이 한 곳이면 선택 select 없이 표를 바로 보여준다", () => {
    renderWithChurch(<Direction />, { church: SINGLE_LOT_CHURCH });
    const row = screen.getByText("요금").closest("tr");
    expect(row).toHaveTextContent("무료");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("주차장이 여러 곳이면 select로 표를 전환한다", () => {
    renderWithChurch(<Direction />, { church: MULTI_LOT_CHURCH });

    expect(screen.getByText("본당 주차장")).toBeInTheDocument();
    expect(screen.getByText("제2 주차장")).toBeInTheDocument();
    expect(screen.getByText("무료")).toBeInTheDocument();
    expect(screen.queryByText("유료")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });

    expect(screen.getByText("유료")).toBeInTheDocument();
    expect(screen.queryByText("무료")).not.toBeInTheDocument();
  });

  it("교회 주소 텍스트를 지도 아래에 렌더한다", () => {
    renderWithChurch(<Direction />);
    expect(screen.getByText(churchConfig.address)).toBeInTheDocument();
  });

  it("대중교통 경로를 모두 렌더한다", () => {
    renderWithChurch(<Direction />);
    churchConfig.publicTransit.forEach((route) => {
      expect(screen.getByText(route.subway)).toBeInTheDocument();
      expect(screen.getByText(route.bus)).toBeInTheDocument();
      expect(screen.getByText(route.dropoff)).toBeInTheDocument();
    });
  });
});
