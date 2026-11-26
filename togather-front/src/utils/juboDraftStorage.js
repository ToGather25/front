const STORAGE_PREFIX = "jubo-draft-";

/** 주보 임시저장 — 서버 저장과 별개로 브라우저에도 같은 내용을 즉시 백업해둔다. */
export function saveJuboDraftLocal(juboId, payload) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${juboId}`,
      JSON.stringify({ ...payload, savedAt: new Date().toISOString() }),
    );
  } catch (err) {
    console.error("[juboDraftStorage] 로컬 저장 실패:", err);
  }
}

export function getJuboDraftLocal(juboId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${juboId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearJuboDraftLocal(juboId) {
  localStorage.removeItem(`${STORAGE_PREFIX}${juboId}`);
}
