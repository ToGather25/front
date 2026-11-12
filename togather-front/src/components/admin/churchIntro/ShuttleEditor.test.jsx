import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import ShuttleEditor from "./ShuttleEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  transportGuide: {
    routes: [
      {
        name: "철산역 라인",
        color: "#3B5280",
        waypoints: [{ lat: 1, lng: 1, label: "철산역 7호선 1번출구", time: "06:20" }],
      },
    ],
    notes: ["차량운행 공지"],
  },
};

describe("ShuttleEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 노선/공지 값을 입력창에 채운다", () => {
    renderWithChurch(<ShuttleEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("철산역 라인")).toBeInTheDocument();
    expect(screen.getByDisplayValue("철산역 7호선 1번출구")).toBeInTheDocument();
    expect(screen.getByDisplayValue("차량운행 공지")).toBeInTheDocument();
  });

  it("저장하면 위경도 없이 label/time만 담아 PUT /church/admin/intro/SHUTTLE을 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<ShuttleEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/intro/SHUTTLE", {
        routes: [
          {
            name: "철산역 라인",
            color: "#3B5280",
            waypoints: [{ label: "철산역 7호선 1번출구", time: "06:20" }],
          },
        ],
        notes: ["차량운행 공지"],
      }),
    );
  });
});
