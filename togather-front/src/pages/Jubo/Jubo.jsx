import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { JuboPage } from "@/components/jubo/shared";
import Cover from "@/components/jubo/Cover";
import Worship from "@/components/jubo/Worship";
import News from "@/components/jubo/News";
import Service from "@/components/jubo/Service";
import Offering from "@/components/jubo/Offering";
import Support from "@/components/jubo/Support";
import District from "@/components/jubo/District";
import Ministers from "@/components/jubo/Ministers";
import Direction from "@/components/jubo/Direction";
import Sermon from "@/components/jubo/Sermon";
import Giving from "@/components/jubo/Giving";
import PrayerTopics from "@/components/jubo/PrayerTopics";

const TABS = [
  "표지",
  "예배",
  "소식",
  "봉사",
  "예물",
  "후원",
  "구역",
  "섬기는 분들",
  "오시는 길",
  "말씀",
  "헌금",
  "기도제목",
];

// ── 탭별 렌더 ──────────────────────────────────────────
function renderTab(tab) {
  switch (tab) {
    case "표지":
      return (
        <JuboPage noPadding>
          <Cover />
        </JuboPage>
      );
    case "예배":
      return (
        <JuboPage>
          <Worship />
        </JuboPage>
      );
    case "소식":
      return (
        <JuboPage>
          <News />
        </JuboPage>
      );
    case "봉사":
      return (
        <JuboPage>
          <Service />
        </JuboPage>
      );
    case "예물":
      return (
        <JuboPage>
          <Offering />
        </JuboPage>
      );
    case "후원":
      return (
        <JuboPage>
          <Support />
        </JuboPage>
      );
    case "구역":
      return (
        <JuboPage>
          <District />
        </JuboPage>
      );
    case "섬기는 분들":
      return (
        <JuboPage>
          <Ministers />
        </JuboPage>
      );
    case "오시는 길":
      return (
        <JuboPage>
          <Direction />
        </JuboPage>
      );
    case "말씀":
      return (
        <JuboPage>
          <Sermon />
        </JuboPage>
      );
    case "헌금":
      return (
        <JuboPage>
          <Giving />
        </JuboPage>
      );
    case "기도제목":
      return (
        <JuboPage>
          <PrayerTopics />
        </JuboPage>
      );
    default:
      return null;
  }
}

// ── 메인 ───────────────────────────────────────────────
export default function Jubo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPrinting, setIsPrinting] = useState(false);
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "표지";

  useEffect(() => {
    function handleBeforePrint() {
      setIsPrinting(true);
    }
    function handleAfterPrint() {
      setIsPrinting(false);
    }
    const mediaQueryList = window.matchMedia("print");
    function handleMediaChange(e) {
      setIsPrinting(e.matches);
    }
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    mediaQueryList.addEventListener("change", handleMediaChange);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      mediaQueryList.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return (
    <>
      <style>{`
        @media print {
          header, footer, .jubo-no-print, .jubo-single-tab { display: none !important; }
          body { margin: 0; background: white; }
          @page { size: A4; margin: 0; }

          .jubo-print-all { display: block !important; }

          .jubo-page {
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          .jubo-page > div {
            height: 100% !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* 헤더 — 프린트 시 숨김 */}
        <div className="jubo-no-print">
          <h1 className="text-sub-tit-1 font-bold text-grey-12 mb-6">스마트 주보</h1>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchParams({ tab })}
                  className={`shrink-0 px-5 py-2 rounded-full text-body-3 border transition-colors font-medium ${
                    activeTab === tab
                      ? "bg-primary border-primary text-white font-semibold"
                      : "bg-white border-bluegrey-3 text-grey-8 hover:border-primary hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 인쇄 / PDF 저장 버튼 */}
            <button
              onClick={() => window.print()}
              title="인쇄 / PDF 저장"
              className="bg-bluegrey-1 border border-bluegrey-3 rounded-lg p-2 hover:bg-bluegrey-2 transition-colors"
            >
              <svg
                className="w-5 h-5 text-grey-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 화면: 현재 탭만 표시 */}
        <div className="jubo-single-tab">{renderTab(activeTab)}</div>

        {/* 인쇄 전용: 모든 탭을 순서대로 렌더 (화면에서는 숨김) — 실제 인쇄 중에만 마운트해 useFetch 중복 호출을 막는다 */}
        {isPrinting && (
          <div className="jubo-print-all" style={{ display: "none" }}>
            <JuboPage noPadding>
              <Cover />
            </JuboPage>
            <JuboPage>
              <Worship />
            </JuboPage>
            <JuboPage>
              <News />
            </JuboPage>
            <JuboPage>
              <Service />
            </JuboPage>
            <JuboPage>
              <Offering />
            </JuboPage>
            <JuboPage>
              <Support />
            </JuboPage>
            <JuboPage>
              <District />
            </JuboPage>
            <JuboPage>
              <Ministers />
            </JuboPage>
            <JuboPage>
              <Direction />
            </JuboPage>
            <JuboPage>
              <Sermon />
            </JuboPage>
            <JuboPage>
              <Giving />
            </JuboPage>
            <JuboPage>
              <PrayerTopics />
            </JuboPage>
          </div>
        )}
      </div>
    </>
  );
}
