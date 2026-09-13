import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import JuboList from "./JuboList";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const ARCHIVE = [
  {
    id: 10,
    issueNo: "제10-8",
    juboDate: "2026-08-09",
    title: "이러한 율법을 행하는 이방인이 정죄하리라",
    scripture: "로마서 2장 27절",
  },
  {
    id: 9,
    issueNo: "제10-7",
    juboDate: "2026-08-02",
    title: "믿음으로 사는 의인",
    scripture: "로마서 1장 17절",
  },
];
const CURRENT_INFO = { issueNo: "제10-8", date: "2026년 8월 9일" };

describe("JuboList — 주보 발행 목록", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.endsWith("/jubo/current")) return Promise.resolve({ data: { data: CURRENT_INFO } });
      if (url.endsWith("/jubo")) return Promise.resolve({ data: { data: ARCHIVE } });
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
  });

  it("발행 목록을 카드로 렌더하고, 최신호에 '이번 주 주보' 배지를 단다", async () => {
    renderWithChurch(<JuboList />, { withRouter: true });
    expect(
      await screen.findByText("이러한 율법을 행하는 이방인이 정죄하리라"),
    ).toBeInTheDocument();
    expect(screen.getByText("이번 주 주보")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /이러한 율법을 행하는 이방인이 정죄하리라/ }),
    ).toHaveAttribute("href", "/주보?issue=10");
  });

  it("검색어로 카드 목록을 좁힌다", async () => {
    renderWithChurch(<JuboList />, { withRouter: true });
    await screen.findByText("믿음으로 사는 의인");

    fireEvent.change(screen.getByPlaceholderText("설교 제목, 말씀 검색"), {
      target: { value: "믿음으로 사는 의인" },
    });

    expect(screen.getByText("믿음으로 사는 의인")).toBeInTheDocument();
    expect(
      screen.queryByText("이러한 율법을 행하는 이방인이 정죄하리라"),
    ).not.toBeInTheDocument();
  });

  describe("날짜로 보기", () => {
    beforeEach(() => {
      // shouldAdvanceTime: findByText 등 testing-library의 폴링(setTimeout)이 실제로
      // 진행되도록 하면서, new Date()가 반환하는 "오늘"만 고정한다.
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date(2026, 7, 15)); // 2026-08-15, 발행 이력이 있는 달
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("버튼을 누르면 오늘이 속한 달의 캘린더가 뜬다", async () => {
      renderWithChurch(<JuboList />, { withRouter: true });
      await screen.findByText("믿음으로 사는 의인");

      fireEvent.click(screen.getByRole("button", { name: "날짜로 보기" }));
      expect(screen.getByText("2026년 8월")).toBeInTheDocument();
    });

    it("발행된 주의 날짜를 클릭하면 그 주보로 이동하고 캘린더가 닫힌다", async () => {
      renderWithChurch(<JuboList />, { withRouter: true });
      await screen.findByText("믿음으로 사는 의인");

      fireEvent.click(screen.getByRole("button", { name: "날짜로 보기" }));
      fireEvent.click(screen.getByRole("button", { name: "9" })); // 2026-08-09(일) — 발행됨

      expect(screen.queryByText("2026년 8월")).not.toBeInTheDocument();
    });

    it("발행되지 않은 주를 클릭하면 안내 문구를 보여주고 캘린더는 유지된다", async () => {
      renderWithChurch(<JuboList />, { withRouter: true });
      await screen.findByText("믿음으로 사는 의인");

      fireEvent.click(screen.getByRole("button", { name: "날짜로 보기" }));
      fireEvent.click(screen.getByRole("button", { name: "20" })); // 발행 없는 주(8/16주)

      expect(screen.getByText("해당 주에 발행된 주보가 없습니다.")).toBeInTheDocument();
      expect(screen.getByText("2026년 8월")).toBeInTheDocument();
    });
  });
});
