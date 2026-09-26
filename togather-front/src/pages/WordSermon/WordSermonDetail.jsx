import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { getSermonDetail, searchSermons } from "@/services/sermonService";
import ArrowLeft from "@/assets/icon-svg/arrow-narrow-left.svg";
import BtnArrow from "@/assets/icon-svg/btn-arrow.svg";
import BtnArrow1 from "@/assets/icon-svg/btn-arrow-1.svg";

const NEIGHBOR_FETCH_SIZE = 50;

// 테스트용 mock 데이터
const MOCK_SERMON = {
  id: "test-sermon-1",
  title: "믿음으로 사는 삶",
  sermonDate: "2026.09.26",
  youtubeVideoId: "0kpFz0-uGdc",
};

export default function WordSermonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { church } = useChurch();
  const [sermon, setSermon] = useState(undefined); // undefined=로딩중, null=없음
  const [neighbors, setNeighbors] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setSermon(undefined);
    void Promise.allSettled([
      getSermonDetail(church.id, id),
      searchSermons(church.id, { page: 1, size: NEIGHBOR_FETCH_SIZE }),
    ]).then(([detailResult, neighborsResult]) => {
      if (cancelled) return;
      if (detailResult.status === "rejected") {
        console.error("[WordSermonDetail] 설교 상세 조회 실패:", detailResult.reason);
        // 테스트 모드: mock 데이터 사용 (URL에 test 파라미터가 있을 때)
        const params = new URLSearchParams(window.location.search);
        if (params.get("test") === "true") {
          setSermon(MOCK_SERMON);
          setNeighbors([]);
          return;
        }
        setSermon(null);
        return;
      }
      setSermon(detailResult.value);
      setNeighbors(neighborsResult.status === "fulfilled" ? neighborsResult.value.sermons : []);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, id]);

  if (sermon === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 md:px-8">
        <div
          className="w-full rounded-2xl bg-grey-2 animate-pulse"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    );
  }

  if (sermon === null) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-24 text-center">
        <p className="text-sub-tit-4 text-grey-6">설교를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/말씀/설교")}
          className="mt-6 px-5 py-2.5 bg-blue-7 text-white rounded-xl text-body-3 font-medium hover:bg-blue-8 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 이전/다음 설교 (검색 결과 순서 기준 — 최신순으로 조회되므로 다음 인덱스가 더 과거)
  const currentIdx = neighbors.findIndex((s) => s.id === sermon.id);
  const prev = currentIdx === -1 ? null : (neighbors[currentIdx + 1] ?? null);
  const next = currentIdx === -1 ? null : (neighbors[currentIdx - 1] ?? null);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* 목록으로 버튼 */}
        <button
          onClick={() => navigate("/말씀/설교")}
          className="flex items-center gap-1.5 text-bluegrey-3 hover:text-primary transition-colors text-body-4 mb-6 group"
        >
          <img src={ArrowLeft} alt="" className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
          목록으로
        </button>

        {/* 주보 보기 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/주보")}
            className="flex items-center gap-2 text-body-4 text-primary hover:text-primary transition-all group"
          >
            주보 보기
            <img src={BtnArrow} alt="" className="w-4 h-4 group-hover:hidden" />
            <img src={BtnArrow1} alt="" className="w-4 h-4 hidden group-hover:block" />
          </button>
        </div>

        {/* 영상 플레이어 */}
        <div
          className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl mb-6"
          style={{ aspectRatio: "16/9" }}
        >
          {sermon.youtubeVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${sermon.youtubeVideoId}`}
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
                <a
                  href={church.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white text-body-3 font-semibold hover:bg-red-700 transition-colors"
                >
                  YouTube에서 보기
                </a>
              )}
            </div>
          )}
        </div>

        {/* 설교 정보 */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-sub-tit-3 font-bold text-grey-11">{sermon.title}</h2>
          <p className="text-body-4 text-grey-5">{sermon.sermonDate}</p>
        </div>
      </div>
    </div>
  );
}
