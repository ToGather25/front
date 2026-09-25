import { useState } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getChurchProfile } from "@/services/churchProfileService";
import defaultBanner from "@/assets/default_banner.png";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import IcoClose from "@/assets/icon-svg/popup-close.svg";

export default function MainBanner() {
  const navigate = useNavigate();
  const { church } = useChurch();
  const { data: profile } = useFetch(() => getChurchProfile(church.id), [church.id], null);
  const { title, subtitle } = church.mainBanner;
  const bgImage = profile?.representativeImageUrl || defaultBanner;
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) void navigate(`/검색?q=${encodeURIComponent(trimmed)}`);
  };

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
      <div className="relative h-full max-w-[1400px] mx-auto px-[50px] pt-[240px] flex flex-col justify-center">
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

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-3 px-6 rounded-full transition-all duration-200 mt-10 w-full max-w-[460px]`}
          style={{
            height: "56px",
            background: focused ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
          }}
        >
          <input
            type="text"
            placeholder="원하는 기능을 검색해보세요"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`flex-1 bg-transparent border-0 outline-none text-body-1 ${
              focused ? "text-white placeholder:text-white caret-white" : "text-white/70 placeholder:text-white/60"
            }`}
          />
          <button type="submit" aria-label="검색">
            <img src={IcoSearch} className={`w-[22px] h-[22px] shrink-0 transition-opacity ${focused ? "opacity-100" : "opacity-70"}`} alt="" />
          </button>
        </form>
      </div>
    </section>
  );
}
