import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import defaultBanner from "@/assets/default_banner.png";
import { getLiveScreen } from "@/services/sermonService";
import ArrowExternal from "@/assets/icon-svg/arrow-external.svg";

function VideoThumb({ isLive, onClick, sermon }) {
  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-grey-11 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <img src={defaultBanner} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

      {/* Sermon info overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <h4 className="text-headline-2 font-bold text-white leading-[1.2] mb-3 whitespace-pre-line">
          {sermon.title}
        </h4>
        <p className="text-body-3 text-white/80 mb-2">{sermon.date}</p>
        <p className="text-body-4 text-white/70">{sermon.verse}</p>
      </div>

      {/* Play disc - show on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
  const { church, loading } = useChurch();
  const navigate = useNavigate();
  const [screen, setScreen] = useState(null);

  useEffect(() => {
    // church context가 아직 로딩 중이면(테넌트 조회 완료 전) X-Church-Id 헤더가
    // 아직 안 실려 있어 401이 난다 — 로딩 완료까지 기다린다.
    if (loading) return;
    let cancelled = false;
    const fetchLiveStatus = async () => {
      try {
        const live = await getLiveScreen(church.id);
        if (!cancelled) setScreen(live);
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
  }, [church.id, loading]);

  const isLive = screen?.state === "LIVE";

  const sermon = {
    date: "2026년 3월 17일 · 주일 1부 예배",
    title: isLive ? (screen.sermon?.title ?? "사랑으로 부르신\n그 자리에서") : "사랑으로 부르신\n그 자리에서",
    verse: `요한일서 4:7–12 · ${church.pastor || "담임목사"}`,
  };

  return (
    <Section className="pt-[120px] pb-[100px] bg-white">
      <div className="grid gap-14 items-start" style={{ gridTemplateColumns: "1fr 520px" }}>
        {/* Left: Video section */}
        <div>
          {/* Title above video */}
          <h3 className="font-bold text-grey-12 m-0 mb-6" style={{ fontSize: "34px", lineHeight: "1.2", letterSpacing: "-0.5px" }}>
            {church.name} 말씀
          </h3>
          <VideoThumb isLive={isLive} onClick={() => navigate("/말씀/방송")} sermon={sermon} />
        </div>

        {/* Right: Worship schedule */}
        <div className="py-2">
          <div className="flex items-center justify-end mb-8">
            <Link
              to="/말씀/방송"
              className="inline-flex items-center gap-2 group"
            >
              <span className="text-body-3 font-light text-bluegrey-4 group-hover:text-blue-8 transition-colors">전체 보기</span>
              <style>{`
                .arrow-icon {
                  stroke: var(--color-bluegrey-4);
                  transition: stroke 0.2s;
                }
                .group:hover .arrow-icon {
                  stroke: white;
                }
              `}</style>
              <div className="w-6 h-6 rounded-full bg-bluegrey-1 group-hover:bg-primary flex items-center justify-center transition-colors">
                <svg
                  className="w-3 h-3 arrow-icon"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 19L19 5M19 5H10M19 5V14" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Worship schedule */}
          <div className="space-y-0">
            {church.worshipDisplay?.map((display, idx) => {
              let timeText = "";
              if (display.isDepartments) {
                timeText = church.worshipSchedule?.departments?.slice(0, 4).map((item) => item.name).join(" | ") || "";
              } else {
                timeText = display.regularIndices?.map((i) => church.worshipSchedule?.regular?.[i]?.time).join(" | ") || "";
              }

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-[auto_1fr] items-center gap-8 ${
                    idx === church.worshipDisplay.length - 1 ? "pt-5" : "py-5"
                  } ${idx < church.worshipDisplay.length - 1 ? "border-b border-dashed border-grey-3" : ""}`}
                >
                  <span className="text-sub-tit-4 font-medium text-bluegrey-9">{display.title}</span>
                  <span className="text-body-4 text-grey-7 whitespace-nowrap">{timeText}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
