import api, { isDummy } from "./api";
import { DUMMY_MEMBERS } from "@/data/dummy/members";

/**
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
 * 교적부 목록 조회 (관리자, CHURCH_ADMIN 전용)
 * @param {string} churchId
 * @param {{ keyword?:string, page?:number, size?:number }} params - page는 1-based(프론트 관례)
 * @returns {Promise<{ members: MemberSummary[], pageInfo: object }>}
 */
export async function getMembers(churchId, { keyword, page = 1, size = DEFAULT_SIZE } = {}) {
  if (isDummy("member")) {
    const filtered = keyword
      ? DUMMY_MEMBERS.filter((m) => m.name.includes(keyword) || m.phone.includes(keyword))
      : DUMMY_MEMBERS;
    const start = (page - 1) * size;
    const content = filtered.slice(start, start + size);
    return {
      members: content,
      pageInfo: {
        page: page - 1,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        hasNext: start + size < filtered.length,
        hasPrevious: page > 1,
      },
    };
  }
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
  if (isDummy("member")) {
    const found = DUMMY_MEMBERS.find((m) => String(m.id) === String(publicId));
    return found ? { ...found, hasAccount: true } : null;
  }
  const res = await api.get(`/church/admin/members/${publicId}`);
  return res.data.data;
}
