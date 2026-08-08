import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Greeting from "./Greeting";

describe("Greeting", () => {
  it("인사말 제목과 첫 번째 본문 단락을 렌더한다", () => {
    renderWithChurch(<Greeting />);
    expect(screen.getByText(churchConfig.greeting.title)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.greeting.paragraphs[0])).toBeInTheDocument();
  });

  it("서명 줄(교회명·직함·이름)을 렌더한다", () => {
    renderWithChurch(<Greeting />);
    const { church, title, name } = churchConfig.greeting.signature;
    expect(
      screen.getByText(
        (_, node) => node?.tagName === "P" && node.textContent.trim() === `${church} ${title} ${name}`,
      ),
    ).toBeInTheDocument();
  });

  it("담임목사 사진이 없으면 대체 아바타를 렌더한다(실제 이미지 없음)", () => {
    renderWithChurch(<Greeting />);
    expect(screen.queryByAltText("담임목사 사진")).not.toBeInTheDocument();
  });
});
