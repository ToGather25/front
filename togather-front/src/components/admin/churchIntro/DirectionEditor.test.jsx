import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import DirectionEditor from "./DirectionEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  address: "경기도 부천시",
  location: { level: 3 },
  publicTransit: [{ subway: "1호선 역곡역 1번출구", bus: "19번 버스", dropoff: "LH 8단지 하차" }],
  parking: {
    lots: [{ name: "교회 주차장", details: [{ label: "주차 요금", value: "무료" }] }],
  },
};

describe("DirectionEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 대중교통/주차 값을 입력창에 채운다", () => {
    renderWithChurch(<DirectionEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("1호선 역곡역 1번출구")).toBeInTheDocument();
    expect(screen.getByDisplayValue("교회 주차장")).toBeInTheDocument();
  });

  it("저장하면 PARKING과 DIRECTIONS 두 섹션을 함께 PUT한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<DirectionEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/DIRECTIONS",
        expect.arrayContaining([expect.objectContaining({ subway: "1호선 역곡역 1번출구" })]),
      );
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/PARKING",
        expect.objectContaining({ lots: expect.arrayContaining([expect.objectContaining({ name: "교회 주차장" })]) }),
      );
    });
  });
});
