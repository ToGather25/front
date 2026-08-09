import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import BibleTutorial from "@/components/bible/BibleTutorial";
import { saveLastPosition } from "@/utils/bibleReadingProgress";
import bibleData from "@/data/bible.json";
import BibleSidebar from "@/components/bible/BibleSidebar";
import { BOOK_MAP, BOOK_ABBREV, OT, NT, BIBLE_READ_SIDEBAR_MENUS } from "@/config/bible.config";
import BibleRankingView from "@/components/bible/BibleRankingView";
import BibleVersesView from "@/components/bible/BibleVersesView";
import BibleStatusView from "@/components/bible/BibleStatusView";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

// 성경 전체 검색 (키워드 → [{book, chapter, num, text}])
function searchBible(query) {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return Object.entries(bibleData)
    .filter(([, text]) => text.toLowerCase().includes(q))
    .slice(0, 30)
    .map(([key, text]) => {
      const [ref, num] = key.split(":");
      const abbr = ref.replace(/\d+$/, "");
      const ch = parseInt(ref.replace(abbr, ""));
      return {
        abbr,
        book: BOOK_MAP[abbr] ?? abbr,
        chapter: ch,
        num: parseInt(num),
        text: text.trim(),
      };
    });
}

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-grey-11 rounded-sm px-px">
        {p}
      </mark>
    ) : (
      p
    ),
  );
}

function getVerses(book, chapter) {
  const abbrev = BOOK_ABBREV[book];
  if (!abbrev) return [];
  const prefix = `${abbrev}${chapter}:`;
  return Object.entries(bibleData)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, text]) => ({ num: parseInt(key.split(":")[1]), text: text.trim() }))
    .sort((a, b) => a.num - b.num);
}

function getChapters(bookFullName) {
  const abbr = BOOK_ABBREV[bookFullName];
  if (!abbr) return [];
  const re = new RegExp(`^${abbr}(\\d+):\\d+$`);
  const set = new Set();
  for (const key of Object.keys(bibleData)) {
    const m = key.match(re);
    if (m) set.add(Number(m[1]));
  }
  return [...set].sort((a, b) => a - b);
}

// ── 랭킹 데이터 ─────────────────────────────────────────
const MY_RANK = { rank: 22, name: "나", count: 20511, trend: 0 };
const READ_NEIGHBORS = [
  { rank: MY_RANK.rank + 1, name: "임예원", count: 14408, trend: -1 },
  MY_RANK,
  { rank: MY_RANK.rank - 1, name: "임예빈", count: 21511, trend: 1 },
];
const READ_MONTHLY = [];
const READ_TOTAL = [
  { rank: 1, name: "요한", count: 12345566, trend: 0 },
  { rank: 2, name: "베드로", count: 12344433, trend: 1 },
  { rank: 3, name: "김미정", count: 3342343, trend: -1 },
  { rank: 4, name: "김수빈", count: 5638383, trend: 2 },
  { rank: 5, name: "이미자", count: 234324, trend: 0 },
  { rank: 6, name: "박은진", count: 123455, trend: -2 },
  { rank: 7, name: "미수리", count: 122222, trend: 1 },
  { rank: 8, name: "정다은", count: 98000, trend: 3 },
  { rank: 9, name: "최성훈", count: 87650, trend: -1 },
  { rank: 10, name: "윤지현", count: 76500, trend: 0 },
  { rank: 11, name: "한승민", count: 65430, trend: 2 },
  { rank: 12, name: "오수연", count: 54320, trend: -3 },
  { rank: 13, name: "장민준", count: 43210, trend: 1 },
  { rank: 14, name: "신예린", count: 32100, trend: 0 },
  { rank: 15, name: "임태양", count: 21000, trend: -1 },
  { rank: 16, name: "강지우", count: 18900, trend: 4 },
  { rank: 17, name: "조현아", count: 15600, trend: -2 },
  { rank: 18, name: "배준서", count: 12300, trend: 0 },
  { rank: 19, name: "서은채", count: 9800, trend: 1 },
  { rank: 20, name: "문도현", count: 7600, trend: -1 },
];

