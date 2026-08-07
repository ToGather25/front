import { useState } from "react";
import { useNavigate } from "react-router";
import { OT, NT, BOOK_MAP } from "@/config/bible.config";

// 성경 권별 절 수 (개역개정 기준)
const VERSE_COUNT = {
  창: 1533,
  출: 1213,
  레: 859,
  민: 1288,
  신: 959,
  수: 658,
  삿: 618,
  룻: 85,
  삼상: 810,
  삼하: 695,
  왕상: 816,
  왕하: 719,
  대상: 942,
  대하: 822,
  스: 280,
  느: 406,
  에: 167,
  욥: 1070,
  시: 2461,
  잠: 915,
  전: 222,
  아: 117,
  사: 1292,
  렘: 1364,
  애: 154,
  겔: 1273,
  단: 357,
  호: 197,
  욜: 73,
  암: 146,
  옵: 21,
  욘: 48,
  미: 105,
  나: 47,
  합: 56,
  습: 53,
  학: 38,
  슥: 211,
  말: 55,
  마: 1071,
  막: 678,
  눅: 1151,
  요: 879,
  행: 1007,
  롬: 433,
  고전: 437,
  고후: 257,
  갈: 149,
  엡: 155,
  빌: 104,
  골: 95,
  살전: 89,
  살후: 47,
  딤전: 113,
  딤후: 83,
  딛: 46,
  몬: 25,
  히: 303,
  약: 108,
  벧전: 105,
  벧후: 61,
  요일: 105,
  요이: 13,
  요삼: 14,
  유: 25,
  계: 404,
};

// 더미 스트릭 데이터 — 백엔드 연동 시 props로 받기
const MOCK_READ_DATES = [3, 4, 5, 6, 9, 10, 14, 15, 16, 17, 18, 22];

