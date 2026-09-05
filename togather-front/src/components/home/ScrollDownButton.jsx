import { useCallback, useEffect, useState } from "react";

const SECTION_SELECTOR = "[data-home-section]";

/**
 * 홈 화면 섹션을 한 화면 단위로 넘겨주는 플로팅 버튼.
 * 히어로(첫 섹션) 위에서는 흰색, 그 아래 밝은 섹션들 위에서는 어두운 색으로
 * 헤더와 같은 방식으로 대비를 맞춘다. 마지막 섹션(푸터 바로 위)에 도달하면
 * 더 넘어갈 화면이 없으므로 숨긴다.
 */
export default function ScrollDownButton() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);

  useEffect(() => {
    function update() {
      const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
      if (sections.length === 0) return;
      // 헤더는 스크롤 방향에 따라 숨었다 나타났다 하므로(--header-offset이 그때그때
      // 바뀜) 이걸 기준점에 섞으면 경계 판정이 흔들린다 — 대신 뷰포트 중앙이 어느
      // 섹션을 지나고 있는지로 판정해 헤더 상태와 무관하게 안정적으로 만든다.
      const scrollPos = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollPos) idx = i;
      }
      setCurrentIndex(idx);
      setSectionCount(sections.length);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToNextSection = useCallback(() => {
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    const next = sections[currentIndex + 1];
    if (!next) return;
    // 헤더 높이만큼 빼서 스크롤하면, 아래로 스크롤할 땐 헤더가 이미 숨어 있는 상태라
    // 그만큼 이전 섹션 끝자락이 화면 위쪽에 살짝 남아 보인다 — 섹션 경계에 정확히
    // 맞춰야 이전 화면이 삐져나오지 않는다.
    window.scrollTo({ top: next.offsetTop, behavior: "smooth" });
  }, [currentIndex]);

  const isLastSection = sectionCount > 0 && currentIndex >= sectionCount - 1;
  if (isLastSection) return null;

  const isOverHero = currentIndex === 0;

  return (
    <button
      type="button"
      onClick={scrollToNextSection}
      aria-label="다음 화면으로 스크롤"
      className={`hidden md:flex fixed left-1/2 -translate-x-1/2 bottom-8 z-40 flex-col items-center gap-2 font-semibold tracking-[0.3em] transition-colors ${
        isOverHero ? "text-white/70 hover:text-white" : "text-grey-6 hover:text-primary"
      }`}
    >
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: "scrollBounce 1.6s ease-in-out infinite" }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
