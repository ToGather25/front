import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

export default function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matchesQuery = (text) => !q || text.toLowerCase().includes(q);

  // 검색어가 있으면 매칭되는 첫 번째 층을 자동으로 선택
  let displayIdx = selectedIdx;
  if (q) {
    const matchedIdx = church.floorGuide.findIndex(
      ({ floor, rooms }) => matchesQuery(floor) || matchesQuery(rooms)
    );
    displayIdx = matchedIdx !== -1 ? matchedIdx : selectedIdx;
  }

  const currentFloor = church.floorGuide[displayIdx];

  return (
    <div className="flex flex-col gap-6">
      {/* 검색 */}
      <div className="relative max-w-[300px] group">
        <img src={IcoSearch} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 brightness-75 group-focus-within:brightness-50 transition-all" alt="" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="층 또는 시설을 검색하세요."
          className="w-full pl-10 pr-4 py-2.5 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-primary outline-none transition-all"
        />
      </div>

      {/* 층별 버튼과 사진 */}
      <div className="grid gap-12 items-start" style={{ gridTemplateColumns: "300px 1fr" }}>
        {/* 층별 버튼 그룹 */}
        <div className="flex flex-col w-[300px] shrink-0 bg-white border border-bluegrey-2 rounded-[20px] p-5">
          {church.floorGuide.map(({ floor, rooms }, idx) => {
            const matchesFloor = matchesQuery(floor) || matchesQuery(rooms);
            return (
              <div key={floor}>
                <button
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full px-4 py-2 rounded-xl text-body-3 font-semibold text-left transition-colors ${
                    idx === displayIdx
                      ? "bg-primary text-white"
                      : "text-grey-9 hover:bg-blue-1 hover:text-primary"
                  }`}
                >
                  {floor}
                </button>
                {matchesFloor && (
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    idx === displayIdx ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0"
                  }`}>
                    <div className="pl-6 text-body-5 text-grey-7 whitespace-pre-line">
                      {rooms}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 사진 */}
        <div className="w-full overflow-hidden rounded-2xl bg-bluegrey-2 shrink-0">
        {currentFloor?.image ? (
          <img
            src={currentFloor.image}
            alt={currentFloor.floor}
            className="w-full h-auto object-cover"
            style={{ aspectRatio: "4/3" }}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center bg-grey-2 text-grey-5"
            style={{ aspectRatio: "4/3" }}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-body-5">{currentFloor?.floor}</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
