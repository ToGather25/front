import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Ministers from "./Ministers";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

// 백엔드 실제 응답은 {clergy:[...], elders:[...], praise:[...]} 객체 — juboService.getMinisters가
// 한글 라벨을 붙여 TitledGroup[]로 변환한다.
const MINISTERS_API = {
  clergy: ["담임목사 | 홍길동", "부 목 사 | 이철수"],
  elders: ["시무장로 | 김영수"],
};
const MINISTERS = [
  { title: "교역자", items: MINISTERS_API.clergy },
  { title: "장로", items: MINISTERS_API.elders },
];

describe("Ministers — 섬기는 분들", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 그룹 제목과 항목을 렌더하고 교적부로 링크한다", async () => {
    api.get.mockResolvedValue({ data: { data: MINISTERS_API } });
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

    api.get.mockResolvedValue({ data: { data: MINISTERS_API } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("교역자")).toBeInTheDocument();
  });

  it("404 응답이면 발행된 주보가 없다는 안내를 보여주고 재시도 버튼은 없다", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithChurch(<Ministers />, { withRouter: true });
    expect(await screen.findByText("아직 발행된 주보가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });
});
