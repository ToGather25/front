import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentFloor = church.floorGuide[selectedIdx];

  return (
    <div className="grid gap-12 items-start" style={{ gridTemplateColumns: "260px 1fr" }}>
      {/* 좌측: 층별 버튼 그룹 (서브 메뉴 형태) */}
      <div className="flex flex-col w-[260px] shrink-0 bg-white border border-bluegrey-2 rounded-[20px] p-5">
        {church.floorGuide.map(({ floor, rooms }, i) => (
          <div key={floor}>
            <button
              onClick={() => setSelectedIdx(i)}
              className={`w-full px-4 py-2 rounded-xl text-body-3 font-semibold text-left transition-colors ${
                i === selectedIdx
                  ? "bg-primary text-white"
                  : "text-grey-9 hover:bg-blue-1 hover:text-primary"
              }`}
            >
              {floor}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              i === selectedIdx ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0"
            }`}>
              <div className="pl-6 text-body-5 text-grey-7 whitespace-pre-line">
                {rooms}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 우측: 사진 */}
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
  );
}
