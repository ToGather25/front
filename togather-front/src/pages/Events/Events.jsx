import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getEvents } from "@/services/eventsService";
import { EVENT_CATEGORIES, getDepartmentStyle } from "@/config/events.config";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  toDateKey,
  formatKoreanDate,
  formatTimeRange,
} from "@/utils/date";
import EventSearchBar from "@/components/events/EventSearchBar";
import RegistrationButton from "@/components/events/RegistrationButton";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 이전/당월/다음달을 합쳐 6주(42칸) 또는 5주(35칸) 그리드 셀 배열을 만든다 */
function buildCalendarCells(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({
      key: `prev-${i}`,
      day: daysInPrevMonth - firstDay + 1 + i,
      inMonth: false,
      dateStr: null,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: `cur-${day}`, day, inMonth: true, dateStr: toDateKey(year, month, day) });
  }
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ key: `next-${nextDay}`, day: nextDay, inMonth: false, dateStr: null });
    nextDay++;
  }
  return cells;
}

export default function Events() {
  const { church } = useChurch();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const cells = buildCalendarCells(year, month);

  const { data: events = [], loading } = useFetch(
    () => getEvents(church.id, { year, month: month + 1 }),
    [church.id, year, month],
    [],
  );

  const prevMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const eventsForDate = (dateStr) =>
    events.filter(
      (e) => e.date === dateStr && (activeCategory === null || e.department === activeCategory),
    );

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const monthName = `${year}년 ${month + 1}월`;

  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-20 md:px-8 md:pt-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-sub-tit-1 font-bold text-grey-12">{monthName}</h1>
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full border border-bluegrey-3 flex items-center justify-center hover:bg-bluegrey-1 transition-colors"
          >
            <svg
              className="w-4 h-4 text-grey-8"
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
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full border border-bluegrey-3 flex items-center justify-center hover:bg-bluegrey-1 transition-colors"
          >
            <svg
              className="w-4 h-4 text-grey-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <EventSearchBar className="w-full md:w-[300px]" />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-1.5 border rounded-full text-body-4 transition-colors shrink-0 ${
                activeCategory === cat
                  ? "bg-blue-8 text-white border-blue-10"
                  : "border-bluegrey-3 text-grey-8 hover:border-blue-5 hover:text-blue-5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1 border border-bluegrey-2 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-bluegrey-2 bg-bluegrey-1">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`py-3 text-center text-[10px] md:text-body-4 font-semibold ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-6" : "text-bluegrey-7"
                }`}
              >
                {w}
              </div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell) => {
              if (!cell.inMonth) {
                return (
                  <div
                    key={cell.key}
                    className="border-b border-r border-bluegrey-2 min-h-14 md:min-h-24 p-2"
                  >
                    <span className="text-body-4 text-grey-4">{cell.day}</span>
                  </div>
                );
              }

              const dayEvents = eventsForDate(cell.dateStr);
              const isSelected = selectedDate === cell.dateStr;
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === cell.day;

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`relative border-b border-r border-bluegrey-2 min-h-14 md:min-h-24 p-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-1/60 outline outline-2 outline-dashed outline-blue-6 -outline-offset-2 z-10"
                      : "hover:bg-bluegrey-1"
                  }`}
                >
                  <span
                    className={`inline-flex w-6 h-6 items-center justify-center text-body-4 rounded-full ${
                      isToday ? "bg-blue-8 text-white font-bold" : "text-grey-10"
                    }`}
                  >
                    {cell.day}
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const ds = getDepartmentStyle(evt.department);
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(cell.dateStr);
                          }}
                          className={`block w-full text-left text-body-5 px-1.5 py-0.5 rounded truncate ${ds.chip}`}
                        >
                          {evt.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-body-5 text-grey-6 px-1">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="border border-bluegrey-2 rounded-xl overflow-y-auto md:w-[400px] md:shrink-0 md:max-h-[calc(100vh-220px)]">
          <div className="px-6 py-4 border-b border-bluegrey-2 bg-bluegrey-1 sticky top-0 z-10">
            <p className="text-body-2 font-semibold text-bluegrey-10">
              {selectedDate ? `${formatKoreanDate(selectedDate)} 일정` : "날짜를 선택하세요"}
            </p>
            {selectedDate && (
              <p className="text-body-5 text-bluegrey-6 mt-0.5">총 {selectedEvents.length}건</p>
            )}
          </div>
          <div className="flex flex-col divide-y divide-bluegrey-2">
            {loading ? (
              <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">
                불러오는 중...
              </div>
            ) : !selectedDate ? (
              <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">
                날짜를 선택하세요.
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">
                일정이 없습니다.
              </div>
            ) : (
              selectedEvents.map((evt) => {
                const ds = getDepartmentStyle(evt.department);
                return (
                  <div key={evt.id} className="px-6 py-5 flex flex-col gap-3">
                    <div className="flex items-center">
                      <span
                        className={`text-body-5 font-semibold px-2 py-0.5 rounded-full ${ds.chip}`}
                      >
                        {evt.department}
                      </span>
                    </div>
                    <p className="text-body-2 font-semibold text-bluegrey-10">{evt.title}</p>
                    <p className="text-body-5 text-bluegrey-5">
                      {formatTimeRange(evt.startTime, evt.endTime)}
                      {evt.location ? ` · ${evt.location}` : ""}
                    </p>
                    {evt.canRegister && typeof evt.capacity === "number" && (
                      <p className="text-body-5 text-bluegrey-5">
                        신청 {evt.registeredCount ?? 0} / {evt.capacity}명
                      </p>
                    )}
                    <div className="flex gap-4 justify-end">
                      <Link
                        to={`/교회행사/${evt.id}`}
                        className="flex-1 py-2.5 bg-blue-1 border border-bluegrey-4 rounded-full text-body-5 font-medium text-bluegrey-7 hover:bg-blue-2 transition-colors text-center"
                      >
                        상세보기
                      </Link>
                      <RegistrationButton event={evt} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
