import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { INITIAL_SCHEDULES } from "./mockData";
import ScheduleTab from "./ScheduleTab";

const PAGE_SIZE = 5;

describe("ScheduleTab — 일정", () => {
  it("첫 페이지에 최대 5개 일정이 표시되고 총 개수가 헤더에 보인다", () => {
    render(<ScheduleTab />);
    expect(screen.getByText(`내 일정 (${INITIAL_SCHEDULES.length})`)).toBeInTheDocument();
    expect(screen.getByText(INITIAL_SCHEDULES[0].title)).toBeInTheDocument();
    expect(screen.queryByText(INITIAL_SCHEDULES[PAGE_SIZE].title)).not.toBeInTheDocument();
  });

  it("페이지네이션 2페이지를 클릭하면 다음 일정이 보인다", () => {
    render(<ScheduleTab />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText(INITIAL_SCHEDULES[PAGE_SIZE].title)).toBeInTheDocument();
  });

  it("일정을 추가하면 목록에 반영된다", () => {
    render(<ScheduleTab />);

    fireEvent.click(screen.getByRole("button", { name: "+ 일정 추가" }));
    fireEvent.change(screen.getByPlaceholderText("예) 새가족 모임"), {
      target: { value: "테스트 일정" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getByText(`내 일정 (${INITIAL_SCHEDULES.length + 1})`)).toBeInTheDocument();
  });
});
