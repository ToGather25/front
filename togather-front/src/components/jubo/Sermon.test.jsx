import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Sermon from "./Sermon";

describe("Sermon — 말씀", () => {
  it("설교 제목과 본문 말씀 참조를 렌더한다", () => {
    render(<Sermon />);
    expect(screen.getByText(juboConfig.sermon.title)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.sermon.scripture)).toBeInTheDocument();
  });

  it("설교 개요가 있으면 목록을 렌더한다", () => {
    render(<Sermon />);
    juboConfig.sermon.outline.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("좋아요 버튼을 클릭하면 하트 상태가 토글된다(로컬 상태만, 새로고침 시 초기화)", () => {
    render(<Sermon />);
    const likeBtn = screen.getByRole("button", { name: "좋아요" });
    fireEvent.click(likeBtn);
    expect(screen.getByRole("button", { name: "좋아요 취소" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "좋아요 취소" }));
    expect(screen.getByRole("button", { name: "좋아요" })).toBeInTheDocument();
  });
});
