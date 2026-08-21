vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: vi.fn(() => false),
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import api, { isDummy } from "@/services/api";
import {
  createSermon,
  updateSermon,
  deleteSermon,
  scheduleBroadcast,
  startBroadcast,
  endBroadcast,
  extractYoutubeVideoId,
  getLiveScreen,
  searchSermons,
  getSermonDetail,
} from "./sermonService";
import { DUMMY_LIVE_SCREEN, DUMMY_ADMIN_SERMONS } from "@/data/dummy/sermons";

describe("sermonService — 관리자 CRUD + 방송 (실 API 경로)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isDummy.mockReturnValue(false);
  });

  it("createSermon은 POST /church/admin/sermons를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 설교", sermonDate: "2026-06-01" };
    api.post.mockResolvedValue({ data: { data: { id: "s10", ...payload } } });

    const result = await createSermon("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/sermons", payload);
    expect(result).toEqual({ id: "s10", ...payload });
  });

  it("updateSermon은 PATCH /church/admin/sermons/{publicId}를 호출한다", async () => {
    const payload = { title: "수정된 제목" };
    api.patch.mockResolvedValue({ data: { data: { id: "s1", ...payload } } });

    const result = await updateSermon("1", "s1", payload);

    expect(api.patch).toHaveBeenCalledWith("/church/admin/sermons/s1", payload);
    expect(result).toEqual({ id: "s1", ...payload });
  });

  it("deleteSermon은 DELETE /church/admin/sermons/{publicId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await deleteSermon("1", "s1");

    expect(api.delete).toHaveBeenCalledWith("/church/admin/sermons/s1");
  });

  it("scheduleBroadcast는 POST /church/admin/broadcasts를 정확한 payload로 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1, status: "BEFORE" } } });

    const result = await scheduleBroadcast("1", {
      sermonId: "s1",
      youtubeLiveUrl: "https://youtube.com/live/abc",
      scheduledStartAt: "2026-06-01T09:00:00Z",
    });

    expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts", {
      sermonId: "s1",
      youtubeLiveUrl: "https://youtube.com/live/abc",
      scheduledStartAt: "2026-06-01T09:00:00Z",
    });
    expect(result).toEqual({ id: 1, status: "BEFORE" });
  });

  it("startBroadcast는 POST /church/admin/broadcasts/{id}/start를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1, status: "LIVE" } } });

    const result = await startBroadcast("1", 1);

    expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts/1/start");
    expect(result).toEqual({ id: 1, status: "LIVE" });
  });

  it("endBroadcast는 POST /church/admin/broadcasts/{id}/end를 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1, status: "ENDED" } } });

    const result = await endBroadcast("1", 1);

    expect(api.post).toHaveBeenCalledWith("/church/admin/broadcasts/1/end");
    expect(result).toEqual({ id: 1, status: "ENDED" });
  });
});

describe("extractYoutubeVideoId", () => {
  it("watch URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("live URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://youtube.com/live/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("youtu.be 단축 URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("embed URL에서 videoId를 추출한다", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("null/undefined는 null을 반환한다", () => {
    expect(extractYoutubeVideoId(null)).toBeNull();
    expect(extractYoutubeVideoId(undefined)).toBeNull();
  });

  it("매치되지 않는 URL은 null을 반환한다", () => {
    expect(extractYoutubeVideoId("https://example.com/video")).toBeNull();
  });
});

describe("getLiveScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("더미 모드면 DUMMY_LIVE_SCREEN을 반환한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await getLiveScreen("1");
    expect(result).toEqual(DUMMY_LIVE_SCREEN);
  });

  it("실 API 모드면 GET /church/sermons/live를 호출한다", async () => {
    isDummy.mockReturnValue(false);
    const responseData = {
      state: "LIVE",
      youtubeLiveUrl: "https://youtube.com/live/abc",
      sermon: null,
      bulletinAvailable: true,
      recentSermons: [],
    };
    api.get.mockResolvedValue({ data: { data: responseData } });

    const result = await getLiveScreen("1");

    expect(api.get).toHaveBeenCalledWith("/church/sermons/live");
    expect(result).toEqual(responseData);
  });
});

describe("searchSermons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("더미 모드면 keyword로 제목을 필터링한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await searchSermons("1", { keyword: "부활" });
    expect(result.sermons).toEqual(DUMMY_ADMIN_SERMONS.filter((s) => s.title.includes("부활")));
  });

  it("더미 모드면 worshipType으로 필터링한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await searchSermons("1", { worshipType: "수요 예배" });
    expect(result.sermons.length).toBeGreaterThan(0);
    expect(result.sermons.every((s) => s.worshipType === "수요 예배")).toBe(true);
  });

  it("더미 모드면 page/size로 페이지네이션한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await searchSermons("1", { page: 1, size: 2 });
    expect(result.sermons).toHaveLength(2);
    expect(result.pageInfo.totalPages).toBe(Math.ceil(DUMMY_ADMIN_SERMONS.length / 2));
  });

  it("실 API 모드면 GET /church/sermons를 1-based→0-based 변환된 page로 호출한다", async () => {
    isDummy.mockReturnValue(false);
    api.get.mockResolvedValue({
      data: { data: { content: [], pageInfo: { page: 1, size: 12, totalElements: 0, totalPages: 0 } } },
    });

    await searchSermons("1", { keyword: "은혜", worshipType: "주일 1부", page: 2, size: 12 });

    expect(api.get).toHaveBeenCalledWith("/church/sermons", {
      params: { keyword: "은혜", worshipType: "주일 1부", page: 1, size: 12 },
    });
  });
});

describe("getSermonDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("더미 모드면 id로 찾아 반환한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await getSermonDetail("1", "s1");
    expect(result).toEqual(DUMMY_ADMIN_SERMONS.find((s) => s.id === "s1"));
  });

  it("더미 모드에서 없는 id면 null을 반환한다", async () => {
    isDummy.mockReturnValue(true);
    const result = await getSermonDetail("1", "존재하지-않는-id");
    expect(result).toBeNull();
  });

  it("실 API 모드면 GET /church/sermons/{publicId}를 호출한다", async () => {
    isDummy.mockReturnValue(false);
    const sermon = { id: "s1", title: "부활의 능력" };
    api.get.mockResolvedValue({ data: { data: sermon } });

    const result = await getSermonDetail("1", "s1");

    expect(api.get).toHaveBeenCalledWith("/church/sermons/s1");
    expect(result).toEqual(sermon);
  });
});
