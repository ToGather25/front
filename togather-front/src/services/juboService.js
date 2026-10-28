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

/**
 * 발행된 특정 주보 1건. 백엔드 상세 응답의 flat 필드 title/scripture가
 * 프론트의 sermonTitle/verse에 대응한다(목록 응답과 같은 관례 — toJuboIssue 참고).
 * @returns {Promise<JuboIssue|null>}
 */
export async function getJuboIssue(churchId, issueId) {
  const res = await api.get(`/churches/${churchId}/jubo/${issueId}`);
  const d = res.data.data;
  return {
    id: d.id,
    issueNo: d.issueNo,
    date: d.juboDate,
    dateLabel: formatKoreanDate(d.juboDate),
    sermonTitle: d.title,
    verse: d.scripture,
  };
}

/** 백엔드는 레이블 문자열 배열만 반환한다(시간 정보 없음) — WorshipService{label,time} 모양으로 감싼다. @returns {Promise<WorshipService[]>} */
export async function getWorshipServices(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/worship-services`);
  return (res.data.data ?? []).map((label) => ({ label, time: "" }));
}

/** serviceType 없이 호출해 전체 맵을 받는다 — 클라이언트에서 라벨로 조회한다 @returns {Promise<WorshipOrderMap>} */
export async function getWorshipOrder(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/worship-order`);
  return res.data.data;
}

/** 백엔드는 {weeks:[{label:"이번주"|"다음주", roles:[{role,name}]}]} 모양으로 준다 —
 * 두 주를 part1/part2로 짝지어 VolunteerRow[] 모양으로 합친다. @returns {Promise<VolunteerRow[]>} */
export async function getVolunteer(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/volunteer`);
  const weeks = res.data.data?.weeks ?? [];
  const thisWeek = weeks.find((w) => w.label === "이번주")?.roles ?? [];
  const nextWeek = weeks.find((w) => w.label === "다음주")?.roles ?? [];
  const roleOrder = [];
  [...thisWeek, ...nextWeek].forEach(({ role }) => {
    if (!roleOrder.includes(role)) roleOrder.push(role);
  });
  return roleOrder.map((role) => ({
    role,
    part1: thisWeek.find((r) => r.role === role)?.name ?? "",
    part2: nextWeek.find((r) => r.role === role)?.name ?? "",
  }));
}

/** @returns {Promise<TitledGroup[]>} */
export async function getOffering(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/offering`);
  return res.data.data;
}

/** 백엔드는 {category, items:[기관명...]} 묶음으로 준다 — offering/news와 같은 TitledGroup 모양이라
 * title/items로 맞춰 반환한다(과거 문서화됐던 organization/target/region 행과는 다름).
 * @returns {Promise<TitledGroup[]>} */
export async function getSupport(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/support`);
  return (res.data.data ?? []).map(({ category, items }) => ({ title: category, items }));
}

/** 백엔드 필드명(zone/place)을 DistrictRow(name/location)로 맞춘다. @returns {Promise<DistrictRow[]>} */
export async function getDistricts(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/districts`);
  return (res.data.data ?? []).map(({ zone, place, time, leader }) => ({
    name: zone,
    location: place,
    time,
    leader,
  }));
}

const MINISTER_GROUP_LABELS = { clergy: "교역자", elders: "장로", praise: "찬양팀" };

/** 백엔드는 {clergy:[...], elders:[...], praise:[...]} 객체로 준다(배열 아님) — 각 항목은
 * "직책 | 이름" 문자열. 그룹별 한글 라벨을 붙여 TitledGroup[] 모양으로 변환한다.
 * @returns {Promise<TitledGroup[]>} */
export async function getMinisters(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/ministers`);
  const data = res.data.data ?? {};
  return Object.entries(data).map(([key, items]) => ({
    title: MINISTER_GROUP_LABELS[key] ?? key,
    items,
  }));
}

/** @returns {Promise<CoverContent>} */
export async function getCover(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/cover`);
  return res.data.data;
}

/** @returns {Promise<TitledGroup[]>} */
export async function getNews(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/news`);
  return res.data.data;
}

/** @returns {Promise<PrayerTopic[]>} */
export async function getPrayerTopics(churchId) {
  const res = await api.get(`/churches/${churchId}/jubo/prayer-topics`);
  return res.data.data;
}

/** @returns {Promise<SermonNote>} */
export async function getSermonNote(churchId) {
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
