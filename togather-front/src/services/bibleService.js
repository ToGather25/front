import api from "./api";

/**
 * @typedef {{book:string, chapter:number, verse:number}} BiblePosition
 * @typedef {{completed:BiblePosition[], lastPosition:BiblePosition|null}} BibleProgress
 */

/**
 * 개인 성경 진도 조회 — mode READ는 장 단위(완료 기록의 verse는 항상 0), WRITE는 절 단위.
 * @param {"READ"|"WRITE"} mode
 * @returns {Promise<BibleProgress>}
 */
export async function getBibleProgress(mode) {
  const res = await api.get(`/my/bible/${mode}`);
  return res.data.data;
}

/**
 * 장(READ)/절(WRITE) 완료 또는 완료 취소를 저장한다.
 * @param {"READ"|"WRITE"} mode
 * @param {{book:string, chapter:number, verse?:number, completed:boolean}} payload
 */
export async function updateBibleProgress(mode, { book, chapter, verse = 0, completed }) {
  await api.put(`/my/bible/${mode}/progress`, { book, chapter, verse, completed });
}

/**
 * 마지막으로 읽던/쓰던 위치를 저장한다 — 다음 접속 시 이어서 보여주는 데 쓴다.
 * @param {"READ"|"WRITE"} mode
 * @param {{book:string, chapter:number, verse?:number}} payload
 */
export async function updateBiblePosition(mode, { book, chapter, verse = 0 }) {
  await api.put(`/my/bible/${mode}/position`, { book, chapter, verse });
}
