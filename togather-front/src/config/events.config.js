/**
 * Events Configuration
 * 실제 서비스에서는 API로 대체 예정
 */

export const EVENT_CATEGORIES = ["예배", "청년부", "선교회", "내 공동체"];

export const SAMPLE_EVENTS = {
  1: {
    id: 1,
    title: "전교인 체육대회",
    location: "장소명",
    department: "전교인",
    date: "2025/01/21",
    description:
      "전교인이 하나되는 행사입니다. 남녀노소 함께 보여 하나님안에서 하나되는 기쁨을 누리시길 바랍니다.\n참석을 희망하시는 분은...",
    canApply: true,
  },
};

export const DEFAULT_EVENT = {
  title: "행사 이름",
  location: "장소명",
  department: "부서 이름",
  date: "2025/01/01",
  description: "행사 내용을 입력하세요.",
  canApply: true,
};
