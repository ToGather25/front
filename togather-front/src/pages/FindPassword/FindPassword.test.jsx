import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import FindPassword from "./FindPassword";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

async function verifyIdentity(user) {
  await user.type(screen.getByPlaceholderText("example@email.com"), "member@example.com");
  await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1234-5678");
  await user.click(screen.getByRole("button", { name: "재설정 링크 받기" }));
}

describe("FindPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("본인 확인에 성공하면 새 비밀번호 입력 단계로 넘어간다", async () => {
    api.post.mockResolvedValue({ data: { data: { resetToken: "tok-1", expiresIn: 600 } } });
    const user = userEvent.setup();
    renderWithChurch(<FindPassword />, { withRouter: true });

    await verifyIdentity(user);

    expect(await screen.findByText("새 비밀번호 설정")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith("/auth/find-password/verify", {
      email: "member@example.com",
      phone: "010-1234-5678",
    });
  });

  it("새 비밀번호를 제출하면 재설정 토큰과 함께 보내고 완료 화면을 보여준다", async () => {
    api.post.mockResolvedValue({ data: { data: { resetToken: "tok-1", expiresIn: 600 } } });
    const user = userEvent.setup();
    renderWithChurch(<FindPassword />, { withRouter: true });
    await verifyIdentity(user);
    await screen.findByText("새 비밀번호 설정");

    api.post.mockResolvedValue({ data: { data: null } });
    await user.type(screen.getByLabelText("새 비밀번호"), "newpassword1");
    await user.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
        resetToken: "tok-1",
        newPassword: "newpassword1",
      }),
    );
    expect(await screen.findByText("비밀번호가 변경되었습니다")).toBeInTheDocument();
  });

  it("8자 미만 비밀번호는 서버에 보내지 않고 안내만 한다", async () => {
    api.post.mockResolvedValue({ data: { data: { resetToken: "tok-1", expiresIn: 600 } } });
    const user = userEvent.setup();
    renderWithChurch(<FindPassword />, { withRouter: true });
    await verifyIdentity(user);
    await screen.findByText("새 비밀번호 설정");
    api.post.mockClear();

    await user.type(screen.getByLabelText("새 비밀번호"), "short");
    await user.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    expect(await screen.findByText("비밀번호는 8자 이상 입력해 주세요.")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("재설정 토큰이 만료되면(404) 본인 확인 단계로 되돌린다", async () => {
    api.post.mockResolvedValue({ data: { data: { resetToken: "tok-1", expiresIn: 600 } } });
    const user = userEvent.setup();
    renderWithChurch(<FindPassword />, { withRouter: true });
    await verifyIdentity(user);
    await screen.findByText("새 비밀번호 설정");

    api.post.mockRejectedValue({ response: { status: 404, data: { code: "AR002" } } });
    await user.type(screen.getByLabelText("새 비밀번호"), "newpassword1");
    await user.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    expect(
      await screen.findByText("재설정 시간이 만료되었습니다. 본인 확인부터 다시 진행해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "재설정 링크 받기" })).toBeInTheDocument();
  });

  it("계정 정보가 일치하지 않으면(404) 확인 안내를 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 404, data: { code: "AR001" } } });
    const user = userEvent.setup();
    renderWithChurch(<FindPassword />, { withRouter: true });

    await verifyIdentity(user);

    expect(
      await screen.findByText(
        "계정 정보를 확인할 수 없습니다. 이메일과 휴대폰 번호를 확인해 주세요.",
      ),
    ).toBeInTheDocument();
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    api.post.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderWithChurch(<FindPassword />, { withRouter: true });

    await verifyIdentity(user);

    expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
  });
});
