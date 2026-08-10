import { describe, it, expect } from "vite-plus/test";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { INITIAL_INQUIRIES, MOCK_USER } from "./mockData";
import InquiryTab from "./InquiryTab";

function Wrapper() {
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  return <InquiryTab inquiries={inquiries} setInquiries={setInquiries} />;
}

describe("InquiryTab — 문의하기", () => {
  it("문의 목록이 렌더된다", () => {
    render(<Wrapper />);
    expect(screen.getByText(INITIAL_INQUIRIES[0].title)).toBeInTheDocument();
  });

  it("'문의하기'를 클릭하면 작성 모드로 전환되고 내 이름/연락처가 readonly로 보인다", () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: "문의하기" }));

    expect(screen.getByText(MOCK_USER.name)).toBeInTheDocument();
    expect(screen.getByText(MOCK_USER.phone)).toBeInTheDocument();
  });

  it("문의를 접수하면 목록 최상단에 '진행 중' 상태로 추가된다", () => {
    render(<Wrapper />);

    fireEvent.click(screen.getByRole("button", { name: "문의하기" }));
    fireEvent.change(screen.getByPlaceholderText("문의 제목을 입력해 주세요."), {
      target: { value: "테스트 문의" },
    });
    fireEvent.click(screen.getByRole("button", { name: "접수" }));

    expect(screen.getByText("테스트 문의")).toBeInTheDocument();
  });
});
