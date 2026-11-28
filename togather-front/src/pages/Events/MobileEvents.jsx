import { useState } from "react";
import { Link } from "react-router";
import { useFetch } from "@/hooks/useFetch";
import { getEvents } from "@/services/eventsService";
import { EVENT_CATEGORIES, getDepartmentStyle } from "@/config/events.config";
import { formatKoreanDate, formatTimeRange } from "@/utils/date";
import RegistrationButton from "@/components/events/RegistrationButton";
import EventSearchBar from "@/components/events/EventSearchBar";
import { buildCalendarCells, buildRegularWorshipEvents } from "./eventCalendarUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function Icon({ d, size = 20, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function FilterChips({ active, onToggle }) {
  return (
    <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
      {EVENT_CATEGORIES.map((cat) => {
        const ds = getDepartmentStyle(cat);
        const on = active.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle(cat)}
            aria-pressed={on}
            className={`shrink-0 h-8.5 px-3.5 rounded-lg border text-body-5 flex items-center gap-1.5 ${
              on ? "border-primary bg-bluegrey-1 text-primary font-semibold" : "border-bluegrey-3 text-grey-7"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${ds.dot}`} />
            {cat}
          </button>
        );
      })}
    </div>
  );
}

function EventCard({ event }) {
  const ds = getDepartmentStyle(event.department);
  return (
    <article className="border border-bluegrey-2 rounded-xl bg-white p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-caption text-grey-6">
        <span className="inline-flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${ds.dot}`} />
          {event.department}
        </span>
        <span>{formatKoreanDate(event.date)}</span>
      </div>
      <h3 className="text-body-3 font-bold text-grey-11">{event.title}</h3>
      <p className="flex flex-wrap gap-3 text-caption text-grey-7">
        {event.startTime && (
          <span className="inline-flex items-center gap-1">
            <Icon d="M12 7.5V12l3 2M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" size={14} />
            {formatTimeRange(event.startTime, event.endTime)}
          </span>
        )}
        {event.location && (
          <span className="inline-flex items-center gap-1">
            <Icon d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" size={14} />
            {event.location}
          </span>
        )}
      </p>
      {event.canRegister && typeof event.capacity === "number" && (
        <p className="text-caption text-grey-6">
          신청 {event.registeredCount ?? 0} / {event.capacity}명
        </p>
      )}
      {!event.synthetic && (
        <div className="flex gap-2 mt-1.5">
          <Link
            to={`/교회행사/${event.id}`}
            className="flex-1 h-10 rounded-full border border-bluegrey-3 text-body-5 text-grey-8 flex items-center justify-center"
          >
            상세보기
          </Link>
          <RegistrationButton event={event} size="sm" />
        </div>
      )}
    </article>
  );
}

