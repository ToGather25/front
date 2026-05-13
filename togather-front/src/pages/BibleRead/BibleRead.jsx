import { useState, useMemo } from "react";
import { Link } from "react-router";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import bibleData from "@/data/bible.json";
import { BOOK_MAP, BOOK_ABBREV, OT, NT, BIBLE_READ_SIDEBAR_MENUS } from "@/config/bible.config";

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

// ── 랭킹 ───────────────────────────────────────────────
const MY_RANK = { rank: 22, name: "나", count: 20511, trend: 0 };
const MOCK_MONTHLY = [
  { rank: 1, name: "요한", count: 12345566 },
  { rank: 2, name: "베드로", count: 12344433 },
  { rank: 3, name: "김미정", count: 3342343 },
  { rank: 4, name: "김수빈", count: 5638383 },
  { rank: 5, name: "이미자", count: 234324 },
  { rank: 6, name: "박은진", count: 123455 },
  { rank: 7, name: "미수리", count: 122222 },
];
const MOCK_TOTAL = [
  { rank: 1, name: "요한", count: 12345566 },
  { rank: 2, name: "베드로", count: 12344433 },
  { rank: 3, name: "김미정", count: 3342343 },
  { rank: 4, name: "김수빈", count: 5638383 },
  { rank: 5, name: "이미자", count: 234324 },
  { rank: 6, name: "박은진", count: 123455 },
  { rank: 7, name: "미수리", count: 122222 },
];
const NEIGHBORS = [
  { rank: MY_RANK.rank + 1, name: "임예원", count: 14408, trend: -1 },
  MY_RANK,
  { rank: MY_RANK.rank - 1, name: "임예빈", count: 21511, trend: 1 },
];

function TrendIcon({ trend }) {
  if (trend > 0) return <span className="text-[10px] text-blue-7">▲</span>;
  if (trend < 0) return <span className="text-[10px] text-red-400">▼</span>;
  return null;
}

