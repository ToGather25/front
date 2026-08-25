import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Service from "./Service";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const ROLES = [
  { role: "예배인도", part1: "000", part2: "000" },
  { role: "설교", part1: "000목사", part2: "000목사" },
];

describe("Service — 봉사", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 봉사 역할 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: ROLES } });
    renderWithChurch(<Service />);
    for (const { role } of ROLES) {
      expect(await screen.findByText(role)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Service />);
    expect(await screen.findByText("봉사 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: ROLES } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("예배인도")).toBeInTheDocument();
  });
});
