import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboIssue } from "@/services/juboService";
import JuboPageSystem from "@/components/jubo/JuboPageSystem";
import { JUBO_PAGES } from "@/components/jubo/juboPages";
import { JuboPrintModeContext } from "@/components/jubo/juboPrintMode";

// 화면에 보이는 8페이지를 둘씩 묶어 가로 A4(297x210mm) 한 장에 배치한다.
// 4장을 양면 인쇄하면 총 2매(앞뒤 4페이지)로 나온다.
const PRINT_ROWS = [
  [JUBO_PAGES[0], JUBO_PAGES[1]],
  [JUBO_PAGES[2], JUBO_PAGES[3]],
  [JUBO_PAGES[4], JUBO_PAGES[5]],
  [JUBO_PAGES[6], JUBO_PAGES[7]],
];

// JuboPageSystem 뷰어가 각 페이지를 그리는 기준 스테이지 크기(630x892px, A4 비율) —
// 내부 컴포넌트들이 고정 px 레이아웃을 쓰므로 인쇄용 숨김 영역도 같은 크기를 유지해야
// 내용이 깨지지 않는다.
const STAGE_WIDTH = 630;
const STAGE_HEIGHT = 892;

/** 인쇄 영역 각 페이지가 자체 useFetch로 불러오는 데이터가 끝날 때까지 기다린다 —
 * 캡처 시점에 로딩 스피너(BubbleLoader, `.bubble`)가 떠 있으면 그대로 캡처돼버린다.
 * 타임아웃이 지나면 로딩 중이어도 일단 진행한다(데이터가 영영 안 끝나는 경우 대비). */
async function waitForPrintDataReady(container, timeoutMs = 8000, pollMs = 150) {
  const start = Date.now();
  while (container.querySelector(".bubble") && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

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
    const wrapper = document.querySelector(".jubo-print-wrapper");
    const rows = document.querySelectorAll(".jubo-print-row");
    if (!wrapper || !rows.length) return;

    try {
      await waitForPrintDataReady(wrapper);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < rows.length; i++) {
        const canvas = await html2canvas(rows[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      }

      const issueNo = issue?.issueNo || "주보";
      const date = issue?.dateLabel?.replace(/\s/g, "-") || new Date().toISOString().split("T")[0];
      pdf.save(`${issueNo}-${date}.pdf`);
    } catch (error) {
      console.error("PDF 생성 실패:", error);
    }
  };

  // 주보 목록에서 "PDF" 버튼(?download=1)으로 들어온 경우, 상세 페이지의 숨겨진
  // 렌더 영역이 그려진 뒤 자동으로 다운로드를 트리거한다.
  const autoDownloadedRef = useRef(false);
  useEffect(() => {
    if (!issue || searchParams.get("download") !== "1" || autoDownloadedRef.current) return;
    autoDownloadedRef.current = true;
    void handleDownloadPdf();
    const next = new URLSearchParams(searchParams);
    next.delete("download");
    setSearchParams(next, { replace: true });
    // oxlint-disable-next-line exhaustive-deps -- handleDownloadPdf/setSearchParams는
    // 매 렌더 새로 생성되는 함수라 deps에 넣으면 autoDownloadedRef 가드와 무관하게
    // 매번 재실행된다. issue/searchParams 변경 시에만 반응하면 된다.
  }, [issue, searchParams]);

  return (
    <div className="w-full bg-grey-1">
      {/* 헤더 */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">스마트 주보</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 - JuboPageSystem이 서브헤더를 포함 */}
      <div className="bg-white">
        <JuboPageSystem issue={issue} onDownloadPdf={handleDownloadPdf} />
      </div>

      {/* 숨겨진 PDF 렌더 영역 — 8페이지를 2개씩 묶어 가로 A4 4장으로 렌더한다.
          각 .jubo-print-row가 handleDownloadPdf에서 PDF 한 페이지가 된다. */}
      <div className="jubo-print-wrapper" style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <JuboPrintModeContext.Provider value={true}>
          {PRINT_ROWS.map(([left, right]) => (
            <div
              key={`${left.id}-${right.id}`}
              className="jubo-print-row"
              style={{ display: "flex", width: STAGE_WIDTH * 2, height: STAGE_HEIGHT }}
            >
              <div style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, flexShrink: 0 }}>
                <left.Component data={issue} />
              </div>
              <div style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, flexShrink: 0 }}>
                <right.Component data={issue} />
              </div>
            </div>
          ))}
        </JuboPrintModeContext.Provider>
      </div>
    </div>
  );
}
