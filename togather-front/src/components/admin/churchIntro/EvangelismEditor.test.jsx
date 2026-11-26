import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import EvangelismEditor from "./EvangelismEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  evangelism: {
    description: "전도회 소개 문구",
    leader: { name: "홍길동 집사", tel: "010-0000-0000" },
    schedule: "매주 토요일 오전 9:30",
    activities: [{ name: "노방전도", schedule: "매주 토요일", location: "교회 주변" }],
  },
};

describe("EvangelismEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 값을 입력창에 채운다", () => {
    renderWithChurch(<EvangelismEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("전도회 소개 문구")).toBeInTheDocument();
    expect(screen.getByDisplayValue("홍길동 집사")).toBeInTheDocument();
    expect(screen.getByDisplayValue("노방전도")).toBeInTheDocument();
  });

  it("저장하면 빈 행은 제외하고 PUT /church/admin/intro/EVANGELISM을 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<EvangelismEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/EVANGELISM",
        expect.objectContaining({
          description: "전도회 소개 문구",
          leader: { name: "홍길동 집사", tel: "010-0000-0000" },
          activities: [{ name: "노방전도", schedule: "매주 토요일", location: "교회 주변" }],
        }),
      ),
    );
  });
});
