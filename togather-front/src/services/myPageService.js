import api from "./api";

/** @typedef {{id:number, title:string, date:string, memo:string}} MySchedule */
/** @typedef {{id:number, type:string, content:string, status:string, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */

/**
 * 내 일정 목록 조회
 * @param {string} churchId
 * @returns {Promise<MySchedule[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getMySchedules(churchId) {
  const res = await api.get(`/my/schedules`);
  return res.data.data;
}

/**
 * 내 일정 추가
 * @param {string} churchId
 * @param {{ title:string, date:string, memo?:string }} payload
 * @returns {Promise<MySchedule>}
 */
export async function addMySchedule(churchId, payload) {
  const res = await api.post(`/my/schedules`, payload);
  return res.data.data;
}

/**
 * 내 일정 삭제
 * @param {string} churchId
 * @param {number} id
 */
export async function deleteMySchedule(churchId, id) {
  await api.delete(`/my/schedules/${id}`);
}

/**
 * 내 기도/상담 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyPrayer[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getMyPrayers(churchId) {
  const res = await api.get(`/my/prayers`);
  return res.data.data;
}

/**
 * 기도/상담 신청
 * @param {string} churchId
 * @param {{ type:string, content:string }} payload
 * @returns {Promise<MyPrayer>}
 */
export async function addMyPrayer(churchId, payload) {
  const res = await api.post(`/my/prayers`, payload);
  return res.data.data;
}

/**
 * 내 문의 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyInquiry[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getMyInquiries(churchId) {
  const res = await api.get(`/my/inquiries`);
  return res.data.data;
}

/**
 * 문의 등록
 * @param {string} churchId
 * @param {{ title:string, content?:string }} payload
 * @returns {Promise<MyInquiry>}
 */
export async function addMyInquiry(churchId, payload) {
  const res = await api.post(`/my/inquiries`, payload);
  return res.data.data;
}

/**
 * 회원 탈퇴 (즉시 소프트삭제)
 * @param {string} churchId
 */
// oxlint-disable-next-line no-unused-vars
export async function withdrawAccount(churchId) {
  await api.delete(`/my/account`);
}
