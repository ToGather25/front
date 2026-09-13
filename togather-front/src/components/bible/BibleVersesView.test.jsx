import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import BibleVersesView from "./BibleVersesView";

const ITEMS = [
  { key: "a", book: "로마서", chapter: 8, num: 28, text: "합력하여 선을 이루느니라" },
  { key: "b", book: "요한복음", chapter: 3, num: 16, text: "독생자를 주셨으니" },
];

describe("BibleVersesView", () => {
  it("저장된 구절이 없으면 read 모드 안내 문구를 보여준다", () => {
    render(<BibleVersesView mode="read" items={[]} mockItems={[]} onRemove={vi.fn()} />);
    expect(screen.getByText("저장된 구절이 없습니다.")).toBeInTheDocument();
  });

  it("검색어로 구절/책 이름을 필터링한다", () => {
    render(<BibleVersesView mode="read" items={ITEMS} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("검색할 내용을 입력하세요"), {
      target: { value: "로마서" },
    });
    expect(screen.getByText(/합력하여/)).toBeInTheDocument();
    expect(screen.queryByText(/독생자를/)).not.toBeInTheDocument();
  });

  it("write 모드에서는 좋아요 취소 버튼을 보여주지 않는다", () => {
    render(<BibleVersesView mode="write" items={ITEMS} onRemove={vi.fn()} />);
    // 절 이동 버튼은 write 모드에도 있으므로(텍스트 포함), 텍스트 없는 아이콘
    // 전용 버튼(좋아요 취소)만 없는지로 확인한다.
    const iconOnlyButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.textContent === "");
    expect(iconOnlyButtons).toHaveLength(0);
  });

  it("좋아요 취소 버튼을 누르면 즉시 사라지지 않고 애니메이션 후 onRemove가 호출된다", async () => {
    const onRemove = vi.fn();
    const { container } = render(
      <BibleVersesView mode="read" items={ITEMS} onRemove={onRemove} />,
    );
    // 데스크탑 카드 그리드로 범위를 좁힌다 — 모바일 리스트도 동시에 렌더되는데
    // (반응형은 CSS로만 전환되고 jsdom은 CSS를 적용하지 않는다) 그쪽 좋아요 취소
    // 버튼은 카드형 ".flex.flex-col" 래퍼 밖에 있어 closest 매칭이 엉뚱한
    // 조상으로 올라가 버린다.
    const desktopGrid = container.querySelector(".md\\:grid");
    // read 모드에서는 상단 "좋아하는 구절만 읽기" 필터 버튼도 함께 렌더되므로,
    // 텍스트가 없는 아이콘 전용 버튼(카드별 좋아요 취소 버튼)만 골라낸다.
    const [firstRemoveBtn] = within(desktopGrid)
      .getAllByRole("button")
      .filter((btn) => btn.textContent === "");
    fireEvent.click(firstRemoveBtn);

    // 클릭 직후: onRemove는 아직 호출되지 않고(부모 state 즉시 변경 없음), 카드에 사라짐 애니메이션 클래스가 붙는다
    expect(onRemove).not.toHaveBeenCalled();
    expect(firstRemoveBtn.closest(".flex.flex-col")).toHaveClass("scale-0", "opacity-0");

    // 애니메이션 시간(200ms) 이후: onRemove가 호출된다
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("a"), { timeout: 1000 });
  });
});
