import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import DeptTab from "./DeptTab";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const PROFILE = { role: "장로", department: "남선교회 1지회", region: "1구역", smallGroup: "에벤에셀 다락방" };
const GROUPS = [
  { type: "DISTRICT", name: "1구역 모임" },
  { type: "SERVICE", name: "성가대" },
];

describe("DeptTab — 부서 / 직책", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: GROUPS } });
  });

  it("profile의 직분·부서·구역·소그룹과 참여 중인 모임 목록(/my/groups)이 렌더된다", async () => {
    renderWithChurch(<DeptTab profile={PROFILE} />);

    expect(screen.getByText("장로")).toBeInTheDocument();
    expect(screen.getByText("남선교회 1지회")).toBeInTheDocument();
    expect(screen.getByText("에벤에셀 다락방")).toBeInTheDocument();
    expect(await screen.findByText("1구역 모임")).toBeInTheDocument();
    expect(screen.getByText("성가대")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/my/groups");
  });

  it("'변경 신청하기'를 클릭하면 변경 모드로 전환되고, 신청하면 완료 모달이 뜬다", async () => {
    renderWithChurch(<DeptTab profile={PROFILE} />);
    await screen.findByText("1구역 모임");

    fireEvent.click(screen.getByRole("button", { name: "변경 신청하기" }));
    expect(screen.getByText("부서 / 직책 변경 신청")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    expect(screen.getByText("신청이 접수되었습니다.")).toBeInTheDocument();
  });
});
