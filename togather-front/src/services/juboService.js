import api, { isDummy } from "./api";
import {
  DUMMY_JUBO_INFO,
  DUMMY_WORSHIP_SERVICES,
  DUMMY_WORSHIP_ORDER,
  DUMMY_VOLUNTEER,
  DUMMY_OFFERING,
  DUMMY_SUPPORT,
  DUMMY_DISTRICTS,
  DUMMY_MINISTERS,
} from "@/data/dummy/jubo";

/**
 * @typedef {{ issueNo: string, date: string }} JuboInfo
 * @typedef {{ label: string, time: string }} WorshipService
 * @typedef {{ role: string, name: string }} OrderRow
 * @typedef {Record<string, OrderRow[]>} WorshipOrderMap
 * @typedef {{ role: string, part1: string, part2: string }} VolunteerRow
 * @typedef {{ title: string, items: string[] }} TitledGroup
 * @typedef {{ organization: string, target: string, region: string }} SupportRow
 * @typedef {{ name: string, location: string, time: string, leader: string }} DistrictRow
 * @typedef {"WORSHIP_SERVICES"|"WORSHIP_ORDER"|"VOLUNTEER"|"OFFERING"|"SUPPORT"|"DISTRICTS"|"MINISTERS"} JuboSectionType
 */

/** 현재 발행된 주보의 호수/날짜 @returns {Promise<JuboInfo>} */
export async function getJuboInfo(churchId) {
  if (isDummy("jubo")) return DUMMY_JUBO_INFO;
  const res = await api.get(`/churches/${churchId}/jubo/current`);
  return res.data.data;
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
