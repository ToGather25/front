import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { AuthProvider } from "@/contexts/auth";
import defaultConfig from "@/config/church.config";

/**
 * withAuth는 내부적으로 useNavigate를 쓰므로 MemoryRouter가 필요합니다 —
 * withAuth: true를 넘기면 withRouter를 명시하지 않아도 자동으로 라우터가 씌워집니다.
 * church를 넘기면 ChurchProvider가 기본 church.config.js 대신 이 값을 사용합니다
 * (일부 필드만 넘겨도 되며, 컴포넌트가 실제로 읽는 필드만 채우면 됩니다).
 *
 * church를 넘기지 않으면 defaultConfig를 initialChurch로 주입해 ChurchProvider의
 * /api/tenant fetch 자체를 건너뜁니다 — 이 헬퍼를 쓰는 테스트들은 테넌트 로딩/폴백 흐름을
 * 검증 대상으로 삼지 않으므로(그건 ChurchContext.test.jsx의 몫), 모킹되지 않은 실제
 * 네트워크 호출이 비동기로 지연/실패해 렌더 타이밍이 흔들리는 것을 막기 위함입니다.
 */
export function renderWithChurch(
  ui,
  { withRouter = false, initialEntries, withAuth = false, church = defaultConfig } = {},
) {
  let wrapped = withAuth ? <AuthProvider>{ui}</AuthProvider> : ui;
  if (withRouter || initialEntries || withAuth) {
    wrapped = <MemoryRouter initialEntries={initialEntries}>{wrapped}</MemoryRouter>;
  }
  return render(<ChurchProvider initialChurch={church}>{wrapped}</ChurchProvider>);
}
