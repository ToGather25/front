import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import FloorGuideEditor from "./FloorGuideEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = { floorGuide: [{ floor: "2층", rooms: "본당, 자모실", image: null }] };

describe("FloorGuideEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 층별 안내 값을 입력창에 채운다", () => {
    renderWithChurch(<FloorGuideEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("2층")).toBeInTheDocument();
    expect(screen.getByDisplayValue("본당, 자모실")).toBeInTheDocument();
  });

  it("저장하면 PUT /church/admin/intro/FLOOR_GUIDE를 배열 그대로 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<FloorGuideEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/intro/FLOOR_GUIDE", [
        { floor: "2층", rooms: "본당, 자모실", image: null },
      ]),
    );
  });
});
