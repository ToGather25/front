vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import api from "@/services/api";
import { renderWithChurch } from "@/test/renderWithChurch";
import WordBroadcast from "./WordBroadcast";

function mockLiveScreen(data) {
  api.get.mockResolvedValue({ data: { data } });
}

describe("WordBroadcast — 실시간 예배", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("LIVE 상태면 실시간 배지와 영상, 설교 정보를 보여준다", async () => {
    mockLiveScreen({
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc12345678",
      sermon: {
        id: "s1",
        title: "부활의 능력",
        scripture: "롬 8:11",
        preacher: "김영수 담임목사",
        worshipType: "주일 1부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: true,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(
      document.querySelector('iframe[src="https://www.youtube.com/embed/abc12345678?autoplay=1"]'),
    ).toBeInTheDocument();
  });

  it("BEFORE 상태면 '곧 예배가 시작됩니다' 안내와 예정 설교 정보를 보여준다", async () => {
    mockLiveScreen({
      state: "BEFORE",
      youtubeLiveUrl: null,
      sermon: {
        id: "s2",
        title: "성령으로 충만하라",
        scripture: "엡 5:18",
        preacher: "박성민 부목사",
        worshipType: "주일 2부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("곧 예배가 시작됩니다")).toBeInTheDocument();
    expect(screen.getByText("성령으로 충만하라")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "스마트 주보 보기" })).not.toBeInTheDocument();
  });

  it("ENDED 상태면 라이브 배지 없이 다시보기 영상을 보여준다", async () => {
    mockLiveScreen({
      state: "ENDED",
      youtubeLiveUrl: "https://youtube.com/live/xyz98765432",
      sermon: {
        id: "s1",
        title: "부활의 능력",
        scripture: "롬 8:11",
        preacher: "김영수 담임목사",
        worshipType: "주일 1부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("부활의 능력")).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
  });

  it("ENDED 상태인데 videoId 파싱에 실패하면 다시보기 준비 중 안내를 보여준다", async () => {
    mockLiveScreen({
      state: "ENDED",
      youtubeLiveUrl: null,
      sermon: null,
      bulletinAvailable: false,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("다시보기 영상을 준비 중입니다")).toBeInTheDocument();
  });

  it("NONE 상태면 '오늘 예정된 예배가 없습니다' 안내를 보여준다", async () => {
    mockLiveScreen({ state: "NONE", youtubeLiveUrl: null, sermon: null, bulletinAvailable: false, recentSermons: [] });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    expect(await screen.findByText("오늘 예정된 예배가 없습니다")).toBeInTheDocument();
  });

  it("지난 설교 목록은 내부 상세 페이지로 링크된다", async () => {
    mockLiveScreen({
      state: "NONE",
      youtubeLiveUrl: null,
      sermon: null,
      bulletinAvailable: false,
      recentSermons: [{ id: "s3", title: "참된 예배", worshipType: "주일 1부", sermonDate: "2026-05-18" }],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    const link = await screen.findByRole("link", { name: /참된 예배/ });
    expect(link).toHaveAttribute("href", "/말씀/설교/s3");
  });

  it("bulletinAvailable=true일 때만 '스마트 주보 보기' 버튼이 뜨고, 클릭하면 모달이 열린다", async () => {
    mockLiveScreen({
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc12345678",
      sermon: {
        id: "s1",
        title: "부활의 능력",
        scripture: "롬 8:11",
        preacher: "김영수 담임목사",
        worshipType: "주일 1부",
        sermonDate: "2026-05-25",
      },
      bulletinAvailable: true,
      recentSermons: [],
    });

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });
    await screen.findByText("부활의 능력");

    expect(screen.queryByText("이번 주 주보")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "스마트 주보 보기" }));
    expect(screen.getByText("이번 주 주보")).toBeInTheDocument();
  });

  it("수동 방송이 없어도(NONE) 유튜브 자동 감지가 라이브면 LIVE로 표시한다", async () => {
    api.get.mockImplementation((url) =>
      url.includes("/broadcast/live")
        ? Promise.resolve({
            data: { data: { live: true, videoId: "auto1234567", title: "자동 라이브" } },
          })
        : Promise.resolve({
            data: {
              data: {
                state: "NONE",
                youtubeLiveUrl: null,
                sermon: null,
                bulletinAvailable: false,
                recentSermons: [],
              },
            },
          }),
    );

    renderWithChurch(<WordBroadcast />, { initialEntries: ["/말씀/방송"] });

    // 자동 감지 라이브 → LIVE 섹션(영상 + 진행중 안내). sermon 메타가 없으면 LIVE 배지는 없다.
    expect(await screen.findByText("지금 예배가 진행중입니다")).toBeInTheDocument();
    expect(
      document.querySelector('iframe[src="https://www.youtube.com/embed/auto1234567?autoplay=1"]'),
    ).toBeInTheDocument();
  });
});
