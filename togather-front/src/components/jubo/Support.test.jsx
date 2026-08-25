import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Support from "./Support";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SUPPORT = [
  { organization: "베트남 | 호치민", target: "선교사님 성함", region: "후원구역명" },
  { organization: "일본 | 동경", target: "선교사님 성함", region: "후원구역명" },
];

describe("Support — 후원", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 후원 기관 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: SUPPORT } });
    renderWithChurch(<Support />);
    for (const { organization } of SUPPORT) {
      expect(await screen.findByText(organization)).toBeInTheDocument();
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
});
