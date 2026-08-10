import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MEMBERS from "@/config/members.config";
import Gyojeokbu from "./Gyojeokbu";

describe("Gyojeokbu — 로그인 가드 + 민감정보 제한", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("비로그인 상태면 로그인 필요 모달을 보여주고 교인 정보는 렌더되지 않는다", () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText(MEMBERS[0].name)).not.toBeInTheDocument();
  });

  it("일반 교인으로 로그인하면 교인 목록이 보이고 목회 메모는 보이지 않는다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com", name: "홍길동" }));
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    expect(screen.getByText(MEMBERS[0].name)).toBeInTheDocument();

    await user.click(screen.getByText(MEMBERS[0].name));
    expect(screen.queryByText("목회 메모")).not.toBeInTheDocument();
  });

  it("관리자로 로그인하면 상세 드로어에서 목회 메모가 보인다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "admin@togather.com", isAdmin: true }));
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    await user.click(screen.getByText(MEMBERS[0].name));
    expect(screen.getByText("목회 메모")).toBeInTheDocument();
    expect(screen.getByText(MEMBERS[0].notes)).toBeInTheDocument();
  });
});
