import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import VisionEditor from "./VisionEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  vision: {
    mainTitle: "환영합니다",
    mainVerse: "핵심 비전 설명",
    items: [{ title: "말씀 공동체", desc: "말씀으로 세워지는 교회", detailedDescription: [] }],
  },
};

describe("VisionEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 비전 값을 입력창에 채운다", () => {
    renderWithChurch(<VisionEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("환영합니다")).toBeInTheDocument();
    expect(screen.getByDisplayValue("말씀 공동체")).toBeInTheDocument();
  });

  it("저장하면 PUT /church/admin/intro/VISION을 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<VisionEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/VISION",
        expect.objectContaining({
          mainTitle: "환영합니다",
          items: [expect.objectContaining({ title: "말씀 공동체" })],
        }),
      ),
    );
  });
});
