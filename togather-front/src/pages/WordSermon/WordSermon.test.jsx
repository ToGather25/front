import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router";
import { renderWithChurch } from "@/test/renderWithChurch";
import { DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
import WordSermon from "./WordSermon";

describe("WordSermon — 예배 목록", () => {
  it("더미 설교 목록이 카드로 렌더된다", async () => {
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    expect(await screen.findByText(DUMMY_PAST_SERMONS[0].title)).toBeInTheDocument();
    expect(screen.getByText(DUMMY_PAST_SERMONS[5].title)).toBeInTheDocument();
  });

  it("검색어를 입력하고 제출하면 제목에 해당 검색어가 없는 카드가 걸러진다", async () => {
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText(DUMMY_PAST_SERMONS[0].title);

    const target = DUMMY_PAST_SERMONS.find((s) => s.title.includes("새벽기도회"));
    const input = screen.getByPlaceholderText("설교 제목 검색");
    fireEvent.change(input, { target: { value: "새벽기도회" } });
    fireEvent.submit(input.closest("form"));

    expect(screen.getByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText(DUMMY_PAST_SERMONS[0].title)).not.toBeInTheDocument();
  });

  it("예배 종류 필터를 선택하면 해당 종류만 표시된다", async () => {
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText(DUMMY_PAST_SERMONS[0].title);

    const target = DUMMY_PAST_SERMONS.find((s) => s.title.includes("수요기도회"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "수요기도회" } });

    expect(screen.getByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText(DUMMY_PAST_SERMONS[0].title)).not.toBeInTheDocument();
  });

  it("설교 카드를 클릭하면 상세 페이지로 라우팅 이동한다", async () => {
    renderWithChurch(
      <Routes>
        <Route path="/말씀/설교" element={<WordSermon />} />
        <Route path="/말씀/설교/:id" element={<div>상세 페이지 진입 확인용 마커</div>} />
      </Routes>,
      { initialEntries: ["/말씀/설교"] },
    );
    const card = await screen.findByText(DUMMY_PAST_SERMONS[0].title);
    fireEvent.click(card);

    expect(screen.getByText("상세 페이지 진입 확인용 마커")).toBeInTheDocument();
  });
});
