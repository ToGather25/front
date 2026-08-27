import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Settings from "./Settings";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

describe("Settings — 홈 화면 메인 배너 (실API 연동)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("마운트 시 GET /church/profile로 대표이미지/슬로건을 조회해 입력값에 채운다", async () => {
    api.get.mockResolvedValue({
      data: { data: { representativeImageUrl: "https://example.com/hero.jpg", slogan: "환영합니다" } },
    });
    renderWithChurch(<Settings />);

    expect(await screen.findByDisplayValue("https://example.com/hero.jpg")).toBeInTheDocument();
    expect(screen.getByDisplayValue("환영합니다")).toBeInTheDocument();
  });

  it("저장을 누르면 PUT /church/admin/profile을 호출한다", async () => {
    api.get.mockResolvedValue({
      data: { data: { representativeImageUrl: "", slogan: "" } },
    });
    api.put.mockResolvedValue({
      data: { data: { representativeImageUrl: "https://example.com/new.jpg", slogan: "새 슬로건" } },
    });
    const user = userEvent.setup();
    renderWithChurch(<Settings />);
    await screen.findByText("홈 화면 메인 배너");

    await user.type(
      screen.getByLabelText("대표 이미지 URL"),
      "https://example.com/new.jpg",
    );
    await user.type(screen.getByLabelText("슬로건"), "새 슬로건");
    await user.click(screen.getAllByRole("button", { name: "저장" })[0]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/profile", {
        representativeImageUrl: "https://example.com/new.jpg",
        slogan: "새 슬로건",
      }),
    );
    expect(await screen.findByText("저장됨")).toBeInTheDocument();
  });

  it("조회에 실패하면 재시도 버튼이 뜨고, 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<Settings />);

    expect(await screen.findByText("불러오지 못했습니다.")).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { data: { representativeImageUrl: "", slogan: "" } } });
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByLabelText("대표 이미지 URL")).toBeInTheDocument();
  });

  it("저장에 실패하면 에러 메시지를 보여준다", async () => {
    api.get.mockResolvedValue({ data: { data: { representativeImageUrl: "", slogan: "" } } });
    api.put.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<Settings />);
    await screen.findByText("홈 화면 메인 배너");

    await user.click(screen.getAllByRole("button", { name: "저장" })[0]);

    expect(await screen.findByText("저장 실패, 다시 시도해 주세요.")).toBeInTheDocument();
  });
});
