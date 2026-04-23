/**
 * @typedef {{ id:number, name:string, desc:string }} Community
 * @typedef {{ id:number, communityId:number, title:string, date:string,
 *   desc:string, imageUrl:string|null }} Photo
 */

import api, { USE_DUMMY } from "./api";
import { DUMMY_COMMUNITIES, DUMMY_PHOTOS } from "@/data/dummy/gallery";

/**
 * 공동체 목록 조회
 * @param {string} churchId
 * @returns {Promise<Community[]>}
 */
export async function getCommunities(churchId) {
  if (USE_DUMMY) return DUMMY_COMMUNITIES;
  const res = await api.get(`/churches/${churchId}/communities`);
  return res.data.data;
}

/**
 * 갤러리 사진 목록 조회
 * @param {string} churchId
 * @param {{ communityId?:number, page?:number }} params
 * @returns {Promise<Photo[]>}
 */
export async function getPhotos(churchId, params = {}) {
  if (USE_DUMMY) {
    const { communityId } = params;
    return communityId
      ? DUMMY_PHOTOS.filter((p) => p.communityId === communityId)
      : DUMMY_PHOTOS;
  }
  const res = await api.get(`/churches/${churchId}/gallery`, { params });
  return res.data.data;
}
