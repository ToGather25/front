vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WordSermonDetail from "./WordSermonDetail";

const NEIGHBORS = [
  {
    id: "s1",
    title: "부활의 능력",
    sermonDate: "2026-05-25",
    worshipType: "주일 1부",
    scripture: "롬 8:11",
    preacher: "김영수 담임목사",
    youtubeVideoId: null,
  },
  {
    id: "s2",
    title: "성령으로 충만하라",
    sermonDate: "2026-05-25",
    worshipType: "주일 2부",
    scripture: "엡 5:18",
    preacher: "박성민 부목사",
    youtubeVideoId: "dQw4w9WgXcQ",
  },
  {
    id: "s3",
    title: "참된 예배",
    sermonDate: "2026-05-18",
    worshipType: "주일 1부",
    scripture: "요 4:23-24",
    preacher: "김영수 담임목사",
    youtubeVideoId: null,
  },
];

function mockBackend() {
  api.get.mockImplementation((url) => {
    if (url === "/church/sermons") {
      return Promise.resolve({ data: { data: { content: NEIGHBORS, pageInfo: { totalPages: 1 } } } });
    }
    const match = url.match(/^\/church\/sermons\/(.+)$/);
    const found = match ? (NEIGHBORS.find((s) => s.id === match[1]) ?? null) : null;
    return Promise.resolve({ data: { data: found } });
  });
}

function renderDetail(id) {
  return renderWithChurch(
    <Routes>
      <Route path="/말씀/설교/:id" element={<WordSermonDetail />} />
    </Routes>,
    { initialEntries: [`/말씀/설교/${id}`] },
  );
}

describe("WordSermonDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id에 해당하는 설교의 제목/날짜/본문말씀/설교자를 보여준다", async () => {
    mockBackend();
    const target = NEIGHBORS[2];
    renderDetail(target.id);

    expect(await screen.findByText(target.title)).toBeInTheDocument();
    expect(screen.getByText(target.sermonDate)).toBeInTheDocument();
    expect(screen.getByText(target.scripture)).toBeInTheDocument();
    expect(screen.getByText(target.preacher)).toBeInTheDocument();
  });

  it("설교를 찾을 수 없으면 안내 문구와 목록으로 돌아가기 버튼을 보여준다", async () => {
    mockBackend();
    renderDetail("존재하지-않는-id");
    expect(await screen.findByText("설교를 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "목록으로 돌아가기" })).toBeInTheDocument();
  });

  it("youtubeVideoId가 없으면 'YouTube에서 보기' 링크로 대체된다", async () => {
    mockBackend();
    const target = NEIGHBORS[0];
    renderDetail(target.id);
    await screen.findByText(target.title);
    expect(screen.getByRole("link", { name: "YouTube에서 보기" })).toBeInTheDocument();
  });

  it("youtubeVideoId가 있으면 embed iframe으로 재생된다", async () => {
    mockBackend();
    const target = NEIGHBORS[1];
    renderDetail(target.id);
    await screen.findByText(target.title);
    expect(
      document.querySelector('iframe[src="https://www.youtube.com/embed/dQw4w9WgXcQ"]'),
    ).toBeInTheDocument();
  });

  it("상세 조회는 성공했지만 인접 목록 조회가 실패해도 설교 내용을 보여준다", async () => {
    const target = NEIGHBORS[2];
    api.get.mockImplementation((url) => {
      if (url === "/church/sermons") {
        return Promise.reject(new Error("network error"));
      }
      const match = url.match(/^\/church\/sermons\/(.+)$/);
      const found = match ? (NEIGHBORS.find((s) => s.id === match[1]) ?? null) : null;
      return Promise.resolve({ data: { data: found } });
    });

    renderDetail(target.id);

    expect(await screen.findByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText("설교를 찾을 수 없습니다.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /이전 설교/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /다음 설교/ })).not.toBeInTheDocument();
  });

  it("'다음 설교' 버튼을 클릭하면 인접 목록 기준으로 해당 설교로 전환된다", async () => {
    mockBackend();
    const target = NEIGHBORS[2];
    renderDetail(target.id);
    await screen.findByText(target.title);

    const next = NEIGHBORS[1];
    fireEvent.click(screen.getByRole("button", { name: /다음 설교/ }));

    expect(await screen.findByText(next.title)).toBeInTheDocument();
  });
});
