import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import NoticesManage from "./NoticesManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const NOTICE = {
  id: 1,
  type: "공지",
  featured: true,
  title: "기존 공지",
  body: "기존 내용",
  date: "2026-08-01",
  author: "사무국",
};

describe("NoticesManage — 관리자 CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [NOTICE] } });
  });

  it("목록을 불러와 렌더링하고 조회 컬럼은 표시하지 않는다", async () => {
    renderWithChurch(<NoticesManage />);
    expect(await screen.findByText("기존 공지")).toBeInTheDocument();
    expect(screen.queryByText("조회")).not.toBeInTheDocument();
  });

  it("공지 등록 시 createNotice(POST)를 호출하고 목록을 다시 불러온다", async () => {
    api.post.mockResolvedValue({
      data: { data: { noticeId: 2, title: "새 공지", content: "새 내용", createdAt: "2026-08-14" } },
    });
    const user = userEvent.setup();
    renderWithChurch(<NoticesManage />);
    await screen.findByText("기존 공지");

    await user.click(screen.getByRole("button", { name: "공지 등록" }));
    await user.type(screen.getByPlaceholderText("공지 제목"), "새 공지");
    await user.type(screen.getByPlaceholderText("공지 내용을 입력하세요"), "새 내용");
    await user.click(screen.getByRole("button", { name: "등록" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/church/admin/notices",
        expect.objectContaining({ title: "새 공지", content: "새 내용" }),
      ),
    );
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });

  it("수정 모달에서는 구분/작성자/상단고정이 읽기전용으로 표시된다(입력 요소 없음)", async () => {
    const user = userEvent.setup();
    renderWithChurch(<NoticesManage />);
    await screen.findByText("기존 공지");

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByText("공지 수정")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("작성자")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("공지 제목")).toBeInTheDocument();
  });

  it("공지 삭제 시 deleteNotice(DELETE)를 호출하고 목록을 다시 불러온다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<NoticesManage />);
    await screen.findByText("기존 공지");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/church/admin/notices/1"));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });
});
