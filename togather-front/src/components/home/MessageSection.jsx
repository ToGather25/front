import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import defaultBanner from "@/assets/default_banner.png";
import rightArrow from "@/assets/icon-svg/right-arrow.svg";

export default function MessageSection() {
  const navigate = useNavigate();
  const { church } = useChurch();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestSermon = async () => {
      try {
        const channelId = church.social?.youtubeChannelId;
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

        if (!channelId || !apiKey) {
          setSermon(null);
          setLoading(false);
          return;
        }

        // 채널 업로드 플레이리스트 조회
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        );
        const channelData = await channelRes.json();
        const uploadPlaylistId =
          channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadPlaylistId) {
          setLoading(false);
          return;
        }

        // 최신 동영상 조회
        const videosRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&maxResults=1&key=${apiKey}`
        );
        const videosData = await videosRes.json();
        const latestVideo = videosData.items?.[0]?.snippet;

        if (latestVideo) {
          const videoId = latestVideo.resourceId?.videoId;
          setSermon({
            title: latestVideo.title,
            date: new Date(latestVideo.publishedAt).toLocaleDateString(
              "ko-KR"
            ),
            preacher: church.pastor || "담임목사",
            scripture: latestVideo.description?.split("\n")[0] || "",
            videoId: videoId,
            youtubeUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
            thumbnail: latestVideo.thumbnails?.high?.url || defaultBanner,
            isLive: false, // 백엔드에서 라이브 상태 받기 필요
          });
        }
      } catch (error) {
        console.error("[MessageSection] YouTube API 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (church.social?.youtubeChannelId) {
      fetchLatestSermon();
    }
  }, [church.social?.youtubeChannelId, church.pastor]);

  const schedules = church.worshipDisplay?.map((display) => ({
    label: display.title,
    time: display.regularIndices
      ?.map((i) => church.worshipSchedule?.regular?.[i]?.time)
      .filter(Boolean)
      .join(" | "),
  })) || [];

  return (
    <div className="pb-[120px]">
      <div className="px-[180px] flex justify-center">
        {/* 타이틀 */}
        <div className="w-full text-center mb-16">
          <p className="text-pale text-headline-5 font-semibold mb-4">Message</p>
          <h2 className="text-grey-12 text-section-title font-bold">{church.name} 말씀</h2>
        </div>
      </div>

      {/* 본문 - 배경과 overlap */}
      <div className="relative">
        {/* 배경 - 화면 전체 너비, 예배시간 약간 위부터 시작 */}
        <div className="absolute top-1/3 left-0 right-0 w-screen bg-bluegrey-1 py-45 -mt-12" />

        <div className="px-[180px] flex justify-center relative z-10">
          <div className="w-full flex gap-10 items-end">
            {/* 설교 카드 */}
            {loading ? (
              <div className="flex-[1.5] h-[500px] bg-grey-2 rounded-3xl p-[60px] flex items-center justify-center animate-pulse">
                <p className="text-grey-6">로딩 중...</p>
              </div>
            ) : sermon ? (
              <div
                onClick={() => sermon.youtubeUrl && window.open(sermon.youtubeUrl, "_blank")}
                className="flex-[1.5] h-[400px] rounded-3xl px-10 pb-6 flex flex-col justify-end cursor-pointer shadow-xl hover:shadow-lg transition-shadow relative overflow-hidden group"
                style={{
                  backgroundImage: `url('${sermon.thumbnail}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-grey-11/20 to-grey-11/80 group-hover:from-grey-11/30 group-hover:to-grey-11/85 transition-colors" />

                {/* 콘텐츠 */}
                <div className="relative z-10">
                  <h3 className="text-white text-headline-5 font-semibold leading-tight mb-4">
                    {sermon.title}
                  </h3>
                  <div className="text-white space-y-1">
                    <p className="text-headline-6">
                      {sermon.date} | {sermon.preacher}
                    </p>
                    <p className="text-[20px] text-white/80">{sermon.scripture}</p>
                  </div>
                </div>

                {/* 화살표 버튼 - hover 시 표시, 오른쪽 아래, 계속 바운스 */}
                {sermon.youtubeUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(sermon.youtubeUrl, "_blank");
                    }}
                    className="absolute bottom-12 right-14 opacity-0 group-hover:opacity-100 animate-bounceRight transition-opacity z-20 hover:scale-110 transition-transform"
                    aria-label="YouTube에서 보기"
                  >
                    <img src={rightArrow} alt="" className="w-11 h-11 drop-shadow-lg" />
                  </button>
                )}

                {/* LIVE 배지 */}
                {sermon.isLive && (
                  <span className="absolute top-6 left-6 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
            ) : (
              <div className="flex-[1.5] h-[548px] bg-grey-1 rounded-[32px] p-[60px] flex items-center justify-center border border-grey-3">
                <p className="text-grey-6">설교 정보를 불러올 수 없습니다</p>
              </div>
            )}

            {/* 예배시간 */}
            <div className="flex-1 py-2 space-y-0">
            {schedules.map((schedule, i) => (
              <div
                key={i}
                className={`grid grid-cols-[auto_1fr] items-start gap-8 ${
                  i === schedules.length - 1 ? "pt-5" : "py-5"
                } ${i < schedules.length - 1 ? "border-b border-dashed border-bluegrey-3" : ""}`}
              >
                <span className="text-sub-tit-4 font-medium text-bluegrey-9 shrink-0">
                  {schedule.label}
                </span>
                <span className="text-body-4 text-grey-7 break-words">
                  {schedule.time}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
