import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import IcoSearch from "@/assets/web-icon/search-grey.svg";
import defaultBanner from "@/assets/default_banner.png";

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
        <img src={IcoSearch} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" alt="" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="층 또는 시설명을 검색하세요."
          className="w-full pl-10 pr-4 py-2.5 border border-bluegrey-3 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-primary outline-none transition-all"
        />
      </div>

      {/* 층별 버튼과 사진 */}
      <div className="grid gap-12 items-start" style={{ gridTemplateColumns: "300px 1fr" }}>
        {/* 층별 버튼 그룹 */}
        <div className="flex flex-col w-[300px] shrink-0 bg-white border border-bluegrey-3 rounded-[20px] p-5">
          {church.floorGuide.map(({ floor, rooms }, idx) => {
            const matchesFloor = matchesQuery(floor) || matchesQuery(rooms);
            return (
              <div key={floor}>
                <button
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full px-4 py-2 rounded-xl text-body-3 font-semibold text-left transition-colors ${
                    idx === displayIdx
                      ? "bg-primary text-white"
                      : "text-grey-9 hover:text-primary"
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
                {idx !== church.floorGuide.length - 1 && <div className="bg-grey-2 mx-4" style={{ height: '0.5px' }} />}
              </div>
            );
          })}
        </div>

        {/* 사진 */}
        <div className="w-full overflow-hidden rounded-2xl border border-bluegrey-3 bg-bluegrey-2 shrink-0">
          <img
            src={currentFloor?.image || defaultBanner}
            alt={currentFloor?.floor}
            className="w-full h-auto object-cover"
            style={{ aspectRatio: "4/3" }}
          />
        </div>
      </div>
    </div>
  );
}
