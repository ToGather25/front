import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

const SERMONS = [
  {
    id: 1, date: "2026.05.04", service: "주일 2부 예배",
    title: "부활의 능력으로 살아가라",
    verse: "빌립보서 3:10–11", speaker: "김함께 목사",
    summary: "부활하신 그리스도의 능력이 우리의 일상 안에서 어떻게 역사하는지 말씀을 통해 나눕니다.",
    videoId: null,
  },
  {
    id: 2, date: "2026.04.27", service: "주일 2부 예배",
    title: "하나님의 선하심을 신뢰하라",
    verse: "시편 23:1–6", speaker: "김함께 목사",
    summary: "목자 되신 하나님의 인도하심을 믿고 삶의 어둠 속에서도 담대히 나아가는 신앙을 살펴봅니다.",
    videoId: null,
  },
  {
    id: 3, date: "2026.04.20", service: "주일 2부 예배",
    title: "함께함의 능력",
    verse: "전도서 4:9–12", speaker: "김함께 목사",
    summary: "공동체가 함께할 때 나타나는 하나님의 역사와 그 아름다움에 대해 말씀드립니다.",
    videoId: null,
  },
  {
    id: 4, date: "2026.04.13", service: "주일 2부 예배",
    title: "고난 너머의 영광",
    verse: "로마서 8:18–25", speaker: "김무리 목사",
    summary: "현재의 고난이 장차 올 영광과 비교할 수 없음을 말씀 안에서 함께 묵상합니다.",
    videoId: null,
  },
  {
    id: 5, date: "2026.04.06", service: "주일 2부 예배",
    title: "은혜로 충분하다",
    verse: "고린도후서 12:9–10", speaker: "임축복 목사",
    summary: "내 약함 속에서 온전히 나타나는 하나님의 은혜에 대한 깊은 묵상을 나눕니다.",
    videoId: null,
  },
  {
    id: 6, date: "2026.03.30", service: "주일 2부 예배",
    title: "믿음으로 나아가라",
    verse: "히브리서 11:1–6", speaker: "김함께 목사",
    summary: "믿음의 선진들이 보여 준 삶을 거울 삼아 우리의 신앙 여정을 돌아봅니다.",
    videoId: null,
  },
];

export default function WordSermon() {
  const { church } = useChurch();
  const [selected, setSelected] = useState(SERMONS[0]);
  const channelUrl = church.social?.youtube;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">설교 소개</h1>
        </div>
      </div>

      <div className="max-w-[1576px] mx-auto px-8 py-14">
        <div className="flex gap-10 items-start">
          {/* Left: selected sermon detail */}
          <div className="flex-1 min-w-0">
            {/* Video */}
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 mb-7" style={{ aspectRatio: "16/9" }}>
              {selected.videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selected.videoId}`}
                  title={selected.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <svg className="w-14 h-14 text-grey-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  {channelUrl && (
                    <a href={channelUrl} target="_blank" rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors">
                      YouTube에서 보기
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-blue-1 text-blue-7 text-body-4 font-medium">{selected.service}</span>
              <span className="text-body-4 text-grey-6">{selected.date}</span>
            </div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">{selected.title}</h2>
            <p className="text-body-3 text-primary font-medium mb-4">{selected.verse}</p>
            <p className="text-body-2 text-grey-8 leading-relaxed">{selected.summary}</p>
            <div className="mt-5 flex items-center gap-2 text-body-3 text-grey-7">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>{selected.speaker}</span>
            </div>
          </div>

          {/* Right: list */}
          <div className="w-[320px] shrink-0 flex flex-col gap-2">
            <h3 className="text-body-2 font-bold text-grey-10 mb-3 px-1">최근 설교 목록</h3>
            {SERMONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`text-left px-4 py-3.5 rounded-xl border transition-all ${
                  selected.id === s.id
                    ? "border-primary bg-blue-1"
                    : "border-bluegrey-2 hover:border-blue-3 hover:bg-bluegrey-1"
                }`}
              >
                <p className={`text-body-3 font-medium mb-1 ${selected.id === s.id ? "text-primary" : "text-grey-10"}`}>{s.title}</p>
                <div className="flex items-center gap-2 text-body-4 text-grey-6">
                  <span>{s.verse}</span>
                  <span>·</span>
                  <span>{s.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
