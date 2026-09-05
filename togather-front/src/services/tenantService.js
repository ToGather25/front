import api from "./api";

/**
 * 테넌트(교회) 식별 + 설정 조회
 * @param {string} domain - 교회 도메인(호스트명)
 * @returns {Promise<object>} { id(숫자 PK), name, ...church.config.js와 동일한 나머지 필드 }
 */
export async function getTenant(domain) {
  const res = await api.get("/tenant", { params: { domain } });
  return res.data.data;
}