// ── 내 구절 목업 ─────────────────────────────────────────
const MOCK_SAVED_VERSES = [
  {
    key: "로마서-8-28",
    book: "로마서",
    chapter: 8,
    num: 28,
    text: "우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
  },
  {
    key: "마가복음-12-29",
    book: "마가복음",
    chapter: 12,
    num: "29~31",
    text: "예수께서 대답하시되 첫째는 이것이니 이스라엘아 들으라 주 곧 우리 하나님은 유일한 주시라 네 마음을 다하고 목숨을 다하고 뜻을 다하고 힘을 다하여 주 너의 하나님을 사랑하라 하신 것이요 둘째는 이것이니 네 이웃을 네 몸과 같이 사랑하라 하신 것이라 이에서 더 큰 계명이 없느니라",
  },
  {
    key: "잠언-24-5a",
    book: "잠언",
    chapter: 24,
    num: "5~6",
    text: "지혜있는 자는 강하고 지식있는 자는 힘을 더 하나니 너는 모략으로 싸우라 승리는 모사가 많음에 있느니라",
  },
  {
    key: "잠언-24-5b",
    book: "잠언",
    chapter: 24,
    num: "5~6",
    text: "지혜있는 자는 강하고 지식있는 자는 힘을 더하나니 너는 모략으로 싸우라 승리는 모사가 많음에 있느니라",
  },
  {
    key: "잠언-24-5c",
    book: "잠언",
    chapter: 24,
    num: "5~6",
    text: "내 사랑하는 형제들아 들을지어다 하나님이 세상에서 가난한 자를 택하사 믿음에 부요하게 하시고 또 자기를 사랑하는 자들에게 약속하신 나라를 상속으로 받게 하지 아니하셨느냐",
  },
  {
    key: "잠언-24-5d",
    book: "잠언",
    chapter: 24,
    num: "5~6",
    text: "내 사랑하는 형제들아 들을지어다 하나님이 세상에서 가난한 자를 택하사 믿음에 부요하게 하시고 또 자기를 사랑하는 자들에게 약속하신 나라를 상속으로 받게 하지 아니하셨느냐",
  },
];

// ── 내 현황 데이터 ───────────────────────────────────────
const BOOK_PROGRESS_READ = {
  창: 100,
  출: 85,
  레: 40,
  민: 100,
  신: 60,
  수: 30,
  삿: 0,
  룻: 100,
  삼상: 0,
  삼하: 0,
  왕상: 0,
  왕하: 0,
  대상: 0,
  대하: 0,
  스: 0,
  느: 0,
  에: 0,
  욥: 0,
  시: 55,
  잠: 20,
  전: 0,
  아: 0,
  사: 0,
  렘: 0,
  애: 0,
  겔: 0,
  단: 0,
  호: 0,
  욜: 0,
  암: 0,
  옵: 0,
  욘: 100,
  미: 0,
  나: 0,
  합: 0,
  습: 0,
  학: 0,
  슥: 0,
  말: 0,
  마: 70,
  막: 100,
  눅: 0,
  요: 100,
  행: 0,
  롬: 45,
  고전: 0,
  고후: 0,
  갈: 100,
  엡: 100,
  빌: 100,
  골: 0,
  살전: 0,
  살후: 0,
  딤전: 0,
  딤후: 0,
  딛: 0,
  몬: 0,
  히: 0,
  약: 0,
  벧전: 0,
  벧후: 0,
  요일: 0,
  요이: 0,
  요삼: 0,
  유: 0,
  계: 0,
};

const READ_STATUS_CONFIG = {
  sectionTitle: "읽기 전체 현황",
  totalLabel: "읽은 구절 수 총합",
  totalValue: "128,450 절",
  visitCount: "215 일",
  completeCount: "1번",
  streakDays: 5,
  streakLabel: "연속 읽기중!",
  monthCount: "12일",
  monthCountLabel: "이번달 읽기 횟수",
  monthVerse: "248절",
  monthVerseLabel: "이번달 읽은 구절수",
  bookStatusTitle: "읽기 현황",
};

// ── 사이드바 메뉴 아이콘 ────────────────────────────────
const MENU_ICON = {
  성경읽기: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  ),
  랭킹: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  "내 구절": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  "내 현황": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
};

