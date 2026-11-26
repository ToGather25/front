import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import DistrictMeetingsEditor from "./DistrictMeetingsEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  districtMeetings: [
    { name: "1구역", leader: "홍길동 구역장", members: 8, time: "매주 목요일 오후 7:30", location: "구역장 댁" },
  ],
};

describe("DistrictMeetingsEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 구역 값을 입력창에 채운다(인원은 문자열로 표시)", () => {
    renderWithChurch(<DistrictMeetingsEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("1구역")).toBeInTheDocument();
    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
  });

  it("저장하면 인원을 숫자로 변환해 PUT /church/admin/intro/DISTRICT_MEETINGS를 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<DistrictMeetingsEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/intro/DISTRICT_MEETINGS", [
        { name: "1구역", leader: "홍길동 구역장", members: 8, time: "매주 목요일 오후 7:30", location: "구역장 댁" },
      ]),
    );
  });
});
