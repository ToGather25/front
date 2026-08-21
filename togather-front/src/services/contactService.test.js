import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";
import { submitContact } from "./contactService";

describe("contactService — 실 API 경로", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submitContact는 POST /churches/{churchId}/contact를 정확한 payload로 호출한다", async () => {
    api.post.mockResolvedValue({ data: { data: { contactId: 1 } } });

    const payload = {
      name: "홍길동",
      phone: "010-0000-0000",
      email: "hong@example.com",
      category: "예배 및 행사",
      message: "문의합니다",
    };
    const result = await submitContact("1", payload);

    expect(api.post).toHaveBeenCalledWith("/churches/1/contact", payload);
    expect(result).toEqual({ contactId: 1 });
  });
});
