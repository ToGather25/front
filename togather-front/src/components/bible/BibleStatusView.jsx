import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { OT, NT, BOOK_MAP } from "@/config/bible.config";

function progressStyle(pct) {
  if (pct <= 25) return { bg: "bg-blue-2", text: "text-blue-9", sub: "text-blue-6", circle: "border-blue-4" };
  if (pct <= 50) return { bg: "bg-blue-3", text: "text-blue-9", sub: "text-blue-7", circle: "border-blue-5" };
  if (pct <= 75) return { bg: "bg-blue-5", text: "text-white",  sub: "text-blue-2", circle: "border-white/70" };
  return               { bg: "bg-blue-7", text: "text-white",  sub: "text-blue-2", circle: "border-white/70" };
}

export default function BibleStatusView({ bookProgress = {}, config = {}, mode = "read" }) {
  const navigate = useNavigate();
  const [bookTab, setBookTab] = useState("OT");
  const [calDate, setCalDate] = useState(new Date());
  const [bookStartIdx, setBookStartIdx] = useState(0);
  const [bookFading, setBookFading] = useState(false);

  const {
    sectionTitle = "전체 현황",
    totalLabel = "읽은 구절 수 총합",
    totalValue = "-",
    visitCount = "-",
    completeCount = "-",
    streakDays = 0,
    streakLabel = "연속중!",
    monthCount = "-",
    monthCountLabel = "이번달 횟수",
    monthVerse = "-",
    monthVerseLabel = "이번달 구절수",
    bookStatusTitle = "현황",
  } = config;

  const allBooks = [...OT, ...NT];
  const totalPct = Math.round(allBooks.reduce((s, a) => s + (bookProgress[a] ?? 0), 0) / allBooks.length);
  const listBooks = bookTab === "OT" ? OT : bookTab === "NT" ? NT
    : allBooks.filter(a => (bookProgress[a] ?? 0) > 0 && (bookProgress[a] ?? 0) < 100);

  useEffect(() => { setBookStartIdx(0); }, [bookTab]);

  const VISIBLE_BOOKS = 14;
  const STEP = 3;
  const canBooksUp   = bookStartIdx > 0;
  const canBooksDown = bookStartIdx + VISIBLE_BOOKS < listBooks.length;
  const visibleBooks = listBooks.slice(bookStartIdx, bookStartIdx + VISIBLE_BOOKS);

  const goBooks = (delta) => {
    if (bookFading) return;
    setBookFading(true);
    setTimeout(() => { setBookStartIdx(i => i + delta); setBookFading(false); }, 280);
  };

  const yr = calDate.getFullYear(), mo = calDate.getMonth();
  const offset = (() => { const d = new Date(yr, mo, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const weeks = Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const today = new Date();
  const isThisMonth = yr === today.getFullYear() && mo === today.getMonth();
  const todayWd = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const wStart = today.getDate() - todayWd, wEnd = wStart + 6;
  const inWeek = (d) => isThisMonth && d >= wStart && d <= wEnd;

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-8 py-6">
      <style>{`
        @keyframes booksfadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes booksfadeOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-10px); } }
      `}</style>

      {/* 상단 진행률 */}
      <div className="mb-6 shrink-0">
        <p className="text-body-3 font-bold text-grey-11 mb-2">{totalPct}% 완료</p>
        <div className="relative h-px bg-grey-2">
          <div className="absolute left-0 top-0 h-full bg-grey-11" style={{ width: `${totalPct}%` }} />
        </div>
      </div>

      {/* 메인 그리드 */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-10">

        {/* 왼쪽 */}
        <div className="flex flex-col gap-5 min-h-0">
          <div className="shrink-0">
            <p className="text-body-3 font-bold text-grey-11 mb-3">{sectionTitle}</p>
            <div className="border border-bluegrey-2 rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-body-3 text-grey-8">{totalLabel} : <span className="font-semibold text-grey-11">{totalValue}</span></p>
              <p className="text-body-3 text-grey-8">방문한 횟수: <span className="font-semibold text-grey-11">{visitCount}</span></p>
              <p className="text-body-3 text-grey-8">완독 횟수: <span className="font-semibold text-grey-11">{completeCount}</span></p>
            </div>
          </div>
          <p className="shrink-0">
            <span className="text-sub-tit-1 font-bold text-grey-11">{streakDays} 일</span>
            <span className="text-body-2 text-grey-8 ml-2">{streakLabel}</span>
          </p>

          {/* 통계 카드 + 캘린더 */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-3 shrink-0">
              <div className="border border-bluegrey-2 rounded-xl px-4 py-3">
                <p className="text-sub-tit-4 font-bold text-grey-11">{monthCount}</p>
                <p className="text-body-5 text-grey-5">{monthCountLabel}</p>
              </div>
              <div className="border border-bluegrey-2 rounded-xl px-4 py-3">
                <p className="text-sub-tit-4 font-bold text-grey-11">{monthVerse}</p>
                <p className="text-body-5 text-grey-5">{monthVerseLabel}</p>
              </div>
            </div>

            {/* 캘린더 */}
            <div className="flex-1 min-w-0 border border-bluegrey-2 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-body-3 font-semibold text-grey-10">{yr}년 {mo + 1}월</p>
                <div className="flex items-center gap-1">
                  {!isThisMonth && (
                    <button onClick={() => setCalDate(new Date())} className="px-2 py-0.5 text-caption text-blue-7 border border-blue-4 rounded-full hover:bg-blue-1 transition-colors">
                      오늘
                    </button>
                  )}
                  <button onClick={() => setCalDate(new Date(yr, mo - 1, 1))} className="w-6 h-6 flex items-center justify-center text-grey-5 hover:text-grey-9 rounded">‹</button>
                  <button onClick={() => setCalDate(new Date(yr, mo + 1, 1))} className="w-6 h-6 flex items-center justify-center text-grey-5 hover:text-grey-9 rounded">›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-2">
                {["월","화","수","목","금","토","일"].map(d => <span key={d} className="text-body-5 text-grey-5 font-medium">{d}</span>)}
              </div>
              <div className="flex flex-col gap-0.5">
                {weeks.map((week, wi) => (
                  <div key={wi} className={`h-19 grid grid-cols-7 text-center rounded-lg ${week.some(d => d && inWeek(d)) ? "bg-grey-2" : ""}`}>
                    {[...Array(7)].map((_, di) => (
                      <span key={di} className={`flex items-center justify-center text-caption ${week[di] ? "text-grey-9" : ""}`}>
                        {week[di] ?? ""}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-2 mb-4 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-body-3 font-bold text-grey-11">{bookStatusTitle}</p>
              <div className="flex gap-1.5">
                {[["OT","구약"],["NT","신약"],["exclude","완료 제외"]].map(([key, label]) => (
                  <button key={key} onClick={() => setBookTab(key)}
                    className={`px-3 py-1 rounded-lg text-body-5 border transition-colors ${bookTab === key ? "border-grey-9 text-grey-9 font-semibold" : "border-bluegrey-2 text-grey-6 hover:border-grey-6"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {(canBooksUp || canBooksDown) && (
              <div className="flex gap-1.5">
                <button onClick={() => goBooks(-STEP)} disabled={!canBooksUp || bookFading}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${canBooksUp && !bookFading ? "border-blue-7 text-blue-7 hover:bg-blue-1" : "border-grey-3 text-grey-4 cursor-not-allowed"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => goBooks(STEP)} disabled={!canBooksDown || bookFading}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${canBooksDown && !bookFading ? "border-blue-7 text-blue-7 hover:bg-blue-1" : "border-grey-3 text-grey-4 cursor-not-allowed"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            )}
          </div>

          <div
            key={`${bookTab}-${bookStartIdx}`}
            className="flex flex-col gap-2"
            style={{ animation: bookFading ? "booksfadeOut 0.25s ease-in both" : "booksfadeUp 0.35s ease-out both" }}
          >
            {visibleBooks.map(abbr => {
              const pct = bookProgress[abbr] ?? 0;
              const done = pct === 100;
              const inProgress = pct > 0 && pct < 100;
              const s = inProgress ? progressStyle(pct) : null;
              return (
                <div
                  key={abbr}
                  onClick={() => navigate(
                    mode === "write" ? "/말씀/필사" : "/말씀/읽기",
                    { state: { book: mode === "write" ? abbr : BOOK_MAP[abbr] } }
                  )}
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer ${
                    done ? "bg-grey-2 hover:bg-grey-3" : inProgress ? s.bg : "bg-white border border-bluegrey-2 hover:border-blue-4"
                  }`}
                >
                  <span className={`text-body-3 font-medium ${done ? "text-grey-6" : inProgress ? s.text : "text-grey-5"}`}>
                    {BOOK_MAP[abbr]}
                  </span>
                  <span className={`ml-auto mr-3 text-body-4 ${done ? "text-grey-5" : inProgress ? s.sub : "text-grey-4"}`}>
                    {pct > 0 ? `${pct}%` : ""}
                  </span>
                  {done
                    ? <svg className="w-5 h-5 text-grey-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                    : inProgress
                      ? <div className={`w-5 h-5 rounded-full border-2 ${s.circle} shrink-0`} />
                      : <div className="w-5 h-5 rounded-full border-2 border-bluegrey-2 shrink-0" />
                  }
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
