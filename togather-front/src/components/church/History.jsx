import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

const HISTORY_ROW = ({ era, events, isLast, style }) => (
  <div className="flex gap-5" style={style}>
    <div className="flex flex-col items-center">
      <div className="w-3.5 h-3.5 rounded-full bg-blue-7 ring-4 ring-blue-1 shrink-0 mt-1.5 z-10" />
      {!isLast && <div className="w-px flex-1 bg-grey-3 mt-1.5" />}
    </div>
    <div className="flex-1 pb-6">
      <h3 className="text-headline-4 font-bold text-grey-11 mb-2">{era}</h3>
      <div className="border border-bluegrey-2 rounded-xl overflow-hidden">
        {events.map(({ date, content }, i) => (
          <div
            key={i}
            className="flex items-start gap-4 px-4 py-2.5 border-b border-grey-2 last:border-b-0 text-body-4"
          >
            <span className="text-blue-7 w-24 shrink-0 font-medium">{date}</span>
            <span className="text-grey-8">{content}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function History() {
  const { church } = useChurch();
  const [startIdx, setStartIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const VISIBLE = 2;
  const items = church.history;
  const canUp = startIdx > 0;
  const canDown = startIdx + VISIBLE < items.length;
  const visible = items.slice(startIdx, startIdx + VISIBLE);

  const go = (delta) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setStartIdx((i) => i + delta);
      setFading(false);
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOutUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>

      {(canUp || canDown) && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => go(-1)}
            disabled={!canUp || fading}
            aria-label="이전 시대"
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              canUp && !fading
                ? "border-blue-7 text-blue-7 hover:bg-blue-1"
                : "border-grey-3 text-grey-4 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            disabled={!canDown || fading}
            aria-label="다음 시대"
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              canDown && !fading
                ? "border-blue-7 text-blue-7 hover:bg-blue-1"
                : "border-grey-3 text-grey-4 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {visible.map(({ era, events }, i) => (
        <HISTORY_ROW
          key={`${startIdx}-${era}`}
          era={era}
          events={events}
          isLast={i === visible.length - 1 && !canDown}
          style={
            fading
              ? { animation: `fadeOutUp 0.28s ease-in ${i * 0.06}s both` }
              : { animation: `fadeUp 0.4s ease-out ${i * 0.1}s both` }
          }
        />
      ))}
    </div>
  );
}
