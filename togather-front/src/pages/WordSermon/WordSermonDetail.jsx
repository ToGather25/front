import { useParams, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

// WordSermon과 동일한 데이터 — 백엔드 연동 시 API로 교체
const ALL_SERMONS = [
  { id: 1,  date: "2026.05.04", service: "주일 2부 예배", title: "부활의 능력으로 살아가라",     verse: "빌립보서 3:10–11",     speaker: "김함께 목사",  summary: "부활하신 그리스도의 능력이 우리의 일상 안에서 어떻게 역사하는지 말씀을 통해 나눕니다.", videoId: null },
  { id: 2,  date: "2026.04.27", service: "주일 2부 예배", title: "하나님의 선하심을 신뢰하라",   verse: "시편 23:1–6",          speaker: "김함께 목사",  summary: "목자 되신 하나님의 인도하심을 믿고 삶의 어둠 속에서도 담대히 나아가는 신앙을 살펴봅니다.", videoId: null },
  { id: 3,  date: "2026.04.20", service: "주일 2부 예배", title: "함께함의 능력",               verse: "전도서 4:9–12",        speaker: "김함께 목사",  summary: "공동체가 함께할 때 나타나는 하나님의 역사와 그 아름다움에 대해 말씀드립니다.", videoId: null },
  { id: 4,  date: "2026.04.13", service: "주일 2부 예배", title: "고난 너머의 영광",             verse: "로마서 8:18–25",       speaker: "김무리 목사",  summary: "현재의 고난이 장차 올 영광과 비교할 수 없음을 말씀 안에서 함께 묵상합니다.", videoId: null },
  { id: 5,  date: "2026.04.06", service: "주일 2부 예배", title: "은혜로 충분하다",              verse: "고린도후서 12:9–10",   speaker: "임축복 목사",  summary: "내 약함 속에서 온전히 나타나는 하나님의 은혜에 대한 깊은 묵상을 나눕니다.", videoId: null },
  { id: 6,  date: "2026.03.30", service: "주일 2부 예배", title: "믿음으로 나아가라",            verse: "히브리서 11:1–6",      speaker: "김함께 목사",  summary: "믿음의 선진들이 보여 준 삶을 거울 삼아 우리의 신앙 여정을 돌아봅니다.", videoId: null },
  { id: 7,  date: "2026.03.23", service: "청년부 예배",   title: "십자가의 도",                 verse: "고린도전서 1:18–25",   speaker: "박은혜 목사",  summary: "세상이 어리석다 하는 십자가의 도가 왜 구원받는 우리에게 하나님의 능력인지를 묵상합니다.", videoId: null },
  { id: 8,  date: "2026.03.16", service: "주일 2부 예배", title: "하나님이 하신다",              verse: "이사야 43:1–7",        speaker: "김함께 목사",  summary: "물과 불을 지날 때에도 함께하시는 하나님의 약속을 붙잡는 신앙에 대해 나눕니다.", videoId: null },
  { id: 9,  date: "2026.03.09", service: "주일 2부 예배", title: "새 힘을 얻으리",              verse: "이사야 40:28–31",      speaker: "김함께 목사",  summary: "지치고 힘든 때에 독수리같이 날게 하시는 하나님의 약속을 함께 묵상합니다.", videoId: null },
  { id: 10, date: "2026.03.02", service: "청년부 예배",   title: "복음의 능력",                 verse: "로마서 1:16–17",       speaker: "박은혜 목사",  summary: "복음은 모든 믿는 자에게 구원을 주시는 하나님의 능력임을 함께 선포합니다.", videoId: null },
  { id: 11, date: "2026.02.23", service: "주일 2부 예배", title: "사랑의 빚",                   verse: "로마서 13:8–10",       speaker: "김함께 목사",  summary: "서로 사랑하는 것 외에는 아무에게든지 아무 빚도 지지 말라는 말씀을 묵상합니다.", videoId: null },
  { id: 12, date: "2026.02.16", service: "주일 2부 예배", title: "성령의 열매",                 verse: "갈라디아서 5:22–23",   speaker: "임축복 목사",  summary: "성령의 아홉 가지 열매가 우리의 삶 속에서 어떻게 맺히는지를 살펴봅니다.", videoId: null },
  { id: 13, date: "2026.02.09", service: "주일 2부 예배", title: "기도의 능력",                 verse: "야고보서 5:13–18",     speaker: "김함께 목사",  summary: "의인의 간구는 역사하는 힘이 큼을 믿고 담대히 기도로 나아가기를 권면합니다.", videoId: null },
  { id: 14, date: "2026.02.02", service: "청년부 예배",   title: "그리스도 안에서",             verse: "에베소서 1:3–14",      speaker: "박은혜 목사",  summary: "그리스도 안에서 우리에게 허락된 신령한 복이 무엇인지 함께 살펴봅니다.", videoId: null },
];

export default function WordSermonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { church } = useChurch();
  const sermon = ALL_SERMONS.find((s) => s.id === Number(id));

  if (!sermon) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-24 text-center">
        <p className="text-sub-tit-4 text-grey-6">설교를 찾을 수 없습니다.</p>
        <button onClick={() => navigate("/말씀/설교")}
          className="mt-6 px-5 py-2.5 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 이전/다음 설교 (id 기준)
  const currentIdx = ALL_SERMONS.findIndex((s) => s.id === sermon.id);
  const prev = ALL_SERMONS[currentIdx + 1] ?? null;
  const next = ALL_SERMONS[currentIdx - 1] ?? null;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <button
            onClick={() => navigate("/말씀/설교")}
            className="flex items-center gap-1.5 text-blue-3 hover:text-white transition-colors text-body-4 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            설교 목록
          </button>
          <h1 className="text-headline-4 font-bold text-white">말씀·찬양</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* 영상 플레이어 */}
        <div className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl mb-8" style={{ aspectRatio: "16/9" }}>
          {sermon.videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${sermon.videoId}`}
              title={sermon.title}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <svg className="w-14 h-14 text-grey-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {church?.social?.youtube && (
                <a href={church.social.youtube} target="_blank" rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors">
                  YouTube에서 보기
                </a>
              )}
            </div>
          )}
        </div>

        {/* 설교 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-4 font-medium rounded-full">{sermon.service}</span>
          <span className="text-body-4 text-grey-5">{sermon.date}</span>
        </div>
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-3">{sermon.title}</h2>
        <p className="text-body-2 text-primary font-semibold mb-2">{sermon.verse}</p>
        <div className="flex items-center gap-2 text-body-3 text-grey-7 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{sermon.speaker}</span>
        </div>
        <p className="text-body-2 text-grey-8 leading-relaxed border-t border-bluegrey-2 pt-6">{sermon.summary}</p>

        {/* 이전/다음 네비게이션 */}
        <div className="flex gap-4 mt-12 pt-8 border-t border-bluegrey-2">
          {prev ? (
            <button
              onClick={() => navigate(`/말씀/설교/${prev.id}`)}
              className="flex-1 text-left px-4 py-3.5 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all group"
            >
              <p className="text-body-5 text-grey-5 mb-1">이전 설교</p>
              <p className="text-body-3 font-medium text-grey-9 group-hover:text-primary transition-colors line-clamp-1">{prev.title}</p>
            </button>
          ) : <div className="flex-1" />}
          {next ? (
            <button
              onClick={() => navigate(`/말씀/설교/${next.id}`)}
              className="flex-1 text-right px-4 py-3.5 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all group"
            >
              <p className="text-body-5 text-grey-5 mb-1">다음 설교</p>
              <p className="text-body-3 font-medium text-grey-9 group-hover:text-primary transition-colors line-clamp-1">{next.title}</p>
            </button>
          ) : <div className="flex-1" />}
        </div>
      </div>
    </div>
  );
}
