import api from "./api";

/**
 * @typedef {{code:string, label:string, to:string, visible:boolean, orderNo:number, children:MenuItem[]}} MenuItem
 */

/**
 * 공개 메뉴 트리 — 숨긴 항목(부모 포함 하위 전체)은 응답에서 이미 제외되어 있다.
 * @param {string} churchId
 * @returns {Promise<MenuItem[]>}
 */
export async function getPublicMenus(churchId) {
  const res = await api.get(`/churches/${churchId}/menus`);
  return res.data.data;
}

/**
 * 메뉴 트리 전체 조회 (관리자) — 숨긴 항목 포함.
 * @returns {Promise<MenuItem[]>}
 */
export async function getAdminMenus() {
  const res = await api.get(`/church/admin/menus`);
  return res.data.data;
}

/**
 * 메뉴 트리 전체 교체 (관리자).
 * @param {MenuItem[]} tree
 */
export async function updateAdminMenus(tree) {
  await api.put(`/church/admin/menus`, tree);
}
