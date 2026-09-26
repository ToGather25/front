import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import Vision1 from "@/assets/icon-svg/vision-1.png";
import Vision2 from "@/assets/icon-svg/vision-2.png";
import Vision3 from "@/assets/icon-svg/vision-3.png";
import Vision4 from "@/assets/icon-svg/vision-4.png";
import Vision5 from "@/assets/icon-svg/vision-5.png";
import Vision6 from "@/assets/icon-svg/vision-6.png";
import Vision7 from "@/assets/icon-svg/vision-7.png";
import Polygon from "@/assets/icon-svg/polygon.svg";

const VISION_ICONS = [Vision1, Vision2, Vision3, Vision4, Vision5, Vision6, Vision7];

export default function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const displayItems = (items ?? [])
    .filter(item => item?.title && item?.desc)
    .slice(0, 4);

  return (
    <div>
      <style>{`
        @keyframes typing {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vision-card-container {
          height: 400px;
        }
        .vision-card-front {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          border-radius: 1rem;
          box-shadow: 16px 10px 50px rgba(35, 46, 78, 0.15);
          background-color: white;
          width: 100%;
          height: 100%;
        }
        .typing-text {
          animation: typing 0.8s ease-out forwards;
        }
      `}</style>

      <div className="mb-12">
        <h3 className="text-sub-tit-2 font-bold text-grey-11 mb-2 whitespace-pre-wrap">{mainTitle}</h3>
        <p className="text-body-2 text-grey-7 whitespace-pre-wrap">{mainVerse}</p>
      </div>

      <div className="min-h-[75vh]">
        <div className={`grid gap-6 ${
          {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
          }[displayItems.length] || 'grid-cols-4'
        }`}>
          {displayItems.map((item, index) => (
            <div
              key={item.title}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(0)}
              className={`transition-opacity duration-300 ${
                hoveredIndex !== index ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* 카드 */}
              <div className="vision-card-container">
                <div className="vision-card-front">
                  {/* 아이콘 원형 배경 */}
                  <div className="w-30 h-30 rounded-full bg-blue-1 flex items-center justify-center mb-6 shrink-0 overflow-hidden">
                    <img
                      src={VISION_ICONS[index % VISION_ICONS.length]}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* 제목 */}
                  <h4 className="text-sub-tit-4 font-bold text-grey-11 mb-3">{item.title}</h4>

                  {/* 설명 */}
                  <p className="text-body-4 text-grey-7 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* polygon - hover한 카드 위치에 붙음 (detail이 있을 때만) */}
          {hoveredIndex !== null && displayItems[hoveredIndex] && Array.isArray(displayItems[hoveredIndex].detailedDescription) && (
            <div
              className="col-span-1 flex flex-col items-center justify-start -mt-6.5"
              style={{ gridColumn: `${hoveredIndex + 1}` }}
            >
              <img
                src={Polygon}
                alt="polygon"
                className="w-6 h-6"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))' }}
              />
            </div>
          )}
        </div>

        {/* 타이핑 애니메이션 텍스트 - 전체 너비 (detailedDescription이 있을 때만) */}
        {hoveredIndex !== null && displayItems[hoveredIndex] && Array.isArray(displayItems[hoveredIndex].detailedDescription) && (
          <div className="mt-8">
            <div className="space-y-0">
              {displayItems[hoveredIndex].detailedDescription.map((detail, idx, arr) => (
                <div key={idx}>
                  <div
                    className="typing-text flex gap-3 py-3"
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    <div className={`w-1.5 h-6 rounded-sm shrink-0 mt-1 ${
                      idx === 0 ? 'bg-primary' : 'bg-bluegrey-2'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sub-tit-5 font-bold text-grey-11 mb-1">{detail.title}</p>
                      <p className="text-body-4 text-grey-7">{detail.text}</p>
                    </div>
                  </div>
                  {idx < arr.length - 1 && <div className="mt-2 ml-4 border-t border-dotted border-bluegrey-2" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
