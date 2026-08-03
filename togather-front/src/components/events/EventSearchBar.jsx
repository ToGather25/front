import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

/**
 * 행사 검색 입력창. 캘린더 헤더 / 검색결과 페이지 상단에서 공용으로 사용.
 * @param {{
 *   defaultValue?: string,
 *   placeholder?: string,
 *   onSubmit?: (q: string) => void,  // 미지정 시 /교회행사/검색?q=... 로 이동
 *   className?: string,
 *   autoFocus?: boolean,
 * }} props
 */
export default function EventSearchBar({
  defaultValue = "",
  placeholder = "행사명, 장소, 내용으로 검색",
  onSubmit,
  className = "",
  autoFocus = false,
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(defaultValue);

  useEffect(() => {
    setQ(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (onSubmit) onSubmit(trimmed);
    else navigate(`/교회행사/검색?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 h-11 px-4 bg-bluegrey-1 rounded-full border border-transparent focus-within:border-blue-6 focus-within:bg-white transition-all ${className}`}
    >
      <img src={IcoSearch} className="w-[18px] h-[18px] shrink-0" alt="" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 min-w-0 bg-transparent outline-none text-body-4 text-grey-10 placeholder:text-grey-5"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="shrink-0 w-5 h-5 flex items-center justify-center text-grey-5 hover:text-grey-8"
          aria-label="검색어 지우기"
        >
          ×
        </button>
      )}
      <button
        type="submit"
        className="hidden sm:inline-flex shrink-0 px-4 py-1.5 rounded-full bg-primary text-white text-body-5 font-semibold hover:bg-blue-8 transition-colors"
      >
        검색
      </button>
    </form>
  );
}