/** 연월 선택 바텀시트 */
function MonthPicker({ year, month, onApply, onClose }) {
  const [y, setY] = useState(year);
  const [m, setM] = useState(month);
  const today = new Date();

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-grey-12/45" />
      <div className="absolute left-0 right-0 bottom-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-[22px] pt-2.5 px-5 pb-6">
        <div className="w-10 h-1 rounded-full bg-bluegrey-3 mx-auto mb-3.5" />
        <h3 className="text-body-3 font-bold text-grey-11 mb-3">연월 선택</h3>
        <div className="flex items-center justify-center gap-6 pb-4">
          <button type="button" onClick={() => setY((v) => v - 1)} aria-label="이전 해" className="w-8 h-8 rounded-full border border-bluegrey-3 flex items-center justify-center">
            <Icon d="M15 6l-6 6 6 6" size={16} />
          </button>
          <span className="text-sub-tit-4 font-bold text-grey-11">{y}년</span>
          <button type="button" onClick={() => setY((v) => v + 1)} aria-label="다음 해" className="w-8 h-8 rounded-full border border-bluegrey-3 flex items-center justify-center">
            <Icon d="M9 6l6 6-6 6" size={16} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => i).map((i) => {
            const isCur = y === today.getFullYear() && i === today.getMonth();
            const on = i === m;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setM(i)}
                className={`relative h-13 rounded-lg border text-body-4 ${
                  on ? "bg-primary border-primary text-white font-bold" : "border-bluegrey-3 text-grey-9"
                }`}
              >
                {i + 1}월
                {isCur && !on && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2.5 mt-4.5">
          <button
            type="button"
            onClick={() => {
              setY(today.getFullYear());
              setM(today.getMonth());
            }}
            className="flex-1 h-11 rounded-full border border-bluegrey-3 text-body-4 text-grey-8"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => onApply(y, m)}
            className="flex-1 h-11 rounded-full bg-primary text-white text-body-4 font-bold"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MobileEvents({ church }) {
  const today = new Date();
  const [view, setView] = useState("grid");
  const [currentDate, setCurrentDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [activeCategories, setActiveCategories] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: events = [] } = useFetch(
    () => getEvents(church.id, { year, month: month + 1 }),
    [church.id, year, month],
    [],
  );
  const allEvents = [...events, ...buildRegularWorshipEvents(year, month, church.worshipSchedule)];

  const toggleCategory = (cat) =>
    setActiveCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  const matchesFilter = (e) => activeCategories.length === 0 || activeCategories.includes(e.department);
  const eventsForDate = (dateStr) => allEvents.filter((e) => e.date === dateStr && matchesFilter(e));

  function changeMonth(delta) {
    const d = new Date(year, month + delta, 1);
    setCurrentDate(d);
    setSelectedDate(null);
  }

  const cells = buildCalendarCells(year, month);
  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  // 목록 뷰 — 이번 달 중 일정이 있는 날짜만, 날짜순으로 묶어 보여준다.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const groupedByDay = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .map((d) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return { dateStr, events: eventsForDate(dateStr) };
    })
    .filter((g) => g.events.length > 0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-5 pt-4.5 pb-2">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 text-sub-tit-3 font-bold text-grey-11"
        >
          {year}년 {month + 1}월
          <Icon d="M6 9l6 6 6-6" size={20} strokeWidth={2} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="이전 달"
            className="w-[30px] h-[30px] rounded-full border border-bluegrey-3 flex items-center justify-center"
          >
            <Icon d="M15 6l-6 6 6 6" size={16} />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="다음 달"
            className="w-[30px] h-[30px] rounded-full border border-bluegrey-3 flex items-center justify-center"
          >
            <Icon d="M9 6l6 6-6 6" size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-3">
        <EventSearchBar />
      </div>

      <div className="mx-5 mb-3 grid grid-cols-2 bg-bluegrey-1 rounded-xl p-1">
        {[["grid", "달력"], ["list", "목록"]].map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`h-9 rounded-lg text-body-5 ${v === view ? "bg-white text-primary font-bold shadow-sm" : "text-grey-6"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <FilterChips active={activeCategories} onToggle={toggleCategory} />

      {view === "grid" ? (
        <>
          <div className="mx-5 border border-bluegrey-2 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 bg-bluegrey-1">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={`py-2 text-center text-caption font-medium ${i === 0 ? "text-red-400" : "text-grey-7"}`}
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell) => {
                if (!cell.inMonth) {
                  return <div key={cell.key} className="min-h-14 border-t border-bluegrey-1 p-1" />;
                }
                const dayEvents = eventsForDate(cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;
                const isToday =
                  today.getFullYear() === year && today.getMonth() === month && today.getDate() === cell.day;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-14 border-t border-bluegrey-1 p-1 flex flex-col items-center gap-0.5 ${
                      isSelected ? "bg-bluegrey-1" : ""
                    }`}
                  >
                    <span
                      className={`w-5.5 h-5.5 flex items-center justify-center rounded-full text-caption ${
                        isToday ? "bg-primary text-white font-bold" : "text-grey-10"
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${getDepartmentStyle(e.department).dot}`} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-5 my-3.5 py-2.5 rounded-lg bg-bluegrey-1 text-center text-body-5 font-semibold text-primary">
            {selectedDate ? formatKoreanDate(selectedDate) : ""} 일정{selectedEvents.length > 0 ? ` · ${selectedEvents.length}건` : ""}
          </div>
          <div className="px-5 flex flex-col gap-3 pb-6">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((e) => <EventCard key={e.id} event={e} />)
            ) : (
              <p className="py-8 text-center text-body-5 text-grey-5">이 날은 등록된 일정이 없어요.</p>
            )}
          </div>
        </>
      ) : (
        <div className="px-5 flex flex-col gap-5 pb-6">
          {groupedByDay.length === 0 ? (
            <p className="py-8 text-center text-body-5 text-grey-5">조건에 맞는 일정이 없어요.</p>
          ) : (
            groupedByDay.map((g) => (
              <div key={g.dateStr} className="flex flex-col gap-3">
                <div className="py-2.5 rounded-lg bg-bluegrey-1 text-center text-body-5 font-semibold text-primary">
                  {formatKoreanDate(g.dateStr)} 일정
                </div>
                {g.events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {showPicker && (
        <MonthPicker
          year={year}
          month={month}
          onApply={(y, m) => {
            setCurrentDate(new Date(y, m, 1));
            setSelectedDate(null);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
