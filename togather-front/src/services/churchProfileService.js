import api from "./api";

/**
 * @typedef {{ representativeImageUrl: string|null, slogan: string|null,
 *   offeringBankName: string|null, offeringAccountNumber: string|null,
 *   offeringAccountHolder: string|null, offeringNote: string|null,
 *   instagramUrl: string|null, websiteUrl: string|null }} ChurchProfile
 */

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
 * 교회 프로필 부분 수정 (관리자) — 생략한 필드는 보존하고, null인 필드는 삭제한다.
 * @param {string} churchId
 * @param {Partial<ChurchProfile>} payload
 * @returns {Promise<ChurchProfile>}
 */
export async function updateChurchProfile(churchId, payload) {
  const res = await api.patch(`/church/admin/profile`, payload);
  return res.data.data;
}
