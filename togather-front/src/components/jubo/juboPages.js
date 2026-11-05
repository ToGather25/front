import JuboV2Page1 from "./JuboV2Page1";
import JuboV2Page2 from "./JuboV2Page2";
import JuboV2Page3 from "./JuboV2Page3";
import JuboV2Page4 from "./JuboV2Page4";
import JuboV2Page5 from "./JuboV2Page5";
import JuboV2Page6 from "./JuboV2Page6";
import JuboV2Page7 from "./JuboV2Page7";
import JuboV2Page8 from "./JuboV2Page8";

// 주보 뷰어(JuboPageSystem)와 PDF 다운로드(Jubo.jsx)가 공유하는 페이지 순서/구성 — version2(8페이지).
export const JUBO_PAGES_V2 = [
  { id: "page1", title: "주보", Component: JuboV2Page1 },
  { id: "page2", title: "예배 안내", Component: JuboV2Page2 },
  { id: "page3", title: "오후·수요예배", Component: JuboV2Page3 },
  { id: "page4", title: "새벽기도·교회소식", Component: JuboV2Page4 },
  { id: "page5", title: "예물·기도·봉사안내", Component: JuboV2Page5 },
  { id: "page6", title: "구역·주차안내", Component: JuboV2Page6 },
  { id: "page7", title: "후원·섬기는분들", Component: JuboV2Page7 },
  { id: "page8", title: "교회 안내", Component: JuboV2Page8 },
];
