import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { searchSermons } from "@/services/sermonService";
import { BOOK_ABBREV } from "@/config/bible.config";
import bibleData from "@/data/bible.json";
import BubbleLoader from "@/components/common/BubbleLoader";
import defaultBanner from "@/assets/default_banner.png";
import rightArrow from "@/assets/icon-svg/right-arrow.svg";
import quoteRight from "@/assets/icon-svg/quote-right.svg";

/** "골로새서 3:15-17" 같은 표기를 분해해 해당 구절 본문을 찾는다. 범위(-17)가 없으면 한 절만. */
function lookupVerseText(scripture) {
  const m = scripture?.match(/^(\S+)\s*(\d+):(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const [, book, chapterStr, startStr, endStr] = m;
  const abbrev = BOOK_ABBREV[book];
  if (!abbrev) return null;
  const chapter = Number(chapterStr);
  const start = Number(startStr);
  const end = endStr ? Number(endStr) : start;
  const verses = [];
  for (let v = start; v <= end; v++) {
    const text = bibleData[`${abbrev}${chapter}:${v}`];
    if (text) verses.push(text.trim());
  }
  return verses.length ? verses.join(" ") : null;
}

export default function MessageSection() {
  const { church } = useChurch();
  // 최근 설교 중 주일예배(1부/2부 등)만 걸러 가장 최근 것을 쓴다. worshipType은 교회마다
  // 자유 문자열(church.serviceTypes)이라 "주일"로 시작하는지만 본다. 목록은 이미 최신순 정렬.
  const { data: sermons = [], loading } = useFetch(
    () => searchSermons(church.id, { size: 10 }).then((r) => r.sermons),
    [church.id],
    [],
  );
  const sundaySermon = sermons.find((s) => s.worshipType?.startsWith("주일"));
  const sermon = sundaySermon && {
    title: sundaySermon.title,
    date: new Date(sundaySermon.sermonDate).toLocaleDateString("ko-KR"),
    preacher: sundaySermon.preacher || church.pastor || "담임목사",
    scripture: sundaySermon.scripture || "",
    youtubeUrl: sundaySermon.videoId
      ? `https://www.youtube.com/watch?v=${sundaySermon.videoId}`
      : null,
    thumbnail: sundaySermon.thumbnail || defaultBanner,
    isLive: false,
  };
  const verseText = sermon?.scripture ? lookupVerseText(sermon.scripture) : null;

  return (
    <div className="pb-[120px]">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* 타이틀 */}
        <div className="text-center mb-16">
          <p className="text-pale text-headline-5 font-semibold mb-4">Message</p>
          <h2 className="text-grey-12 text-section-title font-bold">{church.name} 말씀</h2>
        </div>
      </div>

      {/* 본문 - 배경과 overlap */}
      <div className="relative">
        {/* 배경 - 화면 전체 너비, 예배시간 약간 위부터 시작 */}
        <div className="absolute top-1/3 left-0 right-0 bg-bluegrey-1 py-45 -mt-12" />

        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
          <div className="flex gap-10 items-end">
            {/* 설교 카드 */}
            {loading ? (
              <div className="flex-[1.5] h-[450px] bg-grey-2 rounded-3xl p-[60px] flex items-center justify-center shadow-xl">
                <BubbleLoader size="lg" />
              </div>
            ) : sermon ? (
              <div
                onClick={() => sermon.youtubeUrl && window.open(sermon.youtubeUrl, "_blank")}
                className="flex-[1.5] h-[450px] rounded-3xl px-10 pb-10 flex flex-col justify-end cursor-pointer shadow-2xl transition-shadow relative overflow-hidden group"
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

            {/* 말씀 인용 */}
            <div className="flex-1 relative flex flex-col items-start justify-start pt-8 self-start">
              <img
                src={quoteRight}
                alt=""
                className="absolute top-14 right-0 w-24 h-24 opacity-80"
              />
              <p className="text-headline-5 pt-24 font-bold text-primary">
                이번주 말씀
              </p>
              <p className="text-body-2 text-grey-9 mt-10 max-w-xs line-clamp-4">
                {verseText || sermon?.scripture || "아직 준비된 말씀이 없습니다."}
              </p>
              {verseText && sermon?.scripture && (
                <p className="text-body-5 text-grey-5 mt-5 w-full">
                  {sermon.scripture}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
