import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const totalFloors = church.floorGuide.length;

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev === 0 ? totalFloors - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev === totalFloors - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* 가로 버튼 */}
      <div className="flex mb-8 overflow-x-auto">
        {church.floorGuide.map(({ floor }, i) => (
          <button
            key={floor}
            onClick={() => setSelectedIdx(i)}
            className={`flex-1 px-4 py-3 border border-bluegrey-2 whitespace-nowrap transition-all text-body-3 font-semibold ${
              i === selectedIdx
                ? "bg-primary text-white border-primary"
                : "bg-white text-grey-8 hover:bg-bluegrey-1"
            }`}
          >
            {floor}
          </button>
        ))}
      </div>

      {/* 캐러셀 이미지 */}
      <div className="w-full relative">
        {/* 이미지 컨테이너 */}
        <div className="overflow-hidden rounded-2xl bg-bluegrey-2">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${selectedIdx * 100}%)`,
            }}
          >
            {church.floorGuide.map(({ floor, image }) => (
              <div
                key={floor}
                className="w-full flex-shrink-0 aspect-[4/3]"
              >
                {image ? (
                  <img
                    src={image}
                    alt={`${floor} 사진`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-grey-5">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-body-5">{floor} 사진</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 네비게이션 화살표 */}
        <button
          onClick={handlePrev}
          aria-label="이전"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          aria-label="다음"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 페이지 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {church.floorGuide.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === selectedIdx ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`${i + 1}번 슬라이드`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
