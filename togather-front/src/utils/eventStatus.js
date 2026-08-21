import { parseLocalDate, startOfDay } from "./date";

/** 행사 신청 상태. 백엔드에 정원/신청기간 개념이 없어 3단계로만 구분한다. */
export const REG_STATUS = {
  NONE: "none", // 신청을 받지 않는 행사 → 버튼 미노출
  OPEN: "open", // 신청하기 (행사일이 아직 지나지 않음)
  CLOSED: "closed", // 신청 마감 (행사일 경과)
};

const LABEL = {
  [REG_STATUS.NONE]: "",
  [REG_STATUS.OPEN]: "신청하기",
  [REG_STATUS.CLOSED]: "신청 마감",
};

/** 버튼 톤 클래스 (배경/글자/테두리) */
export const REG_BTN_TONE = {
  [REG_STATUS.OPEN]: "bg-blue-7 text-white border-blue-7 hover:bg-blue-8",
  [REG_STATUS.CLOSED]: "bg-grey-3 text-grey-6 border-grey-3 cursor-not-allowed",
  [REG_STATUS.NONE]: "hidden",
};

/**
 * 행사의 신청 상태를 계산한다 (순수 함수 — now를 주입받아 테스트 가능).
 * 백엔드에 정원/신청기간 필드가 없어 canRegister와 행사일만으로 판단한다.
 * @param {import('@/services/eventsService').Event|null} event
 * @param {Date} [now]
 * @returns {{ status: "none"|"open"|"closed", label: string, disabled: boolean }}
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

  return { status: REG_STATUS.OPEN, label: LABEL[REG_STATUS.OPEN], disabled: false };
}

/** 신청 불가 사유를 사용자 안내 문구로 변환 */
export function getRegistrationMessage(state) {
  if (!state) return "";
  if (state.status === REG_STATUS.CLOSED) return "이미 종료된 행사입니다.";
  return "";
}

const registeredKey = (churchId, eventId, userEmail) =>
  `event_registered_${churchId}_${eventId}_${userEmail}`;

/** 이 브라우저에서 이미 신청 완료로 기록됐는지 (백엔드에 조회 API가 없어 로컬로만 추적) */
export function isLocallyRegistered(churchId, eventId, userEmail) {
  if (!userEmail) return false;
  return localStorage.getItem(registeredKey(churchId, eventId, userEmail)) === "true";
}

/** 신청 성공 후 이 브라우저에 신청 완료를 기록한다 */
export function markLocallyRegistered(churchId, eventId, userEmail) {
  if (!userEmail) return;
  localStorage.setItem(registeredKey(churchId, eventId, userEmail), "true");
}
