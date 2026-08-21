import api, { isDummy } from "./api";
import { DUMMY_MY_SCHEDULES, DUMMY_MY_PRAYERS, DUMMY_MY_INQUIRIES } from "@/data/dummy/mypage";

/** @typedef {{id:number, title:string, date:string, memo:string}} MySchedule */
/** @typedef {{id:number, type:string, content:string, status:string, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */

/**
 * 내 일정 목록 조회
 * @param {string} churchId
 * @returns {Promise<MySchedule[]>}
 */
export async function getMySchedules(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_SCHEDULES];
  const res = await api.get(`/my/schedules`);
  return res.data.data;
}

/**
 * 내 일정 추가
 * @param {string} churchId
 * @param {{ title:string, date:string, memo?:string }} payload
 * @returns {Promise<MySchedule>}
 */
export async function addMySchedule(churchId, payload) {
  if (isDummy("my")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_MY_SCHEDULES.push(created);
    return created;
  }
  const res = await api.post(`/my/schedules`, payload);
  return res.data.data;
}

/**
 * 내 일정 삭제
 * @param {string} churchId
 * @param {number} id
 */
export async function deleteMySchedule(churchId, id) {
  if (isDummy("my")) {
    const idx = DUMMY_MY_SCHEDULES.findIndex((s) => s.id === id);
    if (idx !== -1) DUMMY_MY_SCHEDULES.splice(idx, 1);
    return;
  }
  await api.delete(`/my/schedules/${id}`);
}

/**
 * 내 기도/상담 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyPrayer[]>}
 */
export async function getMyPrayers(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_PRAYERS];
  const res = await api.get(`/my/prayers`);
  return res.data.data;
}

/**
 * 기도/상담 신청
 * @param {string} churchId
 * @param {{ type:string, content:string }} payload
 * @returns {Promise<MyPrayer>}
 */
export async function addMyPrayer(churchId, payload) {
  if (isDummy("my")) {
    const created = {
      id: Date.now(),
      ...payload,
      status: "답변 대기",
      createdAt: new Date().toISOString(),
    };
    DUMMY_MY_PRAYERS.unshift(created);
    return created;
  }
  const res = await api.post(`/my/prayers`, payload);
  return res.data.data;
}

/**
 * 내 문의 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyInquiry[]>}
 */
export async function getMyInquiries(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_INQUIRIES];
  const res = await api.get(`/my/inquiries`);
  return res.data.data;
}

/**
 * 문의 등록
 * @param {string} churchId
 * @param {{ title:string, content?:string }} payload
 * @returns {Promise<MyInquiry>}
 */
export async function addMyInquiry(churchId, payload) {
  if (isDummy("my")) {
    const created = {
      id: Date.now(),
      ...payload,
      status: "진행 중",
      answer: null,
      createdAt: new Date().toISOString(),
    };
    DUMMY_MY_INQUIRIES.unshift(created);
    return created;
  }
  const res = await api.post(`/my/inquiries`, payload);
  return res.data.data;
}

/**
 * 회원 탈퇴 (즉시 소프트삭제)
 * @param {string} churchId
 */
export async function withdrawAccount(churchId) {
  if (isDummy("my")) return;
  await api.delete(`/my/account`);
}
