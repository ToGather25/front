/** 빈 값만 있는 행을 걸러낸다 — RepeatableFieldRows를 쓰는 저장 로직에서 공통으로 쓴다. */
export function filterBlankRows(rows, fields) {
  return rows.filter((r) => fields.some((f) => (r[f.key] ?? "").trim()));
}
