import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import District from "./District";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const DISTRICTS = [
  { name: "1구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { name: "2구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
];

describe("District — 구역", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 구역 행을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: DISTRICTS } });
    renderWithChurch(<District />);
    for (const { name } of DISTRICTS) {
      expect(await screen.findByText(name)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<District />);
    expect(await screen.findByText("구역 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: DISTRICTS } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("1구역")).toBeInTheDocument();
  });
});
