import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, within, fireEvent } from "@testing-library/react";
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

describe("Gyojeokbu — 검색·필터·상세 드로어", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
  });

  it("이름으로 검색하면 해당 교인만 표시된다", () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    const target = MEMBERS[0];
    const other = MEMBERS[1];

    const input = screen.getByPlaceholderText("이름 또는 휴대폰 번호로 검색");
    fireEvent.change(input, { target: { value: target.name } });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("검색 결과가 없으면 안내 문구가 표시된다", () => {
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    const input = screen.getByPlaceholderText("이름 또는 휴대폰 번호로 검색");
    fireEvent.change(input, { target: { value: "존재하지않는이름12345" } });

    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  it("구역 필터를 선택하면 해당 구역 교인만 표시된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });

    const target = MEMBERS.find((m) => m.region === "1구역");
    const other = MEMBERS.find((m) => m.region !== "1구역");

    await user.click(screen.getByRole("button", { name: /^1구역/ }));

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("교인 행을 클릭하면 상세 드로어가 열리고 기본 정보가 보인다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Gyojeokbu />, { withAuth: true });
    const target = MEMBERS[0];

    await user.click(screen.getByText(target.name));

    expect(screen.getByText(target.address)).toBeInTheDocument();
  });

  it("상세 드로어의 '다음' 버튼을 클릭하면 다음 교인으로 전환된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });

    await user.click(screen.getByText(MEMBERS[1].name));
    await user.click(screen.getByRole("button", { name: "다음" }));

    // 주의: m.phone은 드로어 안에 두 곳(Hero의 tel 링크 + 기본정보 InfoRow)에
    // 중복 렌더되어 getByText가 "multiple elements" 에러를 던진다.
    // "생년월일 (만 N세)" InfoRow는 한 곳에만 렌더되므로 이걸로 식별한다.
    const drawer = container.querySelector("aside");
    expect(
      within(drawer).getByText(`${MEMBERS[2].birth} (만 ${MEMBERS[2].age}세)`),
    ).toBeInTheDocument();
  });

  it("가족 구성원을 클릭하면 해당 구성원의 상세로 전환된다", async () => {
    const user = userEvent.setup();
    const { container } = renderWithChurch(<Gyojeokbu />, { withAuth: true });

    const owner = MEMBERS.find((m) => m.family.some((f) => f.id));
    const linkedFamily = owner.family.find((f) => f.id);
    const target = MEMBERS.find((m) => m.id === linkedFamily.id);

    await user.click(screen.getByText(owner.name));
    await user.click(screen.getByRole("button", { name: new RegExp(target.name) }));

    // phone은 중복 렌더되므로(위 테스트와 동일한 이유) 생년월일 조합 텍스트로 식별한다.
    const drawer = container.querySelector("aside");
    expect(
      within(drawer).getByText(`${target.birth} (만 ${target.age}세)`),
    ).toBeInTheDocument();
  });
});
