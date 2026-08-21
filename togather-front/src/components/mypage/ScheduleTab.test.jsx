import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import ScheduleTab from "./ScheduleTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SCHEDULES = [{ id: 1, title: "1구역 모임", date: "2026-02-18", memo: "옥길동 · 19:30" }];

describe("ScheduleTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("요일 입력 필드와 상태 배지가 없다", () => {
    renderWithChurch(<ScheduleTab schedules={SCHEDULES} setSchedules={() => {}} />);
    expect(screen.queryByText("요일")).not.toBeInTheDocument();
    expect(screen.queryByText("참석 예정")).not.toBeInTheDocument();
  });

  it("일정을 추가하면 addMySchedule을 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 2, title: "새 일정", date: "2026-03-15", memo: "본당" } },
    });
    const setSchedules = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<ScheduleTab schedules={SCHEDULES} setSchedules={setSchedules} />);

    await user.click(screen.getByRole("button", { name: "+ 일정 추가" }));
    await user.type(screen.getByPlaceholderText("03.15"), "2026-03-15");
    await user.type(screen.getByPlaceholderText("예) 새가족 모임"), "새 일정");
    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/my/schedules",
        expect.objectContaining({ title: "새 일정" }),
      ),
    );
  });

  it("일정을 삭제하면 deleteMySchedule을 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const setSchedules = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<ScheduleTab schedules={SCHEDULES} setSchedules={setSchedules} />);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/my/schedules/1"));
  });
});
