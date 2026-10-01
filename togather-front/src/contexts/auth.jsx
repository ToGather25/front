import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/services/api";

export const authContext = createContext(null);

export function useAuth() {
  return useContext(authContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (autoLoginAttempted || currentUser) return;

      try {
        const shouldAutoLogin = import.meta.env.VITE_AUTO_LOGIN === "true";
        const useMockLogin = import.meta.env.VITE_USE_MOCK_LOGIN === "true";

        if (shouldAutoLogin) {
          if (useMockLogin) {
            // Mock 자동 로그인
            const mockUser = {
              id: "mock-user-1",
              email: "okgil@gmail.com",
              username: "okgil",
              isAdmin: false,
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(mockUser);
            localStorage.setItem("token", "mock-token-" + Date.now());
            localStorage.setItem("refreshToken", "mock-refresh-" + Date.now());
          } else {
            // 실제 API 자동 로그인
            const res = await api.post("/auth/login", {
              email: "okgil@gmail.com",
              password: "togather"
            });
            const user = res.data.data;
            setCurrentUser(user);
            localStorage.setItem("token", res.data.token);
            if (res.data.refreshToken) localStorage.setItem("refreshToken", res.data.refreshToken);
          }
        }
      } catch (error) {
        console.error("[AuthProvider] Auto-login failed:", error);
      } finally {
        setAutoLoginAttempted(true);
      }
    };

    attemptAutoLogin();
  }, [autoLoginAttempted, currentUser]);

  async function login({ email, password }) {
    try {
      // Mock 모드 (백엔드 없이 테스트용)
      const useMockLogin = import.meta.env.VITE_USE_MOCK_LOGIN === "true";

      if (useMockLogin) {
        const mockUser = {
          id: "mock-user-1",
          email: email,
          username: email.split("@")[0],
          isAdmin: email.includes("admin"),
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(mockUser);
        localStorage.setItem("token", "mock-token-" + Date.now());
        localStorage.setItem("refreshToken", "mock-refresh-" + Date.now());
        void navigate(mockUser.isAdmin ? "/admin" : "/");
        return;
      }

      // 실제 API 호출
      const res = await api.post("/auth/login", { email, password });
      const user = res.data.data;
      setCurrentUser(user);
      localStorage.setItem("token", res.data.token);
      if (res.data.refreshToken) localStorage.setItem("refreshToken", res.data.refreshToken);
      void navigate(user.isAdmin ? "/admin" : "/");
    } catch (error) {
      throw error;
    }
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    return res.data.data;
  }

  async function completeRegistration({ token, username, password }) {
    const res = await api.post("/auth/register/complete", { token, username, password });
    return res.data;
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // best-effort — 실패해도 로컬 상태 정리는 진행한다
    }
    setCurrentUser(null);
    localStorage.clear();
    void navigate("/");
  }

  return (
    <authContext.Provider
      value={{ currentUser, setCurrentUser, login, logout, register, completeRegistration }}
    >
      {children}
    </authContext.Provider>
  );
}
