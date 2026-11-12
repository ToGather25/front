import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import MobileHome from "./MobileHome";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

describe("MobileHome — 모바일 홈", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("공지 알림 섹션에서 쓸 수 있도록 넉넉한 limit으로 공지를 조회한다", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("/notices")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                type: "공지",
                featured: false,
                title: "테스트 공지",
                body: "내용",
                date: "2026-08-01",
                author: "사무실",
              },
            ],
          },
        });
      }
      if (url.includes("/church/sermons")) {
        return Promise.resolve({ data: { data: { content: [], pageInfo: {} } } });
      }
      if (url.includes("/gallery")) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: [] } });
    });
    renderWithChurch(<MobileHome />, { withRouter: true });

    expect(await screen.findByText("공지 알림")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/notices"), {
      params: { limit: 10 },
    });
  });

  it("이번주 말씀 섹션에서 주일예배 설교를 조회해 성구를 보여준다", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("/church/sermons")) {
        return Promise.resolve({
          data: {
            data: {
              content: [
                {
                  id: 1,
                  worshipType: "주일 1부",
                  scripture: "로마서 9:15",
                  sermonDate: "2026-07-12",
                  preacher: "임재호",
                },
              ],
              pageInfo: {},
            },
          },
        });
      }
      if (url.includes("/gallery")) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: [] } });
    });
    renderWithChurch(<MobileHome />, { withRouter: true });
    expect(await screen.findByText("이번주 말씀")).toBeInTheDocument();
    // 출처 라인(`{sermon.scripture}`)은 실제 설교 데이터가 sundaySermon으로
    // 걸러져 ThisWeekMessageSection까지 전달됐을 때만 렌더링된다 — 목업/빈 상태로
    // 폴백하면 "아직 준비된 말씀이 없습니다"만 보이고 이 텍스트는 나오지 않는다.
    expect(await screen.findByText("로마서 9:15")).toBeInTheDocument();
  });
});
