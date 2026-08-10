import { describe, it, expect } from "vite-plus/test";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { INITIAL_PRAYERS } from "./mockData";
import PrayerTab from "./PrayerTab";

function Wrapper() {
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  return <PrayerTab prayers={prayers} setPrayers={setPrayers} />;
}

describe("PrayerTab — 기도 / 상담", () => {
  it("기도/상담 내역이 렌더된다", () => {
    render(<Wrapper />);
    expect(screen.getByText(INITIAL_PRAYERS[0].title)).toBeInTheDocument();
  });

  it("'상담' 필터를 클릭하면 상담 타입만 표시된다", () => {
    render(<Wrapper />);
    const target = INITIAL_PRAYERS.find((p) => p.type === "상담");
    const other = INITIAL_PRAYERS.find((p) => p.type === "기도");

    fireEvent.click(screen.getByRole("button", { name: "상담" }));

    expect(screen.getByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText(other.title)).not.toBeInTheDocument();
  });

  it("기도/상담을 신청하면 목록 끝에 '답변 대기' 상태로 추가된다", () => {
    render(<Wrapper />);

    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    fireEvent.change(screen.getByPlaceholderText("예) 건강"), {
      target: { value: "테스트 기도제목" },
    });
    fireEvent.click(screen.getByRole("button", { name: "신청" }));

    // handleAddPrayer는 배열 끝에 추가하고 페이지는 그대로 두므로(리셋 없음),
    // PRAYER_PAGE_SIZE=4에 7개 초기 데이터 + 1개 추가 = 8개가 되어 새 항목은
    // 2페이지에 있다 — 1페이지에서 바로 찾으면 실패한다.
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("테스트 기도제목")).toBeInTheDocument();
  });
});
