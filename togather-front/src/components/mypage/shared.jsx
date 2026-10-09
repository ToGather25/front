import { useEffect, useRef, useState } from "react";
import PopupClose from "@/assets/icon-svg/popup-close.svg";
import ArrowBack from "@/assets/icon-svg/mypage-arrow-back.svg";
import CalendarBlue from "@/assets/icon-svg/mypage-calendar-blue.svg";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getWeekdayLabel,
  parseLocalDate,
  toDateKey,
  formatDotDate,
} from "@/utils/date";

export function IconClose() {
  return <img src={PopupClose} className="w-4 h-4" alt="" />;
}

export function IconBack() {
  return <img src={ArrowBack} className="w-[18px] h-[18px]" alt="" />;
}

export function ReadonlyField({ label, value, note }) {
  return (
    <div>
      <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
      <div className="border border-grey-3 rounded-lg px-4 py-3 text-body-4 text-grey-8 bg-bluegrey-1 cursor-not-allowed select-none">
        {value}
      </div>
      {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
    </div>
  );
}

// 일요일(0)부터 시작하는 달력 팝오버. 네이티브 input[type=date]의 OS별 디자인이
// 제각각이라, 날짜 필드 전용으로 직접 그린 캘린더를 아이콘 아래에 띄운다.
function CalendarPopover({ value, onSelect, onClose }) {
  const selected = parseLocalDate(value);
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayKey = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-grey-3 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="이전 달"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 transition-colors"
        >
          ‹
        </button>
        <p className="text-body-4 font-semibold text-grey-11">
          {year}년 {month + 1}월
        </p>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="다음 달"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 transition-colors"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="text-body-5 text-grey-5 text-center py-1">
            {getWeekdayLabel(idx)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 place-items-center">
        {cells.map((d, idx) => {
          if (d === null) return <div key={idx} />;
          const key = toDateKey(year, month, d);
          const isSelected = key === value;
          const isToday = key === todayKey;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelect(key);
                onClose();
              }}
              className={`w-8 h-8 rounded-full text-body-5 transition-colors ${
                isSelected
                  ? "bg-primary text-white font-semibold"
                  : isToday
                    ? "border border-primary text-primary"
                    : "text-grey-9 hover:bg-grey-2"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function InputField({ label, value, onChange, placeholder, type = "text", note }) {
  const isDate = type === "date";
  const [calendarOpen, setCalendarOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!isDate || !calendarOpen) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setCalendarOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isDate, calendarOpen]);

  if (isDate) {
    return (
      <div ref={wrapRef} className="relative">
        <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
        <button
          type="button"
          onClick={() => setCalendarOpen((v) => !v)}
          className="w-full flex items-center justify-between border border-grey-4 rounded-lg px-4 py-3 text-body-4 bg-white outline-none focus:border-primary transition-colors"
        >
          <span className={value ? "text-grey-10" : "text-grey-5"}>
            {value ? formatDotDate(value) : placeholder || "연도. 월. 일."}
          </span>
          <img src={CalendarBlue} alt="" className="w-4 h-4" />
        </button>
        {calendarOpen && (
          <CalendarPopover
            value={value}
            onSelect={(key) => onChange({ target: { value: key } })}
            onClose={() => setCalendarOpen(false)}
          />
        )}
        {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors"
      />
      {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
    </div>
  );
}

export function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-md p-8 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-grey-7 transition-colors"
          aria-label="닫기"
        >
          <IconClose />
        </button>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    "답변 완료": "text-green-700 bg-green-50 border border-green-200",
    "답변 대기": "text-amber-600 bg-amber-50 border border-amber-200",
    "진행 중": "text-blue-600 bg-blue-50 border border-blue-200",
    "참석 예정": "text-green bg-green/20",
    미정: "text-blue-6 bg-blue-1",
  };
  return (
    <span
      className={`text-body-6 font-bold rounded-full px-2.5 py-1 whitespace-nowrap ${styles[status] ?? "text-grey-7 bg-grey-2"}`}
    >
      {status}
    </span>
  );
}

export function Pagination({ total, perPage, current, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-5">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-body-5 transition-colors ${
            p === current ? "bg-primary text-white font-semibold" : "text-grey-7 hover:bg-grey-2"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
