import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getChurchProfile } from "@/services/churchProfileService";
import defaultBanner from "@/assets/default_banner.png";

export default function MainBanner() {
  const { church } = useChurch();
  const { data: profile } = useFetch(() => getChurchProfile(church.id), [church.id], null);
  const { title, subtitle } = church.mainBanner;
  const bgImage = profile?.representativeImageUrl || defaultBanner;

  return (
    <section
      className="relative bg-black overflow-hidden"
      style={{
        marginTop: "calc(-1 * var(--header-height, 0px))",
        height: "calc(95vh + var(--header-height, 0px))",
      }}
    >
      <style>{`
        @keyframes heroPan {
          from { transform: scale(1.04) translateX(-1%); }
          to   { transform: scale(1.04) translateX(1%); }
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

      {/* Header scrim — 배너 이미지가 밝은 계열이어도 그 위 투명 헤더의 흰색
          메뉴 글자가 항상 구분되도록, 위 비네트와 별개로 헤더 높이만큼만
          확실하게 어둡게 깐다. 이미지 밝기에 의존하지 않는 고정 대비. */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "var(--header-height, 88px)",
          background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.15) 75%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative h-full max-w-[1400px] mx-auto px-[120px] flex flex-col justify-center">
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
          <Link
            to="/말씀/방송"
            className="inline-flex items-center gap-3 px-7 py-[18px] rounded-full bg-white text-blue-10 font-semibold text-[17px] tracking-[-0.3px] hover:bg-blue-4 hover:text-white hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>이번 주 예배 보기</span>
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4l14 8-14 8z" />
            </svg>
          </Link>
          <Link
            to="/말씀/안내"
            className="inline-flex items-center gap-3 px-7 py-[18px] rounded-full font-semibold text-[17px] tracking-[-0.3px] text-white hover:-translate-y-0.5 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.4)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
          >
            <span>예배 안내</span>
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
