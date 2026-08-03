/**
 * @typedef {Object} Event
 * @property {number|string} id           - 더미는 number, 실 API는 uuid string. 비교는 항상 String() 캐스팅
 * @property {string}  title              - 행사명
 * @property {string}  department         - 주최 부서. EVENT_CATEGORIES 중 하나
 * @property {string}  date               - 행사일 "YYYY-MM-DD"
 * @property {string|null} startTime      - "HH:mm" | null
 * @property {string|null} endTime        - "HH:mm" | null
 * @property {string}  location           - 장소
 * @property {string}  description        - 상세 내용
 * @property {string|null} imageUrl       - 대표 이미지. null이면 기본 배너 대체
 * @property {string}  createdAt          - 등록일 "YYYY-MM-DD"
 * @property {boolean} canRegister        - 신청을 받는 행사인지
 * @property {string|null} registrationStart - 신청 시작일 "YYYY-MM-DD"
 * @property {string|null} registrationEnd   - 신청 마감일 "YYYY-MM-DD" (당일까지 포함)
 * @property {number|null} capacity       - 정원(명). null = 무제한
 * @property {number}  registeredCount    - 현재 신청 인원
 */

import api, { USE_DUMMY } from "./api";
import { DUMMY_EVENTS } from "@/data/dummy/events";

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalize = (s) => (s ?? "").replace(/\s/g, "").toLowerCase();

function sortEvents(list, sort) {
  const arr = [...list];
  if (sort === "createdAt") {
    arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.date < b.date ? -1 : 1));
    return arr;
  }
  // "date" (일정 빠른순): 오늘 이후를 오름차순으로 먼저, 지난 행사는 내림차순으로 뒤에
  const today = todayIso();
  const upcoming = arr.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
  const past = arr.filter((e) => e.date < today).sort((a, b) => (a.date < b.date ? 1 : -1));
  return [...upcoming, ...past];
}

/**
 * 교회 행사 목록 조회
 * @param {string} churchId
 * @param {{ year?:number, month?:number }} params
 * @returns {Promise<Event[]>}
 */
export async function getEvents(churchId, params = {}) {
  if (USE_DUMMY) {
    if (!params.year || !params.month) return [...DUMMY_EVENTS];
    const prefix = `${params.year}-${String(params.month).padStart(2, "0")}`;
    return DUMMY_EVENTS.filter((e) => e.date.startsWith(prefix));
  }
  const res = await api.get(`/churches/${churchId}/events`, { params });
  return res.data.data;
}

/**
 * 행사 검색
 * @param {string} churchId
 * @param {{ q?:string, sort?:"date"|"createdAt" }} params
 * @returns {Promise<Event[]>}
 */
export async function searchEvents(churchId, { q = "", sort = "date" } = {}) {
  if (USE_DUMMY) {
    const key = normalize(q);
    const list = key
      ? DUMMY_EVENTS.filter((e) => [e.title, e.description, e.location, e.department].some((f) => normalize(f).includes(key)))
      : [...DUMMY_EVENTS];
    return sortEvents(list, sort);
  }
  const res = await api.get(`/churches/${churchId}/events/search`, { params: { q, sort } });
  return res.data.data;
}

/**
 * 최근 등록된 행사 조회 (검색 결과 없음 상태에서 사용)
 * @param {string} churchId
 * @param {number} limit
 * @returns {Promise<Event[]>}
 */
export async function getRecentEvents(churchId, limit = 5) {
  if (USE_DUMMY) {
    return sortEvents(DUMMY_EVENTS, "createdAt").slice(0, limit);
  }
  const res = await api.get(`/churches/${churchId}/events/recent`, { params: { limit } });
  return res.data.data;
}

/**
 * 행사 상세 조회
 * @param {string} churchId
 * @param {number|string} eventId
 * @returns {Promise<Event|null>}
 */
export async function getEventById(churchId, eventId) {
  if (USE_DUMMY) {
    return DUMMY_EVENTS.find((e) => String(e.id) === String(eventId)) ?? null;
  }
  const res = await api.get(`/churches/${churchId}/events/${eventId}`);
  return res.data.data;
}

/**
 * 행사 신청
 * @param {string} churchId
 * @param {number|string} eventId
 * @param {{ name?:string, phone?:string, attendeeCount?:number, note?:string }} payload
 */
export async function registerForEvent(churchId, eventId, payload = {}) {
  if (USE_DUMMY) {
    const event = DUMMY_EVENTS.find((e) => String(e.id) === String(eventId));
    if (event) event.registeredCount = (event.registeredCount ?? 0) + (payload.attendeeCount ?? 1);
    return { success: true, registration: { ...payload, eventId, status: "PENDING" } };
  }
  const res = await api.post(`/churches/${churchId}/events/${eventId}/register`, payload);
  return res.data;
}

/**
 * 행사 등록 (관리자)
 * @param {string} churchId
 * @param {Partial<Event>} payload
 * @returns {Promise<Event>}
 */
export async function createEvent(churchId, payload) {
  if (USE_DUMMY) {
    const created = {
      id: Date.now(),
      startTime: null,
      endTime: null,
      imageUrl: null,
      capacity: null,
      registrationStart: null,
      registrationEnd: null,
      registeredCount: 0,
      createdAt: todayIso(),
      ...payload,
    };
    DUMMY_EVENTS.unshift(created);
    return created;
  }
  const res = await api.post(`/churches/${churchId}/events`, payload);
  return res.data.data;
}

/**
 * 행사 수정 (관리자)
 * @param {string} churchId
 * @param {number|string} eventId
 * @param {Partial<Event>} payload
 * @returns {Promise<Event|null>}
 */
export async function updateEvent(churchId, eventId, payload) {
  if (USE_DUMMY) {
    const idx = DUMMY_EVENTS.findIndex((e) => String(e.id) === String(eventId));
    if (idx === -1) return null;
    DUMMY_EVENTS[idx] = { ...DUMMY_EVENTS[idx], ...payload };
    return DUMMY_EVENTS[idx];
  }
  const res = await api.put(`/churches/${churchId}/events/${eventId}`, payload);
  return res.data.data;
}

/**
 * 행사 삭제 (관리자)
 * @param {string} churchId
 * @param {number|string} eventId
 */
export async function deleteEvent(churchId, eventId) {
  if (USE_DUMMY) {
    const idx = DUMMY_EVENTS.findIndex((e) => String(e.id) === String(eventId));
    if (idx !== -1) DUMMY_EVENTS.splice(idx, 1);
    return { success: true };
  }
  const res = await api.delete(`/churches/${churchId}/events/${eventId}`);
  return res.data;
}
