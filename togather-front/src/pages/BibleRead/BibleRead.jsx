import { useState } from "react";
import { Link } from "react-router";
import bibleData from "@/data/bible.json";
import { READ_BOOKS, BOOK_ABBREV, BIBLE_READ_SIDEBAR_MENUS } from "@/config/bible.config";

function getVerses(book, chapter) {
  const abbrev = BOOK_ABBREV[book];
  if (!abbrev) return [];
  const prefix = `${abbrev}${chapter}:`;
  return Object.entries(bibleData)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, text]) => ({ num: parseInt(key.split(":")[1]), text: text.trim() }))
    .sort((a, b) => a.num - b.num);
}

// ── 랭킹 ───────────────────────────────────────────────
const MOCK_RANKING = [
  { rank: 1, name: "김민준", count: 245 },
  { rank: 2, name: "이서연", count: 198 },
  { rank: 3, name: "박지호", count: 176 },
  { rank: 4, name: "최유진", count: 134 },
  { rank: 5, name: "정도현", count: 112 },
  { rank: 6, name: "나", count: 87, isMe: true },
  { rank: 7, name: "강민서", count: 65 },
  { rank: 8, name: "오준혁", count: 43 },
  { rank: 9, name: "한지수", count: 31 },
  { rank: 10, name: "임채원", count: 22 },
];

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RankingView() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-xl w-full mx-auto">
      <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">성경 읽기 랭킹</h2>
      <div className="flex flex-col gap-2">
        {MOCK_RANKING.map(({ rank, name, count, isMe }) => (
          <div
            key={rank}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
              isMe
                ? "bg-blue-1 border-blue-3"
                : "bg-white border-bluegrey-2"
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
function MyVersesView({ saved }) {
  const list = Object.values(saved);
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl w-full mx-auto">
      <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-2">내 구절</h2>
      <p className="text-body-4 text-grey-5 mb-6">총 {list.length}개의 구절을 저장했습니다.</p>
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="w-12 h-12 text-grey-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-body-3 text-grey-6">저장된 구절이 없습니다.</p>
          <p className="text-body-4 text-grey-4 mt-1">성경 읽기에서 ♥를 눌러 구절을 저장하세요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((v) => (
            <div key={v.key} className="bg-white border border-bluegrey-2 rounded-2xl px-6 py-5">
              <p className="text-body-5 text-blue-6 font-semibold mb-2">
                {v.book} {v.chapter}장 {v.num}절
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
function MyStatusView({ saved }) {
  const count = Object.values(saved).length;
  const stats = [
    { label: "저장한 구절", value: `${count}개`, icon: "♥" },
    { label: "연속 읽기", value: "5일", icon: "🔥" },
    { label: "이번 주 읽은 장", value: "12장", icon: "📖" },
    { label: "올해 읽은 구절", value: "342개", icon: "📊" },
  ];
  const progress = [
    { book: "창세기", total: 50, done: 12 },
    { book: "출애굽기", total: 40, done: 5 },
    { book: "마태복음", total: 28, done: 28 },
    { book: "요한복음", total: 21, done: 8 },
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
  "성경읽기": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  "랭킹": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  "내 구절": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  "내 현황": <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export default function BibleRead() {
  const [activeMenu, setActiveMenu] = useState("성경읽기");
  const [selectedBook, setSelectedBook] = useState("창세기");
  const [chapter, setChapter] = useState(1);
  const [checkedVerses, setCheckedVerses] = useState({});
  const [savedVerses, setSavedVerses] = useState({});
  const [bookOpen, setBookOpen] = useState(false);
  const [fontSize, setFontSize] = useState(false);

  const verses = getVerses(selectedBook, chapter);

  const toggleVerse = (idx) =>
    setCheckedVerses((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const toggleSave = (verse) => {
    const key = `${selectedBook}-${chapter}-${verse.num}`;
    setSavedVerses((prev) => {
      if (prev[key]) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { key, book: selectedBook, chapter, num: verse.num, text: verse.text } };
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-56 bg-grey-1 border-r border-bluegrey-2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-bluegrey-2">
          <div className="w-10 h-10 bg-grey-3 rounded-lg" />
          <button className="text-grey-6 hover:text-grey-9">✕</button>
        </div>
        <nav className="flex flex-col py-2">
          {BIBLE_READ_SIDEBAR_MENUS.map((menu) => (
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
          <Link to="/말씀/필사" className="block py-2 bg-grey-3 rounded-lg text-body-5 text-grey-7 text-center hover:bg-grey-4 transition-colors">
            성경쓰기
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — 성경읽기 메뉴에서만 표시 */}
        {activeMenu === "성경읽기" && (
          <div className="flex items-center gap-4 px-6 py-3 border-b border-bluegrey-2 bg-white">
            <button
              onClick={() => setFontSize(!fontSize)}
              className="text-body-3 text-grey-7 font-semibold px-2 hover:text-grey-11"
            >
              가가
            </button>
            <div className="w-px h-5 bg-grey-4" />
            <div className="relative">
              <button
                onClick={() => setBookOpen(!bookOpen)}
                className="flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 hover:border-blue-7"
              >
                {selectedBook}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {bookOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-bluegrey-2 rounded-xl shadow-lg py-2 z-10 max-h-60 overflow-y-auto w-32">
                  {READ_BOOKS.map((book) => (
                    <button
                      key={book}
                      onClick={() => { setSelectedBook(book); setChapter(1); setCheckedVerses({}); setBookOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-body-4 hover:bg-bluegrey-1 ${selectedBook === book ? "text-blue-7 font-semibold" : "text-grey-8"}`}
                    >
                      {book}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg">
              <button onClick={() => { setChapter((c) => Math.max(1, c - 1)); setCheckedVerses({}); }} className="text-grey-6 hover:text-grey-9">‹</button>
              <span className="text-body-4 text-grey-8 w-6 text-center">{chapter}</span>
              <button onClick={() => { setChapter((c) => c + 1); setCheckedVerses({}); }} className="text-grey-6 hover:text-grey-9">›</button>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg">
              <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5" placeholder="검색할 내용을 입력하세요" />
            </div>
          </div>
        )}

        {/* 콘텐츠 분기 */}
        {activeMenu === "성경읽기" && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-1">
              {verses.map(({ num, text }, idx) => {
                const saveKey = `${selectedBook}-${chapter}-${num}`;
                const isSaved = !!savedVerses[saveKey];
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-grey-1 transition-colors ${
                      checkedVerses[idx] ? "bg-blue-1" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedVerses[idx]}
                      onChange={() => toggleVerse(idx)}
                      className="mt-1 shrink-0 accent-primary"
                    />
                    <span
                      className={`flex-1 ${
                        fontSize ? "text-body-1" : "text-body-2"
                      } ${checkedVerses[idx] ? "text-blue-7" : "text-grey-9"}`}
                    >
                      {num} {text}
                    </span>
                    {checkedVerses[idx] && (
                      <button
                        onClick={(e) => { e.preventDefault(); toggleSave({ num, text }); }}
                        className="ml-auto shrink-0 transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-colors ${isSaved ? "text-red-400 fill-red-400" : "text-grey-4 hover:text-red-300"}`}
                          fill={isSaved ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {activeMenu === "랭킹" && <RankingView />}
        {activeMenu === "내 구절" && <MyVersesView saved={savedVerses} />}
        {activeMenu === "내 현황" && <MyStatusView saved={savedVerses} />}
      </div>
    </div>
  );
}
