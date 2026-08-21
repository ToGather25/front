/**
 * @typedef {{ videoId:string, title:string }} LiveSermon
 * @typedef {{ id:string, videoId:string, title:string, date:string, thumbnail:string|null }} PastSermon
 */

import api, { USE_DUMMY, isDummy } from "./api";
import { DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS, DUMMY_ADMIN_SERMONS } from "@/data/dummy/sermons";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// 채널 ID(UCxxxx)는 그대로 업로드 재생목록 ID(UUxxxx)로 치환 가능 — channels.list 호출(1 unit) 절약
function toUploadsPlaylistId(channelId) {
  return channelId?.startsWith("UC") ? `UU${channelId.slice(2)}` : null;
}

/**
 * 채널에서 현재 진행중인 라이브 방송 조회 (없으면 null)
 * search.list(eventType=live)는 100 unit — 자주 호출하지 않도록 주의
 * @param {string|undefined} channelId
 * @returns {Promise<LiveSermon|null>}
 */
export async function getLiveSermon(channelId) {
  if (USE_DUMMY) return DUMMY_LIVE_SERMON;
  if (!channelId || !YOUTUBE_API_KEY) return null;

  const url = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return { videoId: item.id.videoId, title: item.snippet.title };
}

/**
 * 채널 업로드(지난 설교) 목록 조회 — playlistItems.list는 1 unit로 저렴
 * @param {string|undefined} channelId
 * @param {number} maxResults
 * @returns {Promise<PastSermon[]>}
 */
export async function getPastSermons(channelId, maxResults = 12) {
  if (USE_DUMMY) return DUMMY_PAST_SERMONS;
  const playlistId = toUploadsPlaylistId(channelId);
  if (!playlistId || !YOUTUBE_API_KEY) return [];

  const url = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? [])
    .filter((item) => item.snippet?.resourceId?.videoId)
    .map((item) => ({
      id: item.snippet.resourceId.videoId,
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      date: item.snippet.publishedAt?.slice(0, 10).replaceAll("-", "."),
      thumbnail: item.snippet.thumbnails?.medium?.url ?? null,
    }));
}

/**
 * 설교 목록 조회 (관리자) — 백엔드에 목록 조회 API가 없어 더미 모드에서만 항목을 반환한다.
 * 실API 모드에서는 항상 빈 배열을 반환하며, 화면은 등록/수정/삭제 결과를 로컬로 누적해서 보여준다.
 * @param {string} churchId
 * @returns {Promise<object[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getAdminSermons(churchId) {
  if (isDummy("sermon")) return [...DUMMY_ADMIN_SERMONS];
  return [];
}

/**
 * 설교 등록 (관리자)
 * @param {string} churchId
 * @param {{ title:string, scripture?:string, preacher?:string, worshipType?:string, youtubeVideoId?:string, sermonDate:string }} payload
 */
export async function createSermon(churchId, payload) {
  if (isDummy("sermon")) {
    const created = { id: `dummy-${Date.now()}`, ...payload };
    DUMMY_ADMIN_SERMONS.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/sermons`, payload);
  return res.data.data;
}

/**
 * 설교 수정 (관리자)
 * @param {string} churchId
 * @param {string} publicId
 * @param {object} payload
 */
export async function updateSermon(churchId, publicId, payload) {
  if (isDummy("sermon")) {
    const idx = DUMMY_ADMIN_SERMONS.findIndex((s) => s.id === publicId);
    if (idx !== -1) DUMMY_ADMIN_SERMONS[idx] = { ...DUMMY_ADMIN_SERMONS[idx], ...payload };
    return DUMMY_ADMIN_SERMONS[idx] ?? null;
  }
  const res = await api.patch(`/church/admin/sermons/${publicId}`, payload);
  return res.data.data;
}

/**
 * 설교 삭제 (관리자)
 * @param {string} churchId
 * @param {string} publicId
 */
export async function deleteSermon(churchId, publicId) {
  if (isDummy("sermon")) {
    const idx = DUMMY_ADMIN_SERMONS.findIndex((s) => s.id === publicId);
    if (idx !== -1) DUMMY_ADMIN_SERMONS.splice(idx, 1);
    return;
  }
  await api.delete(`/church/admin/sermons/${publicId}`);
}

/**
 * 방송 예약 (관리자) — 백엔드에 조회 API가 없어 이 응답의 id를 호출부가 로컬로 계속 들고 있어야 한다.
 * @param {string} churchId
 * @param {{ sermonId:string, youtubeLiveUrl:string, scheduledStartAt:string }} payload
 * @returns {Promise<{id:number|string, status:"BEFORE"}>}
 */
export async function scheduleBroadcast(churchId, { sermonId, youtubeLiveUrl, scheduledStartAt }) {
  if (isDummy("sermon")) return { id: `dummy-bc-${Date.now()}`, status: "BEFORE" };
  const res = await api.post(`/church/admin/broadcasts`, {
    sermonId,
    youtubeLiveUrl,
    scheduledStartAt,
  });
  return res.data.data;
}

/**
 * 방송 시작
 * @param {string} churchId
 * @param {number|string} broadcastId
 * @returns {Promise<{id:number|string, status:"LIVE"}>}
 */
export async function startBroadcast(churchId, broadcastId) {
  if (isDummy("sermon")) return { id: broadcastId, status: "LIVE" };
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/start`);
  return res.data.data;
}

/**
 * 방송 종료
 * @param {string} churchId
 * @param {number|string} broadcastId
 * @returns {Promise<{id:number|string, status:"ENDED"}>}
 */
export async function endBroadcast(churchId, broadcastId) {
  if (isDummy("sermon")) return { id: broadcastId, status: "ENDED" };
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/end`);
  return res.data.data;
}
