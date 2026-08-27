import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import MobileHome from "./MobileHome";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

vi.mock("@/contexts/SearchContext", () => ({
  useSearch: () => ({ setOpen: vi.fn() }),
}));

import api from "@/services/api";

describe("MobileHome — 모바일 홈", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("공지 알림 섹션에서 쓸 수 있도록 넉넉한 limit으로 공지를 조회한다", async () => {
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
            author: "사무실",
          },
        ],
      },
    });
    renderWithChurch(<MobileHome />, { withRouter: true });

    expect(await screen.findByText("공지 알림")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 10 },
    });
  });
});
