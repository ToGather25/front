import { useEffect, useRef, useState } from "react";
import JuboPage1 from "./JuboPage1";
import JuboPage2 from "./JuboPage2";
import JuboPage3 from "./JuboPage3";
import JuboPage4 from "./JuboPage4";
import JuboPage5 from "./JuboPage5";
import JuboPage6 from "./JuboPage6";
import JuboPage7 from "./JuboPage7";
import JuboPage8 from "./JuboPage8";

const PAGES = [
  { id: "page1", title: "주보", Component: JuboPage1 },
  { id: "page2", title: "예배 및 소식", Component: JuboPage2 },
  { id: "page3", title: "봉사 및 예물", Component: JuboPage3 },
  { id: "page4", title: "기타안내", Component: JuboPage4 },
  { id: "page5", title: "페이지 5", Component: JuboPage5 },
  { id: "page6", title: "페이지 6", Component: JuboPage6 },
  { id: "page7", title: "페이지 7", Component: JuboPage7 },
  { id: "page8", title: "페이지 8", Component: JuboPage8 },
];

export default function JuboPageSystem({ issue, onDownloadPdf }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const thumbScrollRef = useRef(null);
  const [thumbBar, setThumbBar] = useState({ height: 0, top: 0 });

  const handlePageChange = (newIndex) => {
    setCurrentPageIndex(newIndex);
  };

  useEffect(() => {
    const el = thumbScrollRef.current;
    if (!el) return;

    const updateThumbBar = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) {
        setThumbBar({ height: 0, top: 0 });
        return;
      }
      const height = Math.max((clientHeight / scrollHeight) * clientHeight, 24);
      const top = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height);
      setThumbBar({ height, top });
    };

    updateThumbBar();
    el.addEventListener("scroll", updateThumbBar);
    return () => el.removeEventListener("scroll", updateThumbBar);
  }, []);

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
        <div className="max-w-[1400px] mx-auto px-8 pt-8 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-1.5 h-6 bg-primary rounded" />
            <span className="text-headline-5 font-semibold">{issue?.dateLabel || ""} 주보</span>
          </div>

          <button
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-2 text-blue-4 border border-blue-4 rounded-lg px-3 py-1.5 hover:opacity-50 transition-opacity text-body-5 font-medium"
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

      {/* 메인 콘텐츠 - PDF 스타일 */}
      <div className="mx-auto pt-15 py-30 flex justify-center">
        <div className="flex gap-20 items-start relative">
          {/* 메인 콘텐츠 */}
          <div className="relative">
            <div
              key={currentPage.id}
              className="bg-grey-1 rounded-5 overflow-hidden animate-fadeInSlide h-[892px] w-[630px]"
              style={{ boxShadow: '10px 20px 24px rgba(0, 0, 0, 0.15)' }}
            >
              <div className="h-full overflow-y-auto">
                {CurrentComponent ? (
                  <CurrentComponent data={issue} />
                ) : null}
              </div>
            </div>
          </div>

          {/* 오른쪽 썸네일 사이드바 (스크롤) */}
          <div className="relative rounded-3 bg-grey-1 h-[892px]" style={{ width: '188px' }}>
            <div
              ref={thumbScrollRef}
              className="jubo-thumb-scroll flex flex-col gap-4 overflow-y-auto h-full p-4"
            >
              {PAGES.map((page, idx) => {
                const scale = 140 / 630;

                return (
                  <div
                    key={page.id}
                    onClick={() => handlePageChange(idx)}
                    className={`relative shrink-0 rounded-3 overflow-hidden transition-all duration-300 cursor-pointer ${
                      idx === currentPageIndex
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'shadow-md hover:shadow-lg hover:ring-1 hover:ring-primary opacity-70'
                    }`}
                    style={{
                      width: '140px',
                      height: '197px',
                      backgroundColor: '#f5f5f5',
                    }}
                  >
                    {/* 축소된 페이지 미리보기 */}
                    <div
                      style={{
                        position: 'relative',
                        width: '630px',
                        height: '892px',
                        transformOrigin: 'top left',
                        transform: `scale(${scale})`,
                        pointerEvents: 'none',
                      }}
                    >
                      <page.Component data={issue} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 항상 보이는 커스텀 스크롤바 (OS 스크롤바는 유휴 상태에서 사라지므로 직접 그림) */}
            {thumbBar.height > 0 && (
              <div
                className="absolute right-1.5 w-1.5 rounded-full bg-grey-5 pointer-events-none"
                style={{ top: thumbBar.top, height: thumbBar.height }}
              />
            )}
          </div>
        </div>
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
