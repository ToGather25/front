import { Outlet } from "react-router";
import { AuthProvider } from "@/contexts/auth";

// 말씀/읽기, 말씀/필사는 RootLayout 밖의 최상위 라우트라 RootLayout이 제공하는
// AuthProvider를 상속받지 못한다. 이 pathless layout이 해당 두 라우트에만
// 별도로 AuthProvider를 공급한다 (RootLayout의 AuthProvider와는 별개 인스턴스).
export default function AuthOnlyLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
