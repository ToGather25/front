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

// 섹션별 백엔드 원본 → 프론트 shape 변환. 개별 get*와 getCurrentJuboSections(통합 조회)가
// 공유한다 — 변환 로직을 한 곳에만 두어 두 경로의 결과가 어긋나지 않게 한다.
const sectionTransforms = {
  /** 백엔드는 레이블 문자열 배열만 반환한다(시간 정보 없음) — WorshipService{label,time}로 감싼다. */
  WORSHIP_SERVICES: (raw) => (raw ?? []).map((label) => ({ label, time: "" })),
  /** 전체 맵 그대로 — 클라이언트에서 서비스 라벨로 조회한다. */
  WORSHIP_ORDER: (raw) => raw ?? {},
  /** {weeks:[{label:"이번주"|"다음주", roles:[{role,name}]}]} → 두 주를 part1/part2로 짝짓는다. */
  VOLUNTEER: (raw) => {
    const weeks = raw?.weeks ?? [];
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
  },
  OFFERING: (raw) => raw ?? [],
  /** {category, items:[기관명...]}[] → offering/news와 같은 TitledGroup(title/items) 모양으로. */
  SUPPORT: (raw) => (raw ?? []).map(({ category, items }) => ({ title: category, items })),
  /** 백엔드 필드명(zone/place) → DistrictRow(name/location). */
  DISTRICTS: (raw) =>
    (raw ?? []).map(({ zone, place, time, leader }) => ({ name: zone, location: place, time, leader })),
  /** {clergy:[...], elders:[...], praise:[...]}(배열 아님, "직책 | 이름" 문자열 항목) →
   * 그룹별 한글 라벨을 붙여 TitledGroup[]로. */
  MINISTERS: (raw) =>
    Object.entries(raw ?? {}).map(([key, items]) => ({
      title: MINISTER_GROUP_LABELS[key] ?? key,
      items,
    })),
  COVER: (raw) => raw ?? {},
  NEWS: (raw) => raw ?? [],
  PRAYER_TOPICS: (raw) => raw ?? [],
  SERMON_NOTE: (raw) => raw ?? {},
};

const MINISTER_GROUP_LABELS = { clergy: "교역자", elders: "장로", praise: "찬양팀" };

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
