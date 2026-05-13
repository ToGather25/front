import { useChurch } from "@/contexts/ChurchContext";

const PAST_BROADCASTS = [
  { id: 1, title: "주일 2부 예배 (2026.05.04)", date: "2026.05.04", views: "1,204", thumb: null },
  { id: 2, title: "수요 예배 (2026.04.30)", date: "2026.04.30", views: "438", thumb: null },
  { id: 3, title: "주일 2부 예배 (2026.04.27)", date: "2026.04.27", views: "987", thumb: null },
  { id: 4, title: "금요기도회 (2026.04.25)", date: "2026.04.25", views: "312", thumb: null },
  { id: 5, title: "주일 2부 예배 (2026.04.20)", date: "2026.04.20", views: "1,056", thumb: null },
  { id: 6, title: "수요 예배 (2026.04.16)", date: "2026.04.16", views: "521", thumb: null },
];

export default function WordBroadcast() {
  const { church } = useChurch();
  const channelId = church.social?.youtubeChannelId;
  const channelUrl = church.social?.youtube;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ON-AIR
            </span>
          </div>
          <h1 className="text-headline-4 font-bold text-white">실시간 방송</h1>
        </div>
      </div>

      <div className="max-w-[1576px] mx-auto px-8 py-14">
        {/* Live Player */}
        <section className="mb-16">
          <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-6">실시간 예배 방송</h2>
          <div
            className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl"
            style={{ aspectRatio: "16/9", maxWidth: "900px" }}
          >
            {channelId ? (
              <iframe
                src={`https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0`}
                title="실시간 예배 방송"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
                <svg className="w-16 h-16 text-grey-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <p className="text-grey-5 text-body-2">YouTube 채널 ID가 설정되지 않았습니다.</p>
                {channelUrl && (
                  <a href={channelUrl} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors">
                    YouTube 채널 바로가기
                  </a>
                )}
              </div>
            )}
          </div>
          <p className="mt-4 text-body-3 text-grey-7">
            * 방송이 진행되지 않는 시간에는 영상이 표시되지 않을 수 있습니다.
            {channelUrl && (
              <> <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube 채널</a>에서 지난 방송을 시청하실 수 있습니다.</>
            )}
          </p>
        </section>

        {/* Past Broadcasts */}
        <section>
          <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-6">지난 방송</h2>
          <div className="grid grid-cols-3 gap-5">
            {PAST_BROADCASTS.map((item) => (
              <a
                key={item.id}
                href={channelUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl overflow-hidden border border-bluegrey-2 hover:border-blue-4 hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="w-full bg-grey-2 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                  <svg className="w-10 h-10 text-grey-5 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                {/* Info */}
                <div className="px-4 py-3">
                  <p className="text-body-3 font-medium text-grey-10 group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-body-4 text-grey-6">
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>조회 {item.views}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
