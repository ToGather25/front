import api from "./api";

/** @typedef {{id:number, type:string, title?:string, content:string, status:string, reply:{author:string,text:string}|null, createdAt:string}} AdminPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} AdminMemberInquiry */

/** 기도/상담 전체 목록 (관리자) @returns {Promise<AdminPrayer[]>} */
export async function getAdminPrayers() {
  const res = await api.get(`/church/admin/prayers`);
  return res.data.data;
}

/** 기도/상담 답변 저장 (관리자) @param {number} id @param {string} text */
export async function replyToPrayer(id, text) {
  const res = await api.put(`/church/admin/prayers/${id}/reply`, { text });
  return res.data.data;
}

/** 교인 문의 전체 목록 (관리자) — 작성자 이름/연락처는 포함하지 않는다. @returns {Promise<AdminMemberInquiry[]>} */
export async function getAdminMemberInquiries() {
  const res = await api.get(`/church/admin/member-inquiries`);
  return res.data.data;
}

/** 교인 문의 답변 저장 (관리자) @param {number} id @param {string} answer */
export async function answerMemberInquiry(id, answer) {
  const res = await api.put(`/church/admin/member-inquiries/${id}/answer`, { answer });
  return res.data.data;
}
