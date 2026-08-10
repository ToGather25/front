import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import MEMBERS from "@/config/members.config";
import MembersManage from "./MembersManage";

describe("MembersManage — 교인 목록", () => {
  it("members.config의 실제 교인이 목록에 표시된다", () => {
    render(<MembersManage />);
    expect(screen.getByText(MEMBERS[0].name)).toBeInTheDocument();
    expect(screen.getByText(`(${MEMBERS.length})`)).toBeInTheDocument();
  });

  it("부서 필터를 선택하면 해당 부서 교인만 표시된다", () => {
    render(<MembersManage />);
    const target = MEMBERS.find((m) => m.department === "청년부 1부");
    const other = MEMBERS.find((m) => m.department !== "청년부 1부");

    expect(target).toBeDefined();
    expect(other).toBeDefined();

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "청년부 1부" } });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("직책 필터를 선택하면 해당 직책 교인만 표시된다(복합 직분 포함)", () => {
    render(<MembersManage />);
    const targets = MEMBERS.filter((m) => m.role.includes("권사"));
    const other = MEMBERS.find((m) => !m.role.includes("권사"));

    expect(targets.length).toBeGreaterThan(1); // "권사 · 1구역장" 같은 복합 직분이 실제로 존재하는지 전제 확인

    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "권사" } });

    targets.forEach((t) => expect(screen.getByText(t.name)).toBeInTheDocument());
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });

  it("이메일이 없는 교인도 검색 시 크래시 없이 정상 필터링된다", () => {
    render(<MembersManage />);
    const target = MEMBERS.find((m) => !m.email);
    const other = MEMBERS.find((m) => m.id !== target.id);

    fireEvent.change(screen.getByPlaceholderText("이름 / 연락처 / 이메일 검색"), {
      target: { value: target.name },
    });

    expect(screen.getByText(target.name)).toBeInTheDocument();
    expect(screen.queryByText(other.name)).not.toBeInTheDocument();
  });
});
