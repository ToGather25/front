import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router";
import { renderWithChurch } from "@/test/renderWithChurch";
import { DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
import WordSermonDetail from "./WordSermonDetail";

function renderDetail(id) {
  return renderWithChurch(
    <Routes>
      <Route path="/말씀/설교/:id" element={<WordSermonDetail />} />
    </Routes>,
    { initialEntries: [`/말씀/설교/${id}`] },
  );
}

describe("WordSermonDetail", () => {
  it("id에 해당하는 설교의 제목과 날짜를 보여준다", async () => {
    const target = DUMMY_PAST_SERMONS[2];
    renderDetail(target.id);

    expect(await screen.findByText(target.title)).toBeInTheDocument();
    expect(screen.getByText(target.date)).toBeInTheDocument();
  });

  it("존재하지 않는 id면 안내 문구와 목록으로 돌아가기 버튼을 보여준다", async () => {
    renderDetail("존재하지-않는-id");
    expect(await screen.findByText("설교를 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "목록으로 돌아가기" })).toBeInTheDocument();
  });

  it("videoId가 없으면 'YouTube에서 보기' 링크로 대체된다", async () => {
    const target = DUMMY_PAST_SERMONS[0];
    renderDetail(target.id);
    await screen.findByText(target.title);
    expect(screen.getByRole("link", { name: "YouTube에서 보기" })).toBeInTheDocument();
  });

  it("'다음 설교' 버튼을 클릭하면 해당 설교로 전환된다", async () => {
    const target = DUMMY_PAST_SERMONS[2]; // index2: prev=index3, next=index1 (둘 다 존재)
    renderDetail(target.id);
    await screen.findByText(target.title);

    const next = DUMMY_PAST_SERMONS[1];
    fireEvent.click(screen.getByRole("button", { name: /다음 설교/ }));

    expect(await screen.findByText(next.title)).toBeInTheDocument();
  });
});
