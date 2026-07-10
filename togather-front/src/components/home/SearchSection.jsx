import { useState } from "react";
import { Link } from "react-router";
import { useSearch } from "@/contexts/SearchContext";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const SUGGESTIONS = [
  { label: "주일 예배",  to: "/말씀/방송" },
  { label: "성경 타자",  to: "/말씀/필사" },
  { label: "오시는 길",  to: "/교회소개?tab=오시는 길" },
  { label: "구역모임",   to: "/양육훈련/구역" },
  { label: "헌금 안내",  to: "/주보?tab=예물" },
];

export default function SearchSection() {
  const { setOpen } = useSearch();
  const [value, setValue] = useState("");

  return (
    <section className="w-full py-[100px] pb-[60px] flex flex-col items-center">
      {/* Eye label */}
      <p className="text-caption font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
        QUICK FIND
      </p>

      <h2 className="text-[38px] font-bold tracking-[-1.2px] text-grey-12 mb-8 text-center leading-[1.3]">
        원하는 기능을 빠르게 찾아보세요
      </h2>

      {/* Search bar */}
      <label
        className="flex items-center gap-4 px-8 rounded-full cursor-text transition-all duration-200 w-full max-w-[900px]"
        style={{
          height: "70px",
          background: "var(--tw-color-bluegrey-1, #f4f5f6)",
          border: "2px solid #dde0e5",
        }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = "#3d5588";
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.boxShadow = "0 0 0 6px rgba(61,85,136,.08)";
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = "#dde0e5";
          e.currentTarget.style.background = "#f4f5f6";
          e.currentTarget.style.boxShadow = "none";
        }}
        onClick={() => setOpen(true)}
      >
        <img src={IcoSearch} className="w-[26px] h-[26px] shrink-0" alt="" />
        <input
          type="text"
          placeholder="예배, 주보, 성경, 오시는 길…"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={e => setValue(e.target.value)}
          className="flex-1 bg-transparent border-0 outline-none text-sub-tit-3 text-grey-11 placeholder:text-grey-5"
        />
        {value && (
          <button
            className="w-8 h-8 rounded-full bg-bluegrey-2 text-grey-7 text-xl flex items-center justify-center hover:bg-bluegrey-3 transition-colors"
            onClick={e => { e.stopPropagation(); setValue(""); }}
          >
            ×
          </button>
        )}
      </label>

      {/* Quick suggestions */}
      <div className="flex items-center gap-2.5 mt-6 flex-wrap justify-center">
        {SUGGESTIONS.map(s => (
          <Link
            key={s.label}
            to={s.to}
            className="px-4 py-2 rounded-full border border-bluegrey-2 bg-white text-sm font-medium text-grey-9 hover:border-blue-5 hover:text-primary hover:bg-blue-1 transition-all"
          >
            # {s.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
