import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import StaffEditor from "./StaffEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  staff: {
    filterTags: ["#담임목사"],
    headPastor: { name: "임재호 목사", tel: "02-1234-5678", email: "", role: "", image: null, education: [], career: [] },
    clergy: [],
    elders: [],
    associateElders: [],
    retiredElders: [],
    missionaries: [{ name: "오범석 선교사", location: "태국", tel: "", email: "", image: null }],
  },
};

describe("StaffEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("담임목사·파송선교사 값을 입력창에 채운다", () => {
    renderWithChurch(<StaffEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("임재호 목사")).toBeInTheDocument();
    expect(screen.getByDisplayValue("오범석 선교사")).toBeInTheDocument();
  });

  it("저장하면 빈 행은 제외하고 PUT /church/admin/intro/STAFF를 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<StaffEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/STAFF",
        expect.objectContaining({
          headPastor: expect.objectContaining({ name: "임재호 목사" }),
          clergy: [],
          missionaries: [expect.objectContaining({ name: "오범석 선교사" })],
        }),
      ),
    );
  });
});
