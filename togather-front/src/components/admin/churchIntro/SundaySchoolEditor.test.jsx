import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import SundaySchoolEditor from "./SundaySchoolEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  sundaySchool: [
    {
      key: "유치부",
      ageRange: "만 4–7세",
      worship: { time: "주일 오전 11:00", location: "유치부실 (2층)" },
      pastor: { name: "김전도사", role: "유치부 전도사", tel: "010-0000-0000", image: null },
      vision: "하나님을 사랑하는 어린이",
      description: "유치부 소개",
      activities: ["주일 예배", "VBS"],
      bgImage: null,
    },
  ],
};

describe("SundaySchoolEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 부서 값을 입력창에 채운다", () => {
    renderWithChurch(<SundaySchoolEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("유치부")).toBeInTheDocument();
    expect(screen.getByDisplayValue("만 4–7세")).toBeInTheDocument();
    expect(screen.getByDisplayValue("김전도사")).toBeInTheDocument();
    expect(screen.getByLabelText("부서 1 주요 활동")).toHaveValue("주일 예배\nVBS");
  });

  it("부서를 추가하고 저장하면 PUT /church/admin/intro/SUNDAY_SCHOOL을 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<SundaySchoolEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "+ 부서 추가" }));
    const nameInputs = screen.getAllByLabelText(/부서 \d+ 부서명/);
    await user.type(nameInputs[nameInputs.length - 1], "초등부");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/SUNDAY_SCHOOL",
        expect.arrayContaining([
          expect.objectContaining({ key: "유치부" }),
          expect.objectContaining({ key: "초등부" }),
        ]),
      ),
    );
  });

  it("빈 부서명(key)인 행은 저장 시 제외된다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<SundaySchoolEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "+ 부서 추가" }));
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/SUNDAY_SCHOOL",
        expect.arrayContaining([expect.objectContaining({ key: "유치부" })]),
      ),
    );
    expect(api.put.mock.calls[0][1]).toHaveLength(1);
  });

  it("부서를 삭제할 수 있다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<SundaySchoolEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "부서 삭제" }));
    expect(screen.queryByDisplayValue("유치부")).not.toBeInTheDocument();
  });
});
