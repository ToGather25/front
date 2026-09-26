import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import WordTabBar from "./WordTabBar";

function renderTabBar(path = "/말씀/설교") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <WordTabBar />
    </MemoryRouter>,
  );
}

describe("WordTabBar", () => {
  it("3개 탭을 CSV 명세 순서·라벨대로 렌더한다", () => {
    renderTabBar();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "예배 안내",
      "예배 목록",
      "스마트 주보",
    ]);
  });

  it("각 탭이 올바른 경로로 연결된다", () => {
    renderTabBar();
    expect(screen.getByRole("link", { name: "예배 목록" })).toHaveAttribute(
      "href",
      "/말씀/설교",
    );
    expect(screen.getByRole("link", { name: "예배 안내" })).toHaveAttribute(
      "href",
      "/말씀/안내",
    );
    expect(screen.getByRole("link", { name: "스마트 주보" })).toHaveAttribute(
      "href",
      "/주보/목록",
    );
  });

  it("현재 경로와 일치하는 탭만 활성 스타일을 갖는다", () => {
    renderTabBar("/말씀/설교");
    expect(screen.getByRole("link", { name: "예배 목록" })).toHaveClass("border-blue-8");
    expect(screen.getByRole("link", { name: "예배 안내" })).not.toHaveClass("border-blue-8");
  });
});
