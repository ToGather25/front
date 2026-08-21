vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WordSermon from "./WordSermon";

const SERMONS = [
  { id: "s1", title: "부활의 능력", worshipType: "주일 1부", sermonDate: "2026-05-25" },
  { id: "s2", title: "성령으로 충만하라", worshipType: "주일 2부", sermonDate: "2026-05-25" },
];

function mockSearch(sermons, pageInfo = { totalPages: 1 }) {
  api.get.mockResolvedValue({ data: { data: { content: sermons, pageInfo } } });
}

describe("WordSermon — 예배 목록(서버 검색)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("조회된 설교 목록이 카드로 렌더된다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.getByText("성령으로 충만하라")).toBeInTheDocument();
  });

  it("검색어를 입력하고 제출하면 keyword 파라미터로 서버에 재조회한다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText("부활의 능력");

    mockSearch([SERMONS[0]]);
    const input = screen.getByPlaceholderText("설교 제목 검색");
    fireEvent.change(input, { target: { value: "부활" } });
    fireEvent.submit(input.closest("form"));

    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith(
        "/church/sermons",
        expect.objectContaining({ params: expect.objectContaining({ keyword: "부활" }) }),
      ),
    );
  });

  it("예배구분 필터를 선택하면 worshipType 파라미터로 서버에 재조회한다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText("부활의 능력");

    mockSearch([SERMONS[1]]);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "주일 2부" } });

    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith(
        "/church/sermons",
        expect.objectContaining({ params: expect.objectContaining({ worshipType: "주일 2부" }) }),
      ),
    );
  });

  it("설교 카드를 클릭하면 상세 페이지로 라우팅 이동한다", async () => {
    mockSearch(SERMONS);
    renderWithChurch(
      <Routes>
        <Route path="/말씀/설교" element={<WordSermon />} />
        <Route path="/말씀/설교/:id" element={<div>상세 페이지 진입 확인용 마커</div>} />
      </Routes>,
      { initialEntries: ["/말씀/설교"] },
    );
    const card = await screen.findByText("부활의 능력");
    fireEvent.click(card);

    expect(screen.getByText("상세 페이지 진입 확인용 마커")).toBeInTheDocument();
  });

  it("페이지네이션은 서버가 준 totalPages를 기준으로 렌더된다", async () => {
    mockSearch(SERMONS, { totalPages: 3 });
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });
    await screen.findByText("부활의 능력");

    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("조회 실패 시 재시도 버튼이 노출되고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    renderWithChurch(<WordSermon />, { initialEntries: ["/말씀/설교"] });

    expect(await screen.findByText("불러오지 못했습니다. 다시 시도해 주세요.")).toBeInTheDocument();

    mockSearch(SERMONS);
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
  });
});
