/**
 * @typedef {{ videoId:string, title:string }} LiveSermon
 * @typedef {{ id:string, videoId:string, title:string, date:string, thumbnail:string|null }} PastSermon
 */

import { USE_DUMMY } from "./api";
import { DUMMY_LIVE_SERMON, DUMMY_PAST_SERMONS } from "@/data/dummy/sermons";

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
