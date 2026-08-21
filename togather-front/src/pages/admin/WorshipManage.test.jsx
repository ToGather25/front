import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import WorshipManage from "./WorshipManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("WorshipManage — 설교 관리자 CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("조회수 컬럼이 없다", async () => {
    renderWithChurch(<WorshipManage />);
    expect(screen.queryByText("조회")).not.toBeInTheDocument();
  });

  it("설교 등록 모달에 유튜브 영상 ID 입력 필드가 있다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));

    expect(screen.getByText("유튜브 영상 ID")).toBeInTheDocument();
  });

  it("설교를 등록하면 createSermon을 호출하고 목록에 추가된다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id: "s10",
          sermonDate: "2026-06-01",
          worshipType: "주일 1부",
          title: "새 설교",
          preacher: "홍길동 목사",
          scripture: "요 1:1",
          youtubeVideoId: "",
        },
      },
    });
    const user = userEvent.setup();
    const { container } = renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "새 설교");
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: "2026-06-01" },
    });
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("새 설교")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/sermons",
      expect.objectContaining({ title: "새 설교" }),
    );
  });

  it("설교를 삭제하면 deleteSermon을 호출하고 목록에서 사라진다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id: "s10",
          sermonDate: "2026-06-01",
          worshipType: "주일 1부",
          title: "삭제될 설교",
          preacher: "",
          scripture: "",
          youtubeVideoId: "",
        },
      },
    });
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    const { container } = renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "삭제될 설교");
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: "2026-06-01" },
    });
    await user.click(screen.getByRole("button", { name: "등록" }));
    await screen.findByText("삭제될 설교");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/church/admin/sermons/s10"));
    expect(screen.queryByText("삭제될 설교")).not.toBeInTheDocument();
  });

  it("방송 버튼을 클릭해 예약하면 상태 배지와 시작 버튼이 나타난다", async () => {
    api.post
      .mockResolvedValueOnce({
        data: {
          data: {
            id: "s10",
            sermonDate: "2026-06-01",
            worshipType: "주일 1부",
            title: "방송용 설교",
            preacher: "",
            scripture: "",
            youtubeVideoId: "",
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { id: 1, status: "BEFORE" } } });
    const user = userEvent.setup();
    const { container } = renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "방송용 설교");
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: "2026-06-01" },
    });
    await user.click(screen.getByRole("button", { name: "등록" }));
    await screen.findByText("방송용 설교");

    await user.click(screen.getByRole("button", { name: "방송" }));
    await user.type(screen.getByPlaceholderText("https://youtube.com/live/..."), "https://youtube.com/live/xyz");
    await user.type(screen.getByLabelText("예정 시각"), "2026-06-01T09:00");
    await user.click(screen.getByRole("button", { name: "예약" }));

    expect(await screen.findByText("예약됨")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "방송 시작" })).toBeInTheDocument();
  });

  it("설교를 수정하면 updateSermon을 호출하고 목록의 제목이 바뀐다", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        data: {
          id: "s10",
          sermonDate: "2026-06-01",
          worshipType: "주일 1부",
          title: "원래 제목",
          preacher: "홍길동 목사",
          scripture: "요 1:1",
          youtubeVideoId: "",
        },
      },
    });
    api.patch.mockResolvedValueOnce({
      data: {
        data: {
          id: "s10",
          sermonDate: "2026-06-01",
          worshipType: "주일 1부",
          title: "수정된 제목",
          preacher: "홍길동 목사",
          scripture: "요 1:1",
          youtubeVideoId: "",
        },
      },
    });
    const user = userEvent.setup();
    const { container } = renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "원래 제목");
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: "2026-06-01" },
    });
    await user.click(screen.getByRole("button", { name: "등록" }));
    await screen.findByText("원래 제목");

    await user.click(screen.getByRole("button", { name: "수정" }));

    const titleInput = screen.getByPlaceholderText("설교 제목 입력");
    expect(titleInput).toHaveValue("원래 제목");
    await user.clear(titleInput);
    await user.type(titleInput, "수정된 제목");
    // 모달의 제출 버튼과 목록 행의 "수정" 버튼이 동시에 존재하므로,
    // DOM 순서상 먼저 렌더링되는 모달 쪽(첫 번째)을 선택한다.
    const submitButtons = screen.getAllByRole("button", { name: "수정" });
    await user.click(submitButtons[0]);

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/church/admin/sermons/s10",
        expect.objectContaining({ title: "수정된 제목" }),
      ),
    );
    expect(await screen.findByText("수정된 제목")).toBeInTheDocument();
    expect(screen.queryByText("원래 제목")).not.toBeInTheDocument();
  });

  it("방송 시작 후 종료하면 배지와 버튼이 각 단계에 맞게 바뀐다", async () => {
    api.post
      .mockResolvedValueOnce({
        data: {
          data: {
            id: "s10",
            sermonDate: "2026-06-01",
            worshipType: "주일 1부",
            title: "방송용 설교",
            preacher: "",
            scripture: "",
            youtubeVideoId: "",
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { id: 1, status: "BEFORE" } } })
      .mockResolvedValueOnce({ data: { data: { id: 1, status: "LIVE" } } })
      .mockResolvedValueOnce({ data: { data: { id: 1, status: "ENDED" } } });
    const user = userEvent.setup();
    const { container } = renderWithChurch(<WorshipManage />);

    await user.click(screen.getByRole("button", { name: "설교 등록" }));
    await user.type(screen.getByPlaceholderText("설교 제목 입력"), "방송용 설교");
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: "2026-06-01" },
    });
    await user.click(screen.getByRole("button", { name: "등록" }));
    await screen.findByText("방송용 설교");

    await user.click(screen.getByRole("button", { name: "방송" }));
    await user.type(screen.getByPlaceholderText("https://youtube.com/live/..."), "https://youtube.com/live/xyz");
    await user.type(screen.getByLabelText("예정 시각"), "2026-06-01T09:00");
    await user.click(screen.getByRole("button", { name: "예약" }));
    await screen.findByText("예약됨");

    await user.click(screen.getByRole("button", { name: "방송 시작" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts/1/start"),
    );
    expect(await screen.findByText("방송 중")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "방송 종료" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "방송 종료" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts/1/end"),
    );
    expect(await screen.findByText("종료됨")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "방송 종료" })).not.toBeInTheDocument();
  });
});
