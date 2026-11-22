import { describe, it, expect, vi } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn() },
}));

import api from "@/services/api";
import { fetchKakaoStaticMapDataUrl } from "./kakaoStaticMap";

describe("fetchKakaoStaticMapDataUrl", () => {
  it("churchId가 없으면 요청 없이 null을 반환한다", async () => {
    const result = await fetchKakaoStaticMapDataUrl(undefined);
    expect(result).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("서버 map-image 엔드포인트를 blob으로 요청해 data URL로 변환한다", async () => {
    const blob = new Blob(["png-bytes"], { type: "image/png" });
    api.get.mockResolvedValue({ data: blob });

    const result = await fetchKakaoStaticMapDataUrl("church-1", { level: 4 });

    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/map-image", {
      params: { level: 4 },
      responseType: "blob",
    });
    expect(result).toMatch(/^data:/);
  });

  it("요청이 실패하면 null을 반환한다", async () => {
    api.get.mockRejectedValue(new Error("network error"));
    const result = await fetchKakaoStaticMapDataUrl("church-1");
    expect(result).toBeNull();
  });
});
