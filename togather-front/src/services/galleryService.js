/**
 * @typedef {{ id:number, name:string, desc:string }} Community
 * @typedef {{ id:number, communityId:number, title:string, date:string,
 *   desc:string, imageUrl:string|null }} Photo
 */

import api, { isDummy } from "./api";
import { DUMMY_COMMUNITIES, DUMMY_PHOTOS } from "@/data/dummy/gallery";

/**
 * 공동체 목록 조회
 * @param {string} churchId
 * @returns {Promise<Community[]>}
 */
export async function getCommunities(churchId) {
  if (isDummy("gallery")) return DUMMY_COMMUNITIES;
  const res = await api.get(`/churches/${churchId}/communities`);
  return res.data.data;
}

/**
 * 갤러리 사진 목록 조회
 * @param {string} churchId
 * @param {{ communityId?:number, page?:number, limit?:number }} params
 *   - page: 백엔드는 0-based. 이 함수는 변환 없이 그대로 전달한다(noticeService/memberService의 1-based 변환과 다름).
 * @returns {Promise<Photo[]>}
 */
export async function getPhotos(churchId, params = {}) {
  if (isDummy("gallery")) {
    const { communityId } = params;
    return communityId ? DUMMY_PHOTOS.filter((p) => p.communityId === communityId) : DUMMY_PHOTOS;
  }
  const res = await api.get(`/churches/${churchId}/gallery`, { params });
  return res.data.data;
}

/**
 * 공동체 등록 (관리자)
 * @param {string} churchId
 * @param {{ name:string, desc?:string }} payload
 * @returns {Promise<Community>}
 */
export async function createCommunity(churchId, payload) {
  if (isDummy("gallery")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_COMMUNITIES.push(created);
    return created;
  }
  const res = await api.post(`/church/admin/communities`, payload);
  return res.data.data;
}

/**
 * 사진 등록 (관리자) — 응답이 {id,communityId,title}뿐이라 제출 폼 값과 합쳐 반환한다.
 * @param {string} churchId
 * @param {{ communityId:number, title:string, date?:string, desc?:string, imageUrl?:string }} payload
 * @returns {Promise<Photo>}
 */
export async function createPhoto(churchId, payload) {
  if (isDummy("gallery")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_PHOTOS.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/gallery`, payload);
  return { ...payload, id: res.data.data.id };
}

/**
 * 사진 삭제 (관리자)
 * @param {string} churchId
 * @param {number} photoId
 */
export async function deletePhoto(churchId, photoId) {
  if (isDummy("gallery")) {
    const idx = DUMMY_PHOTOS.findIndex((p) => p.id === photoId);
    if (idx !== -1) DUMMY_PHOTOS.splice(idx, 1);
    return;
  }
  await api.delete(`/church/admin/gallery/${photoId}`);
}
