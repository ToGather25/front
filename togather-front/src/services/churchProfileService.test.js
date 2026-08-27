import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getChurchProfile, updateChurchProfile } from "./churchProfileService";

describe("churchProfileService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getChurchProfile은 GET /church/profile을 호출한다", async () => {
    api.get.mockResolvedValue({
      data: { data: { representativeImageUrl: "https://example.com/a.jpg", slogan: "환영합니다" } },
    });

    const result = await getChurchProfile("church-1");

    expect(api.get).toHaveBeenCalledWith("/church/profile");
    expect(result).toEqual({
      representativeImageUrl: "https://example.com/a.jpg",
      slogan: "환영합니다",
    });
  });

  it("updateChurchProfile은 PUT /church/admin/profile을 정확한 payload로 호출한다", async () => {
    const payload = { representativeImageUrl: "https://example.com/b.jpg", slogan: "새 슬로건" };
    api.put.mockResolvedValue({ data: { data: payload } });

    const result = await updateChurchProfile("church-1", payload);

    expect(api.put).toHaveBeenCalledWith("/church/admin/profile", payload);
    expect(result).toEqual(payload);
  });
});
