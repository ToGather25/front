/**
 * @typedef {{ id:number, type:string, featured:boolean, title:string,
 *   body:string, date:string, author:string }} Notice
 */

import api, { isDummy } from "./api";
import { DUMMY_NOTICES } from "@/data/dummy/notices";

/**
 * 공지 목록 조회
 * @param {string} churchId
 * @param {{ page?:number, limit?:number }} params
 * @returns {Promise<Notice[]>}
 */
export async function getNotices(churchId, params = {}) {
  if (isDummy("notice")) {
    if (!params.limit) return [...DUMMY_NOTICES];
    const start = ((params.page ?? 1) - 1) * params.limit;
    return DUMMY_NOTICES.slice(start, start + params.limit);
  }
  const res = await api.get(`/churches/${churchId}/notices`, { params });
  return res.data.data;
}

/**
 * 공지 등록 (관리자)
 * @param {string} churchId
 * @param {{ type:string, title:string, body:string, author:string, featured:boolean }} payload
 * @returns {Promise<{noticeId:number|string, title:string, content:string, createdAt:string}>}
 */
export async function createNotice(churchId, payload) {
  if (isDummy("notice")) {
    const created = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      type: payload.type,
      title: payload.title,
      body: payload.body,
      author: payload.author,
      featured: payload.featured,
    };
    DUMMY_NOTICES.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/notices`, {
    title: payload.title,
    content: payload.body,
    type: payload.type,
    featured: payload.featured,
    author: payload.author,
  });
  return res.data.data;
}

/**
 * 공지 수정 (관리자) — 백엔드가 title/content만 받는다. type/author/featured는 등록 시에만 정해진다.
 * @param {string} churchId
 * @param {number|string} noticeId
 * @param {{ title:string, body:string }} payload
 * @returns {Promise<Notice|null>}
 */
export async function updateNotice(churchId, noticeId, payload) {
  if (isDummy("notice")) {
    const idx = DUMMY_NOTICES.findIndex((n) => String(n.id) === String(noticeId));
    if (idx === -1) return null;
    DUMMY_NOTICES[idx] = { ...DUMMY_NOTICES[idx], title: payload.title, body: payload.body };
    return DUMMY_NOTICES[idx];
  }
  const res = await api.patch(`/church/admin/notices/${noticeId}`, {
    title: payload.title,
    content: payload.body,
  });
  return res.data.data;
}

/**
 * 공지 삭제 (관리자)
 * @param {string} churchId
 * @param {number|string} noticeId
 */
export async function deleteNotice(churchId, noticeId) {
  if (isDummy("notice")) {
    const idx = DUMMY_NOTICES.findIndex((n) => String(n.id) === String(noticeId));
    if (idx !== -1) DUMMY_NOTICES.splice(idx, 1);
    return { success: true };
  }
  await api.delete(`/church/admin/notices/${noticeId}`);
  return { success: true };
}
