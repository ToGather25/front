import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import { getEvents } from "@/services/eventsService";
import { getDaysInMonth, getFirstDayOfMonth } from "@/utils/date";
import Section from "@/components/common/Section";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { bg: "rgba(61,85,136,.12)", color: "#2b3c61" },
  행사: { bg: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { bg: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const MAX_NOTICE_ROWS = 5;

/** 이전/당월/다음달을 합쳐 5주 또는 6주 그리드 셀 배열을 만든다(달력 미리보기용). */
function buildMiniCalendarCells(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length < totalCells) cells.push(null);
  return cells;
}

/** 실제 행사 + 주일예배(교회 예배 시간표 기준)를 날짜별 건수/설명으로 집계한다. */
function buildEventCountByDay(events, year, month, sundayServices) {
  const daysInMonth = getDaysInMonth(year, month);
  const countByDay = {};
  const detailByDay = {};

  events.forEach((e) => {
    const day = Number(e.date?.slice(8, 10));
    if (!day) return;
    countByDay[day] = (countByDay[day] ?? 0) + 1;
    detailByDay[day] = [...(detailByDay[day] ?? []), e.title];
  });

  if (sundayServices.length > 0) {
    const label = `주일예배 · ${sundayServices[0].time}`;
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month, day).getDay() !== 0) continue;
      countByDay[day] = (countByDay[day] ?? 0) + 1;
      detailByDay[day] = [label, ...(detailByDay[day] ?? [])];
    }
  }

  return { countByDay, detailByDay };
}

