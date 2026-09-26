import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import WordTabBar from "@/components/word/WordTabBar";
import WorshipInfo from "@/components/church/WorshipInfo";
import JuboList from "@/pages/JuboList/JuboList";
import IcoSearch from "@/assets/icon-svg/search-black.svg";
import { searchSermons } from "@/services/sermonService";

const PAGE_SIZE = 12;

function SermonThumb() {
  return (
    <div
      className="w-full bg-grey-2 flex items-center justify-center overflow-hidden"
      style={{ aspectRatio: "5/4" }}
    >
      <svg
        className="w-12 h-12 text-grey-4 group-hover:text-primary transition-colors"
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
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "예배 목록";
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

  const totalPages = Math.max(1, pageInfo?.totalPages ?? 1);

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
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      {activeTab === "예배 목록" && (
      <div className="max-w-[1400px] mx-auto px-4 py-10 md:px-8 md:py-12">
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
              className="w-full h-[46px] pl-10 pr-10 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 outline-none transition-all"
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
            className="h-[46px] px-4 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 bg-white focus:border-blue-6 outline-none transition-all shrink-0"
          >
            <option value="">예배 전체</option>
            {(church.worshipDisplay || []).map((display) => (
              <option key={display.title} value={display.title}>
                {display.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-[46px] px-5 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors shrink-0"
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
            <p className="mb-4">데이터를 불러오지 못했습니다.</p>
          </div>
        )}

        {/* 검색했는데 결과 없음 */}
        {!loading && !error && sermons.length === 0 && query && (
          <div className="min-h-[60vh] flex items-center justify-center text-centre text-grey-6 text-body-2">
            검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
          </div>
        )}

        {/* 검색 안 했을 때 (데이터 없는 상태) */}
        {!loading && !error && sermons.length === 0 && !query && (
          <div className="min-h-[60vh] flex items-center justify-center text-centre text-grey-6 text-body-2">
            설교 데이터를 불러오는 중입니다.
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
                  className="group text-left rounded-2xl overflow-hidden hover:shadow-lg transition-all relative cursor-pointer bg-grey-2 flex flex-col"
                  style={{
                    aspectRatio: "9/7",
                  }}
                >
                  {/* 배경 이미지 또는 기본 썸네일 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: s.thumbnail ? `url('${s.thumbnail}')` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {!s.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SermonThumb />
                    </div>
                  )}

                  {/* 그래디언트 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-grey-11/60 group-hover:to-grey-11/70 transition-colors" />

                  {/* 콘텐츠 */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-5 pb-6">
                    <h3 className="text-body-2 font-semibold text-white group-hover:text-white/95 transition-colors line-clamp-2 mb-2">
                      <span className="hover-underline inline-block">{s.title}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-body-5 text-white/90">
                      <span>{s.sermonDate}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 페이지네이션 */}
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
          </>
        )}
      </div>
      )}

      {activeTab === "예배 안내" && (
      <div className="flex-1 max-w-[1400px] mx-auto px-6 py-10 md:px-12 md:py-12 w-full">
        <WorshipInfo />
      </div>
      )}

      {activeTab === "스마트 주보" && (
      <div>
        <JuboList hideHeader />
      </div>
      )}
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
