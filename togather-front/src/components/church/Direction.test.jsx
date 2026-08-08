import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Direction from "./Direction";

describe("Direction", () => {
  it("주차 안내 행을 모두 렌더한다", () => {
    renderWithChurch(<Direction />);
    churchConfig.parking.details.forEach(({ label, value }) => {
      const row = screen.getByText(label).closest("tr");
      expect(row).toHaveTextContent(value);
    });
  });

  it("교회 주소 텍스트를 지도 아래에 렌더한다", () => {
    renderWithChurch(<Direction />);
    expect(screen.getByText(churchConfig.address)).toBeInTheDocument();
  });
});
