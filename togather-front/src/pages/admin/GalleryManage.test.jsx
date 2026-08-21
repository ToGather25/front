import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import GalleryManage from "./GalleryManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

const COMMUNITIES = [{ id: 1, name: "청년부", desc: "청년들의 모임" }];
const PHOTOS = [{ id: 10, communityId: 1, title: "여름 수련회", date: "2026년 8월 1일", desc: "", imageUrl: null }];

describe("GalleryManage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/churches/togather-church/communities") {
        return Promise.resolve({ data: { data: COMMUNITIES } });
      }
      return Promise.resolve({ data: { data: PHOTOS } });
    });
  });

  it("공동체 목록을 불러와 렌더링한다", async () => {
    renderWithChurch(<GalleryManage />);
    expect(await screen.findByText("청년부")).toBeInTheDocument();
  });

  it("공동체를 등록하면 createCommunity를 호출하고 목록에 추가된다", async () => {
    api.post.mockResolvedValue({ data: { data: { id: 2, name: "새가족부", desc: "" } } });
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");

    await user.click(screen.getByRole("button", { name: "공동체 등록" }));
    await user.type(screen.getByPlaceholderText("예) 청년부"), "새가족부");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("새가족부")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/communities",
      expect.objectContaining({ name: "새가족부" }),
    );
  });

  it("공동체를 선택하면 해당 사진만 조회한다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");

    await user.click(screen.getByText("청년부"));

    expect(await screen.findByText("여름 수련회")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/churches/togather-church/gallery", {
      params: { communityId: 1 },
    });
  });

  it("사진을 등록하면 createPhoto를 호출하고 그리드에 추가된다", async () => {
    api.post.mockResolvedValue({
      data: { data: { id: 11, communityId: 1, title: "가을 야유회" } },
    });
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");
    await user.click(screen.getByText("청년부"));
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "사진 등록" }));
    await user.type(screen.getByPlaceholderText("예) 여름 수련회"), "가을 야유회");
    await user.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByText("가을 야유회")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/gallery",
      expect.objectContaining({ communityId: 1, title: "가을 야유회" }),
    );
  });

  it("사진을 삭제하면 deletePhoto를 호출하고 그리드에서 제거된다", async () => {
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);
    await screen.findByText("청년부");
    await user.click(screen.getByText("청년부"));
    await screen.findByText("여름 수련회");

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/church/admin/gallery/10"));
    expect(screen.queryByText("여름 수련회")).not.toBeInTheDocument();
  });

  it("공동체 조회 실패 시 재시도 버튼이 뜨고 클릭하면 다시 조회한다", async () => {
    api.get.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<GalleryManage />);

    expect(await screen.findByText("불러오지 못했습니다. 다시 시도해 주세요.")).toBeInTheDocument();

    api.get.mockImplementation((url) => {
      if (url === "/churches/togather-church/communities") {
        return Promise.resolve({ data: { data: COMMUNITIES } });
      }
      return Promise.resolve({ data: { data: PHOTOS } });
    });
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("청년부")).toBeInTheDocument();
  });
});
