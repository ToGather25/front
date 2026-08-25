import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Cover from "./Cover";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("Cover — 표지", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
  });

  it("호수·발행일을 실API로, 표어·3대 실천사항을 교회 설정으로 렌더한다", async () => {
    renderWithChurch(<Cover />);
    expect(await screen.findByText("제10-7")).toBeInTheDocument();
    expect(screen.getByText("2026년 2월 15일")).toBeInTheDocument();
    expect(
      screen.getByText(churchConfig.vision.mainVerse.replace(/^"|"$/g, "")),
    ).toBeInTheDocument();
    expect(screen.getByText(churchConfig.vision.items[0].label)).toBeInTheDocument();
  });

  it("조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<Cover />);
    expect(await screen.findByText("주보 정보를 불러오지 못했습니다. 다시 시도")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
    fireEvent.click(screen.getByRole("button", { name: "주보 정보를 불러오지 못했습니다. 다시 시도" }));

    expect(await screen.findByText("제10-7")).toBeInTheDocument();
  });

  it("404 응답이면 발행된 주보가 없다는 안내를 보여주고 재시도 버튼은 없다", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithChurch(<Cover />);
    expect(await screen.findByText("아직 발행된 주보가 없습니다.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "주보 정보를 불러오지 못했습니다. 다시 시도" }),
    ).not.toBeInTheDocument();
  });
});
