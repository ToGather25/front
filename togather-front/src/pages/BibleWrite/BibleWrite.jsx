import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
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
              <p className="text-body-2 text-grey-9 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 내 현황 ─────────────────────────────────────────────
function MyStatusView({ completed }) {
  const count = completed.length;
  const stats = [
    { label: "필사한 구절", value: `${count}개`, icon: "✍️" },
    { label: "연속 필사", value: "3일", icon: "🔥" },
    { label: "이번 주 필사", value: "14구절", icon: "📝" },
    { label: "누적 글자 수", value: `${completed.reduce((s, v) => s + v.text.length, 0).toLocaleString()}자`, icon: "📊" },
  ];
  const progress = [
    { book: "창세기", total: 50, done: 8 },
    { book: "시편", total: 150, done: 3 },
    { book: "요한복음", total: 21, done: 21 },
    { book: "로마서", total: 16, done: 5 },
  ];
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl w-full mx-auto">
      <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">내 현황</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-bluegrey-2 rounded-2xl p-5">
            <p className="text-body-5 text-grey-5 mb-1">{icon} {label}</p>
            <p className="text-sub-tit-3 font-bold text-grey-11">{value}</p>
          </div>
        ))}
      </div>
      <h3 className="text-body-3 font-semibold text-grey-9 mb-3">성경별 진행률</h3>
      <div className="flex flex-col gap-4">
        {progress.map(({ book, total, done }) => {
          const pct = Math.round((done / total) * 100);
          return (
            <div key={book}>
              <div className="flex justify-between text-body-4 text-grey-8 mb-1">
                <span>{book}</span>
                <span className="text-grey-5">{done}/{total}장 ({pct}%)</span>
              </div>
              <div className="h-2 bg-grey-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-6 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
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
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-56 bg-grey-1 border-r border-bluegrey-2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-bluegrey-2">
          <div className="w-10 h-10 bg-grey-3 rounded-lg" />
          <button className="text-grey-6 hover:text-grey-9">✕</button>
        </div>
        <nav className="flex flex-col py-2">
          {BIBLE_WRITE_SIDEBAR_MENUS.map((menu) => (
            <button
              key={menu}
              onClick={() => setActiveMenu(menu)}
              className={`flex items-center gap-3 px-4 py-3 text-body-3 transition-colors ${
                activeMenu === menu
                  ? "bg-grey-3 text-grey-11 font-semibold"
                  : "text-grey-8 hover:bg-bluegrey-1"
              }`}
            >
              {MENU_ICON[menu]}
              {menu}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-bluegrey-2">
          <Link to="/말씀/읽기" className="block py-2 bg-grey-3 rounded-lg text-body-5 text-grey-7 text-center hover:bg-grey-4 transition-colors">
            성경읽기
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — 성경쓰기 메뉴에서만 표시 */}
        {activeMenu === "성경쓰기" && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-bluegrey-2 bg-white flex-wrap">
            <button
              onClick={() => setBookModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 hover:border-blue-7 min-w-[96px]"
            >
              {BOOK_MAP[selectedBook]}
              <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="px-3 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 hover:border-blue-7 outline-none"
            >
              {chapters.map((c) => (
                <option key={c} value={c}>{c}장</option>
              ))}
            </select>
            <select
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(Number(e.target.value))}
              className="px-3 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 hover:border-blue-7 outline-none"
            >
              {verses.map(({ verse }) => (
                <option key={verse} value={verse}>{verse}절</option>
              ))}
            </select>
          </div>
        )}

        {/* 콘텐츠 분기 */}
        {activeMenu === "성경쓰기" && (
          <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-8 max-w-2xl w-full mx-auto">
            <p className="text-body-4 text-grey-5">
              {BOOK_MAP[selectedBook]} {selectedChapter}장 {selectedVerse}절
            </p>

            {/* 오버레이 타이핑 영역 */}
            <div
              className="relative cursor-text"
              onClick={() => !isDone && textareaRef.current?.focus()}
            >
              <div className="text-body-1 leading-loose whitespace-pre-wrap tracking-wide select-none">
                {targetText.split("").map((char, i) => {
                  if (i < typed.length) {
                    const correct = typed[i] === char;
                    return (
                      <span key={i} className={correct ? "text-grey-9" : "text-red-500"}>
                        {typed[i]}
                      </span>
                    );
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
              <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-2xl px-6 py-4">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-body-3 text-green-700 font-semibold">정확히 완료했습니다!</p>
                <button
                  onClick={() => { setTyped(""); setIsCorrect(null); textareaRef.current?.focus(); }}
                  className="ml-auto text-body-4 text-green-700 underline hover:no-underline"
                >
                  다시 쓰기
                </button>
              </div>
            )}

            {/* 진행 바 */}
            <div>
              <div className="flex justify-between text-body-5 text-grey-6 mb-2">
                <span>{typed.length} / {targetText.length} 자</span>
                <span>{targetText.length > 0 ? Math.round((typed.length / targetText.length) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-grey-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-7 rounded-full transition-all"
                  style={{ width: `${targetText.length > 0 ? Math.min((typed.length / targetText.length) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {activeMenu === "랭킹" && <RankingView />}
        {activeMenu === "내 구절" && <MyVersesView completed={completedVerses} />}
        {activeMenu === "내 현황" && <MyStatusView completed={completedVerses} />}
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
