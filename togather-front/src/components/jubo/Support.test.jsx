import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Support from "./Support";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

// 백엔드 실제 응답 모양 — {category, items}(juboService.getSupport가 title/items로 변환한다).
const SUPPORT = [
  { category: "국내 선교", items: ["베트남 | 호치민", "일본 | 동경"] },
  { category: "해외 선교", items: ["후원구역명"] },
];

describe("Support — 후원", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 후원 기관 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: SUPPORT } });
    renderWithChurch(<Support />);
    for (const { items } of SUPPORT) {
      for (const item of items) {
        expect(await screen.findByText(item)).toBeInTheDocument();
      }
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Support />);
    expect(await screen.findByText("후원 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: SUPPORT } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("베트남 | 호치민")).toBeInTheDocument();
  });

  it("404 응답이면 발행된 주보가 없다는 안내를 보여주고 재시도 버튼은 없다", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithChurch(<Support />);
    expect(await screen.findByText("아직 발행된 주보가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });
});
