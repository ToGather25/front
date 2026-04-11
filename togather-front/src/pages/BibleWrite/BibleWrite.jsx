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

export default function BibleWrite() {
  const [activeMenu, setActiveMenu] = useState("성경쓰기");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState("창");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [typed, setTyped] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);

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
    setTyped(val);
    if (val.length === 0) { setIsCorrect(null); return; }
    const correct = targetText.startsWith(val);
    if (val === targetText) setIsCorrect(true);
    else setIsCorrect(correct ? null : false);
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
              {menu}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-bluegrey-2 flex gap-2">
          <Link to="/말씀/읽기" className="flex-1 py-2 bg-grey-3 rounded-lg text-body-5 text-grey-7 text-center hover:bg-grey-4 transition-colors">
            성경읽기
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-bluegrey-2 bg-white flex-wrap">
          {/* 책 선택 */}
          <button
            onClick={() => setBookModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 hover:border-blue-7 min-w-[96px]"
          >
            {BOOK_MAP[selectedBook]}
            <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 장 선택 */}
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(Number(e.target.value))}
            className="px-3 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 hover:border-blue-7 outline-none"
          >
            {chapters.map((c) => (
              <option key={c} value={c}>{c}장</option>
            ))}
          </select>

          {/* 절 선택 */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6 max-w-2xl w-full mx-auto">
          {/* 원문 */}
          <div className="bg-grey-1 rounded-2xl p-6">
            <p className="text-body-5 text-grey-5 mb-2">
              {BOOK_MAP[selectedBook]} {selectedChapter}장 {selectedVerse}절
            </p>
            <p className="text-body-2 text-grey-9 leading-relaxed">
              {targetText || "해당 구절을 찾을 수 없습니다."}
            </p>
          </div>

          {/* 입력창 */}
          <div className={`border-2 rounded-2xl p-6 transition-colors ${
            isCorrect === true ? "border-green-400 bg-green-50" :
            isCorrect === false ? "border-red-300 bg-red-50" :
            "border-bluegrey-2"
          }`}>
            <p className="text-body-5 text-grey-5 mb-3">위 구절을 그대로 입력하세요</p>
            <textarea
              ref={textareaRef}
              value={typed}
              onChange={handleTyping}
              rows={5}
              className="w-full outline-none text-body-2 text-grey-9 leading-relaxed resize-none bg-transparent placeholder:text-grey-4"
              placeholder="여기에 성경 구절을 입력하세요..."
            />
            {isCorrect === true && (
              <p className="text-body-5 text-green-600 font-semibold mt-2">✓ 정확히 입력했습니다!</p>
            )}
            {isCorrect === false && (
              <p className="text-body-5 text-red-500 mt-2">입력이 일치하지 않습니다.</p>
            )}
          </div>

          {/* 진행 바 */}
          <div>
            <div className="flex justify-between text-body-5 text-grey-6 mb-1">
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
