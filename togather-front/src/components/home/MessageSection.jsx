import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

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
          setSermon({
            title: latestVideo.title,
            date: new Date(latestVideo.publishedAt).toLocaleDateString(
              "ko-KR"
            ),
            preacher: church.pastor || "담임목사",
            scripture: latestVideo.description?.split("\n")[0] || "",
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
    <div className="bg-blue-1 py-[120px] px-[200px] flex justify-center w-full">
      <div className="w-[1520px]">
        {/* 타이틀 */}
        <div className="text-center mb-14">
          <p className="text-pale text-[30px] font-bold mb-4">Message</p>
          <h2 className="text-grey-12 text-[40px] font-bold">{church.name} 말씀</h2>
        </div>

        {/* 본문 */}
        <div className="flex gap-14 items-end">
          {/* 설교 카드 */}
          {loading ? (
            <div className="flex-1 h-[550px] bg-grey-2 rounded-3xl p-[60px] flex items-center justify-center animate-pulse">
              <p className="text-grey-6">로딩 중...</p>
            </div>
          ) : sermon ? (
            <div
              onClick={() => navigate("/말씀")}
              className="flex-2 h-[548px] bg-gradient-to-b from-grey-11/20 to-grey-11/80 rounded-3xl p-[60px] flex flex-col justify-end gap-8 cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-white text-headline-5 font-semibold leading-tight mb-4">
                  {sermon.title}
                </h3>
                <div className="text-white space-y-1">
                  <p className="text-[22px]">
                    {sermon.date} | {sermon.preacher}
                  </p>
                  <p className="text-[20px] text-white/80">{sermon.scripture}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 h-[548px] bg-grey-1 rounded-[32px] p-[60px] flex items-center justify-center border border-grey-3">
              <p className="text-grey-6">설교 정보를 불러올 수 없습니다</p>
            </div>
          )}

          {/* 예배시간 */}
          <div className="flex-1 py-2 space-y-0">
            {schedules.map((schedule, i) => (
              <div
                key={i}
                className={`grid grid-cols-[auto_1fr] items-center gap-8 ${
                  i === schedules.length - 1 ? "pt-5" : "py-5"
                } ${i < schedules.length - 1 ? "border-b border-dashed border-grey-3" : ""}`}
              >
                <span className="text-sub-tit-4 font-medium text-bluegrey-9">
                  {schedule.label}
                </span>
                <span className="text-body-4 text-grey-7 whitespace-nowrap">
                  {schedule.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
