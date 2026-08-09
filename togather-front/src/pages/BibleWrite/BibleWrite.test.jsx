import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import BibleWrite from "./BibleWrite";

describe("BibleWrite — 로그인 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("로그인하지 않은 상태로 접근하면 로그인 필요 모달만 보여준다", () => {
    renderWithChurch(<BibleWrite />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 접근하면 모달 없이 본문이 보인다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<BibleWrite />, { withAuth: true });
    expect(screen.queryByText("로그인이 필요한 서비스입니다")).not.toBeInTheDocument();
  });
});

describe("BibleWrite — state.book 변환", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
  });

  it("BibleStatusView에서 넘어온 전체 이름(state.book)을 약어로 변환해 정상 표시한다", () => {
    renderWithChurch(<BibleWrite />, {
      withAuth: true,
      initialEntries: [{ pathname: "/말씀/필사", state: { book: "창세기" } }],
    });
    expect(screen.getByRole("button", { name: "창세기" })).toBeInTheDocument();
  });

  it("전체 이름이 약어로 변환된 뒤에는 해당 책의 장·절이 정상 조회된다", () => {
    const { container } = renderWithChurch(<BibleWrite />, {
      withAuth: true,
      initialEntries: [{ pathname: "/말씀/필사", state: { book: "출애굽기" } }],
    });
    expect(screen.getByRole("button", { name: "출애굽기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1장" })).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });
});
