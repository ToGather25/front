import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import PrayerTopics from "./PrayerTopics";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const PRAYER_TOPICS = [
  { title: "다음 세대를 위한 기도", subtitle: "주일학교 교사 헌신자", category: "사역" },
  { title: "투병 중인 성도를 위한 기도", subtitle: "OOO 권사님", category: "병중" },
];

describe("PrayerTopics — 기도제목", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 기도제목 항목과 카테고리 이모지를 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: PRAYER_TOPICS } });
    renderWithChurch(<PrayerTopics />);

    for (const { title, subtitle } of PRAYER_TOPICS) {
      expect(await screen.findByText(title)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    }
    expect(screen.getByText("🙏")).toBeInTheDocument();
  });

  it("기도제목이 없으면 빈 상태 문구를 표시한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    renderWithChurch(<PrayerTopics />);

    expect(await screen.findByText("이번 주 기도제목을 준비 중입니다")).toBeInTheDocument();
  });
});
