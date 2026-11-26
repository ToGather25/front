import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Gyojeokbu from "./Gyojeokbu";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const DIRECTORY = [
  { id: "m1", name: "김민수", role: "장로", region: "1구역", department: "남선교회 1지회", smallGroup: "에벤에셀 다락방" },
  { id: "m2", name: "이수진", role: "권사", region: "1구역", department: "여전도회 1지회", smallGroup: "에벤에셀 다락방" },
  { id: "m3", name: "김하은", role: "청년", region: "2구역", department: "청년부 2부", smallGroup: "호산나 셀" },
];

describe("Gyojeokbu — 로그인 가드", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.get.mockResolvedValue({ data: { data: DIRECTORY } });
  });

  it("비로그인 상태면 로그인 필요 모달을 보여주고 교인 정보는 렌더되지 않는다", async () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText(DIRECTORY[0].name)).not.toBeInTheDocument();
  });

  it("로그인하면 교적부 명부(/church/members)를 불러와 목록을 보여준다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com", name: "홍길동" }));
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });

    const table = await screen.findByRole("table");
    expect(within(container.querySelector("table") ?? table).getByText(DIRECTORY[0].name)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/church/members");
  });
});

describe("Gyojeokbu — 검색·필터", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    api.get.mockResolvedValue({ data: { data: DIRECTORY } });
  });

  it("이름으로 검색하면 해당 교인만 표시된다", async () => {
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });
    await screen.findByRole("table");

    const input = screen.getByPlaceholderText("이름, 구역, 부서, 소그룹으로 검색");
    fireEvent.change(input, { target: { value: "김하은" } });

    const table = container.querySelector("table");
    expect(within(table).getByText("김하은")).toBeInTheDocument();
    expect(within(table).queryByText("김민수")).not.toBeInTheDocument();
  });

  it("검색 결과가 없으면 안내 문구가 표시된다", async () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    await screen.findByRole("table");

    const input = screen.getByPlaceholderText("이름, 구역, 부서, 소그룹으로 검색");
    fireEvent.change(input, { target: { value: "존재하지않는이름12345" } });

    expect(screen.getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("구역 필터 칩은 실제 명부에 있는 구역만 동적으로 보여주고, 선택하면 해당 구역만 표시된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "1구역" }));

    const table = container.querySelector("table");
    expect(within(table).getByText("김민수")).toBeInTheDocument();
    expect(within(table).getByText("이수진")).toBeInTheDocument();
    expect(within(table).queryByText("김하은")).not.toBeInTheDocument();
  });

  it("명부 조회에 실패하면 안내 문구를 보여준다(재시도 버튼 없음)", async () => {
    api.get.mockRejectedValueOnce(new Error("network"));
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    expect(await screen.findByText("교적부를 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });
});
