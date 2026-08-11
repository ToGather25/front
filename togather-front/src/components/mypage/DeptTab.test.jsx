import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MOCK_DEPT, MOCK_GROUPS } from "./mockData";
import DeptTab from "./DeptTab";

describe("DeptTab — 부서 / 직책", () => {
  it("조회 화면에 MOCK_DEPT 값과 참여 중인 모임 목록이 렌더된다", () => {
    render(<DeptTab />);
    // 주의: MOCK_DEPT.department("남선교회 1지회")는 MOCK_GROUPS[2].name과
    // 값이 같아서 동시에 렌더되면 getByText가 "multiple elements"로 실패한다.
    // MOCK_DEPT.duty("안내위원장")는 다른 곳과 겹치지 않아 안전하게 쓸 수 있다.
    expect(screen.getByText(MOCK_DEPT.duty)).toBeInTheDocument();
    expect(screen.getByText(MOCK_GROUPS[0].name)).toBeInTheDocument();
  });

  it("'변경 신청하기'를 클릭하면 변경 모드로 전환되고, 신청하면 완료 모달이 뜬다", () => {
    render(<DeptTab />);

    fireEvent.click(screen.getByRole("button", { name: "변경 신청하기" }));
    expect(screen.getByText("부서 / 직책 변경 신청")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    expect(screen.getByText("신청이 접수되었습니다.")).toBeInTheDocument();
  });
});
