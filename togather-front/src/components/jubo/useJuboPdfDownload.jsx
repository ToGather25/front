import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { JUBO_PAGES } from "./juboPages";
import { JuboPrintModeContext } from "./juboPrintMode";

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

/**
 * 주보 PDF 다운로드 — 페이지 이동 없이 호출한 자리에서 바로 파일로 저장된다.
 * 반환된 `PrintArea`를 트리 아무 데나 렌더해 두고 `download(issue)`를 호출하면,
 * issue에 해당하는 8페이지를 화면 밖에 숨겨서 그린 뒤 캡처해 저장하고 치운다.
 */
export function useJuboPdfDownload() {
  const [renderIssue, setRenderIssue] = useState(null);
  const wrapperRef = useRef(null);

  const download = useCallback((issue) => {
    setRenderIssue(issue);
  }, []);

  useEffect(() => {
    if (!renderIssue || !wrapperRef.current) return;
    let cancelled = false;
    const wrapper = wrapperRef.current;

    void (async () => {
      try {
        await waitForPrintDataReady(wrapper);
        if (cancelled) return;

        const rows = wrapper.querySelectorAll(".jubo-print-row");
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        for (let i = 0; i < rows.length; i++) {
          const canvas = await html2canvas(rows[i], {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
          });
          if (cancelled) return;

          const imgData = canvas.toDataURL("image/png");
          if (i > 0) pdf.addPage("a4", "landscape");
          pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
        }

        const issueNo = renderIssue?.issueNo || "주보";
        const date =
          renderIssue?.date?.replace(/-/g, "") || new Date().toISOString().split("T")[0].replace(/-/g, "");
        pdf.save(`${issueNo}_${date}_주보.pdf`);
      } catch (error) {
        console.error("PDF 생성 실패:", error);
      } finally {
        if (!cancelled) setRenderIssue(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [renderIssue]);

  const PrintArea = renderIssue ? (
    <div ref={wrapperRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
      <JuboPrintModeContext.Provider value={true}>
        {PRINT_ROWS.map(([left, right]) => (
          <div
            key={`${left.id}-${right.id}`}
            className="jubo-print-row"
            style={{ display: "flex", width: STAGE_WIDTH * 2, height: STAGE_HEIGHT }}
          >
            <div style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, flexShrink: 0 }}>
              <left.Component data={renderIssue} />
            </div>
            <div style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, flexShrink: 0 }}>
              <right.Component data={renderIssue} />
            </div>
          </div>
        ))}
      </JuboPrintModeContext.Provider>
    </div>
  ) : null;

  return { PrintArea, download };
}
