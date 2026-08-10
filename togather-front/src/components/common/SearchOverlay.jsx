import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSearch } from "@/contexts/SearchContext";
import IcoSearch from "@/assets/icon-svg/search-black.svg";

const ALL_KEYWORDS = [
  { label: "주일 예배", to: "/말씀/방송", category: "예배" },
  { label: "주일 2부 예배", to: "/말씀/방송", category: "예배" },
  { label: "새벽 예배", to: "/말씀/방송", category: "예배" },
  { label: "수요 예배", to: "/말씀/방송", category: "예배" },
  { label: "금요 예배", to: "/말씀/방송", category: "예배" },
  { label: "실시간 방송", to: "/말씀/방송", category: "예배" },
  { label: "성경 타자", to: "/말씀/필사", category: "말씀" },
  { label: "성경 필사", to: "/말씀/필사", category: "말씀" },
  { label: "성경 읽기", to: "/말씀/읽기", category: "말씀" },
  { label: "스마트 주보", to: "/주보", category: "주보" },
  { label: "헌금 안내", to: "/주보?tab=예물", category: "주보" },
  { label: "봉사 안내", to: "/주보?tab=봉사", category: "주보" },
  { label: "구역모임", to: "/양육훈련/구역", category: "양육" },
  { label: "제자훈련", to: "/양육훈련/제자", category: "양육" },
  { label: "소그룹", to: "/양육훈련", category: "양육" },
  { label: "교회 소개", to: "/교회소개", category: "교회" },
  { label: "예배 안내", to: "/말씀/안내", category: "예배" },
  { label: "오시는 길", to: "/교회소개?tab=오시는 길", category: "교회" },
  { label: "셔틀 안내", to: "/교회소개?tab=차량운행 안내", category: "교회" },
  { label: "주차 안내", to: "/교회소개?tab=오시는 길", category: "교회" },
  { label: "교회 행사", to: "/교회행사", category: "행사" },
  { label: "갤러리", to: "/갤러리", category: "행사" },
  { label: "공지사항", to: "/교회소개", category: "소식" },
  { label: "새 가족 등록", to: "/register", category: "등록" },
  { label: "마이페이지", to: "/mypage", category: "내 정보" },
];

const QUICK_SUGGESTIONS = [
  { label: "주일 예배", to: "/말씀/방송" },
  { label: "성경 타자", to: "/말씀/필사" },
  { label: "오시는 길", to: "/교회소개?tab=오시는 길" },
  { label: "구역모임", to: "/양육훈련/구역" },
  { label: "헌금 안내", to: "/주보?tab=예물" },
];

const RECENT_KEY = "togather_recent_searches";

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(label, to) {
  const prev = getRecent().filter((r) => r.label !== label);
  localStorage.setItem(RECENT_KEY, JSON.stringify([{ label, to }, ...prev].slice(0, 8)));
}

function deleteRecent(label) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((r) => r.label !== label)));
}

