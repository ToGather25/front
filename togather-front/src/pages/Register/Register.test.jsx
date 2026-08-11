import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Register from "./Register";

function renderRegister() {
  return renderWithChurch(<Register />, { withRouter: true });
}

async function fillBasicFields(user, container, { name = "김철수", phone = "010-1111-2222" } = {}) {
  await user.type(screen.getByPlaceholderText("홍길동"), name);
  await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1995");
  await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "5");
  await user.selectOptions(container.querySelector('select[name="birthDay"]'), "10");
  await user.type(screen.getByPlaceholderText("010-0000-0000"), phone);
  await user.click(screen.getByLabelText("새신자입니다"));
  await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
}

describe("Register", () => {
  beforeEach(() => {
    // jsdom의 navigator.clipboard는 getter만 있는 접근자 프로퍼티라 Object.assign으로는 덮어쓸 수 없어
    // configurable: true인 값 프로퍼티로 재정의한다. (참고: userEvent.setup()을 호출하면
    // 내부적으로 자체 Clipboard 스텁을 다시 덮어씌우므로, 클립보드 동작을 검증하는 테스트는
    // setup() 이후 시점에 이 mock을 다시 재설치해야 한다 — 아래 마지막 테스트 참고)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("개인정보 동의 전에는 제출 버튼이 비활성화된다", () => {
    renderRegister();
    expect(screen.getByRole("button", { name: "가입 신청하기" })).toBeDisabled();
  });

  it("필수 정보를 입력하고 동의하면 제출 버튼이 활성화되고, 제출 시 완료 화면으로 전환된다", async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container);
    const submitBtn = screen.getByRole("button", { name: "가입 신청하기" });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    await waitFor(
      () => expect(screen.getByText("가입 신청이 완료되었습니다")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("승인 대기 중인 정보로 제출하면 중복 신청 모달을 보여준다", async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    // Register.jsx의 PENDING_TEST_MEMBER 목업과 정확히 일치하는 값
    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1999");
    await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "1");
    await user.selectOptions(container.querySelector('select[name="birthDay"]'), "1");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-9999-8888");
    await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    await waitFor(
      () => expect(screen.getByText("신청을 확인해 주세요")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("중복 신청 모달에서 연락처를 클릭하면 클립보드에 복사되고 문구가 바뀐다", async () => {
    const user = userEvent.setup();
    // userEvent.setup()이 자체 Clipboard 스텁을 navigator.clipboard에 다시 덮어씌우므로
    // (내부적으로 attachClipboardStubToView 호출), setup() 이후 시점에 우리 mock을 재설치한다.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const { container } = renderRegister();

    await user.type(screen.getByPlaceholderText("홍길동"), "홍길동");
    await user.selectOptions(container.querySelector('select[name="birthYear"]'), "1999");
    await user.selectOptions(container.querySelector('select[name="birthMonth"]'), "1");
    await user.selectOptions(container.querySelector('select[name="birthDay"]'), "1");
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-9999-8888");
    await user.click(screen.getByLabelText(/개인정보 수집.*동의합니다/));
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    const contactButton = await screen.findByRole("button", { name: "02-2615-4067" }, { timeout: 2000 });
    await user.click(contactButton);

    expect(writeText).toHaveBeenCalledWith("02-2615-4067");
    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
  });
});
