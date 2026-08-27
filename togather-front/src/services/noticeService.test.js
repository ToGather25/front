import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getNotices, createNotice, updateNotice, deleteNotice } from "./noticeService";

describe("noticeService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getNotices는 1-based page를 백엔드의 0-based page로 변환해 전달한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getNotices("1", { page: 2, limit: 10 });

    expect(api.get).toHaveBeenCalledWith("/churches/1/notices", {
      params: { limit: 10, page: 1 },
    });
  });

  it("getNotices는 page가 없으면 page 파라미터 자체를 보내지 않는다(백엔드 기본값 0에 위임)", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getNotices("1", { limit: 1000 });

    expect(api.get).toHaveBeenCalledWith("/churches/1/notices", {
      params: { limit: 1000 },
    });
  });

  it("createNotice는 body를 content로 매핑해 POST /church/admin/notices를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { noticeId: 1, title: "제목", content: "내용", createdAt: "2026-08-14" } },
    });

    const result = await createNotice("1", {
      type: "공지",
      title: "제목",
      body: "내용",
      author: "사무실",
      featured: true,
    });

    expect(api.post).toHaveBeenCalledWith("/church/admin/notices", {
      title: "제목",
      content: "내용",
      type: "공지",
      featured: true,
      author: "사무실",
    });
    expect(result).toEqual({ noticeId: 1, title: "제목", content: "내용", createdAt: "2026-08-14" });
  });

  it("updateNotice는 title/content만 보낸다(type/author/featured는 보내지 않는다)", async () => {
    api.patch.mockResolvedValue({
      data: { data: { noticeId: 1, title: "수정 제목", content: "수정 내용" } },
    });

    await updateNotice("1", "1", {
      type: "공지",
      title: "수정 제목",
      body: "수정 내용",
      author: "무시됨",
      featured: false,
    });

    expect(api.patch).toHaveBeenCalledWith("/church/admin/notices/1", {
      title: "수정 제목",
      content: "수정 내용",
    });
  });

  it("deleteNotice는 DELETE /church/admin/notices/{noticeId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    const result = await deleteNotice("1", "1");

    expect(api.delete).toHaveBeenCalledWith("/church/admin/notices/1");
    expect(result).toEqual({ success: true });
  });
});