export default function BibleRead() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeMenu, setActiveMenu] = useState("성경읽기");
  const [selectedBook, setSelectedBook] = useState(state?.book ?? "창세기");
  const [chapter, setChapter] = useState(1);
  const [checkedVerses, setCheckedVerses] = useState({});
  const [savedVerses, setSavedVerses] = useState({});
  const [bookOpen, setBookOpen] = useState(false);
  const [bookTab, setBookTab] = useState("OT");
  const [chapterOpen, setChapterOpen] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastChapterModal, setLastChapterModal] = useState(false);
  const clickTimers = useRef({});

  useEffect(() => {
    if (state?.book) {
      setSelectedBook(state.book);
      setActiveMenu("성경읽기");
      setChapter(1);
      setCheckedVerses({});
    }
  }, [state]);

  useEffect(() => {
    if (currentUser) saveLastPosition(selectedBook, chapter);
  }, [currentUser, selectedBook, chapter]);

  const verses = getVerses(selectedBook, chapter);
  const chapters = useMemo(() => getChapters(selectedBook), [selectedBook]);

  const allChecked = verses.length > 0 && verses.every((_, idx) => !!checkedVerses[idx]);

  const toggleVerse = useCallback(
    (idx) => setCheckedVerses((prev) => ({ ...prev, [idx]: !prev[idx] })),
    [],
  );

  const toggleCheckAll = () => {
    if (allChecked) {
      setCheckedVerses({});
    } else {
      const all = {};
      verses.forEach((_, idx) => {
        all[idx] = true;
      });
      setCheckedVerses(all);
    }
  };

  const goNextChapter = () => {
    const nextIdx = chapters.indexOf(chapter) + 1;
    if (nextIdx < chapters.length) {
      setChapter(chapters[nextIdx]);
    } else {
      const allBooks = [...OT, ...NT].map((a) => BOOK_MAP[a]);
      const nextBookIdx = allBooks.indexOf(selectedBook) + 1;
      if (nextBookIdx < allBooks.length) {
        setSelectedBook(allBooks[nextBookIdx]);
        setChapter(1);
      } else {
        setLastChapterModal(true);
        return;
      }
    }
    setCheckedVerses({});
  };

  const goPrevChapter = () => {
    const prevIdx = chapters.indexOf(chapter) - 1;
    if (prevIdx >= 0) {
      setChapter(chapters[prevIdx]);
    } else {
      const allBooks = [...OT, ...NT].map((a) => BOOK_MAP[a]);
      const prevBookIdx = allBooks.indexOf(selectedBook) - 1;
      if (prevBookIdx >= 0) {
        const prevBook = allBooks[prevBookIdx];
        setSelectedBook(prevBook);
        const prevChapters = getChapters(prevBook);
        setChapter(prevChapters[prevChapters.length - 1] ?? 1);
      }
    }
    setCheckedVerses({});
  };

  const searchResults = useMemo(() => searchBible(searchQuery), [searchQuery]);

  const toggleSave = useCallback(
    (verse) => {
      const key = `${selectedBook}-${chapter}-${verse.num}`;
      setSavedVerses((prev) => {
        if (prev[key]) {
          const { [key]: _, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [key]: { key, book: selectedBook, chapter, num: verse.num, text: verse.text },
        };
      });
    },
    [selectedBook, chapter],
  );

  // 더블클릭 좋아요: 구절을 빠르게 두 번 누르면 하트 토글
  const handleVerseClick = useCallback(
    (verse, idx) => {
      if (clickTimers.current[idx]) {
        clearTimeout(clickTimers.current[idx]);
        delete clickTimers.current[idx];
        // 더블클릭
        toggleSave(verse);
      } else {
        clickTimers.current[idx] = setTimeout(() => {
          delete clickTimers.current[idx];
          // 싱글클릭
          toggleVerse(idx);
        }, 220);
      }
    },
    [toggleSave, toggleVerse],
  );

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="성경 읽기를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
    <>
      <BibleTutorial />
      <div className="flex h-screen">
        {/* 공통 사이드바 */}
        <BibleSidebar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          menus={BIBLE_READ_SIDEBAR_MENUS}
          menuIcons={MENU_ICON}
          activeMenu={activeMenu}
          onMenuChange={setActiveMenu}
          switchTo={{ to: "/말씀/필사", label: "쓰기로 전환" }}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar — 성경읽기 메뉴에서만 표시 */}
          {activeMenu === "성경읽기" && (
            <div className="h-[60px] shrink-0 flex items-center gap-3 px-6 border-b border-bluegrey-2 bg-white">
              {/* 글씨 크기 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setFontSizeOpen((v) => !v);
                    setBookOpen(false);
                    setChapterOpen(false);
                  }}
                  className="h-9 px-4 rounded-full bg-grey-2 hover:bg-grey-3 transition-colors"
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
                            onClick={() => {
                              setFontSize(key);
                              setFontSizeOpen(false);
                            }}
                            className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 transition-colors ${
                              fontSize === key
                                ? "bg-primary border-primary text-white"
                                : "bg-white border-bluegrey-2 text-grey-9 hover:border-blue-5"
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

              {/* 전체 선택 */}
              <button
                onClick={toggleCheckAll}
                className={`h-9 flex items-center gap-1.5 px-4 rounded-full text-body-4 border transition-colors ${
                  allChecked
                    ? "bg-primary border-primary text-white"
                    : "border-bluegrey-2 text-grey-7 hover:border-blue-5"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {allChecked ? "전체 해제" : "전체 선택"}
              </button>

              {/* 다음 장으로 */}
              {allChecked && (
                <button
                  onClick={goNextChapter}
                  className="h-9 flex items-center gap-1.5 px-4 rounded-full bg-blue-7 text-white text-body-4 font-medium hover:bg-blue-8 transition-colors"
                >
                  다음 장으로
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              <div className="flex-1" />

              {/* 책 선택 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setBookOpen((v) => !v);
                    setChapterOpen(false);
                    setFontSizeOpen(false);
                    setBookTab(OT.includes(BOOK_ABBREV[selectedBook]) ? "OT" : "NT");
                  }}
                  className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-4 text-grey-8 hover:border-blue-5 transition-colors"
                >
                  {selectedBook}
                </button>
                {bookOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setBookOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-2xl shadow-xl p-5 w-[500px]">
                      <div className="flex justify-end gap-2 mb-4">
                        {["OT", "NT"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setBookTab(t)}
                            className={`px-5 py-2 rounded-full text-body-4 font-medium transition-colors ${
                              bookTab === t
                                ? "bg-primary text-white"
                                : "border border-bluegrey-2 text-grey-8 hover:border-blue-5"
                            }`}
                          >
                            {t === "OT" ? "구약" : "신약"}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {(bookTab === "OT" ? OT : NT).map((abbr) => {
                          const fullName = BOOK_MAP[abbr];
                          const isSelected = selectedBook === fullName;
                          return (
                            <button
                              key={abbr}
                              onClick={() => {
                                setSelectedBook(fullName);
                                setChapter(1);
                                setCheckedVerses({});
                                setBookOpen(false);
                              }}
                              className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-colors ${
                                isSelected
                                  ? "border-primary"
                                  : "border-bluegrey-2 hover:border-blue-4"
                              }`}
                            >
                              <span className="text-body-3 font-bold text-grey-10">{abbr}</span>
                              <span className="text-[10px] text-grey-6 mt-0.5 truncate w-full text-center">
                                {fullName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 장 선택 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setChapterOpen((v) => !v);
                    setBookOpen(false);
                    setFontSizeOpen(false);
                  }}
                  className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-4 text-grey-8 hover:border-blue-5 transition-colors min-w-[52px] text-center"
                >
                  {chapter}
                  {selectedBook === "시편" ? "편" : "장"}
                </button>
                {chapterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setChapterOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-2xl shadow-xl p-4 w-48 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-5 gap-1">
                        {chapters.map((ch) => (
                          <button
                            key={ch}
                            onClick={() => {
                              setChapter(ch);
                              setCheckedVerses({});
                              setChapterOpen(false);
                            }}
                            className={`py-2 rounded-lg text-body-4 transition-colors ${
                              chapter === ch
                                ? "bg-primary text-white font-semibold"
                                : "hover:bg-grey-1 text-grey-8"
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 장 이동 < > */}
              <div className="flex items-center gap-1">
                <button
                  onClick={goPrevChapter}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-bluegrey-2 text-grey-7 hover:border-blue-5 hover:text-blue-7 transition-colors"
                  title="이전 장"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={goNextChapter}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-bluegrey-2 text-grey-7 hover:border-blue-5 hover:text-blue-7 transition-colors"
                  title="다음 장"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* 검색 — 클릭 시 오른쪽 사이드 모달 오픈 */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-bluegrey-2 rounded-full w-56 text-left hover:border-blue-4 transition-colors"
              >
                <img src={IcoSearch} className="w-4 h-4 shrink-0" alt="" />
                <span className="text-body-4 text-grey-5">검색할 내용을 입력하세요.</span>
              </button>
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
                    <div
                      key={idx}
                      onClick={() => handleVerseClick({ num, text }, idx)}
                      className={`flex items-start gap-3 py-2 px-3 rounded-lg cursor-pointer select-none hover:bg-grey-1 transition-colors ${
                        checkedVerses[idx] ? "bg-blue-1" : ""
                      }`}
                      title="한 번 클릭: 읽음 표시 | 두 번 클릭: 좋아요"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedVerses[idx]}
                        onChange={() => toggleVerse(idx)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 shrink-0 accent-primary"
                      />
                      <span
                        className={`flex-1 ${
                          fontSize === "large"
                            ? "text-body-1"
                            : fontSize === "small"
                              ? "text-body-3"
                              : "text-body-2"
                        } ${checkedVerses[idx] ? "text-blue-7" : "text-grey-9"}`}
                      >
                        {num} {text}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave({ num, text });
                        }}
                        className="ml-auto shrink-0 transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-colors ${isSaved ? "text-red-400 fill-red-400" : "text-grey-5 hover:text-red-400"}`}
                          fill={isSaved ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeMenu === "랭킹" && (
            <BibleRankingView
              neighbors={READ_NEIGHBORS}
              monthly={READ_MONTHLY}
              total={READ_TOTAL}
              unit="절"
            />
          )}
          {activeMenu === "내 구절" && (
            <BibleVersesView
              mode="read"
              items={Object.values(savedVerses)}
              mockItems={MOCK_SAVED_VERSES}
              onRemove={(key) =>
                setSavedVerses((prev) => {
                  const { [key]: _, ...rest } = prev;
                  return rest;
                })
              }
            />
          )}
          {activeMenu === "내 현황" && (
            <BibleStatusView
              bookProgress={BOOK_PROGRESS_READ}
              config={READ_STATUS_CONFIG}
              mode="read"
            />
          )}
        </div>
      </div>

      {/* ── 검색 사이드 모달 (우측에서 슬라이드인) ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          searchOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bluegrey-2">
          <button
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="text-grey-5 hover:text-grey-9 text-lg leading-none shrink-0"
          >
            ✕
          </button>
          <div className="flex-1 flex items-center gap-2 border border-bluegrey-2 rounded-xl px-3 py-1.5">
            <img src={IcoSearch} className="w-4 h-4 shrink-0" alt="" />
            <input
              autoFocus={searchOpen}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="성경 구절 검색..."
              className="flex-1 outline-none text-body-4 text-grey-9 placeholder:text-grey-5 bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-grey-4 hover:text-grey-7 text-sm leading-none"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!searchQuery.trim() && (
            <p className="px-4 py-8 text-body-4 text-grey-5 text-center">
              찾고자 하는 성경 구절을 입력하세요.
            </p>
          )}
          {searchQuery.trim() && searchResults.length === 0 && (
            <p className="px-4 py-8 text-body-4 text-grey-5 text-center">검색 결과가 없습니다.</p>
          )}
          {searchResults.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedBook(r.book);
                setChapter(r.chapter);
                setCheckedVerses({});
                setSearchOpen(false);
                setSearchQuery("");
                setActiveMenu("성경읽기");
              }}
              className="w-full text-left px-4 py-3.5 border-b border-bluegrey-1 hover:bg-blue-1 transition-colors"
            >
              <p className="text-body-5 text-blue-6 font-medium mb-1">
                {r.book} {r.chapter}:{r.num}
              </p>
              <p className="text-body-4 text-grey-8 leading-relaxed line-clamp-3">
                {highlight(r.text, searchQuery)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── 마지막 장 모달 ── */}
      {lastChapterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-8 text-center max-w-xs w-full mx-4">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-2">마지막 장입니다!</h3>
            <p className="text-body-4 text-grey-6 mb-6">성경의 마지막에 도달했습니다.</p>
            <button
              onClick={() => setLastChapterModal(false)}
              className="w-full py-2.5 bg-blue-7 text-white rounded-xl text-body-3 font-semibold hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
