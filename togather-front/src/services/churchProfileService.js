import api from "./api";

/**
 * @typedef {{ representativeImageUrl: string|null, slogan: string|null,
 *   offeringBankName: string|null, offeringAccountNumber: string|null,
 *   offeringAccountHolder: string|null, instagramUrl: string|null }} ChurchProfile
 */

const EMPTY_PROFILE = {
  representativeImageUrl: null,
  slogan: null,
  offeringBankName: null,
  offeringAccountNumber: null,
  offeringAccountHolder: null,
  instagramUrl: null,
};

/**
 * 교회 프로필(메인화면 대표이미지/슬로건) 조회 — 공개
 * @param {string} churchId
 * @returns {Promise<ChurchProfile>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getChurchProfile(churchId) {
  const res = await api.get(`/church/profile`);
  return res.data.data;
}

/**
 * 교회 프로필 등록/수정 (관리자) — 교회당 1건 upsert(통째 교체이므로 보낼 필드를 빠뜨리지 말 것)
 * @param {string} churchId
 * @param {Partial<ChurchProfile>} payload
 * @returns {Promise<ChurchProfile>}
 */
export async function updateChurchProfile(churchId, payload) {
  const res = await api.put(`/church/admin/profile`, payload);
  return res.data.data;
}
