vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen } from "@testing-library/react";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WorshipSection from "./WorshipSection";

function mockLiveScreen(data) {
  api.get.mockResolvedValue({ data: { data } });
}

describe("WorshipSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("LIVE 상태면 LIVE 배지와 실시간 설교 제목을 보여준다", async () => {
    mockLiveScreen({
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc12345678",
      sermon: {
        id: "s1",
        title: "부활의 능력",
      },
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WorshipSection />, { withRouter: true });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });

  it("NONE 상태면 LIVE 배지 없이 기본 제목으로 대체된다", async () => {
    mockLiveScreen({
      state: "NONE",
      youtubeLiveUrl: null,
      sermon: null,
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WorshipSection />, { withRouter: true });

    await screen.findByText(/사랑으로 부르신/);
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
  });
});
