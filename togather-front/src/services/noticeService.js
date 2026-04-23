/**
 * @typedef {{ id:number, type:string, featured:boolean, title:string,
 *   body:string, date:string, author:string }} Notice
 */

import api, { USE_DUMMY } from "./api";
import { DUMMY_NOTICES } from "@/data/dummy/notices";

/**
 * 공지 목록 조회
 * @param {string} churchId
 * @param {{ page?:number, limit?:number }} params
 * @returns {Promise<Notice[]>}
 */
export async function getNotices(churchId, params = {}) {
  if (USE_DUMMY) return DUMMY_NOTICES;
  const res = await api.get(`/churches/${churchId}/notices`, { params });
  return res.data.data;
}
