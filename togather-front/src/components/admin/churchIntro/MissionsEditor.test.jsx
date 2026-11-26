import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MissionsEditor from "./MissionsEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  missions: {
    국내: {
      title: "국내 선교",
      description: "국내 선교 소개",
      items: [{ name: "농어촌 교회 지원", schedule: "분기별", location: "전국" }],
    },
    해외: {
      title: "해외 선교",
      description: "해외 선교 소개",
      items: [{ name: "동남아시아 선교", schedule: "연 2회", location: "태국" }],
    },
  },
};

describe("MissionsEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("국내/해외 값을 입력창에 채운다", () => {
    renderWithChurch(<MissionsEditor />, { church: CHURCH });
    expect(screen.getByLabelText("국내 선교 제목")).toHaveValue("국내 선교");
    expect(screen.getByLabelText("해외 선교 제목")).toHaveValue("해외 선교");
    expect(screen.getByDisplayValue("농어촌 교회 지원")).toBeInTheDocument();
    expect(screen.getByDisplayValue("동남아시아 선교")).toBeInTheDocument();
  });

  it("저장하면 PUT /church/admin/intro/MISSIONS를 국내/해외 구조로 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<MissionsEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/MISSIONS",
        expect.objectContaining({
          국내: expect.objectContaining({
            title: "국내 선교",
            items: [{ name: "농어촌 교회 지원", schedule: "분기별", location: "전국" }],
          }),
          해외: expect.objectContaining({
            title: "해외 선교",
            items: [{ name: "동남아시아 선교", schedule: "연 2회", location: "태국" }],
          }),
        }),
      ),
    );
  });
});
