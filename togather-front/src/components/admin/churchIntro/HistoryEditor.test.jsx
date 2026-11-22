import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import HistoryEditor from "./HistoryEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  history: {
    description: "연혁 소개",
    foundedYear: 1985,
    items: [{ era: "1980~", events: [{ date: "1985.03.01", content: "설립 예배" }] }],
  },
};

describe("HistoryEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 연혁 값을 플랫 리스트로 펼쳐 보여준다", () => {
    renderWithChurch(<HistoryEditor />, { church: CHURCH });
    expect(screen.getByDisplayValue("1985")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1985.03.01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("설립 예배")).toBeInTheDocument();
  });

  it("순서 섞인 연도를 입력해도 저장 시 10년 단위로 묶어 내림차순으로 보낸다", async () => {
    api.put.mockResolvedValue({});
    api.patch.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<HistoryEditor />, { church: CHURCH });

    await user.click(screen.getByRole("button", { name: "연혁 추가" }));
    const dateInputs = screen.getAllByPlaceholderText("날짜 (YYYY.MM.DD)");
    const contentInputs = screen.getAllByPlaceholderText("내용");
    await user.type(dateInputs[1], "2022.01.01");
    await user.type(contentInputs[1], "창립 37주년");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/HISTORY",
        expect.objectContaining({
          items: [
            { era: "2020~", events: [{ date: "2022.01.01", content: "창립 37주년" }] },
            { era: "1980~", events: [{ date: "1985.03.01", content: "설립 예배" }] },
          ],
        }),
      ),
    );
  });

  it("설립일을 입력하면 설립년도가 같은 연도로 맞춰지고, 저장 시 PATCH로 날짜를 보낸다", async () => {
    api.put.mockResolvedValue({});
    api.patch.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<HistoryEditor />, { church: CHURCH });

    const dateInput = screen.getByLabelText("설립일 (선택)");
    await user.type(dateInput, "1990-05-01");
    expect(screen.getByDisplayValue("1990")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/church/admin/intro/HISTORY", {
        foundedDate: "1990-05-01",
      }),
    );
    expect(api.put).toHaveBeenCalledWith(
      "/church/admin/intro/HISTORY",
      expect.not.objectContaining({ foundedDate: expect.anything() }),
    );
  });

  it("설립일을 지우면 PATCH로 null을 보내 날짜를 삭제한다", async () => {
    api.put.mockResolvedValue({});
    api.patch.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<HistoryEditor />, {
      church: { history: { ...CHURCH.history, foundedDate: "1985-03-01" } },
    });

    await user.clear(screen.getByLabelText("설립일 (선택)"));
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/church/admin/intro/HISTORY", {
        foundedDate: null,
      }),
    );
  });
});
