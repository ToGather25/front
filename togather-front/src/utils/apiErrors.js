const ERROR_MESSAGES = {
  A006: "이메일 또는 비밀번호가 올바르지 않습니다.",
  SU001: "이미 존재하거나 승인 처리 중인 계정입니다. 관리팀에 문의해 주세요.",
  SU004: "개인정보 수집·이용에 동의해 주세요.",
  SU005: "유효하지 않거나 만료된 링크입니다. 관리팀에 문의해 주세요.",
  T001: "교회 정보를 찾을 수 없습니다.",
};

/**
 * axios 에러에서 백엔드 에러코드({success:false, code, message})를 읽어
 * 사용자에게 보여줄 한국어 메시지로 변환한다. 매핑에 없는 코드는 범용 메시지로 폴백.
 */
export function getErrorMessage(err) {
  const code = err.response?.data?.code;
  return ERROR_MESSAGES[code] ?? "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
