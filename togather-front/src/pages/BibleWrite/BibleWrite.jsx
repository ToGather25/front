import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import bibleData from "@/data/bible.json";
import { BOOK_MAP, OT, NT, BIBLE_WRITE_SIDEBAR_MENUS } from "@/config/bible.config";
import BibleRankingView from "@/components/bible/BibleRankingView";
import BibleVersesView from "@/components/bible/BibleVersesView";
import BibleStatusView from "@/components/bible/BibleStatusView";

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

// ── 랭킹 데이터 ─────────────────────────────────────────
const MY_WRITE_RANK = { rank: 6, name: "나", count: 93, trend: 0 };
const WRITE_NEIGHBORS = [
  { rank: 7, name: "강민서", count: 71, trend: -1 },
  MY_WRITE_RANK,
  { rank: 5, name: "최유진", count: 154, trend: 1 },
];
const WRITE_MONTHLY = [
  { rank: 1, name: "박지호", count: 312 },
  { rank: 2, name: "김민준", count: 278 },
  { rank: 3, name: "이서연", count: 241 },
  { rank: 4, name: "정도현", count: 189 },
  { rank: 5, name: "최유진", count: 154 },
  { rank: 6, name: "나", count: 93 },
  { rank: 7, name: "강민서", count: 71 },
];
const WRITE_TOTAL = [
  { rank: 1, name: "박지호", count: 2841 },
  { rank: 2, name: "이서연", count: 2234 },
  { rank: 3, name: "김민준", count: 1987 },
  { rank: 4, name: "정도현", count: 1542 },
  { rank: 5, name: "최유진", count: 1103 },
  { rank: 6, name: "나", count: 934 },
  { rank: 7, name: "강민서", count: 712 },
];

// ── 내 현황 데이터 ───────────────────────────────────────
const BOOK_PROGRESS_WRITE = {
  창: 100, 출: 100, 레: 73, 민: 100, 신: 73, 수: 17, 삿: 21, 룻: 0,
  삼상: 0, 삼하: 0, 왕상: 0, 왕하: 0, 대상: 0, 대하: 0, 스: 0, 느: 0, 에: 0,
  욥: 0, 시: 32, 잠: 0, 전: 0, 아: 0, 사: 0, 렘: 0, 애: 0, 겔: 0, 단: 0,
  호: 0, 욜: 0, 암: 0, 옵: 0, 욘: 0, 미: 0, 나: 0, 합: 0, 습: 0, 학: 0, 슥: 0, 말: 0,
  마: 45, 막: 0, 눅: 0, 요: 100, 행: 0, 롬: 60, 고전: 0, 고후: 0, 갈: 100, 엡: 100,
  빌: 0, 골: 0, 살전: 0, 살후: 0, 딤전: 0, 딤후: 0, 딛: 0, 몬: 0, 히: 0,
  약: 0, 벧전: 0, 벧후: 0, 요일: 0, 요이: 0, 요삼: 0, 유: 0, 계: 0,
};

const WRITE_STATUS_CONFIG = {
  sectionTitle: "필사 전체 현황",
  totalLabel: "작성한 구절 수 총합",
  totalValue: "240,021 절",
  visitCount: "320 일",
  completeCount: "1번",
  streakDays: 7,
  streakLabel: "연속 필사중!",
  monthCount: "8일",
  monthCountLabel: "이번달 필사 횟수",
  monthVerse: "360절",
  monthVerseLabel: "이번달 필사 구절수",
  bookStatusTitle: "필사 현황",
};

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
                        { key: "small", label: "작게", gaSize: "text-caption" },
                        { key: "medium", label: "보통", gaSize: "text-body-1" },
                        { key: "large", label: "크게", gaSize: "text-sub-tit-2" },
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

        {activeMenu === "랭킹" && (
          <BibleRankingView
            neighbors={WRITE_NEIGHBORS}
            monthly={WRITE_MONTHLY}
            total={WRITE_TOTAL}
            unit="구절"
          />
        )}
        {activeMenu === "내 구절" && (
          <BibleVersesView
            mode="write"
            items={completedVerses}
          />
        )}
        {activeMenu === "내 현황" && (
          <BibleStatusView bookProgress={BOOK_PROGRESS_WRITE} config={WRITE_STATUS_CONFIG} />
        )}
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
