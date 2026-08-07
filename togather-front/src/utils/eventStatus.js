import { parseLocalDate, startOfDay, endOfDay, formatDotDate } from "./date";

/** 행사 신청 상태 */
export const REG_STATUS = {
  NONE: "none", // 신청을 받지 않는 행사 → 버튼 미노출
  UPCOMING: "upcoming", // 신청 대기 (기간 전)
  OPEN: "open", // 신청하기 (기간 중)
  CLOSED: "closed", // 신청 마감 (기간 종료 / 정원 초과 / 행사 종료)
};

const LABEL = {
  [REG_STATUS.NONE]: "",
  [REG_STATUS.UPCOMING]: "신청 대기",
  [REG_STATUS.OPEN]: "신청하기",
  [REG_STATUS.CLOSED]: "신청 마감",
};

/** 버튼 톤 클래스 (배경/글자/테두리) */
export const REG_BTN_TONE = {
  [REG_STATUS.OPEN]: "bg-blue-7 text-white border-blue-7 hover:bg-blue-8",
  [REG_STATUS.UPCOMING]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.CLOSED]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.NONE]: "hidden",
};

/**
 * 행사의 신청 상태를 계산한다 (순수 함수 — now를 주입받아 테스트 가능).
 * @param {import('@/services/eventsService').Event|null} event
 * @param {Date} [now]
 * @returns {{
 *   status: "none"|"upcoming"|"open"|"closed",
 *   label: string,
 *   disabled: boolean,
 *   reason: null|"before"|"period_ended"|"full"|"event_passed",
 *   remaining: number|null,
 *   opensAt: string|null,
 *   closesAt: string|null,
 * }}
 */
export function getRegistrationState(event, now = new Date()) {
  const base = {
    label: "",
    disabled: true,
    reason: null,
    remaining: null,
    opensAt: null,
    closesAt: null,
  };

  if (!event) return { ...base, status: REG_STATUS.NONE };
  if (event.canRegister !== true) return { ...base, status: REG_STATUS.NONE };

  const today = startOfDay(now);
  const eventDay = parseLocalDate(event.date);
  const regStart = event.registrationStart ? parseLocalDate(event.registrationStart) : null;
  const regEnd = event.registrationEnd
    ? endOfDay(parseLocalDate(event.registrationEnd))
    : eventDay
      ? endOfDay(eventDay)
      : null;

  // 1) 행사 자체가 이미 지남 — 최우선
  if (eventDay && eventDay < today) {
    return {
      ...base,
      status: REG_STATUS.CLOSED,
      label: LABEL[REG_STATUS.CLOSED],
      reason: "event_passed",
    };
  }

  // 2) 신청 기간 전
  if (regStart && now < regStart) {
    return {
      ...base,
      status: REG_STATUS.UPCOMING,
      label: LABEL[REG_STATUS.UPCOMING],
      reason: "before",
      opensAt: formatDotDate(event.registrationStart),
    };
  }

  // 3) 신청 기간 종료
  if (regEnd && now > regEnd) {
    return {
      ...base,
      status: REG_STATUS.CLOSED,
      label: LABEL[REG_STATUS.CLOSED],
      reason: "period_ended",
      closesAt: event.registrationEnd ? formatDotDate(event.registrationEnd) : null,
    };
  }

  // 4) 정원 초과
  if (event.capacity != null && (event.registeredCount ?? 0) >= event.capacity) {
    return {
      ...base,
      status: REG_STATUS.CLOSED,
      label: LABEL[REG_STATUS.CLOSED],
      reason: "full",
    };
  }

  // 5) 신청 가능
  const remaining =
    event.capacity != null ? Math.max(0, event.capacity - (event.registeredCount ?? 0)) : null;
  return {
    status: REG_STATUS.OPEN,
    label: LABEL[REG_STATUS.OPEN],
    disabled: false,
    reason: null,
    remaining,
    opensAt: null,
    closesAt: event.registrationEnd ? formatDotDate(event.registrationEnd) : null,
  };
}

/** 신청 불가/대기 사유를 사용자 안내 문구로 변환 */
export function getRegistrationMessage(state) {
  if (!state) return "";
  switch (state.reason) {
    case "before":
      return state.opensAt
        ? `신청은 ${state.opensAt}부터 가능합니다.`
        : "아직 신청 기간이 아닙니다.";
    case "period_ended":
      return state.closesAt
        ? `신청이 ${state.closesAt}에 마감되었습니다.`
        : "신청이 마감되었습니다.";
    case "full":
      return "정원이 모두 마감되었습니다.";
    case "event_passed":
      return "이미 종료된 행사입니다.";
    default:
      if (state.status === REG_STATUS.OPEN && state.remaining != null) {
        return `잔여 ${state.remaining}명`;
      }
      return "";
  }
}
