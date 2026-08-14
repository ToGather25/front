import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import NoticeSection from "./NoticeSection";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("NoticeSection — 홈 위젯", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("탭 필터링에 쓸 수 있도록 넉넉한 limit으로 공지를 조회한다", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            type: "공지",
            featured: false,
            title: "테스트 공지",
            body: "내용",
            date: "2026-08-01",
            author: "사무국",
          },
        ],
      },
    });
    renderWithChurch(<NoticeSection />, { withRouter: true });

    expect(await screen.findByText("테스트 공지")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 30 },
    });
  });
});
