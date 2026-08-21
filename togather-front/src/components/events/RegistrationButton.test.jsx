import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import RegistrationButton from "./RegistrationButton";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const OPEN_EVENT = { id: "e1", date: "2999-01-01", canRegister: true };
const CLOSED_EVENT = { id: "e2", date: "2000-01-01", canRegister: true };
const NO_REGISTER_EVENT = { id: "e3", date: "2999-01-01", canRegister: false };

describe("RegistrationButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("canRegister가 false인 행사는 아무것도 렌더링하지 않는다", () => {
    renderWithChurch(<RegistrationButton event={NO_REGISTER_EVENT} />, { withAuth: true });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("행사일이 지났으면 비활성화된 '신청 마감' 버튼을 보여준다", () => {
    renderWithChurch(<RegistrationButton event={CLOSED_EVENT} />, { withAuth: true });
    expect(screen.getByRole("button", { name: "신청 마감" })).toBeDisabled();
  });

  it("로그인하지 않은 상태에서 클릭하면 로그인 안내 모달이 뜨고 API는 호출되지 않는다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));

    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("로그인한 상태에서 클릭하면 신청 API를 호출하고 버튼이 신청완료로 바뀐다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockResolvedValue({ data: { registered: true } });
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/^\/churches\/.+\/events\/e1\/register$/),
      ),
    );
    expect(await screen.findByRole("button", { name: "신청완료" })).toBeDisabled();
  });

  it("이미 로컬에 신청 기록이 있으면 처음부터 신청완료로 렌더링된다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    localStorage.setItem("event_registered_togather-church_e1_hong@example.com", "true");
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    expect(screen.getByRole("button", { name: "신청완료" })).toBeDisabled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("신청 API가 실패하면 에러 메시지를 보여준다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));

    expect(
      await screen.findByText("신청에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
