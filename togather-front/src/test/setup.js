import "@testing-library/jest-dom";

// jsdom은 window.matchMedia를 구현하지 않으므로 최소 동작하는 mock을 전역으로 제공한다.
// (예: src/pages/Jubo/Jubo.jsx의 인쇄 감지 로직이 사용)
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = function matchMedia(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}
