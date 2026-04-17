import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import SectionTitle from "@/components/common/SectionTitle";

function ScheduleRow({ name, time }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-body-2 font-semibold text-grey-11 shrink-0 w-28">{name}</span>
      <div className="flex-1 border-t border-dashed border-bluegrey-3" />
      <span className="text-body-3 text-grey-7 shrink-0">{time}</span>
    </div>
  );
}

function VideoPlayer({ channelId, apiKey }) {
  const [videoId, setVideoId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId || !apiKey) {
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        // 1. 라이브 방송 확인
        const liveRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
        );
        const liveData = await liveRes.json();

        if (liveData.items?.length > 0) {
          setVideoId(liveData.items[0].id.videoId);
          setIsLive(true);
        } else {
          // 2. 최근 업로드 영상
          const recentRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=1&key=${apiKey}`
          );
          const recentData = await recentRes.json();

          if (recentData.items?.length > 0) {
            setVideoId(recentData.items[0].id.videoId);
            setIsLive(false);
          } else {
            setVideoId(null);
          }
        }
      } catch (err) {
        console.error("YouTube fetch error:", err);
        setVideoId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
    const interval = setInterval(fetchVideo, 60_000); // 1분마다 재확인
    return () => clearInterval(interval);
  }, [channelId, apiKey]);

  // 로딩 중
  if (loading) {
    return (
      <div className="relative w-full aspect-video bg-bluegrey-1 rounded-xl overflow-hidden animate-pulse" />
    );
  }

  // 채널 미설정 또는 영상 없음
  if (!videoId) {
    return (
      <div className="relative w-full aspect-video bg-bluegrey-1 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-bluegrey-2 flex items-center justify-center">
          <svg className="w-5 h-5 text-bluegrey-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-body-5 text-grey-5">현재 방송이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}${isLive ? "?autoplay=1&mute=1" : ""}`}
        title="예배 영상"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* 라이브 배지 */}
      {isLive && (
        <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-btn-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
      )}
    </div>
  );
}

export default function WorshipSection() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;
  const mid = Math.ceil(regular.length / 2);
  const left = regular.slice(0, mid);
  const right = regular.slice(mid);
  const deptMid = Math.ceil(departments.length / 2);
  const deptLeft = departments.slice(0, deptMid);
  const deptRight = departments.slice(deptMid);

  const channelId = church.social?.youtubeChannelId;
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  return (
    <Section className="py-12 bg-white">
      <SectionTitle className="sr-only">예배 안내 & 예배 영상</SectionTitle>
      <div className="flex gap-6 items-start">
        {/* 예배 안내 카드 */}
        <div className="flex-1 border border-bluegrey-2 rounded-2xl p-8 flex flex-col gap-7 bg-white">
          <h3 className="text-sub-tit-2 font-bold text-grey-12">예배 안내</h3>

          {/* 정기 예배 */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-3 flex-1">
              {left.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {right.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
          </div>

          <hr className="border-t border-bluegrey-2" />

          {/* 부서 예배 */}
          <div>
            <p className="text-body-4 font-medium text-grey-7 mb-3">부서 예배</p>
            <div className="flex gap-10">
              <div className="flex flex-col gap-3 flex-1">
                {deptLeft.map((s) => <ScheduleRow key={s.name} {...s} />)}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {deptRight.map((s) => <ScheduleRow key={s.name} {...s} />)}
              </div>
            </div>
          </div>
        </div>

        {/* 예배 영상 카드 */}
        <div className="w-[380px] border border-bluegrey-2 rounded-2xl p-6 flex flex-col gap-4 bg-white">
          <h3 className="text-sub-tit-2 font-bold text-grey-12">예배 영상</h3>
          <VideoPlayer channelId={channelId} apiKey={apiKey} />
          {(!channelId || !apiKey) && (
            <p className="text-body-5 text-grey-4 text-center">
              관리자에게 문의하세요.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
