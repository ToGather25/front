import api from "./api";

/**
 * 계정 찾기 — 공개(PUBLIC). 본인확인은 교적부(이름/휴대폰) 기준이다.
 *
 * 발송 인프라(메일/SMS)가 아직 없어 비밀번호 재설정은 링크 발송 대신
 * 짧은 수명의 resetToken을 응답으로 돌려주는 방식이다(백엔드 api-spec §10.10).
 * 인프라가 붙으면 이 함수의 응답 처리만 바꾸면 된다.
 */

/**
 * 아이디 찾기 — 이름+휴대폰으로 본인확인
 * @param {{ name: string, phone: string }} payload
 * @returns {Promise<{ loginId: string, email: string }>}
 * @throws 404 AR001 — 일치하는 계정 없음
 */
export async function findLoginId({ name, phone }) {
  const res = await api.post(`/auth/find-id`, { name, phone });
  return res.data.data;
}

/**
 * 비밀번호 재설정 본인확인 — 이메일(계정)+휴대폰(교적부)
 * @param {{ email: string, phone: string }} payload
 * @returns {Promise<{ resetToken: string, expiresIn: number }>}
 * @throws 404 AR001 — 일치하는 계정 없음
 */
export async function verifyPasswordReset({ email, phone }) {
  const res = await api.post(`/auth/find-password/verify`, { email, phone });
  return res.data.data;
}

/**
 * 비밀번호 재설정 — 토큰은 1회성이다
 * @param {{ resetToken: string, newPassword: string }} payload
 * @throws 404 AR002 — 토큰 무효/만료/재사용
 */
export async function resetPassword({ resetToken, newPassword }) {
  await api.post(`/auth/reset-password`, { resetToken, newPassword });
}
