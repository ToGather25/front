import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { searchKeywords } from "@/config/search.config";
import HighlightText from "@/components/common/HighlightText";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const results = searchKeywords(q);
  const [inputValue, setInputValue] = useState(q);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <form
        onSubmit={handleSearch}
        className="sticky z-30 bg-white border-b border-bluegrey-2 py-3 mb-6"
        style={{ top: "var(--header-offset)" }}
      >
        <label className="flex items-center gap-3 h-12 px-4 rounded-full bg-bluegrey-1 border border-transparent focus-within:border-blue-6 focus-within:bg-white transition-all">
          <img src={IcoSearch} className="w-[18px] h-[18px] shrink-0" alt="" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            placeholder="예배, 주보, 성경, 오시는 길…"
            className="flex-1 min-w-0 bg-transparent outline-none text-body-4 text-grey-10 placeholder:text-grey-5"
          />
        </label>
      </form>

      {q.trim() === "" ? (
        <p className="text-body-2 text-grey-8 font-semibold">검색어를 입력해 주세요.</p>
      ) : results.length === 0 ? (
        <p className="text-body-2 text-grey-8 font-semibold">
          '{q}'에 대한 검색 결과가 없습니다.
        </p>
      ) : (
        <div>
          <p className="text-body-4 text-grey-7 mb-2">
            검색결과 <b className="text-primary">{results.length}</b>건
          </p>
          <div className="flex flex-col divide-y divide-bluegrey-2">
            {results.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-4 -mx-3 px-3 py-4 rounded-xl hover:bg-bluegrey-1 transition-colors"
              >
                <span className="flex-1 text-body-2 font-bold text-grey-11">
                  <HighlightText text={item.label} query={q} />
                </span>
                <span className="text-body-4 text-grey-6 shrink-0">{item.category}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
