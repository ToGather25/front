import { useState } from "react";
import { useSearch } from "@/contexts/SearchContext";

const SUGGESTIONS = ["주일 예배", "성경 타자", "오시는 길", "구역모임", "헌금 안내"];

export default function SearchSection() {
  const { setOpen } = useSearch();
  const [value, setValue] = useState("");

  return (
    <section className="w-full py-[100px] pb-[60px] flex flex-col items-center">
      {/* Eye label */}
      <p className="text-[13px] font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
        QUICK FIND
      </p>

      <h2 className="text-[38px] font-bold tracking-[-1.2px] text-grey-12 mb-8 text-center leading-[1.3]">
        원하는 기능을 빠르게 찾아보세요
      </h2>

      {/* Search bar */}
      <label
        className="flex items-center gap-4 px-8 rounded-full cursor-text transition-all duration-200 w-full max-w-[900px]"
        style={{
          height: "80px",
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
        <svg className="w-[26px] h-[26px] text-grey-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          placeholder="예배, 주보, 성경, 오시는 길…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onClick={() => setOpen(true)}
          className="flex-1 bg-transparent border-0 outline-none text-[20px] text-grey-11 placeholder:text-grey-5"
          readOnly
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
        <span className="text-sm font-medium text-grey-7 mr-1">자주 찾는 항목</span>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-full border border-bluegrey-2 bg-white text-sm font-medium text-grey-9 hover:border-blue-5 hover:text-primary hover:bg-blue-1 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}
