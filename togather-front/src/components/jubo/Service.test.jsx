import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Service from "./Service";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

// 콘텐츠는 자유형식 JSON 패스스루 — 관리자 에디터(VolunteerSectionEditor)가 쓰는 모양 그대로 저장/조회한다.
const VOLUNTEER_API = [
  { role: "예배인도", part1: "000", part2: "000" },
  { role: "설교", part1: "000목사", part2: "000목사" },
];
const ROLES = VOLUNTEER_API;

describe("Service — 봉사", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 봉사 역할 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: VOLUNTEER_API } });
    renderWithChurch(<Service />);
    for (const { role } of ROLES) {
      expect(await screen.findByText(role)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 안내 문구를 보여준다(재시도 버튼 없음)", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Service />);
    expect(await screen.findByText("봉사 안내를 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("404 응답이면 발행된 주보가 없다는 안내를 보여주고 재시도 버튼은 없다", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithChurch(<Service />);
    expect(await screen.findByText("아직 발행된 주보가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });
});
