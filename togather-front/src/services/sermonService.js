import api from "./api";

/**
 * 설교 등록 (관리자)
 * @param {string} churchId
 * @param {{ title:string, scripture?:string, preacher?:string, worshipType?:string, youtubeVideoId?:string, sermonDate:string }} payload
 */
export async function createSermon(churchId, payload) {
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
  const { title, scripture, preacher, worshipType, youtubeVideoId, sermonDate } = payload;
  const fields = { title, scripture, preacher, worshipType, youtubeVideoId, sermonDate };
  const res = await api.patch(`/church/admin/sermons/${publicId}`, fields);
  return res.data.data;
}

/**
 * 설교 삭제 (관리자)
 * @param {string} churchId
 * @param {string} publicId
 */
export async function deleteSermon(churchId, publicId) {
  await api.delete(`/church/admin/sermons/${publicId}`);
}

/**
 * 방송 예약 (관리자) — 백엔드에 조회 API가 없어 이 응답의 id를 호출부가 로컬로 계속 들고 있어야 한다.
 * @param {string} churchId
 * @param {{ sermonId:string, youtubeLiveUrl:string, scheduledStartAt:string }} payload
 * @returns {Promise<{id:number|string, status:"BEFORE"}>}
 */
export async function scheduleBroadcast(churchId, { sermonId, youtubeLiveUrl, scheduledStartAt }) {
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
  const res = await api.post(`/church/admin/broadcasts/${broadcastId}/end`);
  return res.data.data;
}

/**
 * 전체 YouTube URL(watch/live/youtu.be/embed 형식)에서 embed용 videoId만 추출한다.
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function extractYoutubeVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:live|embed)\/)([\w-]{11})/,
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * 실시간 예배 화면 조회
 * @param {string} churchId
 * @returns {Promise<{state:string, youtubeLiveUrl:string|null, sermon:object|null,
 *   bulletinAvailable:boolean, recentSermons:object[]}>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getLiveScreen(churchId) {
  const screen = (await api.get(`/church/sermons/live`)).data.data;

  // 자동 라이브 감지: 백엔드가 교회 유튜브 채널을 조회(키 보호+캐시)해 현재 라이브 여부를 판정한다.
  // 라이브면 수동 방송 상태와 무관하게 LIVE로 덮어쓴다. 감지 실패 시 기존(수동) 화면을 그대로 사용.
  try {
    const broadcast = (await api.get(`/church/broadcast/live`)).data.data;
    if (broadcast?.live && broadcast.videoId) {
      return {
        ...screen,
        state: "LIVE",
        youtubeLiveUrl: `https://www.youtube.com/watch?v=${broadcast.videoId}`,
      };
    }
  } catch {
    // 자동 감지 실패 → 수동 화면 유지(그레이스풀)
  }
  return screen;
}

/**
 * 설교 검색/목록 조회
 * @param {string} churchId
 * @param {{ keyword?:string, worshipType?:string, page?:number, size?:number }} params - page는 1-based(프론트 관례)
 * @returns {Promise<{ sermons:object[], pageInfo:object }>}
 */
export async function searchSermons(churchId, { keyword, worshipType, page = 1, size = 12 } = {}) {
  const res = await api.get(`/church/sermons`, {
    params: {
      keyword: keyword || undefined,
      worshipType: worshipType || undefined,
      page: page - 1,
      size,
    },
  });
  return { sermons: res.data.data.content, pageInfo: res.data.data.pageInfo };
}

/**
 * 설교 상세 조회
 * @param {string} churchId
 * @param {string} publicId
 * @returns {Promise<object|null>}
 */
export async function getSermonDetail(churchId, publicId) {
  const res = await api.get(`/church/sermons/${publicId}`);
  return res.data.data;
}
