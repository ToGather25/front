import JuboV1Page1 from "./JuboV1Page1";
import JuboV1Page2 from "./JuboV1Page2";
import JuboV1Page3 from "./JuboV1Page3";
import JuboV1Page4 from "./JuboV1Page4";

// version1(4페이지) 템플릿의 페이지 순서/구성 — juboPages.js(JUBO_PAGES_V2)의 4페이지 버전.
export const JUBO_PAGES_V1 = [
  { id: "v1-page1", title: "표지 · 주일예배", Component: JuboV1Page1 },
  { id: "v1-page2", title: "교회소식 · 조모임 · 헌금", Component: JuboV1Page2 },
  { id: "v1-page3", title: "설교요약 · 예배안내", Component: JuboV1Page3 },
  { id: "v1-page4", title: "예배시간 · 오시는 길", Component: JuboV1Page4 },
];
