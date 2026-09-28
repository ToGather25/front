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
import JuboPageSystem from "@/components/jubo/JuboPageSystem";

export default function Jubo() {
  const { church } = useChurch();
  const [searchParams, setSearchParams] = useSearchParams();
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

        {/* JuboPageSystem 마운트 */}
        <JuboPageSystem issue={issue} onDownloadPdf={handleDownloadPdf} />
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
