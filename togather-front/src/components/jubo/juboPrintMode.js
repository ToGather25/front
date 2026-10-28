import { createContext } from "react";

// PDF 인쇄용 숨김 렌더(Jubo.jsx)에서 true로 켠다 — 정적 문서에서는 눌러도 이동하지
// 않는 링크를 보여줄 이유가 없어, 성경봉독 구절을 일반 텍스트로 대체한다.
export const JuboPrintModeContext = createContext(false);
