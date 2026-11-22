import api from "./api";
import { formatKoreanDate } from "@/utils/date";

/**
 * @typedef {{ issueNo: string, date: string }} JuboInfo
 * @typedef {{ id: string|number, issueNo: string, date: string, dateLabel: string, sermonTitle: string, verse: string, current?: boolean }} JuboIssue
 * @typedef {{ label: string, time: string }} WorshipService
 * @typedef {{ role: string, name: string }} OrderRow
 * @typedef {Record<string, OrderRow[]>} WorshipOrderMap
 * @typedef {{ role: string, part1: string, part2: string }} VolunteerRow
 * @typedef {{ title: string, items: string[] }} TitledGroup
 * @typedef {{ organization: string, target: string, region: string }} SupportRow
 * @typedef {{ name: string, location: string, time: string, leader: string }} DistrictRow
 * @typedef {{ photos: { church: string|null, panorama: string|null, group: string|null } }} CoverContent
 * @typedef {{ title: string, scripture: string, outline: string[] }} SermonNote
 * @typedef {{ title: string, subtitle: string, category: string }} PrayerTopic
 * @typedef {"WORSHIP_SERVICES"|"WORSHIP_ORDER"|"VOLUNTEER"|"OFFERING"|"SUPPORT"|"DISTRICTS"|"MINISTERS"|"COVER"|"NEWS"|"PRAYER_TOPICS"|"SERMON_NOTE"} JuboSectionType
 */

/** 현재 발행된 주보의 호수/날짜 @returns {Promise<JuboInfo>} */
export async function getJuboInfo(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/current`);
  return res.data.data;
}

/** 백엔드 아카이브 요약(title/scripture/juboDate)을 프론트 JuboIssue shape으로 변환한다. */
function toJuboIssue(summary, currentIssueNo) {
  return {
    id: summary.id,
    issueNo: summary.issueNo,
    date: summary.juboDate,
    dateLabel: formatKoreanDate(summary.juboDate),
    sermonTitle: summary.title,
    verse: summary.scripture,
    coverImageUrl: summary.coverImageUrl,
    current: currentIssueNo != null && summary.issueNo === currentIssueNo,
  };
}

/**
 * 발행된 주보 목록(최신순).
 * @returns {Promise<JuboIssue[]>}
 */
export async function getJuboIssues(churchId) {
  const [{ data: archive }, current] = await Promise.all([
    api.get(`/churches/${churchId}/jubo`),
    getJuboInfo(churchId).catch(() => null),
  ]);
  return archive.data.map((summary) => toJuboIssue(summary, current?.issueNo));
}

/** null/undefined는 물론, 배열이 아닌 값(백엔드가 빈 목록을 {}로 내려주는 경우 등)도 전부
 * 빈 배열로 떨어뜨린다 — "raw ?? []"만으로는 object가 그대로 통과해 rows.map()이 터진다. */
function asArray(raw) {
  return Array.isArray(raw) ? raw : [];
}

// 섹션별 백엔드 원본 → 프론트 shape 변환. 개별 get*와 getCurrentJuboSections(통합 조회)가
// 공유한다 — 변환 로직을 한 곳에만 두어 두 경로의 결과가 어긋나지 않게 한다.
const sectionTransforms = {
  /** 백엔드는 레이블 문자열 배열만 반환한다(시간 정보 없음) — WorshipService{label,time}로 감싼다. */
  /** 콘텐츠는 자유형식 JSON이라 저장 형식은 이 프론트가 정한다 — 레거시 문자열 배열(시간 정보 없음)과
   * 현재 형식({label,time})을 둘 다 받아들인다. */
  WORSHIP_SERVICES: (raw) =>
    asArray(raw).map((item) =>
      typeof item === "string" ? { label: item, time: "" } : { label: item?.label ?? "", time: item?.time ?? "" },
    ),
  /** 전체 맵 그대로 — 클라이언트에서 서비스 라벨로 조회한다. */
  WORSHIP_ORDER: (raw) => raw ?? {},
  VOLUNTEER: asArray,
  OFFERING: asArray,
  SUPPORT: asArray,
  DISTRICTS: asArray,
  MINISTERS: asArray,
  COVER: (raw) => raw ?? {},
  NEWS: asArray,
  PRAYER_TOPICS: asArray,
  SERMON_NOTE: (raw) => raw ?? {},
};

/** @returns {Promise<WorshipService[]>} */
export async function getWorshipServices(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/worship-services`);
  return sectionTransforms.WORSHIP_SERVICES(res.data.data);
}

/** serviceType 없이 호출해 전체 맵을 받는다 @returns {Promise<WorshipOrderMap>} */
export async function getWorshipOrder(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/worship-order`);
  return sectionTransforms.WORSHIP_ORDER(res.data.data);
}

/** @returns {Promise<VolunteerRow[]>} */
export async function getVolunteer(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/volunteer`);
  return sectionTransforms.VOLUNTEER(res.data.data);
}

/** @returns {Promise<TitledGroup[]>} */
export async function getOffering(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/offering`);
  return sectionTransforms.OFFERING(res.data.data);
}

/** @returns {Promise<TitledGroup[]>} */
export async function getSupport(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/support`);
  return sectionTransforms.SUPPORT(res.data.data);
}

/** @returns {Promise<DistrictRow[]>} */
export async function getDistricts(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/districts`);
  return sectionTransforms.DISTRICTS(res.data.data);
}

/** @returns {Promise<TitledGroup[]>} */
export async function getMinisters(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/ministers`);
  return sectionTransforms.MINISTERS(res.data.data);
}

