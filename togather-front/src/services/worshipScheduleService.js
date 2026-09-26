import api from "./api";

/**
 * 예배 시간표 — 백엔드가 church.config.worshipSchedule과 같은 shape으로 반환한다.
 *
 * @typedef {{ name: string, time: string, location: string }} WorshipScheduleEntry
 * @typedef {{ regular: WorshipScheduleEntry[], departments: WorshipScheduleEntry[] }} WorshipSchedule
 */

/**
 * 예배 시간표 조회 — 공개. 현재 교회는 호스트/X-Church-Id로 식별된다.
 * @returns {Promise<WorshipSchedule>}
 */
export async function getWorshipSchedule() {
  const res = await api.get(`/church/worship-schedule`);
  return res.data.data;
}

/**
 * 예배 시간표 통째 교체 (관리자)
 * @param {WorshipSchedule} payload
 */
export async function updateWorshipSchedule(payload) {
  const res = await api.put(`/church/admin/worship-schedule`, payload);
  return res.data.data;
}
