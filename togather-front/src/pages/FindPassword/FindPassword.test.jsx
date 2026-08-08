import { describe, it, expect } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import FindPassword from "./FindPassword";

function renderFindPassword() {
  return render(
    <MemoryRouter>
      <ChurchProvider>
        <FindPassword />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("FindPassword", () => {
  it("이메일·휴대폰 번호를 제출하면 발송완료 화면으로 전환되고 입력한 이메일을 보여준다", async () => {
    const user = userEvent.setup();
    renderFindPassword();

    await user.type(screen.getByPlaceholderText("example@email.com"), "member@example.com");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    await user.click(screen.getByRole("button", { name: "재설정 링크 받기" }));

    await waitFor(
      () => expect(screen.getByText("재설정 링크를 보냈습니다")).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(screen.getByText(/member@example\.com/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderFindPassword();

    await user.type(screen.getByPlaceholderText("example@email.com"), "member@example.com");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
    await user.click(screen.getByRole("button", { name: "재설정 링크 받기" }));

    expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
  });
});
