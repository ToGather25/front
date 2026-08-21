import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getCommunities, getPhotos, createCommunity, createPhoto, deletePhoto } from "./galleryService";

describe("galleryService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCommunities는 GET /churches/{churchId}/communities를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1, name: "알곡교회", desc: "" }] } });

    const result = await getCommunities("1");

    expect(api.get).toHaveBeenCalledWith("/churches/1/communities");
    expect(result).toEqual([{ id: 1, name: "알곡교회", desc: "" }]);
  });

  it("getPhotos는 GET /churches/{churchId}/gallery를 params와 함께 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getPhotos("1", { communityId: 2 });

    expect(api.get).toHaveBeenCalledWith("/churches/1/gallery", { params: { communityId: 2 } });
  });

  it("createCommunity는 POST /church/admin/communities를 정확한 payload로 호출한다", async () => {
    const payload = { name: "청년부", desc: "청년들의 모임" };
    api.post.mockResolvedValue({ data: { data: { id: 10, ...payload, orderNo: 0 } } });

    const result = await createCommunity("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/communities", payload);
    expect(result).toEqual({ id: 10, ...payload, orderNo: 0 });
  });

  it("createPhoto는 POST /church/admin/gallery를 호출하고 응답 id와 제출 폼 값을 합쳐 반환한다", async () => {
    const payload = { communityId: 2, title: "여름 수련회", date: "2026년 8월 1일", desc: "", imageUrl: "" };
    api.post.mockResolvedValue({ data: { data: { id: 20, communityId: 2, title: "여름 수련회" } } });

    const result = await createPhoto("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/gallery", payload);
    expect(result).toEqual({ ...payload, id: 20 });
  });

  it("deletePhoto는 DELETE /church/admin/gallery/{photoId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await deletePhoto("1", 20);

    expect(api.delete).toHaveBeenCalledWith("/church/admin/gallery/20");
  });
});
