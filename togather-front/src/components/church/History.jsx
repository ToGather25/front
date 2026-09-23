import { useState, useEffect, useRef } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function History() {
  const { church } = useChurch();
  const items = church.history || [];
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.querySelectorAll("[data-history-item]"));

      // 뷰포트 중간 기준으로 현재 활성 항목 판단
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto">
      <style>{`
        .history-timeline {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          width: 2px;
          height: 80px;
          background: linear-gradient(to bottom, transparent, var(--color-blue-7), transparent);
          pointer-events: none;
          z-index: 10;
        }

        .history-dot {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          width: 16px;
          height: 16px;
          background: white;
          border: 3px solid var(--color-blue-7);
          border-radius: 50%;
          pointer-events: none;
          z-index: 11;
          transition: transform 0.2s ease-out;
        }
      `}</style>

      <div className="history-timeline" />
      <div className="history-dot" />

      <div className="space-y-16 py-20">
        {items.map((item, index) => (
          <div
            key={index}
            data-history-item
            className={`transition-opacity duration-300 ${
              Math.abs(index - activeIndex) <= 1 ? "opacity-100" : "opacity-40"
            }`}
          >
            <div className={`flex gap-8 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
              {/* 좌측 이미지 영역 */}
              <div className="flex-1">
                <div className="w-full h-48 bg-grey-2 rounded-2xl" />
              </div>

              {/* 우측 콘텐츠 */}
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-headline-3 font-bold text-grey-11 mb-4">{item.era}</h3>
                <div className="space-y-2">
                  {item.events.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-body-4 font-medium text-blue-7 w-20 shrink-0">
                        {event.date}
                      </span>
                      <span className="text-body-4 text-grey-8">{event.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
