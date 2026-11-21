import api from "./api";

/** @typedef {{id:number, title:string, date:string, memo:string, status?:string}} MySchedule */
/** @typedef {{id:number, type:string, title?:string, content:string, status:string, reply?:{author:string, text:string}|null, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */
/**
 * @typedef {Object} MyProfile
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} birthDate     - "YYYY-MM-DD"
 * @property {string} role          - 직분
 * @property {string} region        - 구역
 * @property {string} department    - 부서
 * @property {string} smallGroup    - 소그룹
 * @property {string} registeredAt  - "YYYY-MM-DD"
 * @property {string} baptismDate   - "YYYY-MM-DD", 교적부 미연결이면 null
 * @property {string} address
 */
/** @typedef {{type:string, name:string}} MyGroup - type: DISTRICT/DEPARTMENT/SERVICE */

/**
 * 내 프로필 조회(계정 + 연결된 교적부)
 * @returns {Promise<MyProfile>}
 */
export async function getMyProfile() {
  const res = await api.get(`/my/profile`);
  return res.data.data;
}

/**
 * 내 프로필 수정 — name/phone/birthDate/address만 수정 가능(email 등 나머지는 교적부 연동 데이터라 읽기 전용)
 * @param {{ name?:string, phone?:string, birthDate?:string, address?:string }} payload
 * @returns {Promise<MyProfile>}
 */
export async function updateMyProfile(payload) {
  const res = await api.patch(`/my/profile`, payload);
  return res.data.data;
}

/**
 * 내가 속한 구역/부서/봉사 목록
 * @returns {Promise<MyGroup[]>}
 */
export async function getMyGroups() {
  const res = await api.get(`/my/groups`);
  return res.data.data;
}

/**
 * 내 일정 목록 조회
 * @param {string} churchId
 * @returns {Promise<MySchedule[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getMySchedules(churchId) {
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
  const res = await api.post(`/my/schedules`, payload);
  return res.data.data;
}

/**
 * 내 일정 수정
 * @param {string} churchId
 * @param {number} id
 * @param {{ title?:string, date?:string, memo?:string }} payload
 * @returns {Promise<MySchedule>}
 */
export async function updateMySchedule(churchId, id, payload) {
  const res = await api.patch(`/my/schedules/${id}`, payload);
  return res.data.data;
}

/**
 * 내 일정 삭제
 * @param {string} churchId
 * @param {number} id
 */
export async function deleteMySchedule(churchId, id) {
  await api.delete(`/my/schedules/${id}`);
}

/**
 * 내 기도/상담 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyPrayer[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getMyPrayers(churchId) {
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
  const res = await api.post(`/my/prayers`, payload);
  return res.data.data;
}

/**
 * 내 문의 목록 조회
 * @param {string} churchId
 * @returns {Promise<MyInquiry[]>}
 */
// oxlint-disable-next-line no-unused-vars
export async function getMyInquiries(churchId) {
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
  const res = await api.post(`/my/inquiries`, payload);
  return res.data.data;
}

/**
 * 회원 탈퇴 (즉시 소프트삭제)
 * @param {string} churchId
 */
// oxlint-disable-next-line no-unused-vars
export async function withdrawAccount(churchId) {
  await api.delete(`/my/account`);
}
