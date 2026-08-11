import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Service from "./Service";

describe("Service — 봉사", () => {
  it("모든 봉사 역할 행을 렌더한다", () => {
    render(<Service />);
    juboConfig.serviceRoles.forEach(({ role }) => {
      expect(screen.getByText(role)).toBeInTheDocument();
    });
  });
});
