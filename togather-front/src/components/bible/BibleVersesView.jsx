import { useState } from "react";

export default function BibleVersesView({ mode = "read", items = [], mockItems = [], onRemove }) {
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);

  const displayList = items.length > 0 ? items : mockItems;
  const filtered = displayList.filter(v => {
    const book = v.book || v.bookName || "";
    if (search && !v.text.includes(search) && !book.includes(search)) return false;
    return true;
  });

  const emptyMessage = mode === "read" ? "저장된 구절이 없습니다." : "필사한 구절이 없습니다.";
  const emptySubMessage = mode === "read"
    ? "성경 읽기에서 ♥를 눌러 구절을 저장하세요."
    : "성경 쓰기에서 구절을 완성하면 자동으로 저장됩니다.";

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* 상단 검색/필터 바 */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-bluegrey-2 bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border border-bluegrey-2 rounded-full flex-1 max-w-sm">
          <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5 bg-transparent"
            placeholder="검색할 내용을 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {mode === "read" && (
          <button
            onClick={() => setFavOnly(v => !v)}
            className={`px-5 py-2.5 rounded-full text-body-4 font-medium border transition-colors whitespace-nowrap ${
              favOnly ? "bg-primary text-white border-primary" : "border-bluegrey-2 text-grey-8 hover:border-blue-5"
            }`}
          >
            좋아하는 구절만 읽기
          </button>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-12 h-12 text-grey-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mode === "read"
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              }
            </svg>
            <p className="text-body-3 text-grey-6">{emptyMessage}</p>
            <p className="text-body-4 text-grey-4 mt-1">{emptySubMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {filtered.map(v => {
              const displayBook = v.book || v.bookName || "";
              const displayVerse = v.num ?? v.verse;
              return (
                <div key={v.key} className="flex flex-col">
                  <div className="bg-white border border-bluegrey-2 rounded-2xl px-6 py-5 flex-1 flex flex-col justify-between min-h-[140px]">
                    <p className="text-body-3 text-grey-10 leading-relaxed">{v.text}</p>
                    <p className="text-body-4 text-grey-7 mt-4 text-right">
                      {displayBook} {v.chapter}장 {displayVerse}절
                    </p>
                  </div>
                  {mode === "read" && onRemove && (
                    <div className="flex justify-end pr-1 mt-1">
                      <button onClick={() => onRemove(v.key)} className="p-1 text-red-400">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
