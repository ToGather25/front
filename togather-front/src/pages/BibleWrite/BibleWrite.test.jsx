import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import bibleData from "@/data/bible.json";
import BibleWrite from "./BibleWrite";

describe("BibleWrite — 로그인 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("로그인하지 않은 상태로 접근하면 로그인 필요 모달만 보여준다", () => {
    renderWithChurch(<BibleWrite />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 접근하면 모달 없이 본문이 보인다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<BibleWrite />, { withAuth: true });
    expect(screen.queryByText("로그인이 필요한 서비스입니다")).not.toBeInTheDocument();
  });
});

describe("BibleWrite — state.book 변환", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
  });

  it("BibleStatusView에서 넘어온 전체 이름(state.book)을 약어로 변환해 정상 표시한다", () => {
    renderWithChurch(<BibleWrite />, {
      withAuth: true,
      initialEntries: [{ pathname: "/말씀/필사", state: { book: "창세기" } }],
    });
    expect(screen.getByRole("button", { name: "창세기" })).toBeInTheDocument();
  });

  it("전체 이름이 약어로 변환된 뒤에는 해당 책의 장·절이 정상 조회된다", () => {
    const { container } = renderWithChurch(<BibleWrite />, {
      withAuth: true,
      initialEntries: [{ pathname: "/말씀/필사", state: { book: "출애굽기" } }],
    });
    expect(screen.getByRole("button", { name: "출애굽기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1장" })).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });
});

describe("BibleWrite — 필사 로직", () => {
  function renderWrite() {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    return renderWithChurch(<BibleWrite />, { withAuth: true });
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("책 선택 모달에서 다른 책을 클릭하면 헤더 표시와 장·절이 갱신된다", async () => {
    const user = userEvent.setup();
    renderWrite();

    await user.click(screen.getByRole("button", { name: "창세기" }));
    await user.click(screen.getByRole("button", { name: "출애굽기" }));

    expect(screen.getByRole("button", { name: "출애굽기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1절" })).toBeInTheDocument();
  });

  it("장 드롭다운에서 다른 장을 클릭하면 해당 장으로 이동하고 입력이 초기화된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    await user.click(screen.getByRole("button", { name: "1장" }));
    await user.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByRole("button", { name: "2장" })).toBeInTheDocument();
    expect(container.querySelector("textarea")).toHaveValue("");
  });

  it("정답을 입력하면 완료 처리되고 오늘 쓴 절 수가 증가한다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    const targetText = bibleData["창1:1"].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    expect(screen.getByText("오늘 쓴 절 수 : 1절")).toBeInTheDocument();
  });

  it("마지막 절이 아니면 정답 입력 후 700ms 뒤 다음 절로 자동 이동한다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    const targetText = bibleData["창1:1"].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    await waitFor(
      () => expect(screen.getByRole("button", { name: "2절" })).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("완료 상태에서 '다시 쓰기'를 누르면 입력이 초기화되고 다시 작성할 수 있다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    const targetText = bibleData["창1:1"].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    await user.click(screen.getByRole("button", { name: "다시 쓰기" }));

    expect(container.querySelector("textarea")).toHaveValue("");
    expect(screen.getByText("오늘 쓴 절 수 : 1절")).toBeInTheDocument();
  });

  it("장의 마지막 절을 완료하면 '다음 장으로' 버튼이 나타난다", async () => {
    const user = userEvent.setup();
    const { container } = renderWrite();

    // 절 드롭다운을 열어 이 장(창세기 1장)의 마지막 절 번호를 실제 데이터 기준으로 찾는다
    await user.click(screen.getByRole("button", { name: "1절" }));
    const verseButtons = screen.getAllByRole("button", { name: /^\d+$/ });
    const lastVerseNum = Math.max(...verseButtons.map((b) => Number(b.textContent)));
    await user.click(screen.getByRole("button", { name: String(lastVerseNum) }));

    const targetText = bibleData[`창1:${lastVerseNum}`].trim();
    const textarea = container.querySelector("textarea");
    await user.type(textarea, targetText);

    expect(await screen.findByRole("button", { name: "다음 장으로" })).toBeInTheDocument();
  });

  it("랭킹 탭으로 전환하면 랭킹 뷰가 렌더된다", async () => {
    const user = userEvent.setup();
    renderWrite();
    await user.click(screen.getByRole("button", { name: "랭킹" }));
    expect(screen.getByText("월간 순위표")).toBeInTheDocument();
  });

  it("내 구절 탭으로 전환하면 저장된 구절 뷰가 렌더된다", async () => {
    const user = userEvent.setup();
    renderWrite();
    await user.click(screen.getByRole("button", { name: "내 구절" }));
    expect(screen.getByPlaceholderText("검색할 내용을 입력하세요")).toBeInTheDocument();
  });

  it("내 현황 탭으로 전환하면 현황 뷰가 렌더된다", async () => {
    const user = userEvent.setup();
    renderWrite();
    await user.click(screen.getByRole("button", { name: "내 현황" }));
    expect(screen.getByText("전체 완독률")).toBeInTheDocument();
  });
});
