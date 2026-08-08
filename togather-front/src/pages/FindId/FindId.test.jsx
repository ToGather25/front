import { describe, it, expect } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import FindId from "./FindId";

describe("FindId", () => {
  it("이름·휴대폰 번호를 입력하고 제출하면 마스킹된 아이디를 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<FindId />, { withRouter: true });

    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    await user.click(screen.getByRole("button", { name: "아이디 찾기" }));

    await waitFor(() => expect(screen.getByText("test****")).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(screen.getByText("아이디를 찾았습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<FindId />, { withRouter: true });

    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    const submitBtn = screen.getByRole("button", { name: "아이디 찾기" });
    await user.click(submitBtn);

    expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
  });
});
