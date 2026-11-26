import { useState } from "react";
import { describe, it, expect, vi } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MobileRegister from "./MobileRegister";

// MobileRegister는 폼 상태/제출 로직을 부모(Register.jsx)에서 내려받는 순수 표시용
// 컴포넌트다 — 실제 부모와 동일한 방식으로 상태를 들고 있는 얇은 래퍼로 감싸서 테스트한다.
function Harness({ onSubmit = vi.fn(), status = "idle", submitError = "" }) {
  const [form, setForm] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    phone: "",
    isNewcomer: false,
    agreePrivacy: false,
  });
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  return (
    <MobileRegister
      form={form}
      status={status}
      submitError={submitError}
      onChange={onChange}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    />
  );
}

function renderMobileRegister(props) {
  return renderWithChurch(<Harness {...props} />, { withRouter: true });
}

function setBirthDate(container, isoDate) {
  fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: isoDate } });
}

describe("MobileRegister — 질문이 아래로 쌓이는 모바일 회원가입", () => {
  it("이름을 입력해야 다음 질문이 나타난다", async () => {
    const user = userEvent.setup();
    renderMobileRegister();

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    expect(screen.queryByText("생년월일")).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("생년월일")).toBeInTheDocument();
  });

  it("생년월일은 네이티브 날짜 입력(휠 피커)으로 받는다", async () => {
    const user = userEvent.setup();
    const { container } = renderMobileRegister();

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    await user.click(screen.getByRole("button", { name: "다음" }));

    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).toBeTruthy();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    setBirthDate(container, "1995-05-10");
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  it("이름 → 생년월일 → 휴대폰 순으로 질문이 쌓이고, 이전에 답한 내용은 화면에 그대로 남는다", async () => {
    const user = userEvent.setup();
    const { container } = renderMobileRegister();

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    await user.click(screen.getByRole("button", { name: "다음" }));

    setBirthDate(container, "1995-05-10");
    await user.click(screen.getByRole("button", { name: "다음" }));

    // 휴대폰 질문이 쌓였지만, 이름과 생년월일 답변은 화면에서 사라지지 않아야 한다
    expect(screen.getByPlaceholderText("010-0000-0000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("김철수")).toBeInTheDocument();
    expect(container.querySelector('input[type="date"]').value).toBe("1995-05-10");
  });

  it("약관 동의는 쌓이지 않고 완전히 새로운 화면으로 전환되며, 뒤로가기로 돌아오면 이전 입력이 남아있다", async () => {
    const user = userEvent.setup();
    const { container } = renderMobileRegister();

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    await user.click(screen.getByRole("button", { name: "다음" }));
    setBirthDate(container, "1995-05-10");
    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1111-2222");
    await user.click(screen.getByRole("button", { name: "다음" }));

    // 이전 질문들은 더 이상 화면에 남아있지 않아야 한다(쌓이지 않고 전환됨)
    expect(screen.getByText("약관 전체동의")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("이름을 입력하세요")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("010-0000-0000")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "이전" }));

    // 뒤로가기로 쌓인 화면에 돌아오면 이전 입력값이 그대로 남아있어야 한다
    expect(screen.getByDisplayValue("김철수")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("010-0000-0000")).toHaveValue("010-1111-2222");
  });

  it("약관 항목을 모두 체크해야 가입 신청하기가 활성화되고, 필수 항목만으로 제출된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = renderMobileRegister({ onSubmit });

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    await user.click(screen.getByRole("button", { name: "다음" }));
    setBirthDate(container, "1995-05-10");
    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1111-2222");
    await user.click(screen.getByRole("button", { name: "다음" }));

    const submitBtn = screen.getByRole("button", { name: "가입 신청하기" });
    expect(submitBtn).toBeDisabled();

    // 필수 항목만 체크 — 선택(마케팅)은 체크하지 않아도 제출 가능해야 한다
    await user.click(screen.getByLabelText("(필수) 만14세 이상"));
    await user.click(screen.getByLabelText("(필수) 서비스 이용약관"));
    await user.click(screen.getByLabelText("(필수) 위치기반 서비스 이용약관"));
    await user.click(screen.getByLabelText("(필수) 개인정보 수집 및 이용"));
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "김철수",
        birthYear: "1995",
        birthMonth: "5",
        birthDay: "10",
        phone: "010-1111-2222",
        agreePrivacy: true,
      }),
    );
  });

  it("약관 전체동의를 누르면 필수·선택 항목이 한 번에 체크/해제된다", async () => {
    const user = userEvent.setup();
    const { container } = renderMobileRegister();

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    await user.click(screen.getByRole("button", { name: "다음" }));
    setBirthDate(container, "1995-05-10");
    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1111-2222");
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.click(screen.getByRole("button", { name: "약관 전체동의" }));
    expect(screen.getByLabelText("[선택] 마케팅 및 광고 활용")).toBeChecked();
    expect(screen.getByRole("button", { name: "가입 신청하기" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "약관 전체동의" }));
    expect(screen.getByLabelText("[선택] 마케팅 및 광고 활용")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "가입 신청하기" })).toBeDisabled();
  });

  it("제출 실패 에러 메시지를 마지막 단계에 보여준다", async () => {
    const user = userEvent.setup();
    const { container } = renderMobileRegister({
      submitError: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });

    await user.type(screen.getByPlaceholderText("이름을 입력하세요"), "김철수");
    await user.click(screen.getByRole("button", { name: "다음" }));
    setBirthDate(container, "1995-05-10");
    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.type(screen.getByPlaceholderText("010-0000-0000"), "010-1111-2222");
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(
      screen.getByText("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
