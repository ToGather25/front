import { JUBO_PAGES_V2 } from "./juboPages";
import { JUBO_PAGES_V1 } from "./juboPagesV1";

/** order(인덱스 쌍)대로 pages를 짝지어 PRINT_ROWS 모양(가로 A4 한 장당 좌/우 페이지)을 만든다. */
function printRows(pages, order) {
  return order.map(([left, right]) => [pages[left], pages[right]]);
}

export const JUBO_VERSIONS = {
  // 4페이지 — 1장 양면 중철: 앞면 4|1, 뒷면 2|3.
  v1: { pages: JUBO_PAGES_V1, printRows: printRows(JUBO_PAGES_V1, [[3, 0], [1, 2]]) },
  // 8페이지 — 기존 4장 양면 중철 순서(useJuboPdfDownload.jsx 주석 참고).
  v2: {
    pages: JUBO_PAGES_V2,
    printRows: printRows(JUBO_PAGES_V2, [[7, 0], [1, 6], [5, 2], [3, 4]]),
  },
};

/** church.juboTemplateVersion으로 페이지 배열/PDF 조판 순서를 고른다. 값이 없거나 모르는
 * 값이면 v1(4페이지)을 기본으로 쓴다 — 백엔드가 아직 안 내려주는 교회는 신규 템플릿부터 본다. */
export function resolveJuboVersion(church) {
  return JUBO_VERSIONS[church?.juboTemplateVersion] ?? JUBO_VERSIONS.v1;
}
