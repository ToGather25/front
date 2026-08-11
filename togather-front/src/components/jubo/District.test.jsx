import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import District from "./District";

describe("District — 구역", () => {
  it("모든 구역 행을 렌더한다", () => {
    render(<District />);
    juboConfig.districts.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
