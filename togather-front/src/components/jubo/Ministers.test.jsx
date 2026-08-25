import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Ministers from "./Ministers";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const MINISTERS = [
  { title: "교역자", items: ["담임목사 | 홍길동", "부 목 사 | 이철수"] },
  { title: "장 로", items: ["시무장로 | 김영수"] },
];

describe("Ministers — 섬기는 분들", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 그룹 제목과 항목을 렌더하고 교적부로 링크한다", async () => {
    api.get.mockResolvedValue({ data: { data: MINISTERS } });
    renderWithChurch(<Ministers />, { withRouter: true });

    for (const { title } of MINISTERS) {
      expect(await screen.findByText(title)).toBeInTheDocument();
    }
    const link = screen.getByText("홍길동").closest("a");
    expect(link).toHaveAttribute("href", "/교적부");
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Ministers />, { withRouter: true });
    expect(
      await screen.findByText("섬기는 분들 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: MINISTERS } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("교역자")).toBeInTheDocument();
  });
});
