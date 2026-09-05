import { parseLocalDate, startOfDay } from "./date";

/** 행사 신청 상태 */
export const REG_STATUS = {
  NONE: "none", // 신청을 받지 않는 행사 → 버튼 미노출
  NOT_YET_OPEN: "not_yet_open", // 신청 기간 시작 전
  OPEN: "open", // 신청하기
  FULL: "full", // 정원 마감
  CLOSED: "closed", // 신청 마감 (행사일 경과 또는 신청 기간 종료)
};

const LABEL = {
  [REG_STATUS.NONE]: "",
  [REG_STATUS.NOT_YET_OPEN]: "신청 예정",
  [REG_STATUS.OPEN]: "신청하기",
  [REG_STATUS.FULL]: "정원 마감",
  [REG_STATUS.CLOSED]: "신청 마감",
};

/** 버튼 톤 클래스 (배경/글자/테두리) */
export const REG_BTN_TONE = {
  [REG_STATUS.OPEN]: "bg-blue-7 text-white border-blue-7 hover:bg-blue-8",
  [REG_STATUS.NOT_YET_OPEN]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.FULL]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.CLOSED]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.NONE]: "hidden",
};

/**
 * 행사의 신청 상태를 계산한다 (순수 함수 — now를 주입받아 테스트 가능).
 * capacity/registrationStart/registrationEnd가 없는(null) 행사는 해당 조건을 건너뛴다.
 * @param {import('@/services/eventsService').Event|null} event
 * @param {Date} [now]
 * @returns {{ status: "none"|"not_yet_open"|"open"|"full"|"closed", label: string, disabled: boolean }}
 */
export function getRegistrationState(event, now = new Date()) {
  if (!event || event.canRegister !== true) {
    return { status: REG_STATUS.NONE, label: LABEL[REG_STATUS.NONE], disabled: true };
  }

  const today = startOfDay(now);
  const eventDay = parseLocalDate(event.date);

  if (eventDay && eventDay < today) {
    return { status: REG_STATUS.CLOSED, label: LABEL[REG_STATUS.CLOSED], disabled: true };
  }

  if (event.registrationStart) {
    const start = parseLocalDate(event.registrationStart);
    if (start && today < start) {
      return {
        status: REG_STATUS.NOT_YET_OPEN,
        label: LABEL[REG_STATUS.NOT_YET_OPEN],
        disabled: true,
      };
    }
  }

  if (event.registrationEnd) {
    const end = parseLocalDate(event.registrationEnd);
    if (end && today > end) {
      return { status: REG_STATUS.CLOSED, label: LABEL[REG_STATUS.CLOSED], disabled: true };
    }
  }

  if (
    typeof event.capacity === "number" &&
    typeof event.registeredCount === "number" &&
    event.registeredCount >= event.capacity
  ) {
    return { status: REG_STATUS.FULL, label: LABEL[REG_STATUS.FULL], disabled: true };
  }

  return { status: REG_STATUS.OPEN, label: LABEL[REG_STATUS.OPEN], disabled: false };
}

/** 신청 불가 사유를 사용자 안내 문구로 변환 */
export function getRegistrationMessage(state) {
  if (!state) return "";
  if (state.status === REG_STATUS.CLOSED) return "이미 종료된 행사입니다.";
  if (state.status === REG_STATUS.NOT_YET_OPEN) return "아직 신청 기간이 아닙니다.";
  if (state.status === REG_STATUS.FULL) return "정원이 모두 찼습니다.";
  return "";
}
