import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import EventsManage from "./EventsManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const EVENT = {
  id: 1,
  title: "여름 수련회",
  department: "청년부",
  date: "2999-01-01",
  startTime: null,
  endTime: null,
  location: "본당",
  description: "설명",
  canRegister: true,
  imageUrl: null,
};

describe("EventsManage — 관리자 CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [EVENT] } });
  });

  it("목록을 불러와 렌더링하고 더미 모드 안내 문구는 표시하지 않는다", async () => {
    renderWithChurch(<EventsManage />);
    expect(await screen.findByText("여름 수련회")).toBeInTheDocument();
    expect(screen.queryByText(/더미 모드/)).not.toBeInTheDocument();
  });

  it("신청현황 컬럼은 인원수 없이 '신청가능' 배지만 표시한다", async () => {
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");
    expect(screen.getByText("신청가능")).toBeInTheDocument();
  });

  it("등록/수정 폼에 정원·신청기간 입력 필드가 없다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "행사 등록" }));

    expect(screen.queryByText("정원")).not.toBeInTheDocument();
    expect(screen.queryByText("신청 시작일")).not.toBeInTheDocument();
    expect(screen.queryByText("신청 마감일")).not.toBeInTheDocument();
  });

  it("삭제가 실패하면(신청 이력이 있는 행사) 에러 안내를 보여주고 목록은 유지된다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockRejectedValue({ response: { status: 500, data: { code: "C004" } } });
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      await screen.findByText("삭제할 수 없습니다. 이미 신청 내역이 있는 행사일 수 있습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("여름 수련회")).toBeInTheDocument();
  });
});
