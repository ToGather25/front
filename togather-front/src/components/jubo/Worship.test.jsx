import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Worship from "./Worship";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SERVICES = [
  { label: "주일 오전예배", time: "오전 9:00" },
  { label: "수요예배", time: "오전 11:00" },
];
const ORDER_MAP = {
  "주일 오전예배": [{ role: "예배 부름", name: "성가대" }],
  수요예배: [{ role: "말씀", name: "김영수 목사" }],
};

describe("Worship — 예배", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes("worship-services")) return Promise.resolve({ data: { data: SERVICES } });
      if (url.includes("worship-order")) return Promise.resolve({ data: { data: ORDER_MAP } });
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
  });

  it("첫 예배의 순서표를 기본으로 렌더한다", async () => {
    renderWithChurch(<Worship />);
    expect(await screen.findByText("예배 부름")).toBeInTheDocument();
    expect(screen.getByText("성가대")).toBeInTheDocument();
  });

  it("사이드바에서 다른 예배를 선택하면 그 예배의 순서표로 바뀐다", async () => {
    renderWithChurch(<Worship />);
    await screen.findByText("예배 부름");

    fireEvent.click(screen.getByRole("button", { name: "수요예배" }));

    expect(await screen.findByText("말씀")).toBeInTheDocument();
    expect(screen.getByText("김영수 목사")).toBeInTheDocument();
    expect(screen.queryByText("예배 부름")).not.toBeInTheDocument();
  });

  it("예배 및 모임 안내 패널에 전체 예배 목록과 시간을 렌더한다", async () => {
    renderWithChurch(<Worship />);
    await screen.findByText("예배 부름");
    expect(screen.getByText("오전 9:00")).toBeInTheDocument();
    expect(screen.getByText("오전 11:00")).toBeInTheDocument();
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockImplementation(() => Promise.reject(new Error("network error")));
    renderWithChurch(<Worship />);
    expect(await screen.findByText("예배 순서를 불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockImplementation((url) => {
      if (url.includes("worship-services")) return Promise.resolve({ data: { data: SERVICES } });
      if (url.includes("worship-order")) return Promise.resolve({ data: { data: ORDER_MAP } });
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("예배 부름")).toBeInTheDocument();
  });
});
