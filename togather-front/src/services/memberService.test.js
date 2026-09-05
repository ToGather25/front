import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { getMembers, getMemberDetail } from "./memberService";

const PAGE_RESPONSE = {
  content: [
    {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-****-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
    },
  ],
  pageInfo: {
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
};

describe("memberService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMembers는 1-based page를 0-based로 변환해 GET /church/admin/members를 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    const result = await getMembers("1", { page: 2, size: 20 });

    expect(api.get).toHaveBeenCalledWith("/church/admin/members", {
      params: { keyword: undefined, page: 1, size: 20 },
    });
    expect(result).toEqual({ members: PAGE_RESPONSE.content, pageInfo: PAGE_RESPONSE.pageInfo });
  });

  it("getMembers는 keyword 파라미터를 그대로 전달한다", async () => {
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    await getMembers("1", { keyword: "김은혜", page: 1, size: 20 });

    expect(api.get).toHaveBeenCalledWith("/church/admin/members", {
      params: { keyword: "김은혜", page: 0, size: 20 },
    });
  });

  it("getMembers는 page/size 생략 시 1페이지/20건 기본값으로 호출한다", async () => {
    api.get.mockResolvedValue({ data: { data: PAGE_RESPONSE } });

    await getMembers("1");

    expect(api.get).toHaveBeenCalledWith("/church/admin/members", {
      params: { keyword: undefined, page: 0, size: 20 },
    });
  });

  it("getMemberDetail은 GET /church/admin/members/{publicId}를 호출한다", async () => {
    const detail = {
      id: "abc-123",
      name: "김은혜",
      birthDate: "1985-03-12",
      phone: "010-1111-2222",
      newcomer: false,
      registeredAt: "2021-02-01T09:00:00",
      hasAccount: true,
    };
    api.get.mockResolvedValue({ data: { data: detail } });

    const result = await getMemberDetail("1", "abc-123");

    expect(api.get).toHaveBeenCalledWith("/church/admin/members/abc-123");
    expect(result).toEqual(detail);
  });
});
