import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import News from "./News";

describe("News — 소식", () => {
  it("모든 소식 섹션 제목을 렌더한다", () => {
    render(<News />);
    juboConfig.news.forEach((section) => {
      expect(screen.getByText(new RegExp(section.title))).toBeInTheDocument();
    });
  });
});
