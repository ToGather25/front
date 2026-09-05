import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Notice from "./Notice";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

function makeNotices(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type: "공지",
    featured: false,
    title: `공지 ${i + 1}`,
    body: "내용",
    date: "2026-08-01",
    author: "사무실",
  }));
}

const MIXED = [
  { id: 1, type: "공지", featured: false, title: "공지 1", body: "내용", date: "2026-08-01", author: "사무실" },
  { id: 2, type: "행사", featured: false, title: "행사 공지", body: "내용", date: "2026-08-02", author: "교역자실" },
];

describe("Notice — 공개 목록", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("기본 진입 시(UI 1페이지) 백엔드에는 0-based page:0, limit:10으로 조회한다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(10) } });
    renderWithChurch(<Notice />, { withRouter: true });

    await screen.findByText("공지 1");

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 10, page: 0 },
    });
  });

  it("정확히 limit만큼 받으면 다음 버튼이 활성화된다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(10) } });
    renderWithChurch(<Notice />, { withRouter: true });

    await screen.findByText("공지 1");
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeEnabled();
  });

  it("limit보다 적게 받으면 다음 버튼이 비활성화된다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(3) } });
    renderWithChurch(<Notice />, { withRouter: true });

    await screen.findByText("공지 1");
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("탭을 전환하면 limit:1000으로 재요청하고 클라이언트에서 필터링한다", async () => {
    api.get.mockResolvedValue({ data: { data: MIXED } });
    const user = userEvent.setup();
    renderWithChurch(<Notice />, { withRouter: true });
    await screen.findByText("공지 1");

    await user.click(screen.getByRole("button", { name: "행사" }));

    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith(expect.stringContaining("/notices"), {
        params: { limit: 1000 },
      }),
    );
    expect(await screen.findByText("행사 공지")).toBeInTheDocument();
    expect(screen.queryByText("공지 1")).not.toBeInTheDocument();
  });

  it("목록 항목을 클릭하면 상세 화면으로 전환되고 목록으로 버튼으로 되돌아간다", async () => {
    api.get.mockResolvedValue({ data: { data: makeNotices(2) } });
    const user = userEvent.setup();
    renderWithChurch(<Notice />, { withRouter: true });
    await screen.findByText("공지 1");

    await user.click(screen.getByText("공지 1"));
    expect(screen.getByText("내용")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "목록으로" }));
    expect(screen.queryByText("목록으로")).not.toBeInTheDocument();
  });

  it("탭을 전환하면 열려있던 상세가 닫힌 채로 유지된다(서버 응답이 매번 새 배열이어도)", async () => {
    api.get.mockImplementation(() =>
      Promise.resolve({ data: { data: MIXED.map((n) => ({ ...n })) } }),
    );
    const user = userEvent.setup();
    renderWithChurch(<Notice />, { withRouter: true });
    await screen.findByText("공지 1");

    await user.click(screen.getByText("공지 1"));
    expect(screen.getByText("내용")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "행사" }));

    await waitFor(() => expect(screen.queryByText("목록으로")).not.toBeInTheDocument());
  });

  it("첫 페이지 밖의 공지로 딥링크하면 limit:1000으로 조회해 상세를 연다", async () => {
    const notices = makeNotices(20);
    api.get.mockImplementation(() => Promise.resolve({ data: { data: notices } }));
    renderWithChurch(<Notice />, { withRouter: true, initialEntries: ["/공지사항?id=15"] });

    // 상세로 전환되기 전, id로 필터링되지 않은 목록이 잠깐 렌더될 수 있어(둘 다 같은 텍스트를
    // 가짐) 목록에는 없는 heading 역할(h2, 상세 화면 전용)로 안정적으로 대기한다.
    expect(
      await screen.findByRole("heading", { name: "공지 15" }),
    ).toBeInTheDocument();

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 1000 },
    });
    expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 10, page: 0 },
    });
  });
});
