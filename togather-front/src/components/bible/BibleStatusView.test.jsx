import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { saveLastPosition, getLastPosition } from "@/utils/bibleReadingProgress";
import BibleStatusView from "./BibleStatusView";

const navigateSpy = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

const BOOK_PROGRESS = { 창: 100, 출: 50, 레: 0 };
const CONFIG = { totalValue: "128,450 절" };

function renderStatus(props = {}) {
  return render(
    <MemoryRouter>
      <BibleStatusView bookProgress={BOOK_PROGRESS} config={CONFIG} mode="read" {...props} />
    </MemoryRouter>,
  );
}

describe("BibleStatusView", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateSpy.mockClear();
  });

  it("전체 완독률과 통계 카드를 렌더한다", () => {
    renderStatus();
    expect(screen.getByText("전체 완독률")).toBeInTheDocument();
    expect(screen.getByText("128,450 절")).toBeInTheDocument();
  });

  it("목표 미설정 시 명세서 문구를 보여준다(신규)", () => {
    renderStatus();
    expect(screen.getByText("목표는 단기 목표부터!")).toBeInTheDocument();
  });

  it("스트릭 캘린더에 오늘까지 끊기지 않은 연속 읽기 일수를 계산해 표시한다", () => {
    // MOCK_READ_DATES(기본값)는 14~18일이 연속으로 읽혀 있다 — "오늘"을 18일로
    // 고정하면 14,15,16,17,18 5일 연속이어야 한다.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 18));
    try {
      renderStatus();
      expect(screen.getByText("5일 연속 읽기중!")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("마지막으로 읽은 날짜와 오늘 사이에 공백이 있으면 연속 읽기 문구를 숨긴다", () => {
    // MOCK_READ_DATES의 마지막 기록은 22일 — "오늘"을 30일로 두면 8일간 공백이
    // 있으므로 연속 기록은 끊긴 것으로 보고 문구 자체를 보여주지 않아야 한다.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 30));
    try {
      renderStatus();
      expect(screen.queryByText(/연속 읽기중!/)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("구약/신약/완료제외 필터와 리스트/바둑판 뷰 토글을 렌더한다", () => {
    renderStatus();
    expect(screen.getByRole("button", { name: "구약" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "신약" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "완료 제외" })).toBeInTheDocument();
    expect(screen.getByTitle("리스트 형태 (10권)")).toBeInTheDocument();
    expect(screen.getByTitle("바둑판 형태 (20권)")).toBeInTheDocument();
  });

  it("마지막 읽은 위치가 없는 책을 클릭하면 chapter 없이 이동한다(회귀)", async () => {
    const user = userEvent.setup();
    renderStatus();
    await user.click(screen.getByText("창세기"));
    expect(navigateSpy).toHaveBeenCalledWith("/말씀/읽기", {
      state: { book: "창세기" },
    });
  });

  it("마지막 읽은 위치가 저장된 책을 클릭하면 해당 장으로 이동한다(신규)", async () => {
    const user = userEvent.setup();
    saveLastPosition("창세기", 7);
    expect(getLastPosition("창세기")).toBe(7);

    renderStatus();
    await user.click(screen.getByText("창세기"));
    expect(navigateSpy).toHaveBeenCalledWith("/말씀/읽기", {
      state: { book: "창세기", chapter: 7 },
    });
  });
});
