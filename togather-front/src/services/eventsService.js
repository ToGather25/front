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

import api, { isDummy } from "./api";
import { DUMMY_EVENTS } from "@/data/dummy/events";

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalize = (s) => (s ?? "").replace(/\s/g, "").toLowerCase();

function sortEvents(list, sort) {
  const arr = [...list];
  if (sort === "createdAt") {
    // 백엔드에 createdAt 필드가 없어, 자동증가 id 내림차순을 "최근 등록순"의 근사치로 쓴다.
    arr.sort((a, b) => (b.id > a.id ? 1 : b.id < a.id ? -1 : 0));
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
  if (isDummy("events")) {
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
  if (isDummy("events")) {
    const key = normalize(q);
    const list = key
      ? DUMMY_EVENTS.filter((e) =>
          [e.title, e.description, e.location, e.department].some((f) =>
            normalize(f).includes(key),
          ),
        )
      : [...DUMMY_EVENTS];
    return sortEvents(list, sort);
  }
  // 백엔드에 검색 전용 엔드포인트가 없어 전체 목록을 받아 클라이언트에서 필터링한다.
  const res = await api.get(`/churches/${churchId}/events`);
  const key = normalize(q);
  const list = key
    ? res.data.data.filter((e) =>
        [e.title, e.description, e.location, e.department].some((f) => normalize(f).includes(key)),
      )
    : res.data.data;
  return sortEvents(list, sort);
}

/**
 * 최근 등록된 행사 조회 (검색 결과 없음 상태에서 사용)
 * @param {string} churchId
 * @param {number} limit
 * @returns {Promise<Event[]>}
 */
export async function getRecentEvents(churchId, limit = 5) {
  if (isDummy("events")) {
    return sortEvents(DUMMY_EVENTS, "createdAt").slice(0, limit);
  }
  // 백엔드에 최근순 전용 엔드포인트가 없어 전체 목록을 받아 클라이언트에서 정렬한다.
  const res = await api.get(`/churches/${churchId}/events`);
  return sortEvents(res.data.data, "createdAt").slice(0, limit);
}

/**
 * 행사 상세 조회
 * @param {string} churchId
 * @param {number|string} eventId
 * @returns {Promise<Event|null>}
 */
export async function getEventById(churchId, eventId) {
  if (isDummy("events")) {
    return DUMMY_EVENTS.find((e) => String(e.id) === String(eventId)) ?? null;
  }
  const res = await api.get(`/churches/${churchId}/events/${eventId}`);
  return res.data.data;
}

/**
 * 행사 신청 — 백엔드가 요청 바디를 받지 않는다(로그인한 사용자 식별만으로 처리).
 * @param {string} churchId
 * @param {number|string} eventId
 * @returns {Promise<{registered:boolean}>}
 */
export async function registerForEvent(churchId, eventId) {
  if (isDummy("events")) {
    return { registered: true };
  }
  const res = await api.post(`/churches/${churchId}/events/${eventId}/register`);
  return res.data;
}

/**
 * 행사 등록 (관리자)
 * @param {string} churchId
 * @param {Partial<Event>} payload
 * @returns {Promise<Event>}
 */
export async function createEvent(churchId, payload) {
  if (isDummy("events")) {
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
  const res = await api.post(`/church/admin/events`, payload);
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
  if (isDummy("events")) {
    const idx = DUMMY_EVENTS.findIndex((e) => String(e.id) === String(eventId));
    if (idx === -1) return null;
    DUMMY_EVENTS[idx] = { ...DUMMY_EVENTS[idx], ...payload };
    return DUMMY_EVENTS[idx];
  }
  const res = await api.patch(`/church/admin/events/${eventId}`, payload);
  return res.data.data;
}

/**
 * 행사 삭제 (관리자)
 * @param {string} churchId
 * @param {number|string} eventId
 */
export async function deleteEvent(churchId, eventId) {
  if (isDummy("events")) {
    const idx = DUMMY_EVENTS.findIndex((e) => String(e.id) === String(eventId));
    if (idx !== -1) DUMMY_EVENTS.splice(idx, 1);
    return { success: true };
  }
  const res = await api.delete(`/church/admin/events/${eventId}`);
  return res.data;
}
