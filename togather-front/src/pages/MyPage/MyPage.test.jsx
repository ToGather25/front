import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import MyPage from "./MyPage";

describe("MyPage — 로그인 가드 + 탭 전환", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("비로그인 상태면 로그인 필요 모달을 보여주고 탭 콘텐츠는 렌더되지 않는다", () => {
    renderWithChurch(<MyPage />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
  });

  it("로그인하면 5개 탭 버튼과 기본 탭(내 정보) 콘텐츠가 보인다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<MyPage />, { withAuth: true });

    // 주의: "부서 / 직책"은 사이드바 탭 버튼과 InfoTab 내부의 "메뉴에서 확인" 링크가
    // 같은 라벨을 쓰므로 getByRole은 "multiple elements"로 실패한다.
    // getAllByRole로 존재 여부만 확인한다(다른 4개는 원래도 1개뿐이라 안전).
    ["내 정보", "부서 / 직책", "일정", "기도 / 상담", "문의하기"].forEach((label) => {
      expect(screen.getAllByRole("button", { name: label }).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("내 프로필")).toBeInTheDocument();
  });

  it("'일정' 탭을 클릭하면 ScheduleTab 콘텐츠로 전환된다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<MyPage />, { withAuth: true });

    fireEvent.click(screen.getByRole("button", { name: "일정" }));

    expect(screen.getByRole("button", { name: "+ 일정 추가" })).toBeInTheDocument();
    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
  });

  it("일정 탭에서 일정을 추가하고 다른 탭으로 이동했다가 돌아오면 추가한 일정이 유지된다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<MyPage />, { withAuth: true });

    fireEvent.click(screen.getByRole("button", { name: "일정" }));
    const before = screen.getByText(/^내 일정 \(\d+\)$/).textContent;

    fireEvent.click(screen.getByRole("button", { name: "+ 일정 추가" }));
    fireEvent.change(screen.getByPlaceholderText("예) 새가족 모임"), {
      target: { value: "지속성 테스트 일정" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    const afterAdd = screen.getByText(/^내 일정 \(\d+\)$/).textContent;
    expect(afterAdd).not.toBe(before);

    fireEvent.click(screen.getByRole("button", { name: "문의하기" }));
    fireEvent.click(screen.getByRole("button", { name: "일정" }));

    const afterReturn = screen.getByText(/^내 일정 \(\d+\)$/).textContent;
    expect(afterReturn).toBe(afterAdd);
  });
});
