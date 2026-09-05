import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import MainBanner from "./MainBanner";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("MainBanner — 홈 히어로 배너", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("representativeImageUrl이 있으면 배경 이미지로 사용한다", async () => {
    api.get.mockResolvedValue({
      data: { data: { representativeImageUrl: "https://example.com/hero.jpg", slogan: null } },
    });
    const { container } = renderWithChurch(<MainBanner />, { withRouter: true });

    await waitFor(() =>
      expect(container.querySelector("img").getAttribute("src")).toBe(
        "https://example.com/hero.jpg",
      ),
    );
  });

  it("representativeImageUrl이 없으면 기본 배너 이미지를 유지한다", async () => {
    api.get.mockResolvedValue({ data: { data: { representativeImageUrl: null, slogan: null } } });
    const { container } = renderWithChurch(<MainBanner />, { withRouter: true });

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/church/profile"));
    expect(container.querySelector("img").getAttribute("src")).not.toBe(
      "https://example.com/hero.jpg",
    );
  });

  it("성경구절 텍스트는 API와 무관하게 정적 문구를 그대로 보여준다", async () => {
    api.get.mockResolvedValue({ data: { data: { representativeImageUrl: null, slogan: null } } });
    renderWithChurch(<MainBanner />, { withRouter: true });

    expect(
      screen.getByText((_, el) => el?.textContent === "하나님의 사랑이 우리에게\n이렇게 나타난 바 되었으니"),
    ).toBeInTheDocument();
  });
});
