/**
 * @typedef {{ id:number, title:string, department:string, date:string,
 *   startTime:string|null, endTime:string|null, location:string,
 *   description:string, canRegister:boolean, imageUrl:string|null }} Event
 */

import api, { USE_DUMMY } from "./api";
import { DUMMY_EVENTS, DUMMY_EVENT_DETAIL } from "@/data/dummy/events";

/**
 * 교회 행사 목록 조회
 * @param {string} churchId
 * @param {{ year?:number, month?:number }} params
 * @returns {Promise<Event[]>}
 */
export async function getEvents(churchId, params = {}) {
  if (USE_DUMMY) return DUMMY_EVENTS;
  const res = await api.get(`/churches/${churchId}/events`, { params });
  return res.data.data;
}

/**
 * 행사 상세 조회
 * @param {string} churchId
 * @param {number} eventId
 * @returns {Promise<Event>}
 */
export async function getEventById(churchId, eventId) {
  if (USE_DUMMY) return DUMMY_EVENT_DETAIL;
  const res = await api.get(`/churches/${churchId}/events/${eventId}`);
  return res.data.data;
}

/**
 * 행사 신청
 * @param {string} churchId
 * @param {number} eventId
 */
export async function registerForEvent(churchId, eventId) {
  if (USE_DUMMY) return { success: true };
  const res = await api.post(`/churches/${churchId}/events/${eventId}/register`);
  return res.data;
}
