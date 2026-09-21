import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import IcoClose from "@/assets/icon-svg/popup-close.svg";

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
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQ(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (onSubmit) onSubmit(trimmed);
    else void navigate(`/교회행사/검색?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 h-11 px-4 rounded-full border transition-all ${
        focused
          ? "bg-white border-blue-6"
          : "bg-bluegrey-1 border-transparent focus-within:border-blue-6 focus-within:bg-white"
      } ${className}`}
    >
      <img src={IcoSearch} className="w-[18px] h-[18px] shrink-0" alt="" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 min-w-0 bg-transparent outline-none text-body-4 text-grey-10 placeholder:text-grey-5"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="shrink-0 w-3 h-3 flex items-center justify-center text-grey-5 hover:text-grey-8 transition-colors"
          aria-label="검색어 지우기"
        >
          <img src={IcoClose} className="w-full h-full" alt="" />
        </button>
      )}
    </form>
  );
}