export default function SearchOverlay() {
  const { open, setOpen } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const [active, setActive] = useState(false); // controls CSS transition

  // 오버레이 열릴 때 처리
  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      setQuery("");
      // 한 프레임 후 transition 시작 (slide-in 효과)
      requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)));
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setActive(false);
    }
  }, [open]);

  const close = useCallback(() => {
    setActive(false);
    setTimeout(() => setOpen(false), 200);
  }, [setOpen]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // 스크롤 막기
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(label, to) {
    saveRecent(label, to);
    setOpen(false);
    setActive(false);
    void navigate(to);
  }

  function removeRecentItem(e, label) {
    e.stopPropagation();
    deleteRecent(label);
    setRecent(getRecent());
  }

  const filtered = query.trim()
    ? ALL_KEYWORDS.filter(
        (k) =>
          k.label.replace(/\s/g, "").includes(query.replace(/\s/g, "")) ||
          k.label.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 10)
    : [];

  const highlightMatch = (text) => {
    const q = query.trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-bold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150]">
      {/* 블러 백드롭 */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          background: "rgba(20,28,48,0.35)",
          opacity: active ? 1 : 0,
        }}
        onClick={close}
      />

      {/* 검색 패널 */}
      <div
        className="absolute left-0 right-0 bg-white shadow-2xl transition-all duration-200"
        style={{
          top: 0,
          transform: active ? "translateY(0)" : "translateY(-12px)",
          opacity: active ? 1 : 0,
        }}
      >
        {/* 헤더 높이만큼 여백 (sticky header 아래) */}
        <div className="h-[72px] hidden md:block" />
        <div className="h-14 md:hidden" />

        {/* 검색 인풋 */}
        <div className="max-w-[860px] mx-auto px-4 py-4">
          <div
            className="flex items-center gap-3 px-5 h-[56px] rounded-2xl border-2 border-primary bg-white"
            style={{ boxShadow: "0 0 0 4px rgba(61,85,136,.1)" }}
          >
            <img src={IcoSearch} className="w-5 h-5 shrink-0" alt="" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  if (filtered.length > 0) go(filtered[0].label, filtered[0].to);
                }
              }}
              placeholder="예배, 주보, 성경, 오시는 길…"
              className="flex-1 bg-transparent border-0 outline-none text-[16px] text-grey-11 placeholder:text-grey-5"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="w-7 h-7 rounded-full bg-bluegrey-2 text-grey-7 flex items-center justify-center text-lg hover:bg-bluegrey-3 transition-colors shrink-0"
              >
                ×
              </button>
            )}
            <button
              onClick={close}
              className="ml-1 px-3 py-1.5 text-[14px] font-medium text-grey-6 hover:text-grey-10 transition-colors shrink-0"
            >
              취소
            </button>
          </div>
        </div>

        {/* 제안 영역 */}
        <div className="max-w-[860px] mx-auto px-4 pb-5">
          {query.trim() === "" ? (
            /* ── 빈 쿼리: 최근 검색어 + 추천 ── */
            <div className="flex flex-col gap-5">
              {/* 최근 검색어 */}
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[13px] font-bold text-grey-7">최근 검색어</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem(RECENT_KEY);
                        setRecent([]);
                      }}
                      className="text-[12px] text-grey-5 hover:text-grey-8 transition-colors"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r.label}
                        onClick={() => go(r.label, r.to)}
                        className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border border-bluegrey-2 bg-white text-[14px] text-grey-9 hover:border-blue-5 hover:text-primary hover:bg-blue-1 transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-grey-5 group-hover:text-primary transition-colors shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {r.label}
                        <span
                          onClick={(e) => removeRecentItem(e, r.label)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-grey-4 hover:bg-bluegrey-3 hover:text-grey-8 transition-colors text-base leading-none"
                        >
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 추천 검색어 */}
              <div>
                <p className="text-[13px] font-bold text-grey-7 mb-2 px-1">추천 검색어</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => go(s.label, s.to)}
                      className="px-3.5 py-1.5 rounded-full border border-bluegrey-2 bg-bluegrey-1 text-[14px] font-medium text-grey-8 hover:border-blue-5 hover:text-primary hover:bg-blue-1 transition-all"
                    >
                      # {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            /* ── 검색 결과 ── */
            <ul className="divide-y divide-bluegrey-1 rounded-xl overflow-hidden border border-bluegrey-2">
              {filtered.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => go(item.label, item.to)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-blue-1 transition-colors text-left"
                  >
                    <img src={IcoSearch} className="w-4 h-4 shrink-0 opacity-40" alt="" />
                    <span className="flex-1 text-[15px] text-grey-10">
                      {highlightMatch(item.label)}
                    </span>
                    <span className="text-[12px] text-grey-5 shrink-0">{item.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            /* ── 결과 없음 ── */
            <div className="py-8 text-center text-[14px] text-grey-5">
              <span className="font-semibold text-grey-8">"{query}"</span>에 대한 검색 결과가
              없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
