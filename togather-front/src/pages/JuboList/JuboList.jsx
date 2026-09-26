import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboIssues } from "@/services/juboService";
import { getDaysInMonth, getFirstDayOfMonth, toDateKey, parseLocalDate } from "@/utils/date";
import WordTabBar from "@/components/word/WordTabBar";
import IcoSearch from "@/assets/icon-svg/search-black.svg";
import IcoChurch from "@/assets/icon-svg/none-thumb.png";

const PAGE_SIZE = 8;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 이전/당월/다음달을 합쳐 항상 6주(42칸) 그리드로 만든다 — 달마다 실제 주 수가
 * 달라 캘린더 높이가 오락가락하지 않도록 행 수를 고정한다. (Events.jsx와 동일 패턴) */
function buildCalendarCells(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const totalCells = 42;

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

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function JuboList({ hideHeader = false }) {
  const { church } = useChurch();
  const navigate = useNavigate();
  const { data: issues, loading, error, refetch } = useFetch(
    () => getJuboIssues(church.id),
    [church.id],
    [],
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = (issues ?? []).filter(
    (issue) => (issue.sermonTitle ?? '').includes(query) || (issue.verse ?? '').includes(query),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {!hideHeader && (
        <>
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />
        </>
      )}

      <div className="max-w-[1400px] mx-auto px-4 py-10 md:px-8 md:py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="relative max-w-md flex-1">
            <img
              src={IcoSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              alt=""
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="설교 제목, 말씀 검색"
              className="w-full h-[46px] pl-10 pr-4 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 outline-none transition-all"
            />
          </div>
          <DateJumpPicker
            issues={issues ?? []}
            onSelectWeek={(issue) => navigate(`/주보?issue=${issue.id}`)}
          />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <div key={i} className="rounded-2xl border border-bluegrey-2 overflow-hidden animate-pulse">
                <div className="h-40 bg-grey-2" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-grey-2 rounded w-4/5" />
                  <div className="h-3 bg-grey-2 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="py-24 text-center text-grey-6 text-body-2">
            <p className="mb-4">데이터를 불러오지 못했습니다.</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && query && (
          <div className="min-h-[60vh] flex items-center justify-center text-centre text-grey-6 text-body-2">
            검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
          </div>
        )}

        {!loading && !error && filtered.length === 0 && !query && (
          <div className="min-h-[60vh] flex items-center justify-center text-centre text-grey-6 text-body-2">
            주보 데이터를 불러오는 중입니다.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {pageItems.map((issue) => (
                <Link
                  key={issue.id}
                  to={`/주보?issue=${issue.id}`}
                  className="group rounded-2xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-lg transition-all bg-white"
                >
                  <div className="relative h-40 bg-grey-2 flex flex-col items-center justify-center gap-2 px-4 overflow-hidden">
                    {issue.coverImageUrl ? (
                      <img src={issue.coverImageUrl} alt="주보 표지" className="w-full h-full object-cover" />
                    ) : (
                      <img src={IcoChurch} className="w-10 h-12 opacity-60 invert" alt="" />
                    )}
                    {issue.current && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-3 text-blue-9 text-[11px] font-semibold">
                        이번 주 주보
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-body-4">{issue.dateLabel} 주보</p>
                    <h3 className="text-body-3 font-semibold text-grey-11 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                      {issue.sermonTitle}
                    </h3>
                    <p className="text-body-5 text-grey-6">{issue.verse}</p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} label="‹" />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === page} label={String(p)} />
                ))}
                <PageBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  label="›"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** "날짜로 보기" 버튼 + 팝오버 캘린더 — 아무 날짜나 클릭하면 그 날짜가 속한 주(일~토)를
 * 선택하고, 그 주의 일요일 날짜로 발행된 주보가 있으면 바로 그 주보 상세로 이동한다. */
function DateJumpPicker({ issues, onSelectWeek }) {
  const [open, setOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const cells = buildCalendarCells(year, month);
  const issueDateSet = new Set(issues.map((i) => i.date));

  function changeMonth(offset) {
    setCalendarDate(new Date(year, month + offset, 1));
    setSelectedWeekStart(null);
    setSelectedRowIndex(null);
    setNotFound(false);
  }

  function handleDayClick(dateStr, rowIndex) {
    const clicked = parseLocalDate(dateStr);
    const weekStart = startOfWeek(clicked);
    setSelectedWeekStart(weekStart);
    setSelectedRowIndex(rowIndex);
    const weekStartKey = toDateKey(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const match = issues.find((i) => i.date === weekStartKey);
    if (match) {
      setNotFound(false);
      setOpen(false);
      onSelectWeek(match);
    } else {
      setNotFound(true);
    }
  }

  function isInSelectedWeek(dateStr) {
    if (!selectedWeekStart || !dateStr) return false;
    const diffDays = Math.round((parseLocalDate(dateStr) - selectedWeekStart) / 86_400_000);
    return diffDays >= 0 && diffDays < 7;
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[46px] flex items-center gap-2 px-5 rounded-xl border border-bluegrey-2 text-body-3 font-medium text-grey-8 hover:border-blue-5 hover:text-primary transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
        날짜로 보기
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-20 w-80 bg-white rounded-2xl border border-bluegrey-2 shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="이전 달"
                className="w-7 h-7 rounded-full flex items-center justify-center text-grey-7 hover:bg-bluegrey-1 transition-colors"
              >
                ‹
              </button>
              <span className="text-body-2 font-bold text-grey-11">
                {year}년 {month + 1}월
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="다음 달"
                className="w-7 h-7 rounded-full flex items-center justify-center text-grey-7 hover:bg-bluegrey-1 transition-colors"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((w, i) => (
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

            <div className="relative grid grid-cols-7 gap-y-1">
              {/* 선택한 주 전체를 한 덩어리로 잇는 알약 모양 배경 — 셀 하나하나가 아니라
                  주(週) 행 전체를 감싸도록 grid 위에 절대 위치로 겹쳐 그린다. */}
              {selectedRowIndex != null && (
                <div
                  className="absolute inset-x-0 rounded-full bg-blue-2 z-0"
                  style={{
                    top: `calc(${selectedRowIndex} * 40px + ${selectedRowIndex} * 5px)`,
                    height: "36px"
                  }}
                />
              )}
              {cells.map((c, i) => {
                const hasIssue = c.inMonth && issueDateSet.has(c.dateStr);
                const inSelectedWeek = c.inMonth && isInSelectedWeek(c.dateStr);
                if (!c.inMonth) {
                  return (
                    <div
                      key={c.key}
                      className="relative z-10 h-9 flex flex-col items-center justify-center gap-0.5 text-body-4 text-grey-3"
                    >
                      <span>{c.day}</span>
                      <span className="w-1 h-1 rounded-full invisible" />
                    </div>
                  );
                }
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => handleDayClick(c.dateStr, Math.floor(i / 7))}
                    className={`relative z-10 h-9 flex flex-col items-center justify-center gap-0.5 rounded-full text-body-4 transition-colors ${
                      inSelectedWeek ? "text-primary font-bold" : "text-grey-9 hover:bg-bluegrey-1"
                    }`}
                  >
                    <span>{c.day}</span>
                    <span
                      className={`w-1 h-1 rounded-full ${hasIssue ? "bg-blue-6" : "invisible"}`}
                    />
                  </button>
                );
              })}
            </div>

            {notFound && (
              <p className="mt-3 text-caption text-grey-5 text-center">
                해당 주에 발행된 주보가 없습니다.
              </p>
            )}

            {selectedWeekStart && (
              <button
                type="button"
                onClick={() => {
                  setSelectedWeekStart(null);
                  setSelectedRowIndex(null);
                  setNotFound(false);
                }}
                className="mt-3 w-full text-center text-caption text-grey-6 hover:text-primary underline"
              >
                선택 초기화
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg text-body-3 font-medium transition-colors ${
        active
          ? "bg-blue-7 text-white"
          : disabled
            ? "text-grey-4 cursor-not-allowed"
            : "text-grey-8 hover:bg-blue-1 hover:text-blue-7"
      }`}
    >
      {label}
    </button>
  );
}
