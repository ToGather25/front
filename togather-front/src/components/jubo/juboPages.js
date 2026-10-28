import JuboPage1 from "./JuboPage1";
import JuboPage2 from "./JuboPage2";
import JuboPage3 from "./JuboPage3";
import JuboPage4 from "./JuboPage4";
import JuboPage5 from "./JuboPage5";
import JuboPage6 from "./JuboPage6";
import JuboPage7 from "./JuboPage7";
import JuboPage8 from "./JuboPage8";

// 주보 뷰어(JuboPageSystem)와 PDF 다운로드(Jubo.jsx)가 공유하는 페이지 순서/구성.
export const JUBO_PAGES = [
  { id: "page1", title: "주보", Component: JuboPage1 },
  { id: "page2", title: "예배 안내", Component: JuboPage2 },
  { id: "page3", title: "오후·수요예배", Component: JuboPage3 },
  { id: "page4", title: "새벽기도·교회소식", Component: JuboPage4 },
  { id: "page5", title: "예물·기도·봉사안내", Component: JuboPage5 },
  { id: "page6", title: "구역·주차안내", Component: JuboPage6 },
  { id: "page7", title: "후원·섬기는분들", Component: JuboPage7 },
  { id: "page8", title: "교회 안내", Component: JuboPage8 },
];
