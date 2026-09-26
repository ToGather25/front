import api from "./api";

/**
 * @typedef {Object} DirectoryEntry
 * @property {string} id          - UUID
 * @property {string} name
 * @property {string} role        - 직분
 * @property {string} region      - 구역
 * @property {string} department  - 부서
 * @property {string} smallGroup  - 소그룹
 *
 * @typedef {Object} MemberSummary
 * @property {string} id            - UUID(더미는 "m1" 형태 문자열)
 * @property {string} name
 * @property {string} birthDate     - "YYYY-MM-DD"
 * @property {string} phone         - 목록: 중간 마스킹, 상세: 원문
 * @property {boolean} newcomer
 * @property {string} registeredAt  - ISO datetime
 */

const DEFAULT_SIZE = 20;

/**
 * 교적부 명부 조회 (로그인한 교인이면 접근 가능)
 *
 * 개인정보(휴대폰·생년월일·이메일·주소)는 응답에 포함되지 않는다 — 연락처가 필요한
 * 관리 업무는 CHURCH_ADMIN 전용 getMembers()를 쓴다.
 * @returns {Promise<DirectoryEntry[]>}
 */
export async function getMemberDirectory() {
  const res = await api.get(`/church/members`);
  return res.data.data;
}

/**
 * 교적부 목록 조회 (관리자, CHURCH_ADMIN 전용)
 * @param {string} churchId
 * @param {{ keyword?:string, page?:number, size?:number }} params - page는 1-based(프론트 관례)
 * @returns {Promise<{ members: MemberSummary[], pageInfo: object }>}
 */
export async function getMembers(churchId, { keyword, page = 1, size = DEFAULT_SIZE } = {}) {
  const res = await api.get(`/church/admin/members`, {
    params: { keyword: keyword || undefined, page: page - 1, size },
  });
  return { members: res.data.data.content, pageInfo: res.data.data.pageInfo };
}

/**
 * 교적부 상세 조회 (관리자, CHURCH_ADMIN 전용)
 * @param {string} churchId
 * @param {string} publicId
 * @returns {Promise<MemberSummary & { hasAccount:boolean }>}
 */
export async function getMemberDetail(churchId, publicId) {
  const res = await api.get(`/church/admin/members/${publicId}`);
  return res.data.data;
}
