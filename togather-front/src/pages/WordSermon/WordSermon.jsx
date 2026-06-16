import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import WordTabBar from "@/components/word/WordTabBar";

const ALL_SERMONS = [
  { id: 1,  date: "2026.05.04", service: "주일 2부 예배", title: "부활의 능력으로 살아가라",     verse: "빌립보서 3:10–11",     speaker: "김함께 목사" },
  { id: 2,  date: "2026.04.27", service: "주일 2부 예배", title: "하나님의 선하심을 신뢰하라",   verse: "시편 23:1–6",          speaker: "김함께 목사" },
  { id: 3,  date: "2026.04.20", service: "주일 2부 예배", title: "함께함의 능력",               verse: "전도서 4:9–12",        speaker: "김함께 목사" },
  { id: 4,  date: "2026.04.13", service: "주일 2부 예배", title: "고난 너머의 영광",             verse: "로마서 8:18–25",       speaker: "김무리 목사" },
  { id: 5,  date: "2026.04.06", service: "주일 2부 예배", title: "은혜로 충분하다",              verse: "고린도후서 12:9–10",   speaker: "임축복 목사" },
  { id: 6,  date: "2026.03.30", service: "주일 2부 예배", title: "믿음으로 나아가라",            verse: "히브리서 11:1–6",      speaker: "김함께 목사" },
  { id: 7,  date: "2026.03.23", service: "청년부 예배",   title: "십자가의 도",                 verse: "고린도전서 1:18–25",   speaker: "박은혜 목사" },
  { id: 8,  date: "2026.03.16", service: "주일 2부 예배", title: "하나님이 하신다",              verse: "이사야 43:1–7",        speaker: "김함께 목사" },
  { id: 9,  date: "2026.03.09", service: "주일 2부 예배", title: "새 힘을 얻으리",              verse: "이사야 40:28–31",      speaker: "김함께 목사" },
  { id: 10, date: "2026.03.02", service: "청년부 예배",   title: "복음의 능력",                 verse: "로마서 1:16–17",       speaker: "박은혜 목사" },
  { id: 11, date: "2026.02.23", service: "주일 2부 예배", title: "사랑의 빚",                   verse: "로마서 13:8–10",       speaker: "김함께 목사" },
  { id: 12, date: "2026.02.16", service: "주일 2부 예배", title: "성령의 열매",                 verse: "갈라디아서 5:22–23",   speaker: "임축복 목사" },
  { id: 13, date: "2026.02.09", service: "주일 2부 예배", title: "기도의 능력",                 verse: "야고보서 5:13–18",     speaker: "김함께 목사" },
  { id: 14, date: "2026.02.02", service: "청년부 예배",   title: "그리스도 안에서",             verse: "에베소서 1:3–14",      speaker: "박은혜 목사" },
];

const PAGE_SIZE = 12;

export default function WordSermon() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_SERMONS;
    const q = query.trim().toLowerCase();
    return ALL_SERMONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.verse.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        s.service.toLowerCase().includes(q)
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputVal);
    setPage(1);
  };

  const handleClear = () => {
    setInputVal("");
    setQuery("");
    setPage(1);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">말씀·찬양</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1576px] mx-auto px-8 py-12">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-xl">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="설교 제목, 본문 말씀, 목사님, 예배 종류 검색"
              className="w-full pl-10 pr-10 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all"
            />
            {inputVal && (
              <button type="button" onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-4 hover:text-grey-7 text-lg leading-none">
                ✕
              </button>
            )}
          </div>
          <button type="submit"
            className="px-5 py-3 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors shrink-0">
            검색
          </button>
        </form>

        {/* 결과 없음 */}
        {filtered.length === 0 && (
          <div className="py-24 text-center text-grey-6 text-body-2">
            검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
          </div>
        )}

        {/* 4×3 그리드 */}
        {filtered.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
              {pageItems.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/말씀/설교/${s.id}`)}
                  className="group text-left rounded-2xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-lg transition-all"
                >
                  {/* 썸네일 */}
                  <div className="w-full bg-grey-2 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                    <svg className="w-10 h-10 text-grey-4 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  {/* 정보 */}
                  <div className="p-4">
                    <span className="inline-block px-2 py-0.5 bg-blue-1 text-blue-7 text-body-5 font-medium rounded-full mb-2">
                      {s.service}
                    </span>
                    <h3 className="text-body-3 font-semibold text-grey-11 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                      {s.title}
                    </h3>
                    <p className="text-body-4 text-primary font-medium mb-1">{s.verse}</p>
                    <div className="flex items-center gap-2 text-body-5 text-grey-6">
                      <span>{s.speaker}</span>
                      <span>·</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} label="‹" />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === currentPage} label={String(p)} />
                ))}
                <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} label="›" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg text-body-3 font-medium transition-colors ${
        active
          ? "bg-blue-7 text-white"
          : disabled
          ? "text-grey-4 cursor-not-allowed"
          : "text-grey-8 hover:bg-blue-1 hover:text-blue-7"
      }`}
    >
      {label}
    </button>
  );
}
