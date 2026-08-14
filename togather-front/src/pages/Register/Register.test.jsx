import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Register from "./Register";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

function renderRegister() {
  return renderWithChurch(<Register />, { withRouter: true, withAuth: true });
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
    vi.clearAllMocks();
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

  it("필수 정보를 입력하고 동의하면 제출 버튼이 활성화되고, 제출 성공 시 완료 화면으로 전환된다", async () => {
    api.post.mockResolvedValue({ data: { data: { requestId: 1, status: "PENDING" }, token: null } });
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
    expect(api.post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        name: "김철수",
        birthdate: "1995-05-10",
        phone: "010-1111-2222",
        isNewcomer: true,
        agreePrivacy: true,
      }),
    );
  });

  it("이미 승인 처리 중인 정보로 제출하면(409 SU001) 중복 신청 모달을 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 409, data: { code: "SU001" } } });
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container, { name: "이영희", phone: "010-9999-8888" });
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    await waitFor(
      () => expect(screen.getByText("신청을 확인해 주세요")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("네트워크 오류 등 SU001이 아닌 실패는 화면에 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 500, data: { code: "UNKNOWN" } } });
    const user = userEvent.setup();
    const { container } = renderRegister();

    await fillBasicFields(user, container);
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    await waitFor(() =>
      expect(
        screen.getByText("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
      ).toBeInTheDocument(),
    );
    // 중복 모달은 뜨지 않아야 한다 — SU001 전용
    expect(screen.queryByText("신청을 확인해 주세요")).not.toBeInTheDocument();
  });

  it("중복 신청 모달에서 연락처를 클릭하면 클립보드에 복사되고 문구가 바뀐다", async () => {
    api.post.mockRejectedValue({ response: { status: 409, data: { code: "SU001" } } });
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const { container } = renderRegister();

    await fillBasicFields(user, container, { name: "박민수", phone: "010-5555-4444" });
    await user.click(screen.getByRole("button", { name: "가입 신청하기" }));

    const contactButton = await screen.findByRole("button", { name: "02-2615-4067" }, { timeout: 2000 });
    await user.click(contactButton);

    expect(writeText).toHaveBeenCalledWith("02-2615-4067");
    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
  });
});
