import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import juboConfig from "@/config/jubo.config";
import Ministers from "./Ministers";

describe("Ministers — 섬기는 분들", () => {
  it("모든 그룹 제목과 첫 항목을 렌더하고 교적부로 링크한다", () => {
    render(
      <MemoryRouter>
        <Ministers />
      </MemoryRouter>,
    );
    juboConfig.ministers.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    const [firstRole] = juboConfig.ministers[0].items[0].split("|").map((s) => s.trim());
    const link = screen.getByText(firstRole).closest("a");
    expect(link).toHaveAttribute("href", "/교적부");
  });
});
