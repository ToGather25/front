import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import News from "./News";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const NEWS = [
  { title: "정기모임", items: ["금요기도회", "새벽기도회"] },
  { title: "공지사항", items: ["교회 야유회 신청 마감"] },
];

describe("News — 소식", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: NEWS } });
  });

  it("모든 소식 섹션 제목을 렌더한다", async () => {
    renderWithChurch(<News />);
    for (const section of NEWS) {
      expect(await screen.findByText(new RegExp(section.title))).toBeInTheDocument();
    }
  });
});
