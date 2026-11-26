import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import DiscipleTrainingEditor from "./DiscipleTrainingEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  discipleTraining: {
    courses: [{ name: "제자훈련 1단계", schedule: "매주 수요일", location: "302호", desc: "입문 과정" }],
    info: [{ label: "교재", value: "국제제자훈련원 교재" }],
    note: "꼭 신청해 주세요.",
  },
};

describe("DiscipleTrainingEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 값을 입력창에 채운다", () => {
    renderWithChurch(<DiscipleTrainingEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("제자훈련 1단계")).toBeInTheDocument();
    expect(screen.getByDisplayValue("국제제자훈련원 교재")).toBeInTheDocument();
    expect(screen.getByDisplayValue("꼭 신청해 주세요.")).toBeInTheDocument();
  });

  it("저장하면 PUT /church/admin/intro/DISCIPLE_TRAINING을 courses/info/note로 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<DiscipleTrainingEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/intro/DISCIPLE_TRAINING", {
        courses: [
          { name: "제자훈련 1단계", schedule: "매주 수요일", location: "302호", desc: "입문 과정" },
        ],
        info: [{ label: "교재", value: "국제제자훈련원 교재" }],
        note: "꼭 신청해 주세요.",
      }),
    );
  });
});
