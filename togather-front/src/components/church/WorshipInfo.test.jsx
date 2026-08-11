import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import WorshipInfo from "./WorshipInfo";

describe("WorshipInfo", () => {
  it("정기 예배 행을 모두 렌더한다", () => {
    renderWithChurch(<WorshipInfo />);
    churchConfig.worshipSchedule.regular.forEach(({ name, time, location }) => {
      const row = screen.getByText(name).closest("tr");
      expect(row).not.toBeNull();
      expect(row).toHaveTextContent(time);
      expect(row).toHaveTextContent(location);
    });
  });

  it("주일학교예배 행을 모두 렌더한다", () => {
    renderWithChurch(<WorshipInfo />);
    churchConfig.worshipSchedule.departments.forEach(({ name, time, location }) => {
      const row = screen.getByText(name).closest("tr");
      expect(row).not.toBeNull();
      expect(row).toHaveTextContent(time);
      expect(row).toHaveTextContent(location);
    });
  });
});
