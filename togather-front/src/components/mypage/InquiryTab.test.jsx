import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import InquiryTab from "./InquiryTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const INQUIRIES = [
  {
    id: 1,
    title: "주소 변경 요청",
    content: "이사했습니다",
    status: "답변 완료",
    answer: "사무실 — 반영 완료했습니다.",
    createdAt: "2026-02-12T09:00:00",
  },
];

describe("InquiryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("answer 필드를 답변으로 표시한다", () => {
    renderWithChurch(<InquiryTab inquiries={INQUIRIES} setInquiries={() => {}} />);
    expect(screen.getByText("사무실 — 반영 완료했습니다.")).toBeInTheDocument();
  });

  it("문의를 등록하면 addMyInquiry를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id: 2,
          title: "새 문의",
          content: "내용입니다",
          status: "진행 중",
          answer: null,
          createdAt: "2026-03-15T09:00:00",
        },
      },
    });
    const setInquiries = vi.fn();
    const user = userEvent.setup();
    renderWithChurch(<InquiryTab inquiries={INQUIRIES} setInquiries={setInquiries} />);

    await user.click(screen.getByRole("button", { name: "문의하기" }));
    await user.type(screen.getByPlaceholderText("문의 제목을 입력해 주세요."), "새 문의");
    await user.type(screen.getByPlaceholderText("자세히 내용을 작성하여 주시면 더 도움이 됩니다."), "내용입니다");
    await user.click(screen.getByRole("button", { name: "접수" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/my/inquiries", { title: "새 문의", content: "내용입니다" }),
    );
  });
});
