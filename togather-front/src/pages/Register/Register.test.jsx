import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import defaultConfig from "@/config/church.config";
import Register from "./Register";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

// 모바일 전용 다단계 폼(MobileRegister)도 같은 화면에 함께 렌더되므로(반응형 CSS로만
// 보임/숨김 처리 — Home/MobileHome과 동일한 패턴), placeholder·role이 양쪽에 똑같이
// 존재한다. 데스크톱 트리로 쿼리를 한정해야 "여러 개 발견됨" 에러가 나지 않는다.
function renderRegister() {
  const utils = renderWithChurch(<Register />, { withRouter: true, withAuth: true });
  const desktopEl = utils.container.querySelector('[data-testid="desktop-register"]');
  const desktop = within(desktopEl);
  return { ...utils, desktop, desktopEl };
}

function desktopModal(container) {
  return within(container.querySelector('[data-testid="desktop-duplicate-modal"]'));
}

async function fillBasicFields(user, desktopEl, { name = "김철수", phone = "010-1111-2222" } = {}) {
  const desktop = within(desktopEl);
  await user.type(desktop.getByPlaceholderText("이름을 입력하세요"), name);
  await user.selectOptions(desktopEl.querySelector('select[name="birthYear"]'), "1995");
  await user.selectOptions(desktopEl.querySelector('select[name="birthMonth"]'), "5");
  await user.selectOptions(desktopEl.querySelector('select[name="birthDay"]'), "10");
  await user.type(desktop.getByPlaceholderText("010-0000-0000"), phone);
  await user.click(desktop.getByLabelText("새신자입니다"));
  await user.click(desktop.getByLabelText(/개인정보 수집.*동의합니다/));
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
    const { desktop } = renderRegister();
    expect(desktop.getByRole("button", { name: "가입 신청하기" })).toBeDisabled();
  });

  it("필수 정보를 입력하고 동의하면 제출 버튼이 활성화되고, 제출 성공 시 완료 화면으로 전환된다", async () => {
    api.post.mockResolvedValue({ data: { data: { requestId: 1, status: "PENDING" }, token: null } });
    const user = userEvent.setup();
    const { desktop, desktopEl } = renderRegister();

    await fillBasicFields(user, desktopEl);
    const submitBtn = desktop.getByRole("button", { name: "가입 신청하기" });
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
    const { desktop, desktopEl, container } = renderRegister();

    await fillBasicFields(user, desktopEl, { name: "이영희", phone: "010-9999-8888" });
    await user.click(desktop.getByRole("button", { name: "가입 신청하기" }));

    // 모바일 쪽은 같은 문구를 모달이 아닌 전체 화면으로 보여주므로(둘 다 항상 DOM에
    // 존재) 데스크톱 모달로 한정해서 확인한다.
    await waitFor(
      () => expect(desktopModal(container).getByText("신청을 확인해 주세요")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("모바일에서는 중복 안내가 팝업이 아니라 전체 화면으로 보이고, 데스크톱 모달은 숨겨진다", async () => {
    api.post.mockRejectedValue({ response: { status: 409, data: { code: "SU001" } } });
    const user = userEvent.setup();
    const { desktop, desktopEl, container } = renderRegister();

    await fillBasicFields(user, desktopEl, { name: "최지우", phone: "010-7777-6666" });
    await user.click(desktop.getByRole("button", { name: "가입 신청하기" }));

    const mobileScreen = await waitFor(() =>
      container.querySelector('[data-testid="mobile-duplicate-screen"]'),
    );
    expect(mobileScreen).toBeTruthy();
    expect(within(mobileScreen).getByText("신청을 확인해 주세요")).toBeInTheDocument();
    // 모바일 쪽은 바텀시트/오버레이가 아니라 그냥 화면(해당 div 자체에 hidden이 없다) —
    // 부모의 md:hidden에 의해서만 큰 화면에서 숨겨진다.
    expect(mobileScreen.className).not.toMatch(/\bhidden\b/);

    // 데스크톱 모달은 모바일에서 숨겨져 있어야 한다(hidden md:flex)
    const desktopModalEl = container.querySelector('[data-testid="desktop-duplicate-modal"]');
    expect(desktopModalEl.className).toMatch(/\bhidden\b/);
  });

  it("네트워크 오류 등 SU001이 아닌 실패는 화면에 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValue({ response: { status: 500, data: { code: "UNKNOWN" } } });
    const user = userEvent.setup();
    const { desktop, desktopEl } = renderRegister();

    await fillBasicFields(user, desktopEl);
    await user.click(desktop.getByRole("button", { name: "가입 신청하기" }));

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
    const { desktop, desktopEl, container } = renderRegister();

    await fillBasicFields(user, desktopEl, { name: "박민수", phone: "010-5555-4444" });
    await user.click(desktop.getByRole("button", { name: "가입 신청하기" }));

    // 연락처는 교회 설정(church.tel)에서 온다 — 하드코딩 값과 어긋나지 않게 config를 기준으로 본다.
    // 모바일 전체 화면에도 같은 버튼이 있으므로 데스크톱 모달로 한정해서 찾는다.
    const contactButton = await waitFor(
      () => desktopModal(container).getByRole("button", { name: defaultConfig.tel }),
      { timeout: 2000 },
    );
    await user.click(contactButton);

    expect(writeText).toHaveBeenCalledWith(defaultConfig.tel);
    expect(await desktopModal(container).findByText("복사되었습니다")).toBeInTheDocument();
  });
});
