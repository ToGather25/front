import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { AuthProvider } from "@/contexts/auth";

/**
 * withAuth는 내부적으로 useNavigate를 쓰므로 MemoryRouter가 필요합니다 —
 * withAuth: true를 넘기면 withRouter를 명시하지 않아도 자동으로 라우터가 씌워집니다.
 * church를 넘기면 ChurchProvider가 기본 church.config.js 대신 이 값을 사용합니다
 * (일부 필드만 넘겨도 되며, 컴포넌트가 실제로 읽는 필드만 채우면 됩니다).
 */
export function renderWithChurch(
  ui,
  { withRouter = false, initialEntries, withAuth = false, church } = {},
) {
  let wrapped = withAuth ? <AuthProvider>{ui}</AuthProvider> : ui;
  if (withRouter || initialEntries || withAuth) {
    wrapped = <MemoryRouter initialEntries={initialEntries}>{wrapped}</MemoryRouter>;
  }
  return render(<ChurchProvider initialChurch={church}>{wrapped}</ChurchProvider>);
}
