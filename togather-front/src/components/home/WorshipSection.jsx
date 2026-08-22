import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import defaultBanner from "@/assets/default_banner.png";
import { getLiveSermon } from "@/services/sermonService";

function VideoThumb({ isLive, onClick }) {
  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-grey-11 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <img src={defaultBanner} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

      {/* Play disc */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[72px] h-[72px] rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-blue-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4l14 8-14 8z" />
          </svg>
        </div>
      </div>

      {/* Live badge */}
      {isLive && (
        <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
      )}
    </div>
  );
}

export default function WorshipSection() {
  const { church } = useChurch();
  const navigate = useNavigate();
  const channelId = church.social?.youtubeChannelId;
  const [liveSermon, setLiveSermon] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLiveStatus = async () => {
      try {
        const live = await getLiveSermon(channelId);
        if (!cancelled) setLiveSermon(live);
      } catch (err) {
        console.error("[WorshipSection] 라이브 예배 상태 조회 실패:", err);
      }
    };
    void fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [channelId]);

  const isLive = !!liveSermon;

  const sermon = {
    date: "2026년 3월 17일 · 주일 1부 예배",
    title: isLive ? liveSermon.title : "사랑으로 부르신\n그 자리에서",
    verse: `요한일서 4:7–12 · ${church.pastor || "담임목사"}`,
  };

  return (
    <Section className="pt-[120px] pb-[100px] bg-white">
      <div className="grid gap-14 items-center" style={{ gridTemplateColumns: "560px 1fr" }}>
        {/* Sermon info */}
        <div className="py-2">
          <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0 mb-2">
            이번 주 말씀
          </h3>
          <p className="text-[15px] font-medium text-grey-7 tracking-[0.02em] mt-2 mb-6 m-0">
            {sermon.date}
          </p>
          <div
            className="text-headline-1 font-bold leading-[1.18] tracking-[-1.6px] text-grey-12"
            style={{ whiteSpace: "pre-line" }}
          >
            {sermon.title}
          </div>
          <p
            className="mt-5 text-body-1 leading-[1.6] text-grey-9 pl-4 m-0"
            style={{ borderLeft: "3px solid #60749d" }}
          >
            {sermon.verse}
          </p>
          <div className="flex gap-3 mt-9">
            <Link
              to="/말씀/방송"
              className="inline-flex items-center gap-3 px-7 py-[16px] rounded-full bg-blue-8 text-white font-semibold text-[17px] hover:bg-blue-9 hover:-translate-y-0.5 transition-all"
            >
              <span>{isLive ? "실시간 방송 보기" : "다시 보기"}</span>
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Video thumb */}
        <VideoThumb isLive={isLive} onClick={() => navigate("/말씀/방송")} />
      </div>
    </Section>
  );
}
