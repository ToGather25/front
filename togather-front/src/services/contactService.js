import api, { isDummy } from "./api";

/**
 * 교회 문의 등록
 * @param {string} churchId
 * @param {{ name:string, phone:string, email?:string, category:string, message:string }} payload
 * @returns {Promise<{contactId:number|string}>}
 */
export async function submitContact(churchId, payload) {
  if (isDummy("contact")) {
    return { contactId: Date.now() };
  }
  const res = await api.post(`/churches/${churchId}/contact`, payload);
  return res.data.data;
}
