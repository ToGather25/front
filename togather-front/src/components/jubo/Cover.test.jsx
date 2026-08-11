import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import juboConfig from "@/config/jubo.config";
import Cover from "./Cover";

describe("Cover — 표지", () => {
  it("호수·발행일과 표어·3대 실천사항을 렌더한다", () => {
    renderWithChurch(<Cover />);
    expect(screen.getByText(juboConfig.cover.issueNumber)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.cover.date)).toBeInTheDocument();
    expect(
      screen.getByText(churchConfig.vision.mainVerse.replace(/^"|"$/g, "")),
    ).toBeInTheDocument();
    expect(screen.getByText(churchConfig.vision.items[0].label)).toBeInTheDocument();
  });
});
