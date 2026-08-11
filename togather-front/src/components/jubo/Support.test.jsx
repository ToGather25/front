import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Support from "./Support";

describe("Support — 후원", () => {
  it("모든 후원 기관 행을 렌더한다", () => {
    render(<Support />);
    const uniqueOrgs = [...new Set(juboConfig.support.map((s) => s.organization))];
    uniqueOrgs.forEach((organization) => {
      const count = juboConfig.support.filter((s) => s.organization === organization).length;
      const matches = screen.getAllByText(organization);
      expect(matches).toHaveLength(count);
    });
  });
});
