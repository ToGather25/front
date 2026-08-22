import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import WordTabBar from "@/components/word/WordTabBar";
import { getLiveSermon, getPastSermons } from "@/services/sermonService";

function YouTubeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function SermonInfoBlock({ sermon, isLive = false, juboOnClick }) {
  return (
    <div className="mt-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-body-5 font-bold rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE
            </span>
          )}
          {sermon.service && (
            <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-5 font-medium rounded-full">
              {sermon.service}
            </span>
          )}
          {sermon.date && <span className="text-body-5 text-grey-5">{sermon.date}</span>}
        </div>
        <h2 className="text-sub-tit-3 font-bold text-grey-11 leading-snug mb-2">{sermon.title}</h2>
        {(sermon.scripture || sermon.speaker) && (
          <div className="flex items-center gap-2 text-body-4 text-grey-6">
            {sermon.scripture && (
              <span className="text-primary font-medium">{sermon.scripture}</span>
            )}
            {sermon.scripture && sermon.speaker && <span className="text-grey-4">·</span>}
            {sermon.speaker && <span>{sermon.speaker}</span>}
          </div>
        )}
      </div>
      {juboOnClick && (
        <div className="shrink-0 pt-0.5">
          <SmartJuboButton onClick={juboOnClick} />
        </div>
      )}
    </div>
  );
}

export default function WordBroadcast() {
  const { church } = useChurch();
  const channelId = church.social?.youtubeChannelId;
  const channelUrl = church.social?.youtube;
  const [juboOpen, setJuboOpen] = useState(false);
  const [liveSermon, setLiveSermon] = useState(null);
  const [pastSermons, setPastSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [live, past] = await Promise.all([
          getLiveSermon(channelId),
          getPastSermons(channelId),
        ]);
        if (cancelled) return;
        setLiveSermon(live);
        setPastSermons(past);
        setLoading(false);
      } catch (err) {
        if (!cancelled) setLoading(false);
        console.error("[WordBroadcast] 설교 목록 조회 실패:", err);
      }
    }
    void loadAll();

    const interval = setInterval(async () => {
      try {
        const live = await getLiveSermon(channelId);
        if (!cancelled) setLiveSermon(live);
      } catch (err) {
        console.error("[WordBroadcast] 라이브 예배 상태 조회 실패:", err);
      }
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [channelId]);

  const status = loading ? "loading" : liveSermon ? "live" : pastSermons[0] ? "ended" : "none";
  const heroSermon = liveSermon ?? pastSermons[0] ?? null;
  const listedPastSermons = status === "ended" ? pastSermons.slice(1) : pastSermons;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* ── 로딩 중 ── */}
        {status === "loading" && (
          <section className="mb-14 max-w-6xl mx-auto">
            <div className="w-full rounded-2xl overflow-hidden bg-grey-2 animate-pulse aspect-video" />
          </section>
        )}

        {/* ── 실시간 중 ── */}
        {status === "live" && (
          <section className="mb-14 max-w-3xl mx-auto">
            <p className="text-body-4 text-grey-6 mb-3">지금 예배가 진행중입니다</p>
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${liveSermon.videoId}?autoplay=1`}
                title="실시간 예배 방송"
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <SermonInfoBlock sermon={heroSermon} isLive juboOnClick={() => setJuboOpen(true)} />
          </section>
        )}

        {/* ── 오늘 예배가 끝난 경우(가장 최근 업로드) ── */}
        {status === "ended" && (
          <section className="mb-14 max-w-6xl mx-auto">
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl aspect-video">
              {heroSermon.videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${heroSermon.videoId}`}
                  title={heroSermon.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <LivePlaceholder channelUrl={channelUrl} />
              )}
            </div>
            <SermonInfoBlock sermon={heroSermon} juboOnClick={() => setJuboOpen(true)} />
          </section>
        )}

        {/* ── 오늘 예배 없음 ── */}
        {status === "none" && (
          <section className="mb-14 max-w-3xl mx-auto">
            <div className="w-full rounded-2xl bg-bluegrey-1 border border-bluegrey-2 flex flex-col items-center justify-center py-20 gap-3">
              <div className="text-4xl">📭</div>
              <p className="text-sub-tit-4 font-semibold text-grey-7">
                오늘 예정된 예배가 없습니다
              </p>
            </div>
          </section>
        )}

        {/* ── 지난 설교 가로 스크롤 ── */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-5">지난 설교</h2>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
            {listedPastSermons.map((s) => (
              <a
                key={s.id}
                href={
                  s.videoId ? `https://www.youtube.com/watch?v=${s.videoId}` : (channelUrl ?? "#")
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 w-52 rounded-xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-md transition-all"
              >
                <div
                  className="w-full bg-grey-2 flex items-center justify-center overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  {s.thumbnail ? (
                    <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <YouTubeIcon className="w-8 h-8 text-grey-4 group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-body-4 font-medium text-grey-10 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {s.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-body-5 text-grey-5">
                    {s.service && (
                      <>
                        <span>{s.service}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{s.date}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {channelUrl && (
            <p className="mt-4 text-body-4 text-grey-6">
              더 많은 설교는{" "}
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                유튜브 채널
              </a>
              에서 확인하세요.
            </p>
          )}
        </section>
      </div>

      {/* 스마트 주보 모달 */}
      {juboOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setJuboOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-bluegrey-2">
              <h3 className="text-sub-tit-4 font-bold text-grey-11">이번 주 주보</h3>
              <button
                onClick={() => setJuboOpen(false)}
                className="text-grey-5 hover:text-grey-9 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-8 text-center text-grey-6 text-body-3">
              {/* TODO: 주보 컨텐츠 연동 */}
              주보 내용이 여기에 표시됩니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartJuboButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex items-center gap-2 px-5 py-2.5 border border-blue-3 text-blue-7 text-body-3 font-medium rounded-full hover:bg-blue-1 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
      스마트 주보 보기
    </button>
  );
}

function LivePlaceholder({ channelUrl }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <YouTubeIcon className="w-16 h-16 text-grey-5" />
      <p className="text-grey-5 text-body-3">YouTube 채널 ID가 설정되지 않았습니다.</p>
      {channelUrl && (
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors"
        >
          유튜브 채널에서 보기
        </a>
      )}
    </div>
  );
}
