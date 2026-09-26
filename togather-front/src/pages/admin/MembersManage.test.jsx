import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MembersManage from "./MembersManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
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

const PENDING_RESPONSE = [
  {
    requestId: 101,
    name: "홍길동",
    phone: "010-1111-2222",
    birthDate: "1990-05-12",
    newcomer: true,
    status: "PENDING",
    requestedAt: "2026-07-08T09:00:00Z",
  },
];

describe("MembersManage — 교인 목록 탭", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) =>
      url === "/church/admin/signup-requests"
        ? Promise.resolve({ data: { data: PENDING_RESPONSE } })
        : Promise.resolve({ data: { data: PAGE_RESPONSE } }),
    );
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

  it("승인 대기 탭은 GET /church/admin/signup-requests 결과를 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");

    await user.click(screen.getByText("승인 대기"));

    expect(await screen.findByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("2026.07.08")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/church/admin/signup-requests", {
      params: { status: "PENDING" },
    });
  });

  it("승인을 누르면 approve를 호출하고 목록을 다시 불러온다", async () => {
    api.post.mockResolvedValue({ data: { data: {} } });
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");
    await user.click(screen.getByText("승인 대기"));
    await screen.findByText("홍길동");

    // 승인 후 재조회에서는 대기자가 비어 있다
    api.get.mockImplementation((url) =>
      url === "/church/admin/signup-requests"
        ? Promise.resolve({ data: { data: [] } })
        : Promise.resolve({ data: { data: PAGE_RESPONSE } }),
    );
    await user.click(screen.getByRole("button", { name: "승인" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/church/admin/signup-requests/101/approve"),
    );
    expect(await screen.findByText("대기 중인 가입 신청이 없습니다.")).toBeInTheDocument();
  });

  it("거절이 실패하면 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");
    await user.click(screen.getByText("승인 대기"));
    await screen.findByText("홍길동");

    await user.click(screen.getByRole("button", { name: "거절" }));

    expect(
      await screen.findByText("거절에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("상세 조회 중 에러가 발생하면 모달이 '정보를 찾을 수 없습니다.'로 표시되고 로딩 상태에 영원히 머무르지 않는다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MembersManage />);
    await screen.findByText("김은혜");

    // getMemberDetail이 reject하도록 모킹
    api.get.mockRejectedValueOnce(new Error("network error"));

    await user.click(screen.getByRole("button", { name: "상세" }));

    // 에러 시 "정보를 찾을 수 없습니다."가 표시되어야 함
    expect(await screen.findByText("정보를 찾을 수 없습니다.")).toBeInTheDocument();

    // "불러오는 중..."은 사라져야 함
    expect(screen.queryByText("불러오는 중...")).not.toBeInTheDocument();
  });
});
