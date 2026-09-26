import api from "./api";

/**
 * 교회소개 콘텐츠(섹션별 JSONB passthrough) — 백엔드가 프론트 shape 그대로 저장/반환한다.
 * 즉 각 섹션의 값은 church.config.js의 동명 블록과 동일한 구조다.
 *
 * @typedef {"GREETING"|"VISION"|"HISTORY"|"STAFF"|"FLOOR_GUIDE"|"DIRECTIONS"|"SHUTTLE"|"PARKING"} IntroSectionType
 */

/** 백엔드 섹션 타입 → church(config) 키. ChurchProvider가 이 표로 응답을 병합한다. */
export const INTRO_SECTION_TO_CONFIG_KEY = {
  GREETING: "greeting",
  VISION: "vision",
  HISTORY: "history",
  STAFF: "staff",
  FLOOR_GUIDE: "floorGuide",
  DIRECTIONS: "publicTransit",
  SHUTTLE: "transportGuide",
  PARKING: "parking",
};

/**
 * 설정된 교회소개 섹션 전체 조회 — 공개.
 * 설정되지 않은 섹션은 응답에 아예 없다(= 프론트 기본값 유지).
 * @param {string|number} churchId
 * @returns {Promise<Record<IntroSectionType, unknown>>}
 */
export async function getChurchIntro(churchId) {
  const res = await api.get(`/churches/${churchId}/intro`);
  return res.data.data ?? {};
}

/**
 * 교회소개 섹션 upsert (관리자) — content는 church.config의 해당 블록 shape 그대로.
 * @param {IntroSectionType} section
 * @param {unknown} content
 */
export async function updateChurchIntroSection(section, content) {
  await api.put(`/church/admin/intro/${section}`, content);
}
