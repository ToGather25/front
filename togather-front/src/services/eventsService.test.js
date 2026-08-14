import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  USE_DUMMY: false,
}));

import api from "@/services/api";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getRecentEvents,
} from "./eventsService";

const EVENTS = [
  {
    id: "e1",
    title: "여름 수련회",
    department: "청년부",
    date: "2026-01-10",
    startTime: null,
    endTime: null,
    location: "본당",
    description: "청년부 여름 수련회 안내",
    imageUrl: null,
    createdAt: "2026-01-01",
    canRegister: true,
    registeredCount: 0,
  },
  {
    id: "e2",
    title: "가을 바자회",
    department: "여전도회",
    date: "2026-02-05",
    startTime: null,
    endTime: null,
    location: "교육관",
    description: "알뜰 바자회",
    imageUrl: null,
    createdAt: "2026-01-15",
    canRegister: false,
    registeredCount: 0,
  },
];

describe("eventsService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEvent는 POST /church/admin/events를 정확한 payload로 호출한다", async () => {
    const payload = { title: "새 행사", date: "2026-03-01" };
    api.post.mockResolvedValue({ data: { data: { id: "e3", ...payload } } });

    const result = await createEvent("1", payload);

    expect(api.post).toHaveBeenCalledWith("/church/admin/events", payload);
    expect(result).toEqual({ id: "e3", ...payload });
  });

  it("updateEvent는 PATCH /church/admin/events/{eventId}를 호출한다", async () => {
    const payload = { title: "수정된 제목" };
    api.patch.mockResolvedValue({ data: { data: { id: "e1", ...payload } } });

    const result = await updateEvent("1", "e1", payload);

    expect(api.patch).toHaveBeenCalledWith("/church/admin/events/e1", payload);
    expect(result).toEqual({ id: "e1", ...payload });
  });

  it("deleteEvent는 DELETE /church/admin/events/{eventId}를 호출한다", async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    const result = await deleteEvent("1", "e1");

    expect(api.delete).toHaveBeenCalledWith("/church/admin/events/e1");
    expect(result).toEqual({ success: true });
  });

  it("searchEvents는 전체 목록을 조회해 검색어로 클라이언트 필터링한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await searchEvents("1", { q: "바자회", sort: "date" });

    expect(api.get).toHaveBeenCalledWith("/churches/1/events");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e2");
  });

  it("searchEvents는 검색어가 없으면 전체 목록을 정렬만 해서 반환한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await searchEvents("1", { q: "", sort: "date" });

    expect(result).toHaveLength(2);
  });

  it("getRecentEvents는 전체 목록을 createdAt 기준 정렬해 limit만큼 반환한다", async () => {
    api.get.mockResolvedValue({ data: { data: EVENTS } });

    const result = await getRecentEvents("1", 1);

    expect(api.get).toHaveBeenCalledWith("/churches/1/events");
    expect(result).toHaveLength(1);
    // createdAt이 더 최근인 e2(2026-01-15)가 e1(2026-01-01)보다 먼저 와야 한다
    expect(result[0].id).toBe("e2");
  });
});
