import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import bibleData from "@/data/bible.json";
import { BOOK_MAP, OT, NT, BIBLE_WRITE_SIDEBAR_MENUS } from "@/config/bible.config";

// ── 유틸 ───────────────────────────────────────────────
function getChapters(bookAbbr) {
  const re = new RegExp(`^${bookAbbr}(\\d+):\\d+$`);
  const set = new Set();
  for (const key of Object.keys(bibleData)) {
    const m = key.match(re);
    if (m) set.add(Number(m[1]));
  }
  return [...set].sort((a, b) => a - b);
}

function getVerses(bookAbbr, chapter) {
  const re = new RegExp(`^${bookAbbr}${chapter}:(\\d+)$`);
  const arr = [];
  for (const [key, text] of Object.entries(bibleData)) {
    const m = key.match(re);
    if (m) arr.push({ verse: Number(m[1]), text: text.trim() });
  }
  return arr.sort((a, b) => a.verse - b.verse);
}

// ── 책 선택 모달 ───────────────────────────────────────
function BookModal({ current, onSelect, onClose }) {
  const [tab, setTab] = useState(OT.includes(current) ? "OT" : "NT");
  const list = tab === "OT" ? OT : NT;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[480px] max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-bluegrey-2">
          <span className="text-sub-tit-4 font-semibold text-grey-11">성경 선택</span>
          <button onClick={onClose} className="text-grey-6 hover:text-grey-11">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex border-b border-bluegrey-2">
          {["OT", "NT"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-body-4 font-medium transition-colors ${tab === t ? "text-blue-8 border-b-2 border-blue-8" : "text-grey-6 hover:text-grey-9"}`}
            >
              {t === "OT" ? "구약" : "신약"}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto p-4 grid grid-cols-4 gap-2">
          {list.map((abbr) => (
            <button
              key={abbr}
              onClick={() => onSelect(abbr)}
              className={`py-2 px-3 rounded-lg text-body-4 transition-colors ${current === abbr ? "bg-blue-8 text-white font-semibold" : "hover:bg-bluegrey-1 text-grey-9"}`}
            >
              {BOOK_MAP[abbr]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 랭킹 ───────────────────────────────────────────────
const MOCK_RANKING = [
  { rank: 1, name: "박지호", count: 312 },
  { rank: 2, name: "김민준", count: 278 },
  { rank: 3, name: "이서연", count: 241 },
  { rank: 4, name: "정도현", count: 189 },
  { rank: 5, name: "최유진", count: 154 },
  { rank: 6, name: "나", count: 93, isMe: true },
  { rank: 7, name: "강민서", count: 71 },
  { rank: 8, name: "오준혁", count: 52 },
  { rank: 9, name: "한지수", count: 38 },
  { rank: 10, name: "임채원", count: 19 },
];
const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RankingView() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-xl w-full mx-auto">
      <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">성경 필사 랭킹</h2>
      <div className="flex flex-col gap-2">
        {MOCK_RANKING.map(({ rank, name, count, isMe }) => (
          <div
            key={rank}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
              isMe ? "bg-blue-1 border-blue-3" : "bg-white border-bluegrey-2"
            }`}
          >
            <span className="w-8 text-center text-body-3 font-bold text-grey-7">
              {MEDAL[rank] ?? rank}
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-2 flex items-center justify-center shrink-0">
              <span className="text-body-4 font-semibold text-blue-8">{name[0]}</span>
            </div>
            <span className={`flex-1 text-body-3 font-medium ${isMe ? "text-blue-8 font-semibold" : "text-grey-10"}`}>
              {name}{isMe && " (나)"}
            </span>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-body-4 font-bold text-grey-10">{count.toLocaleString()}</span>
              <span className="text-body-5 text-grey-5">구절</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 내 구절 ─────────────────────────────────────────────
function MyVersesView({ completed }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl w-full mx-auto">
      <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-2">내 구절</h2>
      <p className="text-body-4 text-grey-5 mb-6">총 {completed.length}개의 구절을 필사했습니다.</p>
      {completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="w-12 h-12 text-grey-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          <p className="text-body-3 text-grey-6">필사한 구절이 없습니다.</p>
          <p className="text-body-4 text-grey-4 mt-1">성경 쓰기에서 구절을 완성하면 자동으로 저장됩니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {completed.map((v) => (
            <div key={v.key} className="bg-white border border-bluegrey-2 rounded-2xl px-6 py-5">
              <p className="text-body-5 text-blue-6 font-semibold mb-2">
                {v.bookName} {v.chapter}장 {v.verse}절
              </p>
              <p className="text-body-2 text-grey-9">{v.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 내 현황 ─────────────────────────────────────────────
function progressStyle(pct) {
  if (pct <= 25) return { bg: "bg-blue-2", text: "text-blue-9", sub: "text-blue-6", circle: "border-blue-4" };
  if (pct <= 50) return { bg: "bg-blue-3", text: "text-blue-9", sub: "text-blue-7", circle: "border-blue-5" };
  if (pct <= 75) return { bg: "bg-blue-5", text: "text-white",  sub: "text-blue-2", circle: "border-white/70" };
  return               { bg: "bg-blue-7", text: "text-white",  sub: "text-blue-2", circle: "border-white/70" };
}

const BOOK_PROGRESS_WRITE = {
  창: 100, 출: 100, 레: 73, 민: 100, 신: 73, 수: 17, 삿: 21, 룻: 0,
  삼상: 0, 삼하: 0, 왕상: 0, 왕하: 0, 대상: 0, 대하: 0, 스: 0, 느: 0, 에: 0,
  욥: 0, 시: 32, 잠: 0, 전: 0, 아: 0, 사: 0, 렘: 0, 애: 0, 겔: 0, 단: 0,
  호: 0, 욜: 0, 암: 0, 옵: 0, 욘: 0, 미: 0, 나: 0, 합: 0, 습: 0, 학: 0, 슥: 0, 말: 0,
  마: 45, 막: 0, 눅: 0, 요: 100, 행: 0, 롬: 60, 고전: 0, 고후: 0, 갈: 100, 엡: 100,
  빌: 0, 골: 0, 살전: 0, 살후: 0, 딤전: 0, 딤후: 0, 딛: 0, 몬: 0, 히: 0,
  약: 0, 벧전: 0, 벧후: 0, 요일: 0, 요이: 0, 요삼: 0, 유: 0, 계: 0,
};

function MyStatusView() {
  const [bookTab, setBookTab] = useState("OT");
  const [calDate, setCalDate] = useState(new Date());

  const allBooks = [...OT, ...NT];
  const totalPct = Math.round(allBooks.reduce((s, a) => s + (BOOK_PROGRESS_WRITE[a] ?? 0), 0) / allBooks.length);
  const listBooks = bookTab === "OT" ? OT : bookTab === "NT" ? NT
    : allBooks.filter(a => (BOOK_PROGRESS_WRITE[a] ?? 0) > 0 && (BOOK_PROGRESS_WRITE[a] ?? 0) < 100);

  const yr = calDate.getFullYear(), mo = calDate.getMonth();
  const offset = (() => { const d = new Date(yr, mo, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const today = new Date();
  const isThisMonth = yr === today.getFullYear() && mo === today.getMonth();
  const todayWd = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const wStart = today.getDate() - todayWd, wEnd = wStart + 6;
  const inWeek = (d) => isThisMonth && d >= wStart && d <= wEnd;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-8">
        <p className="text-body-3 font-bold text-grey-11 mb-2">{totalPct}% 완료</p>
        <div className="relative h-px bg-grey-2">
          <div className="absolute left-0 top-0 h-full bg-grey-11" style={{ width: `${totalPct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-10">
        {/* 왼쪽 */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-body-3 font-bold text-grey-11 mb-3">필사 전체 현황</p>
            <div className="border border-bluegrey-2 rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-body-3 text-grey-8">작성한 구절 수 총합 : <span className="font-semibold text-grey-11">240,021 절</span></p>
              <p className="text-body-3 text-grey-8">방문한 횟수: <span className="font-semibold text-grey-11">320 일</span></p>
              <p className="text-body-3 text-grey-8">완독 횟수: <span className="font-semibold text-grey-11">1번</span></p>
            </div>
          </div>
          <p>
            <span className="text-[28px] font-bold text-grey-11">7 일</span>
            <span className="text-body-2 text-grey-8 ml-2">연속 필사중!</span>
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              <div className="border border-bluegrey-2 rounded-xl px-4 py-3">
                <p className="text-sub-tit-4 font-bold text-grey-11">8일</p>
                <p className="text-body-5 text-grey-5">이번달 필사 횟수</p>
              </div>
              <div className="border border-bluegrey-2 rounded-xl px-4 py-3">
                <p className="text-sub-tit-4 font-bold text-grey-11">360절</p>
                <p className="text-body-5 text-grey-5">이번달 필사 구절수</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-body-4 font-semibold text-grey-10">{yr}년 {mo + 1}월</p>
                <div className="flex">
                  <button onClick={() => setCalDate(new Date(yr, mo - 1, 1))} className="px-1 text-grey-5 hover:text-grey-9">‹</button>
                  <button onClick={() => setCalDate(new Date(yr, mo + 1, 1))} className="px-1 text-grey-5 hover:text-grey-9">›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-1">
                {["월","화","수","목","금","토","일"].map(d => <span key={d} className="text-[10px] text-grey-5">{d}</span>)}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className={`grid grid-cols-7 text-center rounded-full mb-0.5 ${week.some(d => d && inWeek(d)) ? "bg-grey-2" : ""}`}>
                  {[...Array(7)].map((_, di) => (
                    <span key={di} className={`py-1 text-[11px] ${week[di] ? "text-grey-9" : ""}`}>{week[di] ?? ""}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 오른쪽 */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <p className="text-body-3 font-bold text-grey-11">필사 현황</p>
            <div className="flex gap-1.5">
              {[["OT","구약"],["NT","신약"],["exclude","완료 제외"]].map(([key, label]) => (
                <button key={key} onClick={() => setBookTab(key)}
                  className={`px-3 py-1 rounded-lg text-body-5 border transition-colors ${bookTab === key ? "border-grey-9 text-grey-9 font-semibold" : "border-bluegrey-2 text-grey-6 hover:border-grey-6"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {listBooks.map(abbr => {
              const pct = BOOK_PROGRESS_WRITE[abbr] ?? 0;
              const done = pct === 100;
              const inProgress = pct > 0 && pct < 100;
              const s = inProgress ? progressStyle(pct) : null;
              return (
                <div
                  key={abbr}
                  className={`flex items-center px-4 py-3 rounded-xl ${
                    done ? "bg-grey-2" : inProgress ? s.bg : "bg-white border border-bluegrey-2"
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

// ── 사이드바 메뉴 아이콘 ────────────────────────────────
const MENU_ICON = {
  "성경쓰기": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>,
  "랭킹": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  "내 구절": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  "내 현황": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export default function BibleWrite() {
  const [activeMenu, setActiveMenu] = useState("성경쓰기");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState("창");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [typed, setTyped] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [completedVerses, setCompletedVerses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [verseOpen, setVerseOpen] = useState(false);

  const chapters = useMemo(() => getChapters(selectedBook), [selectedBook]);
  const verses = useMemo(() => getVerses(selectedBook, selectedChapter), [selectedBook, selectedChapter]);
  const currentVerse = verses.find((v) => v.verse === selectedVerse);
  const targetText = currentVerse?.text ?? "";

  const textareaRef = useRef(null);

  useEffect(() => {
    setSelectedChapter(1);
    setSelectedVerse(1);
    setTyped("");
    setIsCorrect(null);
  }, [selectedBook]);

  useEffect(() => {
    setSelectedVerse(1);
    setTyped("");
    setIsCorrect(null);
  }, [selectedChapter]);

  useEffect(() => {
    setTyped("");
    setIsCorrect(null);
  }, [selectedVerse]);

  const handleTyping = (e) => {
    const val = e.target.value;
    if (val.length > targetText.length) return;
    setTyped(val);
    if (val.length === 0) { setIsCorrect(null); return; }
    if (val === targetText) {
      setIsCorrect(true);
      const key = `${selectedBook}-${selectedChapter}-${selectedVerse}`;
      setCompletedVerses((prev) => {
        if (prev.some((v) => v.key === key)) return prev;
        return [...prev, {
          key,
          bookName: BOOK_MAP[selectedBook],
          bookAbbr: selectedBook,
          chapter: selectedChapter,
          verse: selectedVerse,
          text: targetText,
        }];
      });
    } else {
      setIsCorrect(null);
    }
  };

  const isDone = isCorrect === true;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`bg-grey-1 border-r border-bluegrey-2 flex flex-col transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-56" : "w-14"}`}>
        <div className={`flex items-center py-3 border-b border-bluegrey-2 ${sidebarOpen ? "justify-between pl-3 pr-3" : "justify-center"}`}>
          {sidebarOpen && <img src={LogoIcon} className="h-6 w-auto pl-2 object-contain" alt="" />}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] shrink-0 text-grey-6 hover:text-grey-9"
          >
            <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${sidebarOpen ? "w-5 rotate-45 translate-y-[7px]" : "w-5"}`} />
            <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${sidebarOpen ? "w-5 opacity-0" : "w-5 opacity-100"}`} />
            <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${sidebarOpen ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"}`} />
          </button>
        </div>
        <nav className="flex flex-col py-2">
          {BIBLE_WRITE_SIDEBAR_MENUS.map((menu) => (
            <button
              key={menu}
              onClick={() => setActiveMenu(menu)}
              className={`flex items-center py-3 text-body-3 transition-colors ${sidebarOpen ? "gap-3 px-4" : "justify-center px-0"} ${
                activeMenu === menu
                  ? "bg-grey-3 text-grey-11 font-semibold"
                  : "text-grey-8 hover:bg-bluegrey-1"
              }`}
            >
              {MENU_ICON[menu]}
              {sidebarOpen && menu}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-bluegrey-2 h-20 flex items-center gap-2 px-2">
          <Link
            to="/말씀"
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-grey-6 hover:text-grey-9 hover:bg-bluegrey-1 transition-colors ${sidebarOpen ? "flex-1" : "w-full"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            {sidebarOpen && <span className="text-[10px] whitespace-nowrap">나가기</span>}
          </Link>
          {sidebarOpen && (
            <Link
              to="/말씀/읽기"
              className="flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-grey-6 hover:text-grey-9 hover:bg-bluegrey-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              <span className="text-[10px] whitespace-nowrap">성경읽기로 전환</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — 성경쓰기 메뉴에서만 표시 */}
        {activeMenu === "성경쓰기" && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-bluegrey-2 bg-white">
            {/* 글씨 크기 */}
            <div className="relative">
              <button
                onClick={() => { setFontSizeOpen((v) => !v); setChapterOpen(false); setVerseOpen(false); }}
                className="px-4 py-2 rounded-full bg-grey-2 hover:bg-grey-3 transition-colors"
              >
                <span className="text-[15px] font-medium text-grey-8">가</span>
                <span className="text-[11px] font-medium text-grey-8">가</span>
              </button>
              {fontSizeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFontSizeOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 z-20 bg-grey-1 rounded-2xl p-5 shadow-lg w-72">
                    <p className="text-body-3 font-semibold text-grey-10 mb-4">글씨 크기</p>
                    <div className="flex gap-3">
                      {[
                        { key: "small", label: "작게", gaSize: "text-[13px]" },
                        { key: "medium", label: "보통", gaSize: "text-[18px]" },
                        { key: "large", label: "크게", gaSize: "text-[24px]" },
                      ].map(({ key, label, gaSize }) => (
                        <button
                          key={key}
                          onClick={() => { setFontSize(key); setFontSizeOpen(false); }}
                          className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 transition-colors ${
                            fontSize === key ? "bg-primary border-primary text-white" : "bg-white border-bluegrey-2 text-grey-9 hover:border-blue-5"
                          }`}
                        >
                          <span className={`${gaSize} font-medium leading-none`}>가</span>
                          <span className="text-body-5">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1" />

            {/* 책 선택 */}
            <button
              onClick={() => { setBookModalOpen(true); setChapterOpen(false); setVerseOpen(false); setFontSizeOpen(false); }}
              className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-4 text-grey-8 hover:border-blue-5 transition-colors"
            >
              {BOOK_MAP[selectedBook]}
            </button>

            {/* 장 선택 */}
            <div className="relative">
              <button
                onClick={() => { setChapterOpen((v) => !v); setVerseOpen(false); setFontSizeOpen(false); }}
                className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-4 text-grey-8 hover:border-blue-5 transition-colors min-w-[52px] text-center"
              >
                {selectedChapter}{BOOK_MAP[selectedBook] === "시편" ? "편" : "장"}
              </button>
              {chapterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setChapterOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-2xl shadow-xl p-4 w-48 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-1">
                      {chapters.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setSelectedChapter(c); setChapterOpen(false); }}
                          className={`py-2 rounded-lg text-body-4 transition-colors ${selectedChapter === c ? "bg-primary text-white font-semibold" : "hover:bg-grey-1 text-grey-8"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 절 선택 */}
            <div className="relative">
              <button
                onClick={() => { setVerseOpen((v) => !v); setChapterOpen(false); setFontSizeOpen(false); }}
                className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-4 text-grey-8 hover:border-blue-5 transition-colors min-w-[52px] text-center"
              >
                {selectedVerse}절
              </button>
              {verseOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setVerseOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-2xl shadow-xl p-4 w-48 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-1">
                      {verses.map(({ verse }) => (
                        <button
                          key={verse}
                          onClick={() => { setSelectedVerse(verse); setVerseOpen(false); }}
                          className={`py-2 rounded-lg text-body-4 transition-colors ${selectedVerse === verse ? "bg-primary text-white font-semibold" : "hover:bg-grey-1 text-grey-8"}`}
                        >
                          {verse}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 검색 */}
            <div className="flex items-center gap-2 px-4 py-2 border border-bluegrey-2 rounded-full w-56">
              <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5 bg-transparent" placeholder="검색할 내용을 입력하세요." />
            </div>
          </div>
        )}

        {/* 콘텐츠 분기 */}
        {activeMenu === "성경쓰기" && (() => {
          const progress = targetText.length > 0 ? Math.min((typed.length / targetText.length) * 100, 100) : 0;
          const fontSizeClass = fontSize === "large" ? "text-[22px]" : fontSize === "small" ? "text-body-2" : "text-body-1";
          return (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className="flex-1 overflow-y-auto px-10 py-8 cursor-text"
                onClick={() => !isDone && textareaRef.current?.focus()}
              >
                {/* 제목 + 하트 */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sub-tit-4 font-bold text-grey-11">
                    {BOOK_MAP[selectedBook]} {selectedChapter}{BOOK_MAP[selectedBook] === "시편" ? "편" : "장"} {selectedVerse}절
                  </h2>
                  <svg className="w-5 h-5 text-grey-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>

                {/* 진행률 바 */}
                <div className="relative w-full h-0.5 bg-grey-2 mb-8">
                  <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-sm transition-all duration-150"
                    style={{ left: `clamp(0px, calc(${progress}% - 6px), calc(100% - 12px))` }}
                  />
                </div>

                {/* 오버레이 타이핑 */}
                <div className="relative">
                  <div className={`${fontSizeClass} whitespace-pre-wrap tracking-wide select-none leading-relaxed`}>
                    {targetText.split("").map((char, i) => {
                      if (i < typed.length) {
                        const correct = typed[i] === char;
                        return <span key={i} className={correct ? "text-grey-9" : "text-red-500"}>{typed[i]}</span>;
                      }
                      if (i === typed.length) {
                        return (
                          <span key={i} className="relative">
                            <span className="absolute -left-px top-0 bottom-0 w-0.5 bg-blue-6 animate-pulse" />
                            <span className="text-grey-3">{char}</span>
                          </span>
                        );
                      }
                      return <span key={i} className="text-grey-3">{char}</span>;
                    })}
                  </div>
                  {!isDone && (
                    <textarea
                      ref={textareaRef}
                      value={typed}
                      onChange={handleTyping}
                      autoFocus
                      rows={1}
                      className="absolute inset-0 w-full h-full opacity-0 resize-none cursor-text"
                    />
                  )}
                </div>

                {/* 완료 메시지 */}
                {isDone && (
                  <div className="flex items-center gap-3 bg-blue-1 border border-blue-3 rounded-2xl px-6 py-4 mt-8">
                    <svg className="w-5 h-5 text-blue-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-body-3 text-blue-8 font-semibold">정확히 완료했습니다!</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTyped(""); setIsCorrect(null); textareaRef.current?.focus(); }}
                      className="ml-auto text-body-4 text-blue-7 underline hover:no-underline"
                    >
                      다시 쓰기
                    </button>
                  </div>
                )}
              </div>

              {/* 하단 오늘 쓴 절수 */}
              <div className="border-t border-bluegrey-2 h-20 flex items-center px-10 bg-white">
                <p className="text-body-4 text-grey-8 font-medium">오늘 쓴 절 수 : {completedVerses.length}절</p>
              </div>
            </div>
          );
        })()}

        {activeMenu === "랭킹" && <RankingView />}
        {activeMenu === "내 구절" && <MyVersesView completed={completedVerses} />}
        {activeMenu === "내 현황" && <MyStatusView />}
      </div>

      {bookModalOpen && (
        <BookModal
          current={selectedBook}
          onSelect={(abbr) => { setSelectedBook(abbr); setBookModalOpen(false); }}
          onClose={() => setBookModalOpen(false)}
        />
      )}
    </div>
  );
}
