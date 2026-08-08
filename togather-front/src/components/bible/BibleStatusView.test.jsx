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
const CONFIG = { totalValue: "128,450 절", streakDays: 5 };

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

  it("스트릭 캘린더에 연속 읽기 일수를 표시한다", () => {
    renderStatus();
    expect(screen.getByText("5일 연속 읽기중!")).toBeInTheDocument();
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
