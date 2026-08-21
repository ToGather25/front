import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import PrayerTab from "./PrayerTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const PRAYERS = [
  { id: 1, type: "기도", content: "건강을 위해 기도합니다", status: "답변 완료", createdAt: "2026-02-10T09:00:00" },
];

describe("PrayerTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("제목과 답변 텍스트를 표시하지 않는다", () => {
    renderWithChurch(<PrayerTab prayers={PRAYERS} setPrayers={() => {}} />);
    expect(screen.getByText("건강을 위해 기도합니다")).toBeInTheDocument();
    expect(screen.queryByText("답변:")).not.toBeInTheDocument();
  });

  it("신청 시 유형을 선택할 수 있고 addMyPrayer를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 2, type: "상담", content: "고민이 있습니다", status: "답변 대기", createdAt: "2026-03-15T09:00:00" } },
    });
    const setPrayers = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<PrayerTab prayers={PRAYERS} setPrayers={setPrayers} />);

    await user.click(screen.getByRole("button", { name: "신청하기" }));
    // "상담" 버튼이 목록 위 필터 칩(전체/기도/상담)과 모달 안 유형 선택 버튼 두 곳에 렌더된다.
    // 모달은 JSX 트리 마지막에 조건부 렌더되므로 DOM 순서상 두 번째("상담" 필터 다음)가 모달 것이다.
    const typeButtons = screen.getAllByRole("button", { name: "상담" });
    await user.click(typeButtons[typeButtons.length - 1]);
    await user.type(screen.getByPlaceholderText("기도 제목을 간략히 작성해 주세요."), "고민이 있습니다");
    await user.click(screen.getByRole("button", { name: "신청" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/my/prayers", { type: "상담", content: "고민이 있습니다" }),
    );
  });
});
