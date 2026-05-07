import { useChurch } from "@/contexts/ChurchContext";
import defaultBanner from "@/assets/default_banner.png";

export default function MainBanner() {
  const { church } = useChurch();
  const { url, title, subtitle } = church.mainBanner;
  const bgImage = url || defaultBanner;

  return (
    <section className="relative h-[820px] bg-black overflow-hidden">
      <style>{`
        @keyframes heroPan {
          from { transform: scale(1.04) translateX(-1%); }
          to   { transform: scale(1.04) translateX(1%); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover"
          style={{ animation: "heroPan 18s ease-in-out infinite alternate" }}
        />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "linear-gradient(180deg, rgba(0,0,0,.20) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 70%, rgba(0,0,0,.85) 100%)",
            "radial-gradient(80% 60% at 80% 30%, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 100%)",
          ].join(","),
        }}
      />

      {/* Content */}
      <div className="relative h-full max-w-[1576px] mx-auto px-[120px] flex flex-col justify-end pb-[100px]">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2.5 self-start px-4 py-2 rounded-full mb-7 text-sm font-medium"
          style={{
            border: "1px solid rgba(255,255,255,.35)",
            backdropFilter: "blur(6px)",
            color: "rgba(255,255,255,.92)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-blue-4"
            style={{ boxShadow: "0 0 0 4px rgba(160,196,107,.25)" }}
          />
          <span>2026 봄 — 함께 드리는 예배</span>
        </div>

        {/* Verse */}
        <p
          className="m-0 text-white font-semibold leading-[1.12] tracking-[-2px]"
          style={{
            fontSize: "80px",
            whiteSpace: "pre-line",
            textShadow: "0 4px 30px rgba(0,0,0,.35)",
          }}
        >
          {title}
        </p>

        {/* Citation */}
        <div
          className="mt-7 text-[19px] leading-[1.7]"
          style={{ color: "rgba(255,255,255,.85)", whiteSpace: "pre-line", maxWidth: "720px" }}
        >
          {subtitle}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3.5 mt-10">
          <button className="inline-flex items-center gap-3 px-7 py-[18px] rounded-full bg-white text-blue-10 font-semibold text-[17px] tracking-[-0.3px] hover:bg-blue-4 hover:text-white hover:-translate-y-0.5 transition-all duration-200">
            <span>이번 주 예배 보기</span>
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4l14 8-14 8z" />
            </svg>
          </button>
          <button
            className="inline-flex items-center gap-3 px-7 py-[18px] rounded-full font-semibold text-[17px] tracking-[-0.3px] text-white hover:-translate-y-0.5 transition-all duration-200"
            style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.4)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.18)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
          >
            <span>예배 안내</span>
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute right-[60px] bottom-[60px] flex flex-col items-center gap-3.5 text-[11px] font-semibold tracking-[0.3em]"
        style={{ color: "rgba(255,255,255,.7)" }}
      >
        <span>SCROLL</span>
        <div
          className="w-px h-[60px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 100%)",
            animation: "scrollPulse 2s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
