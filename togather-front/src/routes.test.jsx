import { describe, it, expect, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "./routes";

/**
 * 회귀 방지 테스트 (C-1): /말씀/읽기, /말씀/필사 라우트는 routes.jsx의 실제 라우트 트리에서
 * AuthProvider 하위에 있어야 한다. BibleRead/BibleWrite는 useAuth()로 currentUser를
 * 구조분해하는데, AuthProvider(즉 AuthContext.Provider)가 상위에 없으면 useAuth()가
 * 기본값 null을 반환해 구조분해 시점에 TypeError가 발생하며 화면이 크래시한다.
 *
 * 이 테스트는 App.jsx가 createBrowserRouter에 그대로 넘기는 실제 routes 배열을
 * createMemoryRouter에 꽂아 렌더링함으로써, 실제 라우터 구성에 AuthProvider가
 * 누락되면 여기서 크래시로 드러나게 한다.
 */
describe("routes — 말씀 읽기/필사 라우트의 AuthProvider 존재 확인", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("/말씀/읽기 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/읽기"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("/말씀/필사 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/필사"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 /말씀/읽기 진입 시 크래시 없이 본문이 렌더된다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/읽기"] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("창세기")).toBeInTheDocument();
  });
});
