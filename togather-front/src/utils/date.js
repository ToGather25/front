/**
 * 날짜 관련 순수 함수 모음.
 * 항상 "YYYY-MM-DD" 로컬 문자열만 다루고, `new Date(dateStr)`(UTC 파싱) 대신
 * `parseLocalDate`로만 Date 객체를 만든다.
 */

/** "YYYY-MM-DD" → 로컬 00:00 Date. 형식이 틀리면 null */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** (2026, 3, 6) → "2026-04-06" (monthIdx는 0-based) */
export function toDateKey(year, monthIdx, day) {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDaysInMonth(year, monthIdx) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, monthIdx) {
  return new Date(year, monthIdx, 1).getDay();
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-04-06" → "2026년 4월 6일" */
export function formatKoreanDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** "2026-04-06" → "2026.04.06" */
export function formatDotDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** "2026-04-06" → "04/06" */
export function formatMonthDay(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/** ("14:00","16:00") → "14:00 ~ 16:00" / start만 있으면 "14:00" / 둘다 없으면 "" */
export function formatTimeRange(startTime, endTime) {
  if (startTime && endTime) return `${startTime} ~ ${endTime}`;
  if (startTime) return startTime;
  return "";
}

export function getWeekdayLabel(idx) {
  return WEEKDAY_KO[idx] ?? "";
}
