import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router";
import bibleData from "@/data/bible.json";
import BibleSidebar from "@/components/bible/BibleSidebar";
import { BOOK_MAP, OT, NT, BIBLE_WRITE_SIDEBAR_MENUS } from "@/config/bible.config";
import BibleRankingView from "@/components/bible/BibleRankingView";
import BibleVersesView from "@/components/bible/BibleVersesView";
import BibleStatusView from "@/components/bible/BibleStatusView";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

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
  const { state } = useLocation();
  const [activeMenu, setActiveMenu] = useState("성경쓰기");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(state?.book ?? "창");
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

  useEffect(() => {
    if (state?.book) {
      setSelectedBook(state.book);
      setActiveMenu("성경쓰기");
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  }, [state]);

  const chapters = useMemo(() => getChapters(selectedBook), [selectedBook]);
  const verses = useMemo(() => getVerses(selectedBook, selectedChapter), [selectedBook, selectedChapter]);
  const currentVerse = verses.find((v) => v.verse === selectedVerse);
  const targetText = currentVerse?.text ?? "";

  const currentVerseIdx = verses.findIndex((v) => v.verse === selectedVerse);
  const prevVerses = verses.slice(Math.max(0, currentVerseIdx - 3), currentVerseIdx);
  const nextVerses = verses.slice(currentVerseIdx + 1, currentVerseIdx + 6);
  const nextVerse = nextVerses[0] ?? null;
  const isLastVerse = currentVerseIdx === verses.length - 1;

  const goNextChapter = () => {
    const nextChapterIdx = chapters.indexOf(selectedChapter) + 1;
    if (nextChapterIdx < chapters.length) {
      setSelectedChapter(chapters[nextChapterIdx]);
    } else {
      const allBooks = [...OT, ...NT];
      const nextBookIdx = allBooks.indexOf(selectedBook) + 1;
      if (nextBookIdx < allBooks.length) setSelectedBook(allBooks[nextBookIdx]);
    }
  };

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

  useEffect(() => {
    if (isCorrect !== true || isLastVerse) return;
    const t = setTimeout(() => {
      setSelectedVerse(nextVerse.verse);
    }, 700);
    return () => clearTimeout(t);
  }, [isCorrect, isLastVerse, nextVerse]);

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
      {/* 공통 사이드바 */}
      <BibleSidebar
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        menus={BIBLE_WRITE_SIDEBAR_MENUS}
        menuIcons={MENU_ICON}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        switchTo={{ to: "/말씀/읽기", label: "성경읽기로 전환" }}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — 성경쓰기 메뉴에서만 표시 */}
        {activeMenu === "성경쓰기" && (
          <div className="h-[60px] shrink-0 flex items-center gap-3 px-6 border-b border-bluegrey-2 bg-white">
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
              <img src={IcoSearch} className="w-4 h-4 shrink-0" alt="" />
              <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5 bg-transparent" placeholder="검색할 내용을 입력하세요." />
            </div>
          </div>
        )}

        {/* 콘텐츠 분기 */}
        {activeMenu === "성경쓰기" && (() => {
          const fontSizeClass = fontSize === "large" ? "text-[22px]" : fontSize === "small" ? "text-body-2" : "text-body-1";
          const chapterDone = completedVerses.filter(v => v.bookAbbr === selectedBook && v.chapter === selectedChapter).length;
          const chapterProgress = verses.length > 0 ? (chapterDone / verses.length) * 100 : 0;
          return (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <style>{`
                @keyframes verseSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
              `}</style>

              {/* 장 전체 진행률 바 */}
              <div className="shrink-0 px-10 pt-4 pb-2 flex items-center gap-3">
                <div className="flex-1 relative h-1.5 bg-grey-2 rounded-full">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${chapterProgress}%` }}
                  />
                </div>
                <span className="text-caption text-grey-5 shrink-0">{chapterDone} / {verses.length}절</span>
              </div>

              {/* 이전 절들 */}
              <div className="flex-[1] relative flex flex-col justify-end pb-6 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
                <div className="flex flex-col gap-4 px-16">
                  {prevVerses.map((v, i) => {
                    const opacity = 0.2 + (i / Math.max(prevVerses.length, 1)) * 0.45;
                    return (
                      <div key={v.verse} className="flex items-start gap-3 select-none" style={{ opacity }}>
                        <svg className="w-3.5 h-3.5 text-blue-4 shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                        <p className="text-body-4 text-grey-6 leading-relaxed line-clamp-2">
                          <span className="text-grey-4 text-caption mr-1">{v.verse}</span>{v.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 구분선 */}
              <div className="shrink-0 mx-16 h-px bg-grey-2" />

              {/* 현재 절 */}
              <div
                key={`${selectedChapter}-${selectedVerse}`}
                className="shrink-0 px-16 py-10 cursor-text"
                style={{ animation: "verseSlideUp 0.35s ease-out both" }}
                onClick={() => !isDone && textareaRef.current?.focus()}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-caption font-semibold text-primary tracking-wide">
                    {BOOK_MAP[selectedBook]} {selectedChapter}{BOOK_MAP[selectedBook] === "시편" ? "편" : "장"} {selectedVerse}절
                  </span>
                  {isDone && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-grey-3 inline-block" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setTyped(""); setIsCorrect(null); textareaRef.current?.focus(); }}
                        className="text-caption text-grey-4 hover:text-grey-7 transition-colors"
                      >
                        다시 쓰기
                      </button>
                    </>
                  )}
                </div>

                <div className="relative">
                  <div className={`${fontSizeClass} whitespace-pre-wrap tracking-wide select-none leading-relaxed`}>
                    {targetText.split("").map((char, i) => {
                      if (i < typed.length) {
                        return <span key={i} className={typed[i] === char ? "text-grey-11" : "text-red-400"}>{typed[i]}</span>;
                      }
                      if (i === typed.length && !isDone) {
                        return (
                          <span key={i} className="relative">
                            <span className="absolute -left-px top-0 bottom-0 w-0.5 bg-primary animate-pulse" />
                            <span className="text-grey-3">{char}</span>
                          </span>
                        );
                      }
                      return <span key={i} className={isDone ? "text-grey-11" : "text-grey-3"}>{char}</span>;
                    })}
                  </div>
                  {!isDone && (
                    <textarea
                      ref={textareaRef}
                      value={typed}
                      onChange={handleTyping}
                      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                      autoFocus
                      rows={1}
                      className="absolute inset-0 w-full h-full opacity-0 resize-none cursor-text"
                    />
                  )}
                </div>
              </div>

              {/* 구분선 */}
              <div className="shrink-0 mx-16 h-px bg-grey-2" />

              {/* 다음 절들 */}
              <div className="flex-[2] relative flex flex-col justify-start pt-6 overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
                <div className="flex flex-col gap-4 px-16">
                  {nextVerses.map((v, i) => {
                    const opacity = 0.5 - (i / Math.max(nextVerses.length, 1)) * 0.35;
                    return (
                      <p key={v.verse} className="text-body-4 text-grey-5 leading-relaxed line-clamp-2 select-none" style={{ opacity }}>
                        <span className="text-grey-3 text-caption mr-1.5">{v.verse}</span>{v.text}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* 하단 바 */}
              <div className="shrink-0 border-t border-bluegrey-2 h-20 flex items-center px-10 bg-white">
                <p className="text-body-4 text-grey-8 font-medium">오늘 쓴 절 수 : {completedVerses.length}절</p>
              </div>

              {/* 다음 장으로 버튼 */}
              {isDone && isLastVerse && (
                <button
                  onClick={goNextChapter}
                  className="absolute bottom-20 right-8 flex items-center gap-2 px-5 py-3 bg-primary text-white text-body-3 font-semibold rounded-2xl shadow-lg hover:bg-blue-8 transition-colors"
                >
                  다음 장으로
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
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
          <BibleStatusView bookProgress={BOOK_PROGRESS_WRITE} config={WRITE_STATUS_CONFIG} mode="write" />
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
