import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import InfoTab from "./InfoTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("InfoTab — 회원탈퇴", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
  });

  it("탈퇴를 확정하면 withdrawAccount를 호출하고 로그아웃한다", async () => {
    api.delete.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<InfoTab userForm={{}} setUserForm={() => {}} onNavigateDept={() => {}} />, {
      withAuth: true,
    });

    await user.click(screen.getByRole("button", { name: "회원 탈퇴" }));
    await user.click(screen.getByRole("button", { name: "탈퇴 신청" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/my/account"));
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(localStorage.getItem("user")).toBeNull();
  });

  it("탈퇴 API가 실패하면 에러 메시지를 보여주고 로그아웃하지 않는다", async () => {
    api.delete.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<InfoTab userForm={{}} setUserForm={() => {}} onNavigateDept={() => {}} />, {
      withAuth: true,
    });

    await user.click(screen.getByRole("button", { name: "회원 탈퇴" }));
    await user.click(screen.getByRole("button", { name: "탈퇴 신청" }));

    expect(
      await screen.findByText("탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(localStorage.getItem("user")).not.toBeNull();
  });
});
