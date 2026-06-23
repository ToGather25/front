import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import WordTabBar from "@/components/word/WordTabBar";

// ── 오늘 예배 상태 목업 ──────────────────────────────────
// "live" | "scheduled" | "ended" | "none"
// 백엔드 연동 시 API로 교체
const TODAY_STATUS = "ended"; // 테스트용: 여기서 변경해서 확인

const TODAY_SERMON = {
  title: "부활의 능력으로 살아가라",
  scripture: "빌립보서 3:10–11",
  speaker: "김함께 목사",
  service: "주일 2부 예배",
  scheduledAt: "오전 11:00",
  videoId: null,
};

const PAST_SERMONS = [
  { id: 1, title: "하나님의 선하심을 신뢰하라", date: "2026.04.27", service: "주일 2부", videoId: null },
  { id: 2, title: "함께함의 능력", date: "2026.04.20", service: "주일 2부", videoId: null },
  { id: 3, title: "고난 너머의 영광", date: "2026.04.13", service: "주일 2부", videoId: null },
  { id: 4, title: "은혜로 충분하다", date: "2026.04.06", service: "주일 2부", videoId: null },
  { id: 5, title: "믿음으로 나아가라", date: "2026.03.30", service: "주일 2부", videoId: null },
  { id: 6, title: "십자가의 도", date: "2026.03.23", service: "주일 2부", videoId: null },
];

function YouTubeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function SermonInfoBlock({ sermon }) {
  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-5 font-medium rounded-full">{sermon.service}</span>
      </div>
      <h2 className="text-sub-tit-2 font-bold text-grey-11">{sermon.title}</h2>
      <p className="text-body-3 text-primary font-medium">{sermon.scripture}</p>
      <p className="text-body-4 text-grey-6">{sermon.speaker}</p>
    </div>
  );
}

export default function WordBroadcast() {
  const { church } = useChurch();
  const channelId = church.social?.youtubeChannelId;
  const channelUrl = church.social?.youtube;
  const [juboOpen, setJuboOpen] = useState(false);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">말씀·찬양</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1576px] mx-auto px-4 py-8 md:px-8 md:py-12">

        {/* ── 실시간 중 ── */}
        {TODAY_STATUS === "live" && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-body-5 font-bold rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </span>
              <span className="text-body-3 text-grey-7">지금 예배가 진행중입니다</span>
            </div>
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl" style={{ aspectRatio: "16/9", maxWidth: 900 }}>
              {channelId ? (
                <iframe
                  src={`https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`}
                  title="실시간 예배 방송"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <LivePlaceholder channelUrl={channelUrl} />
              )}
            </div>
            <SermonInfoBlock sermon={TODAY_SERMON} />
            <SmartJuboButton onClick={() => setJuboOpen(true)} />
          </section>
        )}

        {/* ── 오늘 예배 예정 (아직 시작 전) ── */}
        {TODAY_STATUS === "scheduled" && (
          <section className="mb-12">
            <div className="w-full rounded-2xl bg-blue-1 border border-blue-2 flex flex-col items-center justify-center py-16 gap-4" style={{ maxWidth: 900 }}>
              <div className="text-4xl">⏰</div>
              <p className="text-sub-tit-4 font-bold text-blue-8">잠시 뒤 예배가 시작됩니다</p>
              <p className="text-body-3 text-blue-6">예정 시간: {TODAY_SERMON.scheduledAt}</p>
            </div>
            <SermonInfoBlock sermon={TODAY_SERMON} />
            <SmartJuboButton onClick={() => setJuboOpen(true)} />
          </section>
        )}

        {/* ── 오늘 예배가 끝난 경우 ── */}
        {TODAY_STATUS === "ended" && (
          <section className="mb-12">
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl" style={{ aspectRatio: "16/9", maxWidth: 900 }}>
              {TODAY_SERMON.videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${TODAY_SERMON.videoId}`}
                  title={TODAY_SERMON.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <LivePlaceholder channelUrl={channelUrl} />
              )}
            </div>
            <SermonInfoBlock sermon={TODAY_SERMON} />
            <SmartJuboButton onClick={() => setJuboOpen(true)} />
          </section>
        )}

        {/* ── 오늘 예배 없음 ── */}
        {TODAY_STATUS === "none" && (
          <section className="mb-12">
            <div className="w-full rounded-2xl bg-bluegrey-1 border border-bluegrey-2 flex flex-col items-center justify-center py-16 gap-3" style={{ maxWidth: 900 }}>
              <div className="text-4xl">📭</div>
              <p className="text-sub-tit-4 font-semibold text-grey-7">오늘 예정된 예배가 없습니다</p>
            </div>
          </section>
        )}

        {/* ── 지난 설교 가로 스크롤 ── */}
        <section>
          <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-5">지난 설교</h2>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
            {PAST_SERMONS.map((s) => (
              <a
                key={s.id}
                href={channelUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 w-52 rounded-xl border border-bluegrey-2 overflow-hidden hover:border-blue-4 hover:shadow-md transition-all"
              >
                <div className="w-full bg-grey-2 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                  <YouTubeIcon className="w-8 h-8 text-grey-4 group-hover:text-primary transition-colors" />
                </div>
                <div className="p-3">
                  <p className="text-body-4 font-medium text-grey-10 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {s.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-body-5 text-grey-5">
                    <span>{s.service}</span>
                    <span>·</span>
                    <span>{s.date}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {channelUrl && (
            <p className="mt-4 text-body-4 text-grey-6">
              더 많은 설교는{" "}
              <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
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
              <button onClick={() => setJuboOpen(false)} className="text-grey-5 hover:text-grey-9 text-xl leading-none">✕</button>
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
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
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
