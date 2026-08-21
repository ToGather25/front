import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import WordTabBar from "@/components/word/WordTabBar";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import { searchSermons } from "@/services/sermonService";
import { SERVICE_TYPES } from "@/config/sermon.config";

const PAGE_SIZE = 12;

function SermonThumb() {
  return (
    <div
      className="w-full bg-grey-2 flex items-center justify-center overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      <svg
        className="w-10 h-10 text-grey-4 group-hover:text-primary transition-colors"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    </div>
  );
}

export default function WordSermon() {
  const navigate = useNavigate();
  const { church } = useChurch();
  const [sermons, setSermons] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [worshipType, setWorshipType] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    searchSermons(church.id, {
      keyword: query || undefined,
      worshipType: worshipType || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then(({ sermons: list, pageInfo: info }) => {
        if (cancelled) return;
        setSermons(list);
        setPageInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[WordSermon] 설교 목록 조회 실패:", err);
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [church.id, query, worshipType, page, reloadToken]);

  const totalPages = Math.max(1, pageInfo.totalPages ?? 1);

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
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-2xl">
          <div className="relative flex-1">
            <img
              src={IcoSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              alt=""
            />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="설교 제목 검색"
              className="w-full pl-10 pr-10 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all"
            />
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-4 hover:text-grey-7 text-lg leading-none"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={worshipType}
            onChange={(e) => {
              setWorshipType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 bg-white focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all shrink-0"
          >
            <option value="">예배 전체</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-3 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors shrink-0"
          >
            검색
          </button>
        </form>

        {/* 로딩 중 */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-bluegrey-2 overflow-hidden animate-pulse"
              >
                <div className="w-full bg-grey-2" style={{ aspectRatio: "16/9" }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-grey-2 rounded w-4/5" />
                  <div className="h-3 bg-grey-2 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 조회 실패 */}
        {!loading && error && (
          <div className="py-24 text-center text-grey-6 text-body-2">
            <p className="mb-4">불러오지 못했습니다. 다시 시도해 주세요.</p>
            <button
              onClick={() => setReloadToken((t) => t + 1)}
              className="px-5 py-2.5 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && sermons.length === 0 && (
          <div className="py-24 text-center text-grey-6 text-body-2">
            검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
          </div>
        )}

        {/* 4×3 그리드 */}
        {!loading && !error && sermons.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
              {sermons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/말씀/설교/${s.id}`)}
                  className="group text-left rounded-2xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-lg transition-all"
                >
                  <SermonThumb />
                  <div className="p-4">
                    <h3 className="text-body-3 font-semibold text-grey-11 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                      {s.title}
                    </h3>
                    <div className="flex items-center gap-2 text-body-5 text-grey-6">
                      <span>{s.worshipType}</span>
                      <span>·</span>
                      <span>{s.sermonDate}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <PageBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  label="‹"
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === page} label={String(p)} />
                ))}
                <PageBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  label="›"
                />
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
