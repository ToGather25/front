import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import JuboManage from "./JuboManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

function mockPrefillGets() {
  api.get.mockImplementation((url) => {
    if (url.includes("/current")) {
      return Promise.resolve({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
    }
    if (url.includes("worship-services")) {
      return Promise.resolve({ data: { data: [{ label: "주일 오전예배", time: "오전 9:00" }] } });
    }
    if (url.includes("worship-order")) {
      return Promise.resolve({
        data: { data: { "주일 오전예배": [{ role: "예배 부름", name: "성가대" }] } },
      });
    }
    if (url.includes("volunteer")) {
      return Promise.resolve({
        data: { data: [{ role: "대표기도", part1: "000", part2: "000" }] },
      });
    }
    if (url.includes("offering")) {
      return Promise.resolve({ data: { data: [{ title: "십일조", items: ["OOO 외 00명"] }] } });
    }
    if (url.includes("support")) {
      return Promise.resolve({
        data: { data: [{ organization: "베트남", target: "선교사님", region: "구역명" }] },
      });
    }
    if (url.includes("districts")) {
      return Promise.resolve({
        data: { data: [{ name: "1구역", location: "장소", time: "시간", leader: "OOO 집사" }] },
      });
    }
    if (url.includes("ministers")) {
      return Promise.resolve({ data: { data: [{ title: "교역자", items: ["담임목사 | OOO"] }] } });
    }
    return Promise.reject(new Error(`unexpected GET url: ${url}`));
  });
}

function mockCreateOnce() {
  api.post.mockResolvedValueOnce({
    data: { data: { id: 42, issueNo: "제10-8", juboDate: "2026-06-01", published: false } },
  });
}

async function createIssue(user) {
  await user.type(screen.getByLabelText("호수"), "제10-8");
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-06-01" } });
  await user.click(screen.getByRole("button", { name: "작성 시작" }));
  await screen.findByRole("button", { name: "발행하기" });
}

describe("JuboManage — 주보 관리", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrefillGets();
  });

  it("마운트 시 현재 발행된 주보 정보를 보여준다", async () => {
    renderWithChurch(<JuboManage />);
    expect(await screen.findByText("제10-7 · 2026년 2월 15일")).toBeInTheDocument();
  });

  it("호수/날짜를 입력해 작성 시작하면 createJuboIssue를 호출하고 섹션 에디터가 나타난다", async () => {
    mockCreateOnce();
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");

    await createIssue(user);

    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo", {
      issueNo: "제10-8",
      juboDate: "2026-06-01",
    });
    expect(screen.getByText("예배")).toBeInTheDocument();
    expect(screen.getByText("봉사")).toBeInTheDocument();
  });

  it("주보 생성이 실패하면 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");

    await user.type(screen.getByLabelText("호수"), "제10-8");
    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-06-01" } });
    await user.click(screen.getByRole("button", { name: "작성 시작" }));

    expect(
      await screen.findByText("주보 생성에 실패했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("예배 섹션 저장 시 WORSHIP_SERVICES와 WORSHIP_ORDER를 함께 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("주일 오전예배");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[0]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/WORSHIP_SERVICES",
        expect.any(Array),
      ),
    );
    expect(api.put).toHaveBeenCalledWith(
      "/church/admin/jubo/42/sections/WORSHIP_ORDER",
      expect.any(Object),
    );
  });

  it("봉사 섹션 저장 시 VOLUNTEER 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("대표기도");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[1]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/VOLUNTEER",
        expect.any(Array),
      ),
    );
  });

  it("예물 섹션 저장 시 OFFERING 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("십일조");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[2]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/OFFERING",
        expect.any(Array),
      ),
    );
  });

  it("후원 섹션 저장 시 SUPPORT 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("베트남");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[3]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/SUPPORT",
        expect.any(Array),
      ),
    );
  });

  it("구역 섹션 저장 시 DISTRICTS 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("1구역");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[4]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/DISTRICTS",
        expect.any(Array),
      ),
    );
  });

  it("섬기는 분들 섹션 저장 시 MINISTERS 섹션을 저장한다", async () => {
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await screen.findByDisplayValue("교역자");

    const saveButtons = screen.getAllByRole("button", { name: "저장" });
    await user.click(saveButtons[5]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/sections/MINISTERS",
        expect.any(Array),
      ),
    );
  });

  it("발행하기를 누르면 publishJubo를 호출하고 발행 완료 상태가 된다", async () => {
    mockCreateOnce();
    api.post.mockResolvedValueOnce({
      data: { data: { id: 42, issueNo: "제10-8", juboDate: "2026-06-01", published: true } },
    });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    await user.click(screen.getByRole("button", { name: "발행하기" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/church/admin/jubo/42/publish"));
    expect(await screen.findByRole("button", { name: "발행 완료" })).toBeInTheDocument();
  });
});
