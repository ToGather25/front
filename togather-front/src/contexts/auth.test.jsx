import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthProvider, useAuth } from "./auth";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/services/api";

// 렌더 중 useAuth() 반환값을 모듈 변수에 캡처해서, 테스트가 버튼 클릭 시뮬레이션 대신
// login/register/completeRegistration/logout을 직접 호출하고 await할 수 있게 한다
// (클릭 이벤트 핸들러는 내부에서 에러를 안 잡으므로, 실패 케이스를 클릭으로 검증하면
// unhandled rejection이 생겨 테스트가 불안정해진다).
let authRef;
function Probe() {
  authRef = useAuth();
  return <span data-testid="user">{authRef.currentUser ? authRef.currentUser.email : "none"}</span>;
}

function renderAuth() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authRef = undefined;
  });

  it("login 성공 시 currentUser를 세팅하고 토큰을 저장한다", async () => {
    api.post.mockResolvedValue({
      data: {
        data: { email: "hong@example.com", name: "홍길동", isAdmin: false },
        token: "access-token",
        refreshToken: "refresh-token",
      },
    });
    renderAuth();

    await authRef.login({ email: "hong@example.com", password: "pw1234!" });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "hong@example.com",
      password: "pw1234!",
    });
    expect(localStorage.getItem("token")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("hong@example.com"));
  });

  it("login 실패(A006) 시 에러를 던지고 currentUser는 세팅되지 않는다", async () => {
    api.post.mockRejectedValue({ response: { status: 401, data: { code: "A006" } } });
    renderAuth();

    await expect(
      authRef.login({ email: "hong@example.com", password: "wrong" }),
    ).rejects.toBeTruthy();

    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("register 성공 시 currentUser를 세팅하지 않는다(승인 대기, 자동 로그인 없음)", async () => {
    api.post.mockResolvedValue({
      data: { success: true, data: { requestId: 1, status: "PENDING" }, token: null },
    });
    renderAuth();

    const result = await authRef.register({
      name: "홍길동",
      birthdate: "2000-01-01",
      phone: "010-1234-5678",
      isNewcomer: true,
      agreePrivacy: true,
    });

    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      name: "홍길동",
      birthdate: "2000-01-01",
      phone: "010-1234-5678",
      isNewcomer: true,
      agreePrivacy: true,
    });
    expect(result).toEqual({ requestId: 1, status: "PENDING" });
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("completeRegistration 성공 시 register/complete만 호출하고 로그인/currentUser 세팅은 하지 않는다", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderAuth();

    await authRef.completeRegistration({
      token: "tok",
      username: "hong@example.com",
      password: "pw1234!",
    });

    expect(api.post).toHaveBeenCalledWith("/auth/register/complete", {
      token: "tok",
      username: "hong@example.com",
      password: "pw1234!",
    });
    // login은 별도로 호출부가 해야 하므로 여기선 /auth/login이 호출되지 않는다
    expect(api.post).not.toHaveBeenCalledWith("/auth/login", expect.anything());
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("logout은 로그아웃 API를 시도하고 로컬 상태를 정리한다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "hong@example.com" }));
    localStorage.setItem("token", "t");
    localStorage.setItem("refreshToken", "r");
    api.post.mockResolvedValue({ data: { success: true } });
    renderAuth();

    await authRef.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("logout은 API 호출이 실패해도 로컬 상태 정리는 진행한다(best-effort)", async () => {
    localStorage.setItem("token", "t");
    api.post.mockRejectedValue(new Error("network down"));
    renderAuth();

    await authRef.logout();

    expect(localStorage.getItem("token")).toBeNull();
  });
});
