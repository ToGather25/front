import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import RegistrationButton from "./RegistrationButton";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
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

  it("로그인한 상태에서 클릭 후 모달에서 확인하면 신청 API를 호출하고 버튼이 신청완료로 바뀐다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockResolvedValue({ data: { registered: true } });
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    const [, confirmButton] = screen.getAllByRole("button", { name: "신청하기" });
    await user.click(confirmButton);

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/^\/churches\/.+\/events\/e1\/register$/),
      ),
    );
    expect(await screen.findByRole("button", { name: "신청완료" })).toBeDisabled();
  });

  it("신청 확인 모달에서 취소를 누르면 API를 호출하지 않는다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(api.post).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "신청하기" })).toBeInTheDocument();
    expect(screen.queryByText("위 정보로 신청하시겠습니까?")).not.toBeInTheDocument();
  });

  it("서버가 내려준 isRegistered가 true면 처음부터 신청완료로 렌더링된다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    renderWithChurch(<RegistrationButton event={{ ...OPEN_EVENT, isRegistered: true }} />, {
      withAuth: true,
    });

    expect(screen.getByRole("button", { name: "신청완료" })).toBeDisabled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("신청 API가 실패하면 에러 메시지를 보여준다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    const [, confirmButton] = screen.getAllByRole("button", { name: "신청하기" });
    await user.click(confirmButton);

    expect(
      await screen.findByText("신청에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("size='sm'일 때도 신청 API가 실패하면 에러 메시지를 보여준다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} size="sm" />, { withAuth: true });

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    const [, confirmButton] = screen.getAllByRole("button", { name: "신청하기" });
    await user.click(confirmButton);

    expect(
      await screen.findByText("신청에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("정원 마감(EV005)이면 전용 안내를 보여주고 onRegistered로 최신 상태를 재조회한다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockRejectedValue({ response: { data: { code: "EV005" } } });
    const onRegistered = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} onRegistered={onRegistered} />, {
      withAuth: true,
    });

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    const [, confirmButton] = screen.getAllByRole("button", { name: "신청하기" });
    await user.click(confirmButton);

    expect(await screen.findByText("신청 정원이 모두 찼습니다.")).toBeInTheDocument();
    expect(onRegistered).toHaveBeenCalled();
    // 정원 마감은 내가 들고 있던 event가 낡은 정보였다는 뜻 — 확인 모달은 닫혀야 한다.
    expect(screen.queryByText("위 정보로 신청하시겠습니까?")).not.toBeInTheDocument();
  });

  it("신청에 성공하면 onRegistered로 최신 상태를 재조회한다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    api.post.mockResolvedValue({ data: { registered: true } });
    const onRegistered = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<RegistrationButton event={OPEN_EVENT} onRegistered={onRegistered} />, {
      withAuth: true,
    });

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    const [, confirmButton] = screen.getAllByRole("button", { name: "신청하기" });
    await user.click(confirmButton);

    expect(await screen.findByRole("button", { name: "신청완료" })).toBeDisabled();
    expect(onRegistered).toHaveBeenCalled();
  });
});
