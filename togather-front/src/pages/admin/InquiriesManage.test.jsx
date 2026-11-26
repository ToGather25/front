import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import InquiriesManage from "./InquiriesManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

import api from "@/services/api";

const PRAYERS = [
  {
    id: 1,
    type: "기도",
    title: null,
    content: "건강을 위해 기도합니다",
    status: "진행 중",
    reply: null,
    createdAt: "2026-02-10T09:00:00",
  },
];

const INQUIRIES = [
  {
    id: 7,
    title: "주차 문의",
    content: "주차장이 어디인가요",
    status: "진행 중",
    answer: null,
    createdAt: "2026-02-10T09:00:00",
  },
];

describe("InquiriesManage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/church/admin/prayers") return Promise.resolve({ data: { data: PRAYERS } });
      if (url === "/church/admin/member-inquiries")
        return Promise.resolve({ data: { data: INQUIRIES } });
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
  });

  it("기도/상담 탭에서 목록을 조회하고 답변을 저장한다", async () => {
    api.put.mockResolvedValue({ data: { data: { ...PRAYERS[0], reply: { text: "함께 기도합니다" } } } });
    const user = userEvent.setup();
    renderWithChurch(<InquiriesManage />);

    expect(await screen.findByText("건강을 위해 기도합니다")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("답변을 입력하세요."), "함께 기도합니다");
    await user.click(screen.getByRole("button", { name: "답변 저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/prayers/1/reply", {
        text: "함께 기도합니다",
      }),
    );
  });

  it("교인 문의 탭으로 전환해 답변을 저장한다", async () => {
    api.put.mockResolvedValue({ data: { data: { ...INQUIRIES[0], answer: "본당 옆 주차장입니다" } } });
    const user = userEvent.setup();
    renderWithChurch(<InquiriesManage />);

    await user.click(screen.getByRole("button", { name: "교인 문의 답변" }));
    expect(await screen.findByText("주차 문의")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("답변을 입력하세요."), "본당 옆 주차장입니다");
    await user.click(screen.getByRole("button", { name: "답변 저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/member-inquiries/7/answer", {
        answer: "본당 옆 주차장입니다",
      }),
    );
  });

  it("이미 답변이 있으면 텍스트로 보여주고 '수정'을 눌러야 편집할 수 있다", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/church/admin/prayers") {
        return Promise.resolve({
          data: {
            data: [{ ...PRAYERS[0], status: "답변 완료", reply: { author: "담당 교역자", text: "응답된 답변" } }],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
    const user = userEvent.setup();
    renderWithChurch(<InquiriesManage />);

    expect(await screen.findByText("응답된 답변")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("답변을 입력하세요.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "수정" }));
    expect(screen.getByPlaceholderText("답변을 입력하세요.")).toBeInTheDocument();
  });
});
