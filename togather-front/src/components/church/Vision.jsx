import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import Vision1 from "@/assets/icon-svg/vision-1.png";
import Vision2 from "@/assets/icon-svg/vision-2.png";
import Vision3 from "@/assets/icon-svg/vision-3.png";

const VISION_ICONS = [Vision1, Vision2, Vision3];

export default function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const gridCols = items.length === 4 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <div>
      <style>{`
        .vision-card-container {
          perspective: 1000px;
          height: 440px;
        }
        .vision-card-inner {
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
        }
        .vision-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .vision-card-front,
        .vision-card-back {
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: white;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .vision-card-back {
          transform: rotateY(180deg);
          color: var(--color-grey-11);
          white-space: pre-wrap;
        }
      `}</style>

      <div className="mb-12">
        <h3 className="text-sub-tit-2 font-bold text-grey-11 mb-3 whitespace-pre-wrap">{mainTitle}</h3>
        <p className="text-body-2 text-grey-7 whitespace-pre-wrap">{mainVerse}</p>
      </div>

      <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
        {items.map((item, index) => (
          <div
            key={item.label}
            className="vision-card-container"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={`vision-card-inner ${hoveredIndex === index ? "flipped" : ""}`}>
              {/* 앞면 */}
              <div className="vision-card-front">
                {/* 아이콘 원형 배경 */}
                <div className="w-40 h-40 rounded-full bg-blue-1 flex items-center justify-center mb-6 shrink-0 overflow-hidden">
                  <img
                    src={VISION_ICONS[index % VISION_ICONS.length]}
                    alt={item.label}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 제목 */}
                <h4 className="text-sub-tit-4 font-bold text-grey-11 mb-3">{item.label}</h4>

                {/* 설명 */}
                <p className="text-body-4 text-grey-7 leading-relaxed">{item.description}</p>
              </div>

              {/* 뒷면 */}
              <div className="vision-card-back">
                <p className="text-body-3 leading-relaxed">
                  {item.detailedDescription || item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