function RankTable({ title, rows }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-grey-2 rounded-t-xl px-4 py-2.5 text-center">
        <span className="text-body-3 font-semibold text-grey-10">{title}</span>
      </div>
      <div className="border border-t-0 border-bluegrey-2 rounded-b-xl overflow-hidden">
        {rows.map(({ rank, name, count }, i) => (
          <div key={rank} className={`flex items-center px-4 py-3 gap-4 ${i < rows.length - 1 ? "border-b border-bluegrey-2" : ""}`}>
            <span className="w-5 text-body-4 text-grey-7 font-medium shrink-0">{rank}</span>
            <span className="flex-1 text-body-3 text-grey-10">{name}</span>
            <span className="text-body-3 text-grey-9">{count.toLocaleString()}절</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingView() {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-8">
      {/* 내 순위 — 3인 원형 */}
      <div className="flex items-end justify-center gap-8 mb-10">
        {NEIGHBORS.map((u, i) => {
          const isMe = u.name === "나";
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={`rounded-full flex items-center justify-center font-bold text-grey-10 ${
                  isMe
                    ? "w-36 h-36 bg-grey-6 text-white text-sub-tit-2"
                    : "w-28 h-28 bg-grey-2 text-sub-tit-3"
                }`}
              >
                {u.name}
              </div>
              <div className="text-center">
                <p className="text-body-3 font-medium text-grey-9 flex items-center justify-center gap-1">
                  {u.rank}위 <TrendIcon trend={u.trend} />
                </p>
                <p className="text-body-4 text-grey-5">{u.count.toLocaleString()}절</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 순위표 2열 */}
      <div className="flex gap-6">
        <RankTable title="월간 순위표" rows={MOCK_MONTHLY} />
        <RankTable title="전체 순위표" rows={MOCK_TOTAL} />
      </div>
    </div>
  );
}

// ── 내 구절 ─────────────────────────────────────────────
const MOCK_SAVED_VERSES = [
  { key: "로마서-8-28", book: "로마서", chapter: 8, num: 28, text: "우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라" },
  { key: "마가복음-12-29", book: "마가복음", chapter: 12, num: "29~31", text: "예수께서 대답하시되 첫째는 이것이니 이스라엘아 들으라 주 곧 우리 하나님은 유일한 주시라 네 마음을 다하고 목숨을 다하고 뜻을 다하고 힘을 다하여 주 너의 하나님을 사랑하라 하신 것이요 둘째는 이것이니 네 이웃을 네 몸과 같이 사랑하라 하신 것이라 이에서 더 큰 계명이 없느니라" },
  { key: "잠언-24-5a", book: "잠언", chapter: 24, num: "5~6", text: "지혜있는 자는 강하고 지식있는 자는 힘을 더 하나니 너는 모략으로 싸우라 승리는 모사가 많음에 있느니라" },
  { key: "잠언-24-5b", book: "잠언", chapter: 24, num: "5~6", text: "지혜있는 자는 강하고 지식있는 자는 힘을 더하나니 너는 모략으로 싸우라 승리는 모사가 많음에 있느니라" },
  { key: "잠언-24-5c", book: "잠언", chapter: 24, num: "5~6", text: "내 사랑하는 형제들아 들을지어다 하나님이 세상에서 가난한 자를 택하사 믿음에 부요하게 하시고 또 자기를 사랑하는 자들에게 약속하신 나라를 상속으로 받게 하지 아니하셨느냐" },
  { key: "잠언-24-5d", book: "잠언", chapter: 24, num: "5~6", text: "내 사랑하는 형제들아 들을지어다 하나님이 세상에서 가난한 자를 택하사 믿음에 부요하게 하시고 또 자기를 사랑하는 자들에게 약속하신 나라를 상속으로 받게 하지 아니하셨느냐" },
];

function MyVersesView({ saved, onUnsave }) {
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);

  const savedList = Object.values(saved);
  const displayList = savedList.length > 0 ? savedList : MOCK_SAVED_VERSES;

  const filtered = displayList.filter((v) => {
    if (search && !v.text.includes(search) && !v.book.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* 상단 검색/필터 바 */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-bluegrey-2 bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border border-bluegrey-2 rounded-full flex-1 max-w-sm">
          <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5 bg-transparent"
            placeholder="검색할 내용을 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`px-5 py-2.5 rounded-full text-body-4 font-medium border transition-colors whitespace-nowrap ${
            favOnly ? "bg-primary text-white border-primary" : "border-bluegrey-2 text-grey-8 hover:border-blue-5"
          }`}
        >
          좋아하는 구절만 읽기
        </button>
      </div>

      {/* 카드 그리드 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-12 h-12 text-grey-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="text-body-3 text-grey-6">저장된 구절이 없습니다.</p>
            <p className="text-body-4 text-grey-4 mt-1">성경 읽기에서 ♥를 눌러 구절을 저장하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {filtered.map((v) => (
              <div key={v.key} className="flex flex-col">
                <div className="bg-white border border-bluegrey-2 rounded-2xl px-6 py-5 flex-1 flex flex-col justify-between min-h-[140px]">
                  <p className="text-body-3 text-grey-10 leading-relaxed">{v.text}</p>
                  <p className="text-body-4 text-grey-7 mt-4 text-right">
                    {v.book} {v.chapter}장 {v.num}절
                  </p>
                </div>
                <div className="flex justify-end pr-1 mt-1">
                  <button
                    onClick={() => onUnsave?.(v.key)}
                    className="p-1 text-red-400"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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

const BOOK_PROGRESS_READ = {
  창: 100, 출: 85, 레: 40, 민: 100, 신: 60, 수: 30, 삿: 0, 룻: 100,
  삼상: 0, 삼하: 0, 왕상: 0, 왕하: 0, 대상: 0, 대하: 0, 스: 0, 느: 0, 에: 0,
  욥: 0, 시: 55, 잠: 20, 전: 0, 아: 0, 사: 0, 렘: 0, 애: 0, 겔: 0, 단: 0,
  호: 0, 욜: 0, 암: 0, 옵: 0, 욘: 100, 미: 0, 나: 0, 합: 0, 습: 0, 학: 0, 슥: 0, 말: 0,
  마: 70, 막: 100, 눅: 0, 요: 100, 행: 0, 롬: 45, 고전: 0, 고후: 0, 갈: 100, 엡: 100,
  빌: 100, 골: 0, 살전: 0, 살후: 0, 딤전: 0, 딤후: 0, 딛: 0, 몬: 0, 히: 0,
  약: 0, 벧전: 0, 벧후: 0, 요일: 0, 요이: 0, 요삼: 0, 유: 0, 계: 0,
};

function MyStatusView() {
  const [bookTab, setBookTab] = useState("OT");
  const [calDate, setCalDate] = useState(new Date());

  const allBooks = [...OT, ...NT];
  const totalPct = Math.round(allBooks.reduce((s, a) => s + (BOOK_PROGRESS_READ[a] ?? 0), 0) / allBooks.length);
  const listBooks = bookTab === "OT" ? OT : bookTab === "NT" ? NT
    : allBooks.filter(a => (BOOK_PROGRESS_READ[a] ?? 0) > 0 && (BOOK_PROGRESS_READ[a] ?? 0) < 100);

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
            <p className="text-body-3 font-bold text-grey-11 mb-3">읽기 전체 현황</p>
            <div className="border border-bluegrey-2 rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-body-3 text-grey-8">읽은 구절 수 총합 : <span className="font-semibold text-grey-11">128,450 절</span></p>
              <p className="text-body-3 text-grey-8">방문한 횟수: <span className="font-semibold text-grey-11">215 일</span></p>
              <p className="text-body-3 text-grey-8">완독 횟수: <span className="font-semibold text-grey-11">1번</span></p>
            </div>
          </div>
          <p>
            <span className="text-[28px] font-bold text-grey-11">5 일</span>
            <span className="text-body-2 text-grey-8 ml-2">연속 읽기중!</span>
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              <div className="border border-bluegrey-2 rounded-xl px-4 py-3">
                <p className="text-sub-tit-4 font-bold text-grey-11">12일</p>
                <p className="text-body-5 text-grey-5">이번달 읽기 횟수</p>
              </div>
              <div className="border border-bluegrey-2 rounded-xl px-4 py-3">
                <p className="text-sub-tit-4 font-bold text-grey-11">248절</p>
                <p className="text-body-5 text-grey-5">이번달 읽은 구절수</p>
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
            <p className="text-body-3 font-bold text-grey-11">읽기 현황</p>
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
              const pct = BOOK_PROGRESS_READ[abbr] ?? 0;
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
  const [bookTab, setBookTab] = useState("OT");
  const [chapterOpen, setChapterOpen] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const verses = getVerses(selectedBook, chapter);
  const chapters = useMemo(() => getChapters(selectedBook), [selectedBook]);

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
          {BIBLE_READ_SIDEBAR_MENUS.map((menu) => (
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
              to="/말씀/필사"
              className="flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-grey-6 hover:text-grey-9 hover:bg-bluegrey-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              <span className="text-[10px] whitespace-nowrap">성경쓰기로 전환</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — 성경읽기 메뉴에서만 표시 */}
        {activeMenu === "성경읽기" && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-bluegrey-2 bg-white">
            {/* 글씨 크기 */}
            <div className="relative">
              <button
                onClick={() => { setFontSizeOpen((v) => !v); setBookOpen(false); setChapterOpen(false); }}
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

            <div className="flex-1" />

            {/* 책 선택 */}
            <div className="relative">
              <button
                onClick={() => { setBookOpen((v) => !v); setChapterOpen(false); setFontSizeOpen(false); setBookTab(OT.includes(BOOK_ABBREV[selectedBook]) ? "OT" : "NT"); }}
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
                            bookTab === t ? "bg-primary text-white" : "border border-bluegrey-2 text-grey-8 hover:border-blue-5"
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
                            onClick={() => { setSelectedBook(fullName); setChapter(1); setCheckedVerses({}); setBookOpen(false); }}
                            className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-colors ${
                              isSelected ? "border-primary" : "border-bluegrey-2 hover:border-blue-4"
                            }`}
                          >
                            <span className="text-body-3 font-bold text-grey-10">{abbr}</span>
                            <span className="text-[10px] text-grey-6 mt-0.5 truncate w-full text-center">{fullName}</span>
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
                onClick={() => { setChapterOpen((v) => !v); setBookOpen(false); setFontSizeOpen(false); }}
                className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-4 text-grey-8 hover:border-blue-5 transition-colors min-w-[52px] text-center"
              >
                {chapter}{selectedBook === "시편" ? "편" : "장"}
              </button>
              {chapterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setChapterOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-2xl shadow-xl p-4 w-48 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-1">
                      {chapters.map((ch) => (
                        <button
                          key={ch}
                          onClick={() => { setChapter(ch); setCheckedVerses({}); setChapterOpen(false); }}
                          className={`py-2 rounded-lg text-body-4 transition-colors ${
                            chapter === ch ? "bg-primary text-white font-semibold" : "hover:bg-grey-1 text-grey-8"
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

            {/* 검색 */}
            <div className="flex items-center gap-2 px-4 py-2 border border-bluegrey-2 rounded-full w-56">
              <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5 bg-transparent" placeholder="검색할 내용을 입력하세요." />
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
                        fontSize === "large" ? "text-body-1" : fontSize === "small" ? "text-body-3" : "text-body-2"
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
        {activeMenu === "내 구절" && <MyVersesView saved={savedVerses} onUnsave={(key) => setSavedVerses((prev) => { const { [key]: _, ...rest } = prev; return rest; })} />}
        {activeMenu === "내 현황" && <MyStatusView />}
      </div>
    </div>
  );
}
