import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Support from "./Support";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

// 콘텐츠는 자유형식 JSON 패스스루 — 관리자 에디터(SupportSectionEditor)가 쓰는 모양 그대로 저장/조회한다.
const SUPPORT = [
  { organization: "베트남", target: "선교사님", region: "구역명" },
  { organization: "일본", target: "선교사님", region: "구역명" },
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

  it("조회 실패 시 안내 문구를 보여준다(재시도 버튼 없음)", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Support />);
    expect(await screen.findByText("후원 안내를 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("404 응답이면 발행된 주보가 없다는 안내를 보여주고 재시도 버튼은 없다", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithChurch(<Support />);
    expect(await screen.findByText("아직 발행된 주보가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });
});
