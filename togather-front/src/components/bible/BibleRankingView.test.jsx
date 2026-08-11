import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import BibleRankingView from "./BibleRankingView";

const NEIGHBORS = [
  { rank: 23, name: "임예원", count: 14408, trend: -1 },
  { rank: 22, name: "나", count: 20511, trend: 0 },
  { rank: 21, name: "임예빈", count: 21511, trend: 1 },
];

describe("BibleRankingView", () => {
  it("순위 데이터가 있으면 포디움에 이웃 순위를 나란히 렌더한다", () => {
    render(<BibleRankingView neighbors={NEIGHBORS} monthly={[]} total={[]} />);
    expect(screen.getByText("나")).toBeInTheDocument();
    expect(screen.getByText("임예원")).toBeInTheDocument();
    expect(screen.getByText("임예빈")).toBeInTheDocument();
  });

  it("순위 데이터가 없는 신규 유저에게는 진입 유도 메시지를 보여준다", () => {
    render(
      <BibleRankingView
        neighbors={[{ rank: 0, name: "나", count: 0, trend: 0 }]}
        monthly={[]}
        total={[]}
      />,
    );
    expect(screen.getByText("첫 구절을 읽고 랭킹에 진입해보세요!")).toBeInTheDocument();
  });

  it("월간·전체 순위표를 각각 렌더하고 데이터가 없으면 안내 문구를 보여준다", () => {
    render(<BibleRankingView neighbors={NEIGHBORS} monthly={[]} total={[]} />);
    expect(screen.getByText("월간 순위표")).toBeInTheDocument();
    expect(screen.getByText("전체 순위표")).toBeInTheDocument();
    expect(screen.getAllByText("아직 기록이 없습니다")).toHaveLength(2);
  });

  it("만 단위까지만 있는 절 수는 '만'까지만 표기한다(회귀)", () => {
    render(
      <BibleRankingView
        neighbors={NEIGHBORS}
        monthly={[{ rank: 1, name: "김미정", count: 33420000, trend: 0 }]}
        total={[]}
      />,
    );
    expect(screen.getByText("3,342만절")).toBeInTheDocument();
  });

  it("천 단위까지 있는 절 수는 '만 X천 Y' 형태로 표기한다(신규)", () => {
    render(
      <BibleRankingView
        neighbors={NEIGHBORS}
        monthly={[{ rank: 1, name: "요한", count: 12345566, trend: 0 }]}
        total={[]}
      />,
    );
    expect(screen.getByText("1,234만 5천 566절")).toBeInTheDocument();
  });

  it("만 단위 없이 천 단위만 있는 절 수도 'X천 Y' 형태로 표기한다(신규)", () => {
    render(
      <BibleRankingView
        neighbors={NEIGHBORS}
        monthly={[{ rank: 1, name: "박은진", count: 12387, trend: 0 }]}
        total={[]}
      />,
    );
    expect(screen.getByText("1만 2천 387절")).toBeInTheDocument();
  });
});
