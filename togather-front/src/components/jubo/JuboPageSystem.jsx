import { useState } from "react";
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

      {/* 메인 콘텐츠 + 우측 미리보기 */}
      <div className="max-w-[1100px] mx-auto px-8 pt-15 py-30">
        <div className="flex gap-12 items-start relative">
          {/* 중앙 메인 콘텐츠 - 고정 높이 842px */}
          <div className="flex-1 relative">
            {/* 페이지 네비게이션 */}
            <div className="absolute -top-10 z-10 flex items-center gap-3">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-bluegrey-2 text-blue-4 hover:opacity-70 disabled:opacity-40 transition-opacity"
              >
                &lt;
              </button>
              <span className="text-blue-4 px-1 py-1 rounded-sm text-body-5 font-light whitespace-nowrap">
                {currentPageIndex + 1} / 4
              </span>
              <button
                onClick={() => setCurrentPageIndex(Math.min(3, currentPageIndex + 1))}
                disabled={currentPageIndex === 3}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-bluegrey-2 text-blue-4 hover:opacity-70 disabled:opacity-40 transition-opacity"
              >
                &gt;
              </button>
            </div>

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

          {/* 우측 미리보기 (세로 배치, 클릭 가능) */}
          <div className="shrink-0 flex flex-col gap-3 mr-20" style={{ width: '205px', height: '892px' }}>
            {PAGES.map((page, idx) => {
              if (idx === currentPageIndex) return null;
              const scale = 205 / 620;

              return (
                <div
                  key={page.id}
                  onClick={() => handlePageChange(idx)}
                  className="flex-1 relative bg-white rounded-5 shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:opacity-100"
                  style={{
                    opacity: 0.6,
                  }}
                >
                  {/* 축소된 페이지 미리보기 */}
                  <div
                    style={{
                      position: 'relative',
                      width: '620px',
                      height: '875px',
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
