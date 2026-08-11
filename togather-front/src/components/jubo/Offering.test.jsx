import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Offering from "./Offering";

describe("Offering — 예물", () => {
  it("모든 예물 항목 제목을 렌더한다", () => {
    render(<Offering />);
    juboConfig.offering.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});
