import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import defaultBanner from "@/assets/default_banner.png";

function VideoThumb({ channelId, apiKey }) {
  const [videoId, setVideoId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!channelId || !apiKey) return;
    const fetchVideo = async () => {
      try {
        const liveRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
        );
        const liveData = await liveRes.json();
        if (liveData.items?.length > 0) {
          setVideoId(liveData.items[0].id.videoId);
          setIsLive(true);
        } else {
          const recentRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=1&key=${apiKey}`
          );
          const recentData = await recentRes.json();
          if (recentData.items?.length > 0) {
            setVideoId(recentData.items[0].id.videoId);
          }
        }
      } catch {
        setVideoId(null);
      }
    };
    fetchVideo();
    const interval = setInterval(fetchVideo, 60_000);
    return () => clearInterval(interval);
  }, [channelId, apiKey]);

  if (playing && videoId) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1${isLive ? "&mute=1" : ""}`}
          title="예배 영상"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-grey-11 cursor-pointer group"
      onClick={() => videoId && setPlaying(true)}
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

      {/* Bottom meta */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white">
        <p className="text-[15px] font-semibold leading-snug m-0">주일 예배 실시간 방송</p>
        <p className="text-[13px] opacity-75 mt-1 m-0">설교 · 담임목사 · 매주 주일 11:00</p>
      </div>
    </div>
  );
}

export default function WorshipSection() {
  const { church } = useChurch();
  const channelId = church.social?.youtubeChannelId;
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const sermon = {
    date: "2026년 3월 17일 · 주일 1부 예배",
    title: "사랑으로 부르신\n그 자리에서",
    verse: `요한일서 4:7–12 · ${church.pastor || "담임목사"}`,
  };

  return (
    <Section className="py-[120px] bg-white">
      <div className="grid gap-14 items-center" style={{ gridTemplateColumns: "560px 1fr" }}>
        {/* Sermon info */}
        <div className="py-2">
          <p className="text-[13px] font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
            THIS WEEK
          </p>
          <h3 className="text-[44px] font-bold tracking-[-1.2px] text-grey-12 m-0 mb-2">
            이번 주 말씀
          </h3>
          <p className="text-[15px] font-medium text-grey-7 tracking-[0.02em] mt-2 mb-6 m-0">
            {sermon.date}
          </p>
          <div
            className="text-[56px] font-bold leading-[1.18] tracking-[-1.6px] text-grey-12"
            style={{ whiteSpace: "pre-line" }}
          >
            {sermon.title}
          </div>
          <p
            className="mt-5 text-[18px] leading-[1.6] text-grey-9 pl-4 m-0"
            style={{ borderLeft: "3px solid #60749d" }}
          >
            {sermon.verse}
          </p>
          <div className="flex gap-3 mt-9">
            <button className="inline-flex items-center gap-3 px-7 py-[16px] rounded-full bg-blue-8 text-white font-semibold text-[17px] hover:bg-blue-9 hover:-translate-y-0.5 transition-all">
              <span>다시 보기</span>
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </button>
            <button className="inline-flex items-center gap-3 px-7 py-[16px] rounded-full bg-white text-grey-9 font-semibold text-[17px] border border-bluegrey-3 hover:bg-bluegrey-1 hover:border-blue-6 hover:text-blue-8 hover:-translate-y-0.5 transition-all">
              <span>설교 노트</span>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M12 4v12M6 12l6 6 6-6M4 20h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video thumb */}
        <VideoThumb channelId={channelId} apiKey={apiKey} />
      </div>
    </Section>
  );
}
