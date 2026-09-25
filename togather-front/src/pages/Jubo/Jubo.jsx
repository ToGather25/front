import { useSearchParams } from "react-router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboIssue } from "@/services/juboService";
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
function renderTab(tab, issue) {
  switch (tab) {
    case "표지":
      return (
        <JuboPage noPadding>
          <Cover issue={issue} />
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
          <Sermon issue={issue} />
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
  const { church } = useChurch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "표지";
  const issueId = searchParams.get("issue");
  const { data: issue } = useFetch(
    () => (issueId ? getJuboIssue(church.id, issueId) : Promise.resolve(null)),
    [church.id, issueId],
    null,
  );

  const handleDownloadPdf = async () => {
    const element = document.querySelector(".jubo-print-wrapper-all");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 1200,
        windowWidth: 1200,
      });

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pagePixelHeight = canvasHeight / 6; // 6개 페이지로 나누기

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // 6개 페이지로 나눠서 PDF에 추가
      for (let pageNum = 0; pageNum < 6; pageNum++) {
        const startY = pageNum * pagePixelHeight;
        const cropHeight = Math.min(pagePixelHeight, canvasHeight - startY);

        // 현재 페이지의 캔버스 자르기
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvasWidth;
        pageCanvas.height = cropHeight;

        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0, startY,
          canvasWidth, cropHeight,
          0, 0,
          canvasWidth, cropHeight
        );

        const imgData = pageCanvas.toDataURL("image/png");
        if (pageNum > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      }

      // issueNo와 date로 파일명 생성
      const issueNo = issue?.issueNo || "주보";
      const date = issue?.dateLabel?.replace(/\s/g, "-") || new Date().toISOString().split("T")[0];
      pdf.save(`${issueNo}-${date}.pdf`);
    } catch (error) {
      console.error("PDF 생성 실패:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-sub-tit-1 font-bold text-grey-12">스마트 주보</h1>

          {/* PDF 다운로드 버튼 — 데스크톱에만 표시 */}
          <button
            onClick={handleDownloadPdf}
            title="PDF 다운로드"
            className="hidden md:block bg-bluegrey-1 border border-bluegrey-3 rounded-lg p-2 hover:bg-bluegrey-2 transition-colors shrink-0"
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

        <div className="flex gap-0 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSearchParams(issueId ? { tab, issue: issueId } : { tab })}
              className={`shrink-0 w-20 h-10 flex items-center justify-center text-body-3 border text-xs transition-colors font-medium ${
                activeTab === tab
                  ? "bg-primary border-primary text-white font-semibold"
                  : "bg-white border-grey-5 text-grey-8 hover:bg-bluegrey-1 hover:border-primary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 화면: 현재 탭만 표시 */}
      <div className="jubo-single-tab">{renderTab(activeTab, issue)}</div>

      {/* PDF 저장용: 모든 탭을 2개씩 그룹화 (화면 밖) */}
      <div className="jubo-print-wrapper-all" style={{ position: "absolute", left: "-9999px", top: 0, width: "297mm" }}>
        <div style={{ display: "flex", width: "297mm", height: "210mm", gap: 0 }}>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Cover issue={issue} />
            </JuboPage>
          </div>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Worship />
            </JuboPage>
          </div>
        </div>

        <div style={{ display: "flex", width: "297mm", height: "210mm", gap: 0 }}>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <News />
            </JuboPage>
          </div>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Service />
            </JuboPage>
          </div>
        </div>

        <div style={{ display: "flex", width: "297mm", height: "210mm", gap: 0 }}>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Offering />
            </JuboPage>
          </div>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Support />
            </JuboPage>
          </div>
        </div>

        <div style={{ display: "flex", width: "297mm", height: "210mm", gap: 0 }}>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <District />
            </JuboPage>
          </div>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Ministers />
            </JuboPage>
          </div>
        </div>

        <div style={{ display: "flex", width: "297mm", height: "210mm", gap: 0 }}>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Direction />
            </JuboPage>
          </div>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Sermon issue={issue} />
            </JuboPage>
          </div>
        </div>

        <div style={{ display: "flex", width: "297mm", height: "210mm", gap: 0 }}>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <Giving />
            </JuboPage>
          </div>
          <div style={{ width: "148.5mm", height: "210mm", overflow: "hidden", flexShrink: 0 }}>
            <JuboPage noPadding style={{ width: "100%", minHeight: "210mm", margin: 0, padding: 0 }}>
              <PrayerTopics />
            </JuboPage>
          </div>
        </div>
      </div>
    </div>
  );
}
