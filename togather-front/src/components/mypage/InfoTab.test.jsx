import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MOCK_USER } from "./mockData";
import InfoTab from "./InfoTab";

describe("InfoTab — 내 정보", () => {
  it("MOCK_USER 초기값으로 기본 정보 폼이 채워진다", () => {
    render(<InfoTab onNavigateDept={() => {}} />);
    expect(screen.getByDisplayValue(MOCK_USER.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_USER.phone)).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_USER.email)).toBeInTheDocument();
  });

  it("이름 입력을 바꾸면 값이 반영되고, 취소를 누르면 원래대로 되돌아간다", () => {
    render(<InfoTab onNavigateDept={() => {}} />);
    const nameInput = screen.getByDisplayValue(MOCK_USER.name);

    fireEvent.change(nameInput, { target: { value: "변경된이름" } });
    expect(screen.getByDisplayValue("변경된이름")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.getByDisplayValue(MOCK_USER.name)).toBeInTheDocument();
  });

  it("회원 탈퇴 확인 → 신청 → 완료 모달 흐름이 동작한다", () => {
    render(<InfoTab onNavigateDept={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "회원 탈퇴" }));
    expect(screen.getByText("회원 탈퇴를 진행하시겠습니까?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "탈퇴 신청" }));
    expect(screen.getByText("탈퇴 신청이 접수되었습니다.")).toBeInTheDocument();
  });

  it("'부서 / 직책' 링크를 클릭하면 onNavigateDept가 호출된다", () => {
    let called = false;
    render(<InfoTab onNavigateDept={() => (called = true)} />);

    fireEvent.click(screen.getByRole("button", { name: "부서 / 직책" }));
    expect(called).toBe(true);
  });
});
