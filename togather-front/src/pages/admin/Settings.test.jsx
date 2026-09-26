import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Settings from "./Settings";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

describe("Settings — 홈 화면 메인 배너 · SNS (실API 연동)", () => {
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
    await screen.findByText("홈 화면 메인 배너 · SNS");

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
        instagramUrl: null,
      }),
    );
    expect(await screen.findByText("저장됨")).toBeInTheDocument();
  });

  it("인스타그램 URL을 조회해 채우고, 저장 시 instagramUrl로 함께 보낸다", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          representativeImageUrl: "",
          slogan: "",
          instagramUrl: "https://www.instagram.com/old",
          offeringBankName: "국민은행",
        },
      },
    });
    api.put.mockResolvedValue({ data: { data: {} } });
    const user = userEvent.setup();
    renderWithChurch(<Settings />);

    // 조회 응답이 입력값에 반영될 때까지 기다린다(라벨은 로딩 직후 바로 나타난다)
    const input = await screen.findByDisplayValue("https://www.instagram.com/old");
    expect(input).toBe(screen.getByLabelText("인스타그램 URL"));

    await user.clear(input);
    await user.type(input, "https://www.instagram.com/new");
    await user.click(screen.getAllByRole("button", { name: "저장" })[0]);

    // 프로필 upsert는 통째 교체 — 편집하지 않은 헌금 계좌가 지워지지 않아야 한다
    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/profile",
        expect.objectContaining({
          instagramUrl: "https://www.instagram.com/new",
          offeringBankName: "국민은행",
        }),
      ),
    );
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
    await screen.findByText("홈 화면 메인 배너 · SNS");

    await user.click(screen.getAllByRole("button", { name: "저장" })[0]);

    expect(await screen.findByText("저장 실패, 다시 시도해 주세요.")).toBeInTheDocument();
  });
});
