import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Sermon from "./Sermon";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const SERMON = {
  title: "은혜 위에 은혜러라",
  scripture: "요한복음 1장 16절",
  outline: ["말씀이 육신이 되어", "은혜와 진리가 충만하더라"],
};

describe("Sermon — 말씀", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: SERMON } });
  });

  it("설교 제목과 본문 말씀 참조를 렌더한다", async () => {
    renderWithChurch(<Sermon />);
    expect(await screen.findByText(SERMON.title)).toBeInTheDocument();
    expect(screen.getByText(SERMON.scripture)).toBeInTheDocument();
  });

  it("설교 개요가 있으면 목록을 렌더한다", async () => {
    renderWithChurch(<Sermon />);
    await screen.findByText(SERMON.title);
    SERMON.outline.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("좋아요 버튼을 클릭하면 하트 상태가 토글된다(로컬 상태만, 새로고침 시 초기화)", async () => {
    renderWithChurch(<Sermon />);
    await screen.findByText(SERMON.title);

    const likeBtn = screen.getByRole("button", { name: "좋아요" });
    fireEvent.click(likeBtn);
    expect(screen.getByRole("button", { name: "좋아요 취소" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "좋아요 취소" }));
    expect(screen.getByRole("button", { name: "좋아요" })).toBeInTheDocument();
  });

  it("issue(과거 발행호)가 주어지면 그 발행호의 제목/본문을 쓰고 섹션 API는 호출하지 않는다", async () => {
    renderWithChurch(
      <Sermon issue={{ sermonTitle: "옛 설교 제목", verse: "옛 본문 말씀" }} />,
    );
    expect(await screen.findByText("옛 설교 제목")).toBeInTheDocument();
    expect(screen.getByText("옛 본문 말씀")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });
});
