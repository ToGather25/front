import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getEvents } from "@/services/eventsService";
import { EVENT_CATEGORIES } from "@/config/events.config";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
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
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const { data: events = [], loading } = useFetch(
    () => getEvents(church.id, { year, month: month + 1 }),
    [church.id, year, month],
    []
  );

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const eventsForDate = (dateStr) =>
    events.filter(
      (e) =>
        e.date === dateStr &&
        (activeCategory === null || e.department === activeCategory)
    );

  const selectedEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  const monthName = `${year}년 ${month + 1}월`;
  const selectedDateLabel = selectedDate
    ? `${year}년 ${month + 1}월 ${parseInt(selectedDate.split("-")[2])}일`
    : "";

  return (
    <div className="max-w-[1576px] mx-auto px-8 py-10">
      {/* Header Row */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-sub-tit-1 font-bold text-grey-12">{monthName}</h1>
          <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-bluegrey-3 flex items-center justify-center hover:bg-bluegrey-1 transition-colors">
            <svg className="w-4 h-4 text-grey-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-bluegrey-3 flex items-center justify-center hover:bg-bluegrey-1 transition-colors">
            <svg className="w-4 h-4 text-grey-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-bluegrey-3 rounded-full text-body-4 text-grey-8 hover:bg-bluegrey-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          행사 검색
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 border rounded-full text-body-4 transition-colors ${
              activeCategory === cat
                ? "bg-blue-8 text-white border-blue-10"
                : "border-bluegrey-3 text-grey-8 hover:border-blue-5 hover:text-blue-5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1 border border-bluegrey-2 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-bluegrey-2 bg-bluegrey-1">
            {["주일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="py-3 text-center text-body-4 font-semibold text-bluegrey-7">
                {d}
              </div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-bluegrey-2 min-h-24 p-2" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = formatDate(year, month, day);
              const dayEvents = eventsForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`border-b border-r border-bluegrey-2 min-h-24 p-2 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-1" : "hover:bg-bluegrey-1"
                  }`}
                >
                  <span
                    className={`inline-flex w-6 h-6 items-center justify-center text-body-4 rounded-full ${
                      isToday
                        ? "bg-blue-8 text-white font-bold"
                        : "text-grey-10"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <Link
                        key={evt.id}
                        to={`/교회행사/${evt.id}`}
                        className="block text-body-5 px-1.5 py-0.5 rounded bg-blue-1 text-blue-7 truncate hover:bg-blue-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {evt.title}
                      </Link>
                    ))}
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
        <div className="w-[400px] shrink-0 border border-bluegrey-2 rounded-xl overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="flex flex-col divide-y divide-bluegrey-2">
            {loading ? (
              <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">불러오는 중...</div>
            ) : !selectedDate ? (
              <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">날짜를 선택하세요.</div>
            ) : selectedEvents.length === 0 ? (
              <div className="px-6 py-10 text-center text-body-4 text-bluegrey-5">일정이 없습니다.</div>
            ) : (
              selectedEvents.map((evt) => (
                <div key={evt.id} className="px-6 py-5 flex flex-col gap-5">
                  <div className="flex items-center justify-between text-body-5">
                    <span className="font-medium text-bluegrey-6">{evt.department}</span>
                    <span className="text-bluegrey-4">{evt.date}</span>
                  </div>
                  <p className="text-body-2 font-semibold text-bluegrey-10">{evt.title}</p>
                  <div className="flex gap-4 justify-end">
                    <Link
                      to={`/교회행사/${evt.id}`}
                      className="flex-1 py-2.5 bg-blue-1 border border-bluegrey-4 rounded-full text-body-5 font-medium text-bluegrey-7 hover:bg-blue-2 transition-colors text-center"
                    >
                      상세보기
                    </Link>
                    <button className="flex-1 py-2.5 bg-blue-7 border border-bluegrey-4 rounded-full text-body-5 font-semibold text-white hover:bg-blue-8 transition-colors">
                      신청하기
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
