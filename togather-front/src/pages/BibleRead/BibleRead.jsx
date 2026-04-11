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

export default function BibleRead() {
  const [activeMenu, setActiveMenu] = useState("성경읽기");
  const [selectedBook, setSelectedBook] = useState("창세기");
  const [chapter, setChapter] = useState(1);
  const [checkedVerses, setCheckedVerses] = useState({});
  const [bookOpen, setBookOpen] = useState(false);
  const [fontSize, setFontSize] = useState(false);

  const verses = getVerses(selectedBook, chapter);

  const toggleVerse = (idx) =>
    setCheckedVerses((prev) => ({ ...prev, [idx]: !prev[idx] }));

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
              {menu === "성경읽기" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              )}
              {menu === "랭킹" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
              {menu === "내 구절" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              )}
              {menu === "내 현황" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
              {menu}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-bluegrey-2 flex gap-2">
          <Link to="/말씀/필사" className="flex-1 py-2 bg-grey-3 rounded-lg text-body-5 text-grey-7 text-center hover:bg-grey-4 transition-colors">
            성경쓰기
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
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

        {/* Verses */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-1">
            {verses.map(({ num, text }, idx) => (
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
                  className={`text-body-2 leading-relaxed ${
                    checkedVerses[idx] ? "text-blue-7" : "text-grey-9"
                  }`}
                  style={fontSize ? { fontSize: "1.125rem" } : {}}
                >
                  {num} {text}
                </span>
                {checkedVerses[idx] && (
                  <button className="ml-auto shrink-0 text-grey-5 hover:text-blue-7">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </button>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