function GoalModal({ onClose, onSave }) {
  const allBooks = [...OT, ...NT];
  const [selected, setSelected] = useState(new Set());
  const now = new Date();
  const label = `${now.getFullYear()}년 ${now.getMonth() + 1}월 목표 설정`;

  const toggle = (abbr) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(abbr)) {
        next.delete(abbr);
      } else {
        next.add(abbr);
      }
      return next;
    });

  const totalVerses = [...selected].reduce((s, a) => s + (VERSE_COUNT[a] ?? 0), 0);

  const allOTSelected = OT.every((a) => selected.has(a));
  const allNTSelected = NT.every((a) => selected.has(a));
  const allSelected = allBooks.every((a) => selected.has(a));

  const toggleGroup = (books, allChecked) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        books.forEach((a) => next.delete(a));
      } else {
        books.forEach((a) => next.add(a));
      }
      return next;
    });

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-bluegrey-2 shrink-0">
          <div>
            <h3 className="text-sub-tit-4 font-bold text-grey-11">{label}</h3>
            <p className="text-body-5 text-grey-5 mt-0.5">이번 달에 읽을 성경 권을 선택해 주세요</p>
          </div>
          <button onClick={onClose} className="text-grey-5 hover:text-grey-9 text-xl leading-none">
            ✕
          </button>
        </div>

        {/* 목표 절 수 + 전체 선택 */}
        <div className="px-7 py-3 bg-blue-1 border-b border-blue-2 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-body-4 text-blue-7">이번 달 목표 구절 수</span>
            <span className="text-sub-tit-4 font-bold text-primary">
              {totalVerses > 0 ? totalVerses.toLocaleString() + "절" : "—"}
            </span>
          </div>
          <button
            onClick={() => toggleGroup(allBooks, allSelected)}
            className={`text-body-5 px-3 py-1 rounded-full border transition-colors ${
              allSelected
                ? "bg-primary border-primary text-white"
                : "border-blue-4 text-blue-6 hover:bg-blue-1"
            }`}
          >
            {allSelected ? "전체 해제" : "전체 선택"}
          </button>
        </div>

        {/* 성경 바둑판 */}
        <div className="overflow-y-auto px-7 py-5 flex-1">
          {/* 구약 */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-4 font-semibold text-grey-8">구약</p>
            <button
              onClick={() => toggleGroup(OT, allOTSelected)}
              className="text-body-5 text-blue-6 hover:text-blue-8 transition-colors"
            >
              {allOTSelected ? "구약 해제" : "구약 전체"}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {OT.map((abbr) => (
              <button
                key={abbr}
                onClick={() => toggle(abbr)}
                className={`py-2 rounded-lg text-body-5 font-medium border transition-all ${
                  selected.has(abbr)
                    ? "bg-primary border-primary text-white"
                    : "border-bluegrey-2 text-grey-8 hover:border-blue-4 hover:bg-blue-1"
                }`}
              >
                {abbr}
              </button>
            ))}
          </div>

          {/* 신약 */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-4 font-semibold text-grey-8">신약</p>
            <button
              onClick={() => toggleGroup(NT, allNTSelected)}
              className="text-body-5 text-blue-6 hover:text-blue-8 transition-colors"
            >
              {allNTSelected ? "신약 해제" : "신약 전체"}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {NT.map((abbr) => (
              <button
                key={abbr}
                onClick={() => toggle(abbr)}
                className={`py-2 rounded-lg text-body-5 font-medium border transition-all ${
                  selected.has(abbr)
                    ? "bg-primary border-primary text-white"
                    : "border-bluegrey-2 text-grey-8 hover:border-blue-4 hover:bg-blue-1"
                }`}
              >
                {abbr}
              </button>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center gap-3 px-7 py-4 border-t border-bluegrey-2 shrink-0">
          <span className="text-body-5 text-grey-5 flex-1">
            {selected.size > 0 ? `${selected.size}권 선택됨` : ""}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-bluegrey-3 rounded-xl text-body-4 text-grey-8 hover:bg-bluegrey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onSave(totalVerses, selected.size);
              onClose();
            }}
            disabled={selected.size === 0}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-body-4 font-semibold hover:bg-blue-7 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalBanner({ totalPct, monthGoalPct, hasGoal, onGoalSaved }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [goalVerse, setGoalVerse] = useState(0);
  const [goalSet, setGoalSet] = useState(hasGoal);
  const [achievedVerse] = useState(300); // TODO: 백엔드 연동
  const pct =
    goalVerse > 0 ? Math.min(100, Math.round((achievedVerse / goalVerse) * 100)) : monthGoalPct;

  const handleSave = (total) => {
    setGoalVerse(total);
    setGoalSet(true);
    if (onGoalSaved) onGoalSaved(total);
  };

  return (
    <>
      {/* 2열 가로 배치 */}
      <div className="mb-5 grid grid-cols-2 gap-4">
        {/* 전체 완독률 */}
        <div className="border border-bluegrey-2 rounded-2xl px-5 py-4">
          <p className="text-body-5 text-grey-6 mb-2">전체 완독률</p>
          <p className="text-sub-tit-2 font-bold text-grey-11 mb-3">{totalPct}%</p>
          <div className="h-1.5 bg-grey-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-7 rounded-full transition-all duration-500"
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </div>

        {/* 이번 달 목표 */}
        <div className="border border-bluegrey-2 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-body-5 text-grey-6">이번 달 목표</p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-body-5 text-blue-6 hover:text-blue-8 transition-colors"
            >
              {goalSet ? "수정" : "설정하기"}
            </button>
          </div>
          {goalSet ? (
            <>
              <p className="text-sub-tit-2 font-bold text-grey-11 mb-3">{pct}%</p>
              <div className="h-1.5 bg-grey-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-body-5 text-grey-5 mt-2">
                {achievedVerse.toLocaleString()} / {goalVerse.toLocaleString()}절
              </p>
            </>
          ) : (
            <div className="flex flex-col items-start gap-2 mt-1">
              <p className="text-body-4 text-grey-5">목표를 설정해 보세요</p>
              <div className="h-1.5 bg-grey-3 rounded-full overflow-hidden w-full">
                <div className="h-full w-0" />
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && <GoalModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </>
  );
}

function StreakCalendar({ readDates = MOCK_READ_DATES, streakDays, calDate, setCalDate }) {
  const yr = calDate.getFullYear(),
    mo = calDate.getMonth();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const offset = (() => {
    const d = new Date(yr, mo, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const weeks = Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const today = new Date();
  const isThisMonth = yr === today.getFullYear() && mo === today.getMonth();
  const readSet = new Set(readDates);

  const isRead = (d) => d && readSet.has(d);
  const hasLeft = (d, weekArr, di) => di > 0 && isRead(weekArr[di - 1]);
  const hasRight = (d, weekArr, di) => di < 6 && isRead(weekArr[di + 1]);

  return (
    <div className="border border-bluegrey-2 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-body-3 font-bold text-grey-11">{streakDays}일 연속 읽기중!</p>
          <p className="text-body-5 text-grey-5">
            {yr}년 {mo + 1}월
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!isThisMonth && (
            <button
              onClick={() => setCalDate(new Date())}
              className="px-2 py-0.5 text-caption text-blue-7 border border-blue-4 rounded-full hover:bg-blue-1 transition-colors mr-1"
            >
              오늘
            </button>
          )}
          <button
            onClick={() => setCalDate(new Date(yr, mo - 1, 1))}
            className="w-6 h-6 flex items-center justify-center text-grey-5 hover:text-grey-9 rounded"
          >
            ‹
          </button>
          <button
            onClick={() => setCalDate(new Date(yr, mo + 1, 1))}
            className="w-6 h-6 flex items-center justify-center text-grey-5 hover:text-grey-9 rounded"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center mb-1">
        {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
          <span key={d} className="text-caption text-grey-5 font-medium pb-1">
            {d}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {[...Array(7)].map((_, di) => {
              const d = week[di];
              const read = isRead(d);
              const left = read && hasLeft(d, week, di);
              const right = read && hasRight(d, week, di);
              const isToday = isThisMonth && d === today.getDate();
              return (
                <div key={di} className="flex items-center justify-center h-12 relative">
                  {/* 연속 이음새 배경 */}
                  {read && left && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-6 bg-blue-2" />
                  )}
                  {read && right && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-6 bg-blue-2" />
                  )}
                  {/* 날짜 원 */}
                  <span
                    className={`relative z-10 w-8 h-8 flex items-center justify-center text-body-4 font-medium rounded-full transition-colors ${
                      read
                        ? "bg-blue-7 text-white"
                        : isToday
                          ? "border border-blue-5 text-blue-7"
                          : d
                            ? "text-grey-8"
                            : ""
                    }`}
                  >
                    {d ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function BibleProgress({ bookProgress, bookTab, setBookTab, navigate, mode }) {
  const [viewMode, setViewMode] = useState("list");
  const [startIdx, setStartIdx] = useState(0);

  const PAGE = viewMode === "grid" ? 39 : 10;
  const allBooks = [...OT, ...NT];
  const listBooks =
    bookTab === "OT"
      ? OT
      : bookTab === "NT"
        ? NT
        : allBooks.filter((a) => (bookProgress[a] ?? 0) > 0 && (bookProgress[a] ?? 0) < 100);

  const handleTab = (key) => {
    setBookTab(key);
    setStartIdx(0);
  };
  // 뷰 모드 바뀌면 인덱스 초기화
  const handleViewMode = (v) => {
    setViewMode(v);
    setStartIdx(0);
  };
  const visibleBooks = listBooks.slice(startIdx, startIdx + PAGE);
  const canUp = startIdx > 0;
  const canDown = startIdx + PAGE < listBooks.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {[
            ["OT", "구약"],
            ["NT", "신약"],
            ["exclude", "완료 제외"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleTab(key)}
              className={`px-3 py-1 rounded-lg text-body-5 border transition-colors ${bookTab === key ? "border-grey-9 text-grey-9 font-semibold" : "border-bluegrey-2 text-grey-6 hover:border-grey-6"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStartIdx((i) => Math.max(0, i - PAGE))}
            disabled={!canUp}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${canUp ? "border-blue-7 text-blue-7 hover:bg-blue-1" : "border-grey-3 text-grey-4 cursor-not-allowed"}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() =>
              setStartIdx((i) => Math.min(Math.max(0, listBooks.length - PAGE), i + PAGE))
            }
            disabled={!canDown}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${canDown ? "border-blue-7 text-blue-7 hover:bg-blue-1" : "border-grey-3 text-grey-4 cursor-not-allowed"}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="flex border border-bluegrey-2 rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewMode("list")}
              className={`px-2.5 py-1 transition-colors ${viewMode === "list" ? "bg-blue-7 text-white" : "text-grey-6 hover:bg-bluegrey-1"}`}
              title="리스트 형태 (10권)"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewMode("grid")}
              className={`px-2.5 py-1 transition-colors ${viewMode === "grid" ? "bg-blue-7 text-white" : "text-grey-6 hover:bg-bluegrey-1"}`}
              title="바둑판 형태 (20권)"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {listBooks.length === 0 ? (
        <p className="text-body-4 text-grey-5 py-4 text-center">
          {bookTab === "exclude" ? "완료되지 않은 성경이 없습니다" : "데이터가 없습니다"}
        </p>
      ) : viewMode === "list" ? (
        <div className="flex flex-col gap-2">
          {visibleBooks.map((abbr) => {
            const pct = bookProgress[abbr] ?? 0;
            return (
              <button
                key={abbr}
                onClick={() =>
                  navigate(mode === "write" ? "/말씀/필사" : "/말씀/읽기", {
                    state: { book: BOOK_MAP[abbr] },
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-bluegrey-2 hover:border-blue-4 hover:bg-blue-1 transition-all text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-4 font-medium text-grey-9 group-hover:text-primary transition-colors">
                      {BOOK_MAP[abbr]}
                    </span>
                    <span className="text-body-5 text-grey-5">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-grey-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                {pct === 100 && (
                  <svg
                    className="w-4 h-4 text-blue-7 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {visibleBooks.map((abbr) => {
            const pct = bookProgress[abbr] ?? 0;
            const done = pct === 100;
            return (
              <button
                key={abbr}
                onClick={() =>
                  navigate(mode === "write" ? "/말씀/필사" : "/말씀/읽기", {
                    state: { book: BOOK_MAP[abbr] },
                  })
                }
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-all hover:shadow-md ${
                  done
                    ? "bg-blue-7 border-blue-7 text-white"
                    : pct > 0
                      ? "bg-blue-1 border-blue-3 text-blue-8"
                      : "bg-white border-bluegrey-2 text-grey-7 hover:border-blue-3"
                }`}
              >
                <span className="text-body-5 font-bold leading-none">{abbr}</span>
                {pct > 0 && <span className="text-caption leading-none opacity-70">{pct}%</span>}
              </button>
            );
          })}
        </div>
      )}

      {listBooks.length > PAGE && (
        <p className="text-body-5 text-grey-5 text-center">
          {startIdx + 1}–{Math.min(startIdx + PAGE, listBooks.length)} / {listBooks.length}권
        </p>
      )}
    </div>
  );
}

export default function BibleStatusView({ bookProgress = {}, config = {}, mode = "read" }) {
  const navigate = useNavigate();
  const [bookTab, setBookTab] = useState("OT");
  const [calDate, setCalDate] = useState(new Date());
  const [hasGoal] = useState(false);

  const allBooks = [...OT, ...NT];
  const totalPct = Math.round(
    allBooks.reduce((s, a) => s + (bookProgress[a] ?? 0), 0) / allBooks.length,
  );
  const monthGoalPct = 48;

  const statCards = [
    { label: config.totalLabel ?? "읽은 구절 수 총합", value: config.totalValue ?? "-" },
    { label: "방문한 횟수", value: config.visitCount ?? "-" },
    { label: "완독 횟수", value: config.completeCount ?? "-" },
    { label: config.monthVerseLabel ?? "이번달 읽은 구절수", value: config.monthVerse ?? "-" },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <GoalBanner
        totalPct={totalPct}
        monthGoalPct={monthGoalPct}
        hasGoal={hasGoal}
        onSetGoal={() => {}}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {statCards.map(({ label, value }) => (
              <div key={label} className="border border-bluegrey-2 rounded-xl px-4 py-4">
                <p className="text-sub-tit-3 font-bold text-grey-11 leading-tight">{value}</p>
                <p className="text-body-5 text-grey-5 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <StreakCalendar
            streakDays={config.streakDays ?? 0}
            calDate={calDate}
            setCalDate={setCalDate}
          />
        </div>

        <BibleProgress
          bookProgress={bookProgress}
          bookTab={bookTab}
          setBookTab={setBookTab}
          navigate={navigate}
          mode={mode}
        />
      </div>
    </div>
  );
}
