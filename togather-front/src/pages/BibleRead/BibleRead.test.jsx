import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import { getLastPosition } from "@/utils/bibleReadingProgress";
import BibleRead from "./BibleRead";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

import api from "@/services/api";

describe("BibleRead", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { completed: [], lastPosition: null } } });
    api.put.mockResolvedValue({ data: null });
  });

  it("로그인하지 않은 상태로 접근하면 로그인 필요 모달만 보여주고 본문은 렌더하지 않는다", () => {
    renderWithChurch(<BibleRead />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText("창세기")).not.toBeInTheDocument();
  });

  it("로그인된 상태로 접근하면 첫 방문 시 튜토리얼을 보여준다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<BibleRead />, { withAuth: true });
    expect(screen.getByText("성경 읽기 이용 방법")).toBeInTheDocument();
  });

  it("튜토리얼을 이미 본 경우 본문(성경 구절 목록)이 바로 보인다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });
    expect(screen.queryByText("성경 읽기 이용 방법")).not.toBeInTheDocument();
    expect(await screen.findByText("창세기")).toBeInTheDocument();
  });

  it("장을 이동하면 마지막 읽은 위치가 저장된다(신규)", async () => {
    const user = userEvent.setup();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });

    await waitFor(() => expect(getLastPosition("창세기")).toBe(1));

    const nextChapterBtn = screen.getByTitle("다음 장");
    await user.click(nextChapterBtn);

    await waitFor(() => expect(getLastPosition("창세기")).toBe(2));
    expect(api.put).toHaveBeenCalledWith("/my/bible/READ/position", {
      book: "창",
      chapter: 2,
      verse: 0,
    });
  });

  it("서버에 저장된 마지막 위치가 있으면 그 장으로 이동한다", async () => {
    api.get.mockResolvedValue({
      data: { data: { completed: [], lastPosition: { book: "시", chapter: 23, verse: 0 } } },
    });
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });

    expect(await screen.findByText("시편")).toBeInTheDocument();
    expect(screen.getByText("23편")).toBeInTheDocument();
  });

  it("전체 선택을 누르면 해당 장을 완료로 서버에 저장한다", async () => {
    const user = userEvent.setup();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });
    await screen.findByText("창세기");

    await user.click(screen.getByRole("button", { name: "전체 선택" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/my/bible/READ/progress", {
        book: "창",
        chapter: 1,
        verse: 0,
        completed: true,
      }),
    );
  });

  it("이미 완료된 장을 다시 열면 체크 상태가 복원된다", async () => {
    api.get.mockResolvedValue({
      data: { data: { completed: [{ book: "창", chapter: 1, verse: 0 }], lastPosition: null } },
    });
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    renderWithChurch(<BibleRead />, { withAuth: true });

    expect(await screen.findByRole("button", { name: "전체 해제" })).toBeInTheDocument();
  });
});
