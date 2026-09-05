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

const EVENT_NO_LOCATION = {
  ...EVENT,
  id: 2,
  title: "온라인 예배",
  location: null,
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

  it("신청현황 컬럼에 '신청가능' 배지와 신청 인원/정원을 표시한다", async () => {
    api.get.mockResolvedValue({
      data: { data: [{ ...EVENT, capacity: 50, registeredCount: 12 }] },
    });
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");
    expect(screen.getByText("신청가능")).toBeInTheDocument();
    expect(screen.getByText("12 / 50명")).toBeInTheDocument();
  });

  it("정원이 없는 행사는 '명'만 표시한다", async () => {
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");
    expect(screen.getByText("0명")).toBeInTheDocument();
  });

  it("등록 폼은 기본적으로 정원·신청기간 입력 필드를 숨기고, 신청 받기를 체크하면 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "행사 등록" }));
    expect(screen.queryByText("정원")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "신청 받기" }));

    expect(screen.getByText("정원")).toBeInTheDocument();
    expect(screen.getByText("신청 시작일")).toBeInTheDocument();
    expect(screen.getByText("신청 마감일")).toBeInTheDocument();
  });

  it("신청 이력이 있는 행사를 삭제하면(409/EV003) 구체적인 에러 안내를 보여주고 목록은 유지된다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockRejectedValue({ response: { status: 409, data: { code: "EV003" } } });
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      await screen.findByText("신청 이력이 있는 행사는 삭제할 수 없습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("여름 수련회")).toBeInTheDocument();
  });

  it("그 외 삭제 실패는 일반 에러 안내를 보여준다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockRejectedValue({ response: { status: 500, data: { code: "C004" } } });
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      await screen.findByText("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("신청자 버튼을 누르면 신청자 명단을 조회해 보여준다", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [EVENT] } })
      .mockResolvedValueOnce({
        data: { data: [{ name: "홍길동", phone: "010-1234-5678" }] },
      });
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "신청자" }));

    expect(api.get).toHaveBeenCalledWith("/church/admin/events/1/registrations");
    expect(await screen.findByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("010-1234-5678")).toBeInTheDocument();
  });

  it("location이 null인 행사가 있어도 검색 시 크래시하지 않고 정상 렌더링된다", async () => {
    api.get.mockResolvedValue({ data: { data: [EVENT, EVENT_NO_LOCATION] } });
    const user = userEvent.setup();
    renderWithChurch(<EventsManage />);
    await screen.findByText("여름 수련회");
    expect(screen.getByText("온라인 예배")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("행사명 / 장소 검색"), "여름");

    expect(screen.getByText("여름 수련회")).toBeInTheDocument();
    expect(screen.queryByText("온라인 예배")).not.toBeInTheDocument();
  });
});
