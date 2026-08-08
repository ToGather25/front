import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = church.floorGuide[selectedIdx];

  return (
    <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
      <style>{`@keyframes floorFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      <div className="flex-1 min-w-0">
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">층별 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {church.floorGuide.map(({ floor, rooms }, i) => (
              <tr
                key={floor}
                onClick={() => setSelectedIdx(i)}
                className={`border-b border-grey-3 cursor-pointer transition-colors ${
                  i === selectedIdx ? "bg-blue-1" : "hover:bg-grey-1"
                }`}
              >
                <td
                  className={`py-3.5 pl-2 w-28 font-semibold ${i === selectedIdx ? "text-primary" : "text-grey-8"}`}
                >
                  {floor}
                </td>
                <td className={`py-3.5 ${i === selectedIdx ? "text-grey-9" : "text-grey-7"}`}>
                  {rooms}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full md:w-[420px] md:shrink-0">
        <div
          key={selected.floor}
          className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bluegrey-2"
          style={{ animation: "floorFadeIn 0.3s ease both" }}
        >
          {selected.image ? (
            <img
              src={selected.image}
              alt={`${selected.floor} 사진`}
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
              <p className="text-body-5">{selected.floor} 사진</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
