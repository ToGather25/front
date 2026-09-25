import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import Vision1 from "@/assets/icon-svg/vision-1.png";
import Vision2 from "@/assets/icon-svg/vision-2.png";
import Vision3 from "@/assets/icon-svg/vision-3.png";
import Vision4 from "@/assets/icon-svg/vision-4.png";
import Vision5 from "@/assets/icon-svg/vision-5.png";
import Vision6 from "@/assets/icon-svg/vision-6.png";
import Vision7 from "@/assets/icon-svg/vision-7.png";

const VISION_ICONS = [Vision1, Vision2, Vision3, Vision4, Vision5, Vision6, Vision7];

export default function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const gridCols = items.length === 4 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <div>
      <style>{`
        .vision-card-container {
          perspective: 4000px;
          perspective-origin: 50% 50%;
          height: 440px;
        }
        .vision-card-inner {
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
          transform-origin: center;
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
          box-shadow: 16px 10px 50px rgba(35, 46, 78, 0.15);
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
          text-align: left;
          align-items: flex-start;
          justify-content: center;
        }
      `}</style>

      <div className="mb-12">
        <h3 className="text-sub-tit-2 font-bold text-grey-11 mb-8 whitespace-pre-wrap">{mainTitle}</h3>
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
                <div className="text-body-1 leading-relaxed space-y-3">
                  {Array.isArray(item.detailedDescription) ? (
                    item.detailedDescription.map((detail, idx) => (
                      <p key={idx}>
                        <span className="font-bold text-grey-11">{detail.title}:</span> <span className="text-grey-9">{detail.text}</span>
                      </p>
                    ))
                  ) : (
                    <p>{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
