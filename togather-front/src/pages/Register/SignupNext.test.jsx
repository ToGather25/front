import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import churchConfig from "@/config/church.config";
import { renderWithChurch } from "@/test/renderWithChurch";
import SignupNext from "./SignupNext";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

function renderSignupNext(initialEntry) {
  return renderWithChurch(<SignupNext />, { initialEntries: [initialEntry], withAuth: true });
}

async function fillCredentials(user, { username = "hong@example.com" } = {}) {
  await user.type(screen.getByPlaceholderText(/이메일 형식/), username);
  await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "Passw0rd!");
  await user.type(screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"), "Passw0rd!");
}

describe("SignupNext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("URL에 token 파라미터가 없으면 잘못된 접근 화면을 보여준다", () => {
    renderSignupNext("/register/next");
    expect(screen.getByText("잘못된 접근입니다")).toBeInTheDocument();
  });

  it("아이디가 이메일 형식이 아니면 제출 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText(/이메일 형식/), "notanemail");
    await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "Passw0rd!");
    await user.type(screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"), "Passw0rd!");

    expect(screen.getByRole("button", { name: "가입하기" })).toBeDisabled();
  });

  it("비밀번호 규칙을 지키지 않으면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "abc");

    expect(
      screen.getByText("영문·숫자·특수문자 조합 8자 이상이어야 합니다."),
    ).toBeInTheDocument();
  });

  it("비밀번호와 비밀번호 확인이 다르면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"), "Passw0rd!");
    await user.type(screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"), "Different1!");

    expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
  });

  it("이메일형식 아이디로 정상 제출하면 register/complete를 호출하고 완료 모달을 보여준다", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    await waitFor(
      () =>
        expect(
          screen.getByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(api.post).toHaveBeenCalledWith("/auth/register/complete", {
      token: "test-token",
      username: "hong@example.com",
      password: "Passw0rd!",
    });
    // 이 시점엔 아직 로그인 API가 호출되지 않아야 한다 — "시작하기" 클릭 시에만 호출됨
    expect(api.post).not.toHaveBeenCalledWith("/auth/login", expect.anything());
  });

  it("완료 모달의 시작하기를 클릭하면 그때 로그인 API를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "가입하기" }));
    await screen.findByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`, {}, { timeout: 2000 });

    api.post.mockResolvedValue({
      data: { data: { email: "hong@example.com", name: "홍길동" }, token: "t", refreshToken: "r" },
    });
    await user.click(screen.getByRole("button", { name: "시작하기" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "hong@example.com",
        password: "Passw0rd!",
      }),
    );
  });

  it("만료되거나 무효한 토큰(404 SU005)이면 에러 메시지를 보여주고 완료 모달은 뜨지 않는다", async () => {
    api.post.mockRejectedValue({ response: { status: 404, data: { code: "SU005" } } });
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=expired-token&name=홍길동");

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    await waitFor(() =>
      expect(screen.getByText("유효하지 않거나 만료된 링크입니다. 관리팀에 문의해 주세요.")).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`),
    ).not.toBeInTheDocument();
  });
});
