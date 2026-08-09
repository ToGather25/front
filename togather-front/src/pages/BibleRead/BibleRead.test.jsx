import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import { getLastPosition } from "@/utils/bibleReadingProgress";
import BibleRead from "./BibleRead";

describe("BibleRead", () => {
  beforeEach(() => {
    localStorage.clear();
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
  });
});
