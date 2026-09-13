import { useState } from "react";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import IcoHeartRed from "@/assets/icon-svg/heart-red.svg";

export default function BibleVersesView({
  mode = "read",
  items = [],
  mockItems = [],
  onRemove,
  onSelect,
}) {
  const [search, setSearch] = useState("");
  const [removingKeys, setRemovingKeys] = useState(new Set());

  function handleRemove(key) {
    setRemovingKeys((prev) => new Set(prev).add(key));
    setTimeout(() => {
      onRemove(key);
      setRemovingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 200);
  }

  const displayList = items.length > 0 ? items : mockItems;
  const filtered = displayList.filter((v) => {
    const book = v.book || v.bookName || "";
    if (search && !v.text.includes(search) && !book.includes(search)) return false;
    return true;
  });

  const emptyMessage = mode === "read" ? "저장된 구절이 없습니다." : "필사한 구절이 없습니다.";
  const emptySubMessage =
    mode === "read"
      ? "성경 읽기에서 ♥를 눌러 구절을 저장하세요."
      : "성경 쓰기에서 구절을 완성하면 자동으로 저장됩니다.";

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* 상단 검색 바 — 사이드바 헤더(h-[60px])와 높이를 맞춰 경계선이 나란히 온다 */}
      <div className="shrink-0 flex items-center gap-4 px-4 md:px-8 pt-3 md:pt-0 md:h-[60px] md:border-b md:border-bluegrey-2 bg-white">
        <div className="flex items-center gap-2 px-4 py-2 border border-bluegrey-2 rounded-full flex-1 min-w-0 max-w-sm">
          <img src={IcoSearch} className="w-4 h-4 shrink-0" alt="" />
          <input
            className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5 bg-transparent"
            placeholder="검색할 내용을 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              className="w-12 h-12 text-grey-4 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mode === "read" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                />
              )}
            </svg>
            <p className="text-body-3 text-grey-6">{emptyMessage}</p>
            <p className="text-body-4 text-grey-4 mt-1">{emptySubMessage}</p>
          </div>
        ) : (
          <>
            {/* 모바일: 본문 없이 장·절 참조만 — 누르면 해당 절로 이동 */}
            <div className="md:hidden divide-y divide-bluegrey-1">
              {filtered.map((v) => {
                const displayBook = v.book || v.bookName || "";
                const displayVerse = v.num ?? v.verse;
                const isRemoving = removingKeys.has(v.key);
                return (
                  <div
                    key={v.key}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      isRemoving ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    }`}
                  >
                    <button
                      onClick={() => onSelect?.(v)}
                      className="flex-1 min-w-0 flex items-center justify-between gap-2 py-3.5 text-left"
                    >
                      <span className="text-body-3 text-grey-10 font-medium truncate">
                        {displayBook} {v.chapter}장 {displayVerse}절
                      </span>
                      <svg
                        className="w-4 h-4 text-grey-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                    {mode === "read" && onRemove && (
                      <button onClick={() => handleRemove(v.key)} className="p-1 shrink-0">
                        <img src={IcoHeartRed} className="w-5 h-5" alt="" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 데스크탑: 본문 미리보기 카드 그리드 */}
            <div className="hidden md:grid grid-cols-2 gap-x-6 gap-y-4">
              {filtered.map((v) => {
                const displayBook = v.book || v.bookName || "";
                const displayVerse = v.num ?? v.verse;
                const isRemoving = removingKeys.has(v.key);
                return (
                  <div
                    key={v.key}
                    className={`relative flex flex-col bg-white border border-bluegrey-2 rounded-2xl hover:border-blue-4 transition-all duration-200 ${
                      isRemoving ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    }`}
                  >
                    <button
                      onClick={() => onSelect?.(v)}
                      className="flex-1 flex flex-col justify-between min-h-[140px] px-6 py-5 text-left"
                    >
                      <p className="text-body-3 text-grey-10 leading-relaxed pr-8">{v.text}</p>
                      <p className="text-body-4 text-grey-7 mt-4 text-right">
                        {displayBook} {v.chapter}장 {displayVerse}절
                      </p>
                    </button>
                    {mode === "read" && onRemove && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(v.key);
                        }}
                        className="absolute top-3 right-3 p-1"
                      >
                        <img src={IcoHeartRed} className="w-5 h-5" alt="" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
