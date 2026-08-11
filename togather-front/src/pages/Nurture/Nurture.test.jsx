import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Nurture from "./Nurture";

describe("Nurture — 성경읽기/쓰기 탭", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("로그인하지 않은 상태로 성경 읽기 카드를 클릭하면 로그인 필요 모달을 보여주고 이동하지 않는다", async () => {
    // Nurture는 useAuth()를 무조건 호출하므로 AuthProvider 컨텍스트가 필요하다
    // (실제 앱에서는 항상 RootLayout이 AuthProvider로 감싸고 있음).
    // localStorage는 beforeEach에서 비워지므로 currentUser는 null(비로그인)로 초기화된다.
    const user = userEvent.setup();
    renderWithChurch(<Nurture />, { withAuth: true, initialEntries: ["/양육훈련"] });

    await user.click(screen.getByText("성경 읽기"));
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인하지 않은 상태로 성경 쓰기 카드를 클릭해도 로그인 필요 모달을 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Nurture />, { withAuth: true, initialEntries: ["/양육훈련"] });

    await user.click(screen.getByText("성경 쓰기"));
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 카드를 클릭하면 모달 없이 정상 이동한다", async () => {
    // AuthProvider의 currentUser는 useState(JSON.parse(localStorage.getItem("user")))로
    // 마운트 시점에 한 번만 초기화된다. 따라서 로그인 상태를 시뮬레이션하려면
    // 컴포넌트를 렌더링하기 "전에" localStorage를 세팅해야 하며, 마운트 이후에
    // localStorage를 바꿔도 이미 초기화된 currentUser state는 갱신되지 않는다.
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "test@togather.com", name: "홍길동" }),
    );

    const user = userEvent.setup();
    renderWithChurch(<Nurture />, { withAuth: true, initialEntries: ["/양육훈련"] });

    await user.click(screen.getByText("성경 읽기"));
    expect(screen.queryByText("로그인이 필요한 서비스입니다")).not.toBeInTheDocument();
  });
});
