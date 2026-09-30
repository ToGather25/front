import { useCallback, useEffect, useRef, useState } from "react";
import floatingDefault from "@/assets/icon-svg/floating-default.svg";
import floatingHover from "@/assets/icon-svg/floating-hover.svg";

const SECTION_SELECTOR = "[data-home-section]";

export default function SectionDots() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const isAutoScrollingRef = useRef(false);

  useEffect(() => {
    function update() {
      const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
      if (sections.length === 0) return;
      const scrollPos = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollPos) idx = i;
      }
      setCurrentIndex(idx);
      setSectionCount(sections.length);
      setIsDark(sections[idx].dataset.dot === "dark");
    }

    function onScroll() {
      if (isAutoScrollingRef.current) return;

      update();

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        snapToNearest();
      }, 300);
    }

    function snapToNearest() {
      const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
      if (sections.length === 0) return;

      const scrollPos = window.scrollY;
      let nearestIdx = 0;
      let minDistance = Math.abs(sections[0].offsetTop - scrollPos);

      for (let i = 1; i < sections.length; i++) {
        const distance = Math.abs(sections[i].offsetTop - scrollPos);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIdx = i;
        }
      }

      const target = sections[nearestIdx];
      const offset = nearestIdx === 0 ? 72 : 0;

      isAutoScrollingRef.current = true;
      window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 800);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToSection = useCallback((index) => {
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    const target = sections[index];
    if (!target) return;
    const offset = index === 0 ? 72 : 0;
    window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (sectionCount === 0) return null;

  const isLastSection = currentIndex >= sectionCount - 1;

  if (isLastSection) {
    return (
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        className="hidden md:flex fixed right-8 bottom-8 z-40 items-center justify-center transition-all group"
      >
        <img src={floatingDefault} alt="위로" className="w-16 h-16 group-hover:hidden transition-all" />
        <img src={floatingHover} alt="위로" className="w-16 h-16 hidden group-hover:block transition-all" />
      </button>
    );
  }

  return (
    <div className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
      {Array.from({ length: sectionCount }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => scrollToSection(idx)}
          aria-label={`섹션 ${idx + 1}로 이동`}
          className={`w-2 h-2 rounded-full transition-all ${
            currentIndex === idx
              ? `ring-5 ring-blue-2 ${isDark ? "bg-white" : "bg-primary-darker"}`
              : "bg-bluegrey-3 hover:bg-grey-6"
          }`}
        />
      ))}
    </div>
  );
}
