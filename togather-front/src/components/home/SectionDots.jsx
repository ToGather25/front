import { useCallback, useEffect, useRef, useState } from "react";
import floatingDefault from "@/assets/icon-svg/floating-default.svg";
import floatingHover from "@/assets/icon-svg/floating-hover.svg";

const SECTION_SELECTOR = "[data-home-section]";

export default function SectionDots() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const isScrollingRef = useRef(false);
  const lastWheelTimeRef = useRef(0);

  const scrollToSectionRef = useCallback((index) => {
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    const target = sections[index];
    if (!target) return;
    const offset = index === 0 ? 72 : 0;
    isScrollingRef.current = true;
    window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  useEffect(() => {
    function update() {
      const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
      if (sections.length === 0) return;
      const scrollPos = window.scrollY + window.innerHeight / 2;

      // 마지막 섹션의 끝 위치 확인
      const lastSection = sections[sections.length - 1];
      const lastSectionEnd = lastSection.offsetTop + lastSection.offsetHeight;

      // 푸터 영역(페이지 끝)에 있으면 활성화된 점이 없도록 설정
      const pageHeight = document.documentElement.scrollHeight;
      if (window.scrollY + window.innerHeight > pageHeight - 200) {
        setCurrentIndex(sections.length);
        setSectionCount(sections.length);
        return;
      }

      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollPos) idx = i;
      }
      setCurrentIndex(idx);
      setSectionCount(sections.length);
      setIsDark(sections[idx].dataset.dot === "dark");
    }

    function onWheel(e) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 600) return;
      lastWheelTimeRef.current = now;

      if (isScrollingRef.current) return;

      const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
      if (sections.length === 0) return;

      // 현재 스크롤 위치에서 가장 가까운 섹션 찾기
      const scrollPos = window.scrollY + window.innerHeight / 2;
      let currentIdx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollPos) currentIdx = i;
      }

      let nextIndex = currentIdx;
      if (e.deltaY > 0) {
        if (currentIdx < sections.length - 1) nextIndex = currentIdx + 1;
        else return;
      } else if (e.deltaY < 0) {
        if (currentIdx > 0) nextIndex = currentIdx - 1;
        else return;
      }

      e.preventDefault();
      scrollToSectionRef(nextIndex);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("wheel", onWheel);
    };
  }, [currentIndex, scrollToSectionRef]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (sectionCount === 0) return null;

  const isFooterArea = currentIndex >= sectionCount;
  // 점점점 색 버전: 메인/찾아오시는 길(어두운 배경)은 화이트, 중간 섹션들은
  // 메인컬러, 푸터 영역은 디폴트 색 + 60% 투명도로 숨기지 않고 보여준다.
  const dotVariant = isFooterArea ? "footer" : isDark ? "white" : "primary";

  return (
    <>
      <div className={`hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4 transition-opacity ${
        dotVariant === "footer" ? "opacity-60 hover:opacity-100" : "opacity-70 hover:opacity-100"
      }`}>
        {Array.from({ length: sectionCount }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToSectionRef(idx)}
            aria-label={`섹션 ${idx + 1}로 이동`}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === idx
                ? dotVariant === "white"
                  ? "ring-5 ring-blue-2 bg-white"
                  : dotVariant === "primary"
                    ? "ring-5 ring-blue-2 bg-primary"
                    : "ring-5 ring-blue-2 bg-primary-darker"
                : dotVariant === "white"
                  ? "bg-white/40 hover:bg-white/70"
                  : dotVariant === "primary"
                    ? "bg-primary/30 hover:bg-primary/60"
                    : "bg-bluegrey-3 hover:bg-grey-6"
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        className={`hidden md:flex fixed right-8 bottom-30 z-40 items-center justify-center transition-all group ${
          currentIndex >= sectionCount ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ animation: "floatBounce 0.8s ease-in-out infinite" }}
      >
        <style>{`
          @keyframes floatBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}</style>
        <img
          src={floatingDefault}
          alt="위로"
          className="w-16 h-16 group-hover:hidden transition-all"
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" }}
        />
        <img
          src={floatingHover}
          alt="위로"
          className="w-16 h-16 hidden group-hover:block transition-all"
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" }}
        />
      </button>
    </>
  );
}
