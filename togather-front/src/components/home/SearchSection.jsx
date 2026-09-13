import { useState } from "react";
import { Link, useNavigate } from "react-router";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const SUGGESTIONS = [
  { label: "주일 예배", to: "/말씀/방송" },
  { label: "성경 타자", to: "/말씀/필사" },
  { label: "오시는 길", to: "/교회소개?tab=오시는 길" },
  { label: "구역모임", to: "/양육훈련/구역" },
  { label: "헌금 안내", to: "/주보?tab=예물" },
];

const MENU_ITEMS = [
  {
    id: "intro",
    label: "교회소개",
    sub: "비전 · 섬기는 사람들 · 오시는 길",
    to: "/교회소개",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M12 2v4M10 4h4M3 22V9l9-4 9 4v13M9 22v-7h6v7" />
      </svg>
    ),
  },
  {
    id: "news",
    label: "행사 ∙ 소식",
    sub: "캘린더 · 갤러리 · 공지사항",
    to: "/교회행사",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M3 10v4h4l10 5V5L7 10H3zM18 8a4 4 0 0 1 0 8" />
      </svg>
    ),
  },
  {
    id: "bull",
    label: "스마트 주보",
    sub: "주보 · 예배순서 · 교회 소식",
    to: "/주보/목록",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h4M9 12h7M9 16h7M9 8h3" />
      </svg>
    ),
  },
  {
    id: "type",
    label: "성경 타자",
    sub: "필사 · 통독 · 랭킹",
    to: "/말씀/필사",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
      </svg>
    ),
  },
];

export default function SearchSection() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) void navigate(`/검색?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="w-full py-[100px] pb-[100px] flex flex-col items-center">
      <h2 className="text-[38px] font-bold tracking-[-1.2px] text-grey-12 mb-8 text-center leading-[1.3]">
        원하는 기능을 빠르게 검색해보세요
      </h2>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 px-6 rounded-full transition-all duration-200 w-full max-w-[760px]"
        style={{
          height: "56px",
          background: "#fff",
          border: "2px solid #dde0e5",
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = "#3d5588";
          e.currentTarget.style.boxShadow = "0 0 0 6px rgba(61,85,136,.08)";
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = "#dde0e5";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <button type="submit" aria-label="검색">
          <img src={IcoSearch} className="w-[22px] h-[22px] shrink-0" alt="" />
        </button>
        <input
          type="text"
          placeholder="예배, 주보, 성경, 오시는 길…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-transparent border-0 outline-none text-body-1 text-grey-11 placeholder:text-grey-5"
        />
        {value && (
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-bluegrey-2 text-grey-7 text-xl flex items-center justify-center hover:bg-bluegrey-3 transition-colors"
            onClick={() => setValue("")}
          >
            ×
          </button>
        )}
      </form>

      {/* Quick suggestions */}
      <div className="flex items-center gap-2.5 mt-6 flex-wrap justify-center">
        {SUGGESTIONS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="px-4 py-2 rounded-full border border-bluegrey-2 bg-white text-sm font-medium text-grey-9 hover:border-blue-5 hover:text-primary hover:bg-blue-1 transition-all"
          >
            # {s.label}
          </Link>
        ))}
      </div>

      {/* Shortcut cards */}
      <div className="grid grid-cols-4 gap-9 mt-20 w-full max-w-[900px]">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className="group aspect-square bg-white rounded-2xl border border-bluegrey-2 p-4 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 hover:bg-primary hover:border-primary transition-all duration-200"
            style={{ boxShadow: "16px 20px 48px 4px rgba(0,0,0,.10)" }}
          >
            <div className="shrink-0 text-primary group-hover:text-white transition-colors pb-5">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-body-2 font-bold text-grey-12 group-hover:text-white tracking-[-0.4px] m-0 leading-tight transition-colors">
                {item.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
