import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import WordInfo from "./WordInfo";

describe("WordInfo — 예배 안내", () => {
  it("Hero 제목과 WordTabBar, 예배 시간표 내용을 렌더한다", () => {
    renderWithChurch(<WordInfo />, { initialEntries: ["/말씀/안내"] });

    expect(screen.getByRole("heading", { name: "예배·방송" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "예배 안내" })).toHaveClass("border-blue-8");
    expect(screen.getByText("정기 예배")).toBeInTheDocument();
    expect(screen.getByText(churchConfig.worshipSchedule.regular[0].name)).toBeInTheDocument();
  });
});
