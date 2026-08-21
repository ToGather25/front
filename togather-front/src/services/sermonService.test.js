vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import api from "@/services/api";
import {
  createSermon,
  updateSermon,
  deleteSermon,
  scheduleBroadcast,
  startBroadcast,
  endBroadcast,
} from "./sermonService";

describe("sermonService — 관리자 CRUD + 방송 (실 API 경로)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