/** @returns {Promise<CoverContent>} */
export async function getCover(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/cover`);
  return sectionTransforms.COVER(res.data.data);
}

/** @returns {Promise<TitledGroup[]>} */
export async function getNews(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/news`);
  return sectionTransforms.NEWS(res.data.data);
}

/** @returns {Promise<PrayerTopic[]>} */
export async function getPrayerTopics(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/prayer-topics`);
  return sectionTransforms.PRAYER_TOPICS(res.data.data);
}

/** @returns {Promise<SermonNote>} */
export async function getSermonNote(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/sermon-note`);
  return sectionTransforms.SERMON_NOTE(res.data.data);
}

/**
 * 공개 화면 전용 — 표시할 주보 1건의 메타(호수·날짜·설교제목/본문)와 섹션 전체를 한 번에
 * 가져온다. juboId를 안 주면 최신 발행본을 쓴다("현재 주보" 기본 뷰).
 *
 * 기존에는 공개 페이지마다 섹션 엔드포인트(worship-services/worship-order/volunteer/...)를
 * 각자 따로 불러서, 주보 하나를 볼 때 10개 넘는 요청이 나갔다(게다가 그 엔드포인트들은 "현재"
 * 섹션만 반환해 지난 호를 봐도 최신 내용이 섞여 나오는 문제도 있었다). `/jubo/{id}` 상세가
 * 섹션 전체를 이미 한 번에 내려주므로, 이 함수로 최대 2번(아카이브 1건 조회 + 상세)만 부른다.
 * 관리자 에디터는 섹션 단위로 저장하기 때문에 개별 get 함수들과 updateJuboSection을 계속 쓴다.
 *
 * @param {string} churchId
 * @param {number|string} [juboId]
 * @returns {Promise<(JuboIssue & {sections: Record<string, any>})|null>}
 */
export async function getJuboWithSections(churchId, juboId) {
  let id = juboId;
  if (!id) {
    const { data: archive } = await api.get(`/churches/${churchId}/jubo`, { params: { size: 1 } });
    id = archive.data?.[0]?.id;
    if (!id) return null;
  }
  const { data: detail } = await api.get(`/churches/${churchId}/jubo/${id}`);
  const d = detail.data;
  const raw = d.sections ?? {};
  return {
    id: d.id,
    issueNo: d.issueNo,
    date: d.juboDate,
    dateLabel: formatKoreanDate(d.juboDate),
    sermonTitle: d.title,
    verse: d.scripture,
    coverImageUrl: d.coverImageUrl,
    juboTemplateVersion: d.juboTemplateVersion,
    sections: {
      worshipServices: sectionTransforms.WORSHIP_SERVICES(raw.WORSHIP_SERVICES),
      worshipOrder: sectionTransforms.WORSHIP_ORDER(raw.WORSHIP_ORDER),
      volunteer: sectionTransforms.VOLUNTEER(raw.VOLUNTEER),
      offering: sectionTransforms.OFFERING(raw.OFFERING),
      support: sectionTransforms.SUPPORT(raw.SUPPORT),
      districts: sectionTransforms.DISTRICTS(raw.DISTRICTS),
      ministers: sectionTransforms.MINISTERS(raw.MINISTERS),
      cover: sectionTransforms.COVER(raw.COVER),
      news: sectionTransforms.NEWS(raw.NEWS),
      prayerTopics: sectionTransforms.PRAYER_TOPICS(raw.PRAYER_TOPICS),
      sermonNote: sectionTransforms.SERMON_NOTE(raw.SERMON_NOTE),
    },
  };
}

/**
 * 주보 발행 초안 생성 (관리자)
 * @param {string} churchId
 * @param {{ issueNo: string, juboDate: string }} payload - juboDate는 "YYYY-MM-DD"
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function createJuboIssue(churchId, payload) {
  const res = await api.post(`/church/admin/jubo`, payload);
  return res.data.data;
}

/**
 * 섹션 저장 (관리자) — content는 자유형식 JSON, 섹션 타입별 정확한 모양은 juboService.test.js와
 * 각 SectionEditor 컴포넌트를 참고한다.
 * @param {string} churchId
 * @param {number|string} juboId
 * @param {JuboSectionType} sectionType
 * @param {object} content
 */
export async function updateJuboSection(churchId, juboId, sectionType, content) {
  await api.put(`/church/admin/jubo/${juboId}/sections/${sectionType}`, content);
}

/**
 * 주보 발행 (관리자)
 * @param {string} churchId
 * @param {number|string} juboId
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function publishJubo(churchId, juboId) {
  const res = await api.post(`/church/admin/jubo/${juboId}/publish`);
  return res.data.data;
}

/**
 * 미발행 초안 확인 (관리자) — 새로고침 후에도 같은 초안을 이어 편집할 수 있도록 juboId를 복원한다.
 * 초안이 없으면 null.
 * @returns {Promise<{id:number,issueNo:string,juboDate:string,juboTemplateVersion?:string,published:boolean}|null>}
 */
export async function getJuboDraft() {
  try {
    const res = await api.get(`/church/admin/jubo/draft`);
    return res.data.data;
  } catch (err) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

/** 교회 기본 주보 템플릿 버전 (관리자) @returns {Promise<"v1"|"v2"|null>} */
export async function getJuboSettings() {
  const res = await api.get(`/church/admin/jubo/settings`);
  return res.data.data?.juboTemplateVersion ?? null;
}

/** 교회 기본 주보 템플릿 버전 변경 (관리자) @param {"v1"|"v2"} version */
export async function updateJuboSettings(version) {
  await api.put(`/church/admin/jubo/settings`, { juboTemplateVersion: version });
}
