import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentFloor = church.floorGuide[selectedIdx];

  return (
    <div className="grid gap-12 items-start" style={{ gridTemplateColumns: "260px 1fr" }}>
      {/* 좌측: 층별 버튼 그룹 */}
      <div className="flex flex-col w-[260px] shrink-0 gap-1 bg-white border border-bluegrey-2 rounded-[20px] p-5">
        {church.floorGuide.map(({ floor }, i) => (
          <button
            key={floor}
            onClick={() => setSelectedIdx(i)}
            className={`px-4 py-2.5 rounded-xl text-body-3 font-semibold text-left transition-colors ${
              i === selectedIdx
                ? "bg-primary text-white"
                : "text-grey-9 hover:bg-blue-1 hover:text-primary"
            }`}
          >
            {floor}
          </button>
        ))}
      </div>

      {/* 우측: 이미지 + 정보 */}
      <div>
        {/* 이미지 + 오버레이 텍스트 */}
        <div className="w-full relative overflow-hidden rounded-2xl bg-bluegrey-2">
          {currentFloor?.image ? (
            <>
              <img
                src={currentFloor.image}
                alt={currentFloor.floor}
                className="w-full h-auto object-cover"
                style={{ aspectRatio: "4/3" }}
              />
              {/* 텍스트 오버레이 */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/30 to-transparent p-8">
                <h3 className="text-headline-2 font-bold text-white mb-2">{currentFloor?.floor}</h3>
                <p className="text-body-2 text-white/90">{currentFloor?.rooms}</p>
              </div>
            </>
          ) : (
            <div
              className="w-full flex items-center justify-center bg-grey-2 text-grey-5"
              style={{ aspectRatio: "4/3" }}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-body-5">{currentFloor?.floor} 사진</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
