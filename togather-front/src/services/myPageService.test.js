import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import {
  getMySchedules,
  addMySchedule,
  deleteMySchedule,
  getMyPrayers,
  addMyPrayer,
  getMyInquiries,
  addMyInquiry,
  withdrawAccount,
} from "./myPageService";

describe("myPageService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMySchedules는 GET /my/schedules를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1, title: "모임", date: "2026-03-01", memo: "" }] } });

    const result = await getMySchedules("1");

    expect(api.get).toHaveBeenCalledWith("/my/schedules");
    expect(result).toEqual([{ id: 1, title: "모임", date: "2026-03-01", memo: "" }]);
  });

  it("addMySchedule은 POST /my/schedules를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 일정", date: "2026-03-15", memo: "본당" };
    api.post.mockResolvedValue({ data: { data: { id: 10, ...payload } } });

    const result = await addMySchedule("1", payload);

    expect(api.post).toHaveBeenCalledWith("/my/schedules", payload);
    expect(result).toEqual({ id: 10, ...payload });
  });

  it("deleteMySchedule은 DELETE /my/schedules/{id}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await deleteMySchedule("1", 10);

    expect(api.delete).toHaveBeenCalledWith("/my/schedules/10");
  });

  it("getMyPrayers는 GET /my/prayers를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getMyPrayers("1");

    expect(api.get).toHaveBeenCalledWith("/my/prayers");
  });

  it("addMyPrayer는 POST /my/prayers를 정확한 payload로 호출한다", async () => {
    const payload = { type: "상담", content: "고민이 있습니다" };
    api.post.mockResolvedValue({ data: { data: { id: 20, ...payload, status: "답변 대기", createdAt: "2026-03-15T09:00:00" } } });

    const result = await addMyPrayer("1", payload);

    expect(api.post).toHaveBeenCalledWith("/my/prayers", payload);
    expect(result.status).toBe("답변 대기");
  });

  it("getMyInquiries는 GET /my/inquiries를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getMyInquiries("1");

    expect(api.get).toHaveBeenCalledWith("/my/inquiries");
  });

  it("addMyInquiry는 POST /my/inquiries를 정확한 payload로 호출한다", async () => {
    const payload = { title: "문의합니다", content: "내용입니다" };
    api.post.mockResolvedValue({ data: { data: { id: 30, ...payload, status: "진행 중", answer: null, createdAt: "2026-03-15T09:00:00" } } });

    const result = await addMyInquiry("1", payload);

    expect(api.post).toHaveBeenCalledWith("/my/inquiries", payload);
    expect(result.status).toBe("진행 중");
  });

  it("withdrawAccount는 DELETE /my/account를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: null });

    await withdrawAccount("1");

    expect(api.delete).toHaveBeenCalledWith("/my/account");
  });
});
