import { describe, it, expect } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import churchConfig from "@/config/church.config";
import SignupNext from "./SignupNext";

function renderSignupNext(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ChurchProvider>
        <SignupNext />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("SignupNext", () => {
  it("URL에 token 파라미터가 없으면 잘못된 접근 화면을 보여준다", () => {
    renderSignupNext("/register/next");
    expect(screen.getByText("잘못된 접근입니다")).toBeInTheDocument();
  });

  it("아이디 중복확인을 하지 않으면 제출 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("4자 이상 영문/숫자"), "myusername");
    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "Passw0rd!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"),
      "Passw0rd!",
    );

    expect(screen.getByRole("button", { name: "가입하기" })).toBeDisabled();
  });

  it("비밀번호 규칙을 지키지 않으면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "abc",
    );

    expect(
      screen.getByText("영문·숫자·특수문자 조합 8자 이상이어야 합니다."),
    ).toBeInTheDocument();
  });

  it("비밀번호와 비밀번호 확인이 다르면 에러 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "Passw0rd!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"),
      "Different1!",
    );

    expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
  });

  it("아이디 중복확인 후 정상 제출하면 명세서 문구의 완료 모달을 보여준다", async () => {
    const user = userEvent.setup();
    renderSignupNext("/register/next?token=test-token&name=홍길동");

    await user.type(screen.getByPlaceholderText("4자 이상 영문/숫자"), "myusername");
    await user.click(screen.getByRole("button", { name: "중복 확인" }));
    await waitFor(() => expect(screen.getByText("사용 가능")).toBeInTheDocument(), {
      timeout: 1000,
    });

    await user.type(
      screen.getByPlaceholderText("영문·숫자·특수문자 조합 8자 이상"),
      "Passw0rd!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 한 번 더 입력하세요"),
      "Passw0rd!",
    );
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    await waitFor(
      () =>
        expect(
          screen.getByText(`${churchConfig.name}의 일원이 된 것을 축하합니다!`),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });
});