function MiniCalendar({ year, month, countByDay, detailByDay }) {
  const cells = buildMiniCalendarCells(year, month);
  const weeks = cells.length / 7;
  const today = new Date();

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-bluegrey-2 p-4">
      <div className="grid grid-cols-7 mb-1">
        {WEEK_LABELS.map((w, i) => (
          <span
            key={w}
            className={`text-center text-caption font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-6" : "text-grey-5"
            }`}
          >
            {w}
          </span>
        ))}
      </div>
      <div
        className="grid grid-cols-7 flex-1"
        style={{ gridTemplateRows: `repeat(${weeks}, 1fr)` }}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />;
          const count = countByDay[day] ?? 0;
          const isToday =
            today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const label =
            count > 0 ? `${month + 1}월 ${day}일 — ${detailByDay[day].join(", ")}` : undefined;
          return (
            <div key={day} className="flex flex-col items-center pt-1" aria-label={label}>
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-full text-body-4 ${
                  isToday ? "bg-primary text-white font-bold" : "text-grey-9"
                }`}
              >
                {day}
              </span>
              {/* 일정이 없는 날짜도 점 자리를 invisible로 그대로 차지해서, 날짜
                  숫자 위치가 일정 유무와 무관하게 항상 같은 줄에 오게 한다. */}
              <span
                className={`mt-0.5 flex items-center gap-[3px] ${count > 0 ? "" : "invisible"}`}
                aria-hidden="true"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-6 shrink-0" />
                <span className="text-[10px] leading-none text-blue-6 font-semibold">
                  {count || 1}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NoticeSection() {
  const { church } = useChurch();
  const { data: responseData = { data: [] } } = useFetch(
    () => getNotices(church.id, { limit: 30 }),
    [church.id],
    { data: [] },
  );
  const notices = responseData.data;
  const [tab, setTab] = useState("전체");

  const rows = (tab === "전체" ? notices : notices.filter((n) => n.type === tab)).slice(
    0,
    MAX_NOTICE_ROWS,
  );

  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const goToPrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const goToToday = () => setCalendarDate(new Date());
  const isFirstMonth = month === 0;
  const isLastMonth = month === 11;

  const { data: events = [] } = useFetch(
    () => getEvents(church.id, { year, month: month + 1 }),
    [church.id, year, month],
    [],
  );
  // 주일예배는 실제 행사로 등록돼 있지 않지만 "다가오는 일정"엔 항상 기본으로 잡혀야 하므로,
  // 교회 예배 시간표(주일 오전/오후 예배)를 참고해 매주 일요일에 얹는다.
  const sundayServices = (church.worshipSchedule?.regular ?? []).filter((s) =>
    s.time?.startsWith("주일"),
  );
  const { countByDay, detailByDay } = buildEventCountByDay(events, year, month, sundayServices);

  return (
    <Section className="py-[100px]">
      {/* 왼쪽 카드는 flex-1을 빼 placeholder로 채운 5행 높이 그대로 고정하고, 오른쪽
          미니 캘린더만 flex-1로 남겨둔다 — 그리드(items-stretch, 기본값)가 두 컬럼을
          같은 높이로 맞출 때, 캘린더 내부 행(1fr)들이 남는 높이를 고르게 나눠 가져서
          왼쪽 카드 높이에 자연스럽게 맞춰지고 빈 공간이 생기지 않는다. */}
      <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1fr_460px]">
        {/* Left: notices */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
              공지 ∙ 소식
            </h3>
          </div>

          {/* Tabs + 전체보기 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-[18px] py-2.5 rounded-full text-[15px] font-semibold transition-all ${
                    t === tab
                      ? "bg-blue-8 text-white"
                      : "bg-transparent text-grey-9 hover:bg-bluegrey-2"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Link
              to="/공지사항"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors"
            >
              전체보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          {/* Notice list — 실제 항목이 MAX_NOTICE_ROWS보다 적어도(0건 포함) 빈 자리를
              투명 placeholder 행으로 채워 카드 높이가 항상 5행분으로 고정되게 한다. */}
          <div className="relative bg-white rounded-[20px] overflow-hidden border border-bluegrey-2">
            {rows.map((n, i) => {
              const tagStyle = TAG_STYLES[n.type] ?? TAG_STYLES["공지"];
              return (
                <Link
                  key={n.id ?? i}
                  to={`/공지사항?id=${n.id}`}
                  className={`flex items-center gap-5 px-7 py-[22px] hover:bg-bluegrey-1 transition-colors border-b border-bluegrey-2 last:border-b-0`}
                >
                  <span
                    className="text-body-3 font-bold px-2.5 py-1.5 rounded-[6px] min-w-[44px] text-center shrink-0"
                    style={tagStyle}
                  >
                    {n.type}
                  </span>
                  <span
                    className={`flex-1 text-sub-tit-4 leading-[1.4] text-grey-11 tracking-[-0.3px] truncate ${n.featured ? "font-semibold" : "font-medium"}`}
                  >
                    {n.featured && (
                      <span className="inline-flex items-center justify-center shrink-0 mr-3 align-middle rounded-[5px] w-[22px] h-[22px] bg-blue-7">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="17" x2="12" y2="22" />
                          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                        </svg>
                      </span>
                    )}
                    {n.title}
                  </span>
                  <span className="text-body-3 text-grey-6 shrink-0 tracking-[0.02em]">
                    {n.date}
                  </span>
                </Link>
              );
            })}
            {Array.from({ length: MAX_NOTICE_ROWS - rows.length }).map((_, i) => (
              <div
                key={`notice-pad-${i}`}
                aria-hidden="true"
                className="invisible flex items-center gap-5 px-7 py-[22px] border-b border-bluegrey-2 last:border-b-0"
              >
                <span className="text-body-3 font-bold px-2.5 py-1.5 rounded-[6px] min-w-[44px] text-center shrink-0">
                  -
                </span>
                <span className="flex-1 text-sub-tit-4">-</span>
                <span className="text-body-3 shrink-0">-</span>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-grey-5 text-[15px]">
                공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right: upcoming events → 축소된 달력 미리보기 */}
        <aside className="flex flex-col">
          <div className="mb-8">
            <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
              다가오는 일정
            </h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevMonth}
                disabled={isFirstMonth}
                aria-label="이전 달"
                className="w-7 h-7 rounded-full border border-bluegrey-3 flex items-center justify-center hover:bg-bluegrey-1 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <svg
                  className="w-3.5 h-3.5 text-grey-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-[15px] font-semibold text-grey-9 tracking-[0.02em] w-20 text-center tabular-nums">
                {year}년 {month + 1}월
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                disabled={isLastMonth}
                aria-label="다음 달"
                className="w-7 h-7 rounded-full border border-bluegrey-3 flex items-center justify-center hover:bg-bluegrey-1 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <svg
                  className="w-3.5 h-3.5 text-grey-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="ml-1 px-2.5 py-1 rounded-full border border-bluegrey-3 text-caption font-medium text-grey-7 hover:bg-bluegrey-1 transition-colors"
              >
                오늘
              </button>
            </div>
            <Link
              to="/교회행사"
              className="inline-flex items-center gap-1.5 py-2.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors"
            >
              전체보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <MiniCalendar
            year={year}
            month={month}
            countByDay={countByDay}
            detailByDay={detailByDay}
          />
        </aside>
      </div>
    </Section>
  );
}
