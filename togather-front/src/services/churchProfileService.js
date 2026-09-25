import api from "./api";

/**
 * @typedef {{ representativeImageUrl: string|null, slogan: string|null,
 *   offeringBankName: string|null, offeringAccountNumber: string|null,
 *   offeringAccountHolder: string|null }} ChurchProfile
 */

const EMPTY_PROFILE = {
  representativeImageUrl: null,
  slogan: null,
  offeringBankName: null,
  offeringAccountNumber: null,
  offeringAccountHolder: null,
};

/** 더미 데이터 사용 여부 — 백엔드 연동 시 항상 false */
function isDummy(type) {
  return false;
}

/**
 * 교회 프로필(메인화면 대표이미지/슬로건) 조회 — 공개
 * @param {string} churchId
 * @returns {Promise<ChurchProfile>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getChurchProfile(churchId) {
  if (isDummy("churchProfile")) return EMPTY_PROFILE;
  const res = await api.get(`/church/profile`);
  return res.data.data;
}

/**
 * 교회 프로필 등록/수정 (관리자) — 교회당 1건 upsert
 * @param {string} churchId
 * @param {{ representativeImageUrl?: string|null, slogan?: string|null }} payload
 * @returns {Promise<ChurchProfile>}
 */
export async function updateChurchProfile(churchId, payload) {
  if (isDummy("churchProfile")) return { ...EMPTY_PROFILE, ...payload };
  const res = await api.put(`/church/admin/profile`, payload);
  return res.data.data;
}
