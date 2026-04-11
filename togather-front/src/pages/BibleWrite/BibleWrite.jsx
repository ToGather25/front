import { useState } from "react";
import { Link } from "react-router";

const BOOKS = ["창세기", "출애굽기", "시편", "잠언", "마태복음", "요한복음", "로마서"];
const SIDEBAR_MENUS = ["성경쓰기", "랭킹", "내 구절", "내 현황"];

const REFERENCE_VERSE = "너희 의인들아 여호와를 즐거워하라 찬송은 정직한 자의 마땅히 할바로다";

export default function BibleWrite() {
  const [activeMenu, setActiveMenu] = useState("성경쓰기");
  const [selectedBook, setSelectedBook] = useState("시편");
  const [chapter, setChapter] = useState(33);
  const [input, setInput] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [verseCount] = useState(34);

  const correctCount = input.length;
  const isCorrect = REFERENCE_VERSE.startsWith(input);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-56 bg-grey-1 border-r border-bluegrey-2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-bluegrey-2">
          <div className="w-10 h-10 bg-grey-3 rounded-lg" />
          <button className="text-grey-6 hover:text-grey-9">✕</button>
        </div>
        <nav className="flex flex-col py-2">
          {SIDEBAR_MENUS.map((menu) => (
            <button
              key={menu}
              onClick={() => setActiveMenu(menu)}
              className={`flex items-center gap-3 px-4 py-3 text-body-3 transition-colors ${
                activeMenu === menu
                  ? "bg-grey-3 text-grey-11 font-semibold"
                  : "text-grey-8 hover:bg-bluegrey-1"
              }`}
            >
              {menu === "성경쓰기" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
        <div className="mt-auto p-4 border-t border-bluegrey-2">
          <Link to="/말씀/읽기" className="block w-full py-2 bg-grey-3 rounded-lg text-body-5 text-grey-7 text-center hover:bg-grey-4 transition-colors">
            성경읽기
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-bluegrey-2 bg-white">
          <button className="text-body-3 text-grey-7 font-semibold px-2 hover:text-grey-11">가가</button>
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
                {BOOKS.map((book) => (
                  <button
                    key={book}
                    onClick={() => { setSelectedBook(book); setBookOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-body-4 hover:bg-bluegrey-1 ${selectedBook === book ? "text-blue-7 font-semibold" : "text-grey-8"}`}
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg">
            <button onClick={() => setChapter((c) => Math.max(1, c - 1))} className="text-grey-6 hover:text-grey-9">‹</button>
            <span className="text-body-4 text-grey-8 w-6 text-center">{chapter}</span>
            <button onClick={() => setChapter((c) => c + 1)} className="text-grey-6 hover:text-grey-9">›</button>
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg">
            <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5" placeholder="검색할 내용을 입력하세요" />
          </div>
        </div>

        {/* Writing Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-sub-tit-4 font-semibold text-grey-11">
              {selectedBook} {chapter}편 1절
            </h2>
            <button className="text-grey-5 hover:text-red-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </button>
          </div>
          <hr className="border-bluegrey-2 mb-6" />

          {/* Input line */}
          <div className="relative mb-8">
            <div className="text-body-1 text-grey-9 leading-relaxed relative">
              {/* User typed text */}
              <span className={isCorrect ? "text-grey-11" : "text-red-500"}>
                {input}
              </span>
              {/* Cursor */}
              <span className="border-r-2 border-grey-8 animate-pulse">&nbsp;</span>
              {/* Ghost text */}
              <span className="text-grey-4">
                {REFERENCE_VERSE.slice(input.length)}
              </span>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-text"
              autoFocus
            />
          </div>
          <hr className="border-grey-3" />

          <div className="mt-4 text-body-4 text-grey-7">
            오늘 쓴 절수 : {verseCount}절
          </div>
        </div>
      </div>
    </div>
  );
}
