import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { renderWithChurch } from "@/test/renderWithChurch";
import LoginPage from "./Login";

function renderLogin() {
  return renderWithChurch(<LoginPage />, { withAuth: true });
}

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("올바른 테스트 계정으로 로그인하면 에러가 뜨지 않는다", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText("example@email.com"), "test@togather.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "test1234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("user") ?? "null");
      expect(stored?.email).toBe("test@togather.com");
    });

    expect(
      screen.queryByText("이메일 또는 비밀번호가 일치하지 않습니다."),
    ).not.toBeInTheDocument();
  });

  it("잘못된 자격증명으로 로그인하면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, "post").mockRejectedValueOnce(new Error("network error"));
    renderLogin();

    await user.type(screen.getByPlaceholderText("example@email.com"), "wrong@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() =>
      expect(screen.getByText("이메일 또는 비밀번호가 일치하지 않습니다.")).toBeInTheDocument(),
    );
  });

  it("아이디 찾기·비밀번호 찾기 링크가 올바른 경로를 가리킨다", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: "아이디 찾기" })).toHaveAttribute("href", "/find-id");
    expect(screen.getByRole("link", { name: "비밀번호 찾기" })).toHaveAttribute(
      "href",
      "/find-password",
    );
  });
});
