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
