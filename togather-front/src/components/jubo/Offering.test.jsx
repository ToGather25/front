import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Offering from "./Offering";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const OFFERING = [
  { title: "십일조", items: ["OOO 외 00명"] },
  { title: "감사헌금", items: ["OOO 외 00명"] },
];

describe("Offering — 예물", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 예물 항목 제목을 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: OFFERING } });
    renderWithChurch(<Offering />);
    for (const { title } of OFFERING) {
      expect(await screen.findByText(title)).toBeInTheDocument();
    }
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Offering />);
    expect(await screen.findByText("예물 안내를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: OFFERING } });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("십일조")).toBeInTheDocument();
  });

  it("404 응답이면 발행된 주보가 없다는 안내를 보여주고 재시도 버튼은 없다", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithChurch(<Offering />);
    expect(await screen.findByText("아직 발행된 주보가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });
});
