import { useSearchParams } from "react-router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboIssue } from "@/services/juboService";
import { JuboPage } from "@/components/jubo/shared";
import Cover from "@/components/jubo/Cover";
import JuboSection2 from "@/components/jubo/JuboSection2";
import JuboSection3 from "@/components/jubo/JuboSection3";
import JuboSection4 from "@/components/jubo/JuboSection4";
import JuboSection5 from "@/components/jubo/JuboSection5";
import Sermon from "@/components/jubo/Sermon";
import Giving from "@/components/jubo/Giving";
import PrayerTopics from "@/components/jubo/PrayerTopics";
import Worship from "@/components/jubo/Worship";
import News from "@/components/jubo/News";
import Service from "@/components/jubo/Service";
import Offering from "@/components/jubo/Offering";
import Support from "@/components/jubo/Support";
import District from "@/components/jubo/District";
import Ministers from "@/components/jubo/Ministers";
import Direction from "@/components/jubo/Direction";

const SECTIONS = [
  { id: "cover", label: "표지", section: "cover" },
  { id: "worship-news", label: "예배 및 소식", section: "section2" },
  { id: "service-offering", label: "봉사 및 예물 안내", section: "section3" },
  { id: "support-district", label: "후원 및 구역 안내", section: "section4" },
  { id: "others", label: "기타안내", section: "section5" },
];

const ALL_TABS = ["표지", "예배 및 소식", "봉사 및 예물", "후원 및 구역", "기타안내", "말씀", "헌금", "기도제목"];

function renderContent(section, issue) {
  switch (section) {
    case "cover":
      return (
        <JuboPage noPadding>
          <Cover issue={issue} />
        </JuboPage>
      );
    case "section2":
      return <JuboSection2 />;
    case "section3":
      return <JuboSection3 />;
    case "section4":
      return <JuboSection4 />;
    case "section5":
      return <JuboSection5 />;
    case "sermon":
      return (
        <JuboPage>
          <Sermon issue={issue} />
        </JuboPage>
      );
    case "giving":
      return (
        <JuboPage>
          <Giving />
        </JuboPage>
      );
    case "prayer":
      return (
        <JuboPage>
          <PrayerTopics />
        </JuboPage>
      );
    default:
      return null;
  }
}

export default function Jubo() {
  const { church } = useChurch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "cover";
  const issueId = searchParams.get("issue");
  const { data: issue } = useFetch(
    () => (issueId ? getJuboIssue(church.id, issueId) : Promise.resolve(null)),
    [church.id, issueId],
    null,
  );

  const currentSection = SECTIONS.find(s => s.section === activeSection);

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
      const pagePixelHeight = canvasHeight / 6;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      for (let pageNum = 0; pageNum < 6; pageNum++) {
        const startY = pageNum * pagePixelHeight;
        const cropHeight = Math.min(pagePixelHeight, canvasHeight - startY);

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

      const issueNo = issue?.issueNo || "주보";
      const date = issue?.dateLabel?.replace(/\s/g, "-") || new Date().toISOString().split("T")[0];
      pdf.save(`${issueNo}-${date}.pdf`);
    } catch (error) {
      console.error("PDF 생성 실패:", error);
    }
  };

  const isCoverPage = activeSection === "cover";
  const sections = SECTIONS.slice(1); // cover 제외한 섹션들 (section2-5)

  return (
    <div className="w-full bg-grey-1">
      {/* 헤더 */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">스마트 주보</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="bg-white">
        {/* 서브 헤더: 목록으로 | 제목 | PDF 다운로드 */}
        <div className="border-b border-bluegrey-2">
          <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSearchParams({})}
              className="flex items-center gap-2 text-body-4 font-medium text-primary hover:opacity-70"
            >
              <span>←</span>
              <span>목록으로</span>
            </button>

            <h2 className="text-headline-5 font-bold text-grey-12">
              {issue?.dateLabel || "주보"}
            </h2>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 bg-primary text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity text-body-4 font-medium"
            >
              <svg
                className="w-5 h-5"
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
        <div className="max-w-[1400px] mx-auto px-8 py-12">
          <div className="flex gap-8 items-start relative">
            {/* 중앙 메인 콘텐츠 */}
            <div className="flex-1">
              <div className={isCoverPage ? "max-w-xl mx-auto" : ""}>
                {renderContent(activeSection, issue)}
              </div>
            </div>

            {/* 우측 섹션 미리보기 (연하게) */}
            <div className="w-80 shrink-0 relative h-96">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setSearchParams({ section: section.section, issue: issueId })}
                  className="absolute inset-0 bg-white rounded-5 shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:opacity-100"
                  style={{
                    zIndex: 10 - idx,
                    opacity: activeSection === section.section ? 0 : 0.4,
                    transform: `translateY(${idx * 16}px) scale(${1 - idx * 0.02})`,
                  }}
                >
                  <div className="p-6 text-body-4 text-grey-8 font-medium pointer-events-none">
                    {section.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 숨겨진 PDF 렌더 영역 */}
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
      </div>
    </div>
  );
}
