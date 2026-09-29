import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import JuboPage1 from "./JuboPage1";
import JuboPage2 from "./JuboPage2";
import JuboPage3 from "./JuboPage3";
import JuboPage4 from "./JuboPage4";

const PAGES = [
  { id: "page1", title: "주보", Component: JuboPage1 },
  { id: "page2", title: "예배 및 소식", Component: JuboPage2 },
  { id: "page3", title: "봉사 및 예물", Component: JuboPage3 },
  { id: "page4", title: "기타안내", Component: JuboPage4 },
];

export default function JuboPageSystem({ issue, onDownloadPdf }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageImages, setPageImages] = useState({});
  const pageRefs = useRef({});

  useEffect(() => {
    const capturePages = async () => {
      const images = {};
      for (let idx = 0; idx < PAGES.length; idx++) {
        if (idx === currentPageIndex) continue;

        const element = pageRefs.current[idx];
        if (!element) {
          console.warn(`Page ${idx} ref not found`);
          continue;
        }

        try {
          // KakaoMap이 있는 요소를 임시로 숨김 (캡처 중 CORS 에러 방지)
          const kakaoMapElement = element.querySelector('.kakao-map-container');
          const originalDisplay = kakaoMapElement ? kakaoMapElement.style.display : null;
          if (kakaoMapElement) {
            kakaoMapElement.style.display = 'none';
          }

          const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowHeight: 842,
            windowWidth: 595,
          });

          // KakaoMap 다시 보이기
          if (kakaoMapElement && originalDisplay !== null) {
            kakaoMapElement.style.display = originalDisplay;
          } else if (kakaoMapElement) {
            kakaoMapElement.style.display = '';
          }

          images[idx] = canvas.toDataURL('image/png');
          console.log(`Captured page ${idx} successfully`);
        } catch (err) {
          console.error(`Failed to capture page ${idx}:`, err);
        }
      }
      setPageImages(images);
    };

    // 약간의 딜레이를 줘서 DOM이 완전히 렌더된 후에 캡처
    const timer = setTimeout(() => {
      capturePages();
    }, 500);

    return () => clearTimeout(timer);
  }, [issue]);

  const handlePageChange = (newIndex) => {
    setCurrentPageIndex(newIndex);
  };

  const currentPage = PAGES[currentPageIndex];
  const CurrentComponent = currentPage.Component;

  return (
    <div className="bg-white">
      {/* 서브 헤더 */}
      <div>
        {/* 첫 번째 줄: 목록으로, 주보 제목 */}
        <div className="border-b border-bluegrey-2">
          <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => {}} // 목록으로 이동 로직 (아직 미구현)
              className="flex items-center gap-2 text-body-4 font-medium text-primary hover:opacity-70"
            >
              <span>←</span>
              <span>목록으로</span>
            </button>
            <div className="w-24" />
          </div>
        </div>

        {/* 두 번째 줄: 날짜와 PDF 다운로드 (양쪽 정렬) */}
        <div className="max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-1.5 h-6 bg-primary rounded" />
            <span className="text-headline-5 font-semibold">{issue?.dateLabel || ""} 주보</span>
          </div>

          <button
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-2 bg-primary-darker text-white rounded-full px-4 py-2 hover:opacity-50 transition-opacity text-body-5 font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
              />
            </svg>
            <span>PDF 다운로드</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 + 우측 미리보기 */}
      <div className="max-w-[1100px] mx-auto px-8 pt-15 py-30">
        <div className="flex gap-8 items-start relative">
          {/* 중앙 메인 콘텐츠 - 고정 높이 842px */}
          <div className="flex-1 relative">
            {/* 페이지 칩 */}
            <div className="absolute -top-5 -left-1.5 z-10 bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
              {currentPageIndex + 1}p. {currentPageIndex === 0 ? '표지' : PAGES[currentPageIndex].title}
            </div>

            <div
              key={currentPage.id}
              className="bg-grey-1 rounded-5 overflow-hidden animate-fadeInSlide h-[842px] w-[595px]"
              style={{ boxShadow: '10px 20px 24px rgba(0, 0, 0, 0.15)' }}
            >
              <div className="h-full overflow-y-auto">
                {CurrentComponent ? (
                  <CurrentComponent data={issue} />
                ) : null}
              </div>
            </div>
          </div>

          {/* 우측 미리보기 (세로 배치, 클릭 가능) */}
          <div className="shrink-0 flex flex-col gap-2 h-[860px] mr-20" style={{ width: '198px' }}>
            {PAGES.map((page, idx) => {
              if (idx === currentPageIndex) return null;

              return (
                <div
                  key={page.id}
                  onClick={() => handlePageChange(idx)}
                  className="flex-1 relative"
                  style={{
                    opacity: 0.6,
                  }}
                >
                  {/* 미리보기 이미지 */}
                  <div className="bg-white rounded-5 shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:opacity-90 w-full h-full">
                    {pageImages[idx] ? (
                      <img
                        src={pageImages[idx]}
                        alt={page.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-grey-2 flex items-center justify-center text-xs text-grey-6">
                        로딩 중...
                      </div>
                    )}
                  </div>

                  {/* 페이지 칩 - 왼쪽 위에 떠있음 */}
                  <div className="absolute -top-1.5 -left-1.5 z-10 bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">
                    {idx + 1}p. {idx === 0 ? '표지' : page.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 숨겨진 페이지 렌더 영역 (캡처용 + PDF) */}
      <div style={{ display: "none", position: "absolute", left: "-9999px" }}>
        {PAGES.map((page, idx) => (
          <div
            key={page.id}
            ref={(el) => {
              if (el) pageRefs.current[idx] = el;
            }}
            className="h-[842px] w-[595px] bg-white"
          >
            <page.Component data={issue} />
          </div>
        ))}
      </div>

      {/* PDF 다운로드용 숨겨진 영역 */}
      <div
        className="jubo-print-wrapper-all"
        style={{ display: "none", position: "absolute", left: "-9999px" }}
      >
        {PAGES.map((page) => (
          <div key={page.id}>
            <page.Component data={issue} />
          </div>
        ))}
      </div>
    </div>
  );
}
