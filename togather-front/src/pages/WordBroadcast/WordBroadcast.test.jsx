import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import { DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";
import WordBroadcast from "./WordBroadcast";

describe("WordBroadcast — 실시간 예배(더미: 라이브 없음 → 가장 최근 업로드를 히어로로 표시)", () => {
  it("가장 최근 설교를 히어로로 보여주고 지난 설교 목록엔 나머지가 나온다", async () => {
    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText(DUMMY_PAST_SERMONS[0].title)).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    expect(screen.getByText(DUMMY_PAST_SERMONS[1].title)).toBeInTheDocument();
  });

  it("videoId가 없으면 유튜브 채널 ID 안내 플레이스홀더를 보여준다", async () => {
    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });
    expect(
      await screen.findByText("YouTube 채널 ID가 설정되지 않았습니다."),
    ).toBeInTheDocument();
  });

  it("'스마트 주보 보기' 버튼을 클릭하면 당일 주보 모달이 뜬다", async () => {
    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });
    await screen.findByText(DUMMY_PAST_SERMONS[0].title);

    fireEvent.click(screen.getByRole("button", { name: "스마트 주보 보기" }));

    expect(screen.getByText("이번 주 주보")).toBeInTheDocument();
  });
});
