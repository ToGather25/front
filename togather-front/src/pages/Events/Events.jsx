import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getEvents } from "@/services/eventsService";
import { EVENT_CATEGORIES, getDepartmentStyle } from "@/config/events.config";
import { formatKoreanDate, formatTimeRange } from "@/utils/date";
import EventSearchBar from "@/components/events/EventSearchBar";
import RegistrationButton from "@/components/events/RegistrationButton";
import BubbleLoader from "@/components/common/BubbleLoader";
import MobileEvents from "./MobileEvents";
import { buildCalendarCells, buildRegularWorshipEvents } from "./eventCalendarUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

  const {
    data: events = [],
    loading,
    refetch: refetchEvents,
  } = useFetch(() => getEvents(church.id, { year, month: month + 1 }), [church.id, year, month], []);

  const regularWorshipEvents = buildRegularWorshipEvents(year, month, church.worshipSchedule);
  const allEvents = [...events, ...regularWorshipEvents];

  const prevMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const eventsForDate = (dateStr) =>
    allEvents.filter(
      (e) => e.date === dateStr && (activeCategory === null || e.department === activeCategory),
    );

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  return (
    <>
      <div className="md:hidden">
        <MobileEvents church={church} />
      </div>
      <div className="hidden md:block max-w-[1400px] mx-auto px-4 pt-6 pb-20 md:px-8 md:pt-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-sub-tit-1 font-bold text-grey-12 whitespace-nowrap">
            {year}년 <span className="inline-block min-w-[2.4em] tabular-nums">{month + 1}월</span>
          </h1>
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

        <EventSearchBar className="w-full md:w-134" />

        <select
          value={activeCategory ?? ""}
          onChange={(e) => setActiveCategory(e.target.value || null)}
          className="w-full md:w-auto shrink-0 border border-bluegrey-3 rounded-full pl-4 pr-8 py-2 text-body-4 text-grey-8 bg-white focus:outline-none focus:border-blue-5"
        >
          <option value="">전체 카테고리</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-6 relative">
        {/* Calendar */}
        <div className="flex-1 border border-bluegrey-3 rounded-xl overflow-hidden md:rounded-xl">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-bluegrey-3 bg-bluegrey-1">
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
                    className="border-b border-r border-bluegrey-3 min-h-16 md:min-h-32 p-2"
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
                  className={`relative border-b border-r border-bluegrey-3 min-h-16 md:min-h-32 p-2 cursor-pointer transition-colors ${
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

      {/* Drawer Overlay */}
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black/20 z-[60] animate-fadeIn"
          onClick={() => setSelectedDate(null)}
        />
      )}

      {/* Events Drawer */}
      {selectedDate && (
        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white border-l border-bluegrey-3 overflow-hidden flex flex-col z-[70] animate-slideInRight">
            <div className="flex items-center justify-between border-b border-bluegrey-3 bg-bluegrey-1 sticky top-0 z-10 h-18 px-4 md:px-6 shadow-sm">
              <span className="text-body-4 font-semibold text-bluegrey-10">
                {formatKoreanDate(selectedDate)} 일정
              </span>
              <button
                onClick={() => setSelectedDate(null)}
                className="flex items-center justify-center w-6 h-6 text-grey-6 hover:text-grey-8 transition-colors"
                aria-label="닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col">
              {loading ? (
                <div className="flex justify-center py-10">
                  <BubbleLoader size="sm" />
                </div>
              ) : selectedEvents.length === 0 ? (
                <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">
                  일정이 없습니다.
                </div>
              ) : (
                selectedEvents.map((evt) => {
                  const ds = getDepartmentStyle(evt.department);
                  return (
                    <div key={evt.id} className="border-b border-bluegrey-3 px-6 py-5 flex flex-col gap-3">
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
                      {!evt.synthetic && (
                        <div className="flex gap-4 justify-end">
                          <Link
                            to={`/교회행사/${evt.id}`}
                            className="flex-1 py-2.5 bg-blue-1 border border-bluegrey-4 rounded-full text-body-5 font-medium text-bluegrey-9 hover:bg-blue-2 transition-colors text-center"
                          >
                            상세보기
                          </Link>
                          <RegistrationButton event={evt} size="sm" onRegistered={refetchEvents} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
