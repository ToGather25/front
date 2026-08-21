import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MembersManage from "./MembersManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const PAGE_RESPONSE = {
  content: [
    {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-****-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
    },
  ],
  pageInfo: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
};

describe("MembersManage — 교인 목록 탭", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });
  });

  it("목록을 불러와 렌더링한다", async () => {
    renderWithChurch(<MembersManage />);
    expect(await screen.findByText("김은혜")).toBeInTheDocument();
  });

  it("부서/직책 필터, 교인 등록, 엑셀 다운로드, 삭제 버튼이 존재하지 않는다", async () => {
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");

    expect(screen.queryByText("부서")).not.toBeInTheDocument();
    expect(screen.queryByText("직책")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "교인 등록" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "엑셀 다운로드" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it("검색어를 입력하면 디바운스 후 keyword로 서버 검색을 호출한다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    await user.type(screen.getByPlaceholderText("이름 / 연락처 검색"), "김은혜");

    await waitFor(
      () =>
        expect(api.get).toHaveBeenCalledWith(
          "/church/admin/members",
          expect.objectContaining({ params: expect.objectContaining({ keyword: "김은혜" }) }),
        ),
      { timeout: 1000 },
    );
  });

  it("상세 버튼을 클릭하면 getMemberDetail을 호출해 모달에 상세 정보를 보여준다", async () => {
    const detail = {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-1111-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
      hasAccount: true,
    };
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");
    api.get.mockResolvedValue({ data: { data: detail } });

    await user.click(screen.getByRole("button", { name: "상세" }));

    expect(await screen.findByText("010-1111-2222")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/church/admin/members/abc-123");
  });

  it("승인 대기 탭은 기존 더미 동작 그대로 유지된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");

    await user.click(screen.getByText("승인 대기"));

    expect(screen.getByText("홍길동")).toBeInTheDocument();
    // DUMMY_PENDING에 승인 대기자가 3명이라 "승인" 버튼도 3개 렌더링된다(원본 더미 로직 그대로).
    expect(screen.getAllByRole("button", { name: "승인" }).length).toBeGreaterThan(0);
  });
});
