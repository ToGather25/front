import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import NurtureProgramsEditor from "./NurtureProgramsEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  nurturePrograms: [
    { title: "새가족반", level: "기초", duration: "4주", schedule: "매월 첫째 주 토요일", desc: "신앙 입문 과정" },
  ],
};

describe("NurtureProgramsEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 프로그램 값을 입력창에 채운다", () => {
    renderWithChurch(<NurtureProgramsEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("새가족반")).toBeInTheDocument();
    expect(screen.getByDisplayValue("기초")).toBeInTheDocument();
  });

  it("저장하면 PUT /church/admin/intro/NURTURE_PROGRAMS를 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<NurtureProgramsEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/intro/NURTURE_PROGRAMS", [
        { title: "새가족반", level: "기초", duration: "4주", schedule: "매월 첫째 주 토요일", desc: "신앙 입문 과정" },
      ]),
    );
  });
});
