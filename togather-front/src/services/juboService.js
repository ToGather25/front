import api, { isDummy } from "./api";
import { formatKoreanDate } from "@/utils/date";
import {
  DUMMY_JUBO_INFO,
  DUMMY_JUBO_ISSUES,
  DUMMY_WORSHIP_SERVICES,
  DUMMY_WORSHIP_ORDER,
  DUMMY_VOLUNTEER,
  DUMMY_OFFERING,
  DUMMY_SUPPORT,
  DUMMY_DISTRICTS,
  DUMMY_MINISTERS,
  DUMMY_COVER,
  DUMMY_NEWS,
  DUMMY_PRAYER_TOPICS,
  DUMMY_SERMON_NOTE,
} from "@/data/dummy/jubo";

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
  if (isDummy("jubo")) return DUMMY_JUBO_INFO;
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
    current: currentIssueNo != null && summary.issueNo === currentIssueNo,
  };
}

/**
 * 발행된 주보 목록(최신순).
 * @returns {Promise<JuboIssue[]>}
 */
export async function getJuboIssues(churchId) {
  if (isDummy("jubo")) return DUMMY_JUBO_ISSUES;
  const [{ data: archive }, current] = await Promise.all([
    api.get(`/churches/${churchId}/jubo`),
    getJuboInfo(churchId).catch(() => null),
  ]);
  return archive.data.map((summary) => toJuboIssue(summary, current?.issueNo));
}

/**
 * 발행된 특정 주보 1건 — issueNo/dateLabel만 채워진다. 백엔드 상세 응답은
 * sermonTitle/verse에 대응하는 flat 필드가 없고 sections(SERMON_NOTE)로만
 * 내려오는데, 그 섹션 콘텐츠 shape이 프론트 어디에도 아직 안 쓰이고 있어
 * 확인된 필드명이 없다 — 확인 전까지 비워둔다(Cover.jsx는 issueNo/dateLabel만
 * 쓰므로 표지 탭은 정상 동작, Sermon.jsx가 쓰는 sermonTitle/verse만 비어 보임).
 * @returns {Promise<JuboIssue|null>}
 */
export async function getJuboIssue(churchId, issueId) {
  if (isDummy("jubo"))
    return DUMMY_JUBO_ISSUES.find((issue) => String(issue.id) === String(issueId)) ?? null;
  const res = await api.get(`/churches/${churchId}/jubo/${issueId}`);
  const d = res.data.data;
  return {
    id: d.id,
    issueNo: d.issueNo,
    date: d.juboDate,
    dateLabel: formatKoreanDate(d.juboDate),
    sermonTitle: "",
    verse: "",
  };
}

/** @returns {Promise<WorshipService[]>} */
export async function getWorshipServices(churchId) {
  if (isDummy("jubo")) return DUMMY_WORSHIP_SERVICES;
  const res = await api.get(`/churches/${churchId}/jubo/worship-services`);
  return res.data.data;
}

/** serviceType 없이 호출해 전체 맵을 받는다 — 클라이언트에서 라벨로 조회한다 @returns {Promise<WorshipOrderMap>} */
export async function getWorshipOrder(churchId) {
  if (isDummy("jubo")) return DUMMY_WORSHIP_ORDER;
  const res = await api.get(`/churches/${churchId}/jubo/worship-order`);
  return res.data.data;
}

/** @returns {Promise<VolunteerRow[]>} */
export async function getVolunteer(churchId) {
  if (isDummy("jubo")) return DUMMY_VOLUNTEER;
  const res = await api.get(`/churches/${churchId}/jubo/volunteer`);
  return res.data.data;
}

/** @returns {Promise<TitledGroup[]>} */
export async function getOffering(churchId) {
  if (isDummy("jubo")) return DUMMY_OFFERING;
  const res = await api.get(`/churches/${churchId}/jubo/offering`);
  return res.data.data;
}

/** @returns {Promise<SupportRow[]>} */
export async function getSupport(churchId) {
  if (isDummy("jubo")) return DUMMY_SUPPORT;
  const res = await api.get(`/churches/${churchId}/jubo/support`);
  return res.data.data;
}

/** @returns {Promise<DistrictRow[]>} */
export async function getDistricts(churchId) {
  if (isDummy("jubo")) return DUMMY_DISTRICTS;
  const res = await api.get(`/churches/${churchId}/jubo/districts`);
  return res.data.data;
}

/** @returns {Promise<TitledGroup[]>} */
export async function getMinisters(churchId) {
  if (isDummy("jubo")) return DUMMY_MINISTERS;
  const res = await api.get(`/churches/${churchId}/jubo/ministers`);
  return res.data.data;
}

/** @returns {Promise<CoverContent>} */
export async function getCover(churchId) {
  if (isDummy("jubo")) return DUMMY_COVER;
  const res = await api.get(`/churches/${churchId}/jubo/cover`);
  return res.data.data;
}

/** @returns {Promise<TitledGroup[]>} */
export async function getNews(churchId) {
  if (isDummy("jubo")) return DUMMY_NEWS;
  const res = await api.get(`/churches/${churchId}/jubo/news`);
  return res.data.data;
}

/** @returns {Promise<PrayerTopic[]>} */
export async function getPrayerTopics(churchId) {
  if (isDummy("jubo")) return DUMMY_PRAYER_TOPICS;
  const res = await api.get(`/churches/${churchId}/jubo/prayer-topics`);
  return res.data.data;
}

/** @returns {Promise<SermonNote>} */
export async function getSermonNote(churchId) {
  if (isDummy("jubo")) return DUMMY_SERMON_NOTE;
  const res = await api.get(`/churches/${churchId}/jubo/sermon-note`);
  return res.data.data;
}

/**
 * 주보 발행 초안 생성 (관리자)
 * @param {string} churchId
 * @param {{ issueNo: string, juboDate: string }} payload - juboDate는 "YYYY-MM-DD"
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function createJuboIssue(churchId, payload) {
  if (isDummy("jubo")) return { id: `dummy-${Date.now()}`, ...payload, published: false };
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
  if (isDummy("jubo")) return;
  await api.put(`/church/admin/jubo/${juboId}/sections/${sectionType}`, content);
}

/**
 * 주보 발행 (관리자)
 * @param {string} churchId
 * @param {number|string} juboId
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function publishJubo(churchId, juboId) {
  if (isDummy("jubo")) return { id: juboId, issueNo: "", juboDate: "", published: true };
  const res = await api.post(`/church/admin/jubo/${juboId}/publish`);
  return res.data.data;
}
