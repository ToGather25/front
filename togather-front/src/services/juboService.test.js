import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import {
  getJuboInfo,
  getWorshipServices,
  getWorshipOrder,
  getVolunteer,
  getOffering,
  getSupport,
  getDistricts,
  getMinisters,
  createJuboIssue,
  updateJuboSection,
  publishJubo,
} from "./juboService";

describe("juboService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getJuboInfo는 GET /churches/{churchId}/jubo/current를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
    const result = await getJuboInfo("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/current");
    expect(result).toEqual({ issueNo: "제10-7", date: "2026년 2월 15일" });
  });

  it("getWorshipServices는 GET .../worship-services를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [{ label: "주일 오전예배", time: "오전 9:00" }] } });
    const result = await getWorshipServices("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/worship-services");
    expect(result).toEqual([{ label: "주일 오전예배", time: "오전 9:00" }]);
  });

  it("getWorshipOrder는 serviceType 없이 GET .../worship-order를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: { "주일 오전예배": [] } } });
    await getWorshipOrder("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/worship-order");
  });

  it("getVolunteer는 GET .../volunteer를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getVolunteer("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/volunteer");
  });

  it("getOffering는 GET .../offering을 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getOffering("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/offering");
  });

  it("getSupport는 GET .../support를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getSupport("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/support");
  });

  it("getDistricts는 GET .../districts를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getDistricts("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/districts");
  });

  it("getMinisters는 GET .../ministers를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await getMinisters("church-1");
    expect(api.get).toHaveBeenCalledWith("/churches/church-1/jubo/ministers");
  });

  it("createJuboIssue는 POST /church/admin/jubo를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 1, issueNo: "제10-8", juboDate: "2026-06-01", published: false } },
    });
    const result = await createJuboIssue("church-1", { issueNo: "제10-8", juboDate: "2026-06-01" });
    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo", {
      issueNo: "제10-8",
      juboDate: "2026-06-01",
    });
    expect(result).toEqual({ id: 1, issueNo: "제10-8", juboDate: "2026-06-01", published: false });
  });

  it("updateJuboSection은 PUT /church/admin/jubo/{juboId}/sections/{type}을 호출한다", async () => {
    api.put.mockResolvedValue({ data: null });
    await updateJuboSection("church-1", 1, "VOLUNTEER", [{ role: "대표기도" }]);
    expect(api.put).toHaveBeenCalledWith("/church/admin/jubo/1/sections/VOLUNTEER", [
      { role: "대표기도" },
    ]);
  });

  it("publishJubo는 POST /church/admin/jubo/{juboId}/publish를 호출한다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 1, issueNo: "제10-8", juboDate: "2026-06-01", published: true } },
    });
    const result = await publishJubo("church-1", 1);
    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo/1/publish");
    expect(result.published).toBe(true);
  });
});
