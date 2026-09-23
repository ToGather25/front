import { useState, useEffect, useRef } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function History() {
  const { church } = useChurch();
  const historyData = church.history || {};
  const items = historyData.items || [];
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.querySelectorAll("[data-history-item]"));
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

      // 첫 번째 항목부터의 진행도 계산
      const firstItem = children[0];
      if (firstItem) {
        const firstItemTop = firstItem.offsetTop + container.offsetTop;
        const viewportMidpoint = window.scrollY + window.innerHeight / 2;
        const distanceFromFirst = viewportMidpoint - firstItemTop;
        const timelineHeight = container.scrollHeight - (firstItem.offsetTop || 0);
        const progress = Math.max(0, Math.min(1, distanceFromFirst / timelineHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="mb-20">
        <p className="text-body-2 text-grey-8 leading-relaxed mb-12 whitespace-pre-wrap">
          {historyData.description}
        </p>
        <h2 className="text-8xl font-bold text-blue-1 text-center">
          since {historyData.foundedYear}
        </h2>
      </div>

      {/* 타임라인 섹션 */}
      <div ref={containerRef} className="relative">
        <style>{`
          .history-timeline {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 2px;
            height: 100%;
            background: var(--color-grey-3);
            pointer-events: none;
            z-index: 5;
          }

          .history-timeline-fill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: var(--color-blue-7);
          }

          .history-dot {
            position: absolute;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            width: 16px;
            height: 16px;
            background: white;
            border: 3px solid var(--color-blue-7);
            border-radius: 50%;
            pointer-events: none;
            z-index: 11;
          }
        `}</style>

        <div className="history-timeline">
          <div
            className="history-timeline-fill"
            style={{
              height: `${scrollProgress * 100}%`,
              boxShadow: `0 -20px 20px -10px rgba(59, 82, 128, 0.3)`
            }}
          />
        </div>
        <div
          className="history-dot"
          style={{ top: `${scrollProgress * 100}%` }}
        />

        <div className="space-y-16 py-20">
        {items.map((item, index) => (
          <div
            key={index}
            data-history-item
            className={`transition-opacity duration-300 ${
              Math.abs(index - activeIndex) <= 1 ? "opacity-100" : "opacity-40"
            }`}
          >
            <div className={`flex gap-20 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
              {/* 이미지 영역 */}
              <div className="flex-1">
                <div className="w-full h-80 bg-grey-2 rounded-2xl" />
              </div>

              {/* 콘텐츠 */}
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
    </div>
  );
}
