import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import FindId from "./FindId";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

async function fillForm(user) {
  await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
  await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
  await user.click(screen.getByRole("button", { name: "아이디 찾기" }));
}

describe("FindId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("이름·휴대폰 번호를 제출하면 POST /auth/find-id 결과를 마스킹해 보여준다", async () => {
    api.post.mockResolvedValue({
      data: { data: { loginId: "test1234", email: "test@example.com" } },
    });
    const user = userEvent.setup();
    renderWithChurch(<FindId />, { withRouter: true });

    await fillForm(user);

    await waitFor(() => expect(screen.getByText("test****")).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(api.post).toHaveBeenCalledWith("/auth/find-id", {
      name: "홍길동",
      phone: "010-1234-5678",
    });
    expect(screen.getByText("아이디를 찾았습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("일치하는 계정이 없으면(404) 확인 안내를 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 404, data: { code: "AR001" } } });
    const user = userEvent.setup();
    renderWithChurch(<FindId />, { withRouter: true });

    await fillForm(user);

    expect(
      await screen.findByText(
        "일치하는 계정을 찾을 수 없습니다. 이름과 휴대폰 번호를 확인해 주세요.",
      ),
    ).toBeInTheDocument();
  });

  it("서버 오류(500)는 계정 없음과 다른 문구로 안내한다", async () => {
    api.post.mockRejectedValue({ response: { status: 500 } });
    const user = userEvent.setup();
    renderWithChurch(<FindId />, { withRouter: true });

    await fillForm(user);

    expect(
      await screen.findByText("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    api.post.mockReturnValue(new Promise(() => {})); // 응답 대기 상태 유지
    const user = userEvent.setup();
    renderWithChurch(<FindId />, { withRouter: true });

    await fillForm(user);

    expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
  });
});
