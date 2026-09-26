import api from "./api";

/**
 * 교회 가입 승인 (CHURCH_ADMIN 전용)
 *
 * @typedef {Object} SignupRequestItem
 * @property {number} requestId
 * @property {string} name
 * @property {string} phone        - 관리자 식별 목적상 원문
 * @property {string} birthDate    - "YYYY-MM-DD"
 * @property {boolean} newcomer
 * @property {"PENDING"|"APPROVED"|"REJECTED"} status
 * @property {string} requestedAt  - ISO datetime
 */

/**
 * 가입 요청 목록 — 요청 시각 오름차순(FIFO)
 * @param {"PENDING"|"APPROVED"|"REJECTED"} status
 * @returns {Promise<SignupRequestItem[]>}
 */
export async function getSignupRequests(status = "PENDING") {
  const res = await api.get(`/church/admin/signup-requests`, { params: { status } });
  return res.data.data;
}

/** 가입 승인 — 계정이 생성된다. @param {number} requestId */
export async function approveSignupRequest(requestId) {
  const res = await api.post(`/church/admin/signup-requests/${requestId}/approve`);
  return res.data.data;
}

/** 가입 거절 @param {number} requestId */
export async function rejectSignupRequest(requestId) {
  await api.post(`/church/admin/signup-requests/${requestId}/reject`);
}
