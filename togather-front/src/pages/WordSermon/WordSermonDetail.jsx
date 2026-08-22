import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { getSermonDetail, searchSermons } from "@/services/sermonService";

const NEIGHBOR_FETCH_SIZE = 50;

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
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <button
            onClick={() => navigate("/말씀/설교")}
            className="flex items-center gap-1.5 text-blue-3 hover:text-white transition-colors text-body-4 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            예배 목록
          </button>
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* 영상 플레이어 */}
        <div
          className="w-full rounded-2xl overflow-hidden bg-grey-11 shadow-xl mb-8"
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
        <p className="text-body-4 text-grey-5 mb-3">{sermon.sermonDate}</p>
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-4">{sermon.title}</h2>
        {(sermon.scripture || sermon.preacher || sermon.worshipType) && (
          <div className="flex items-center gap-2 text-body-3 text-grey-6 mb-6">
            {sermon.worshipType && (
              <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-5 font-medium rounded-full">
                {sermon.worshipType}
              </span>
            )}
            {sermon.scripture && <span className="text-primary font-medium">{sermon.scripture}</span>}
            {sermon.scripture && sermon.preacher && <span className="text-grey-4">·</span>}
            {sermon.preacher && <span>{sermon.preacher}</span>}
          </div>
        )}

        {/* 이전/다음 네비게이션 */}
        <div className="flex gap-4 mt-12 pt-8 border-t border-bluegrey-2">
          {prev ? (
            <button
              onClick={() => navigate(`/말씀/설교/${prev.id}`)}
              className="flex-1 text-left px-4 py-3.5 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all group"
            >
              <p className="text-body-5 text-grey-5 mb-1">이전 설교</p>
              <p className="text-body-3 font-medium text-grey-9 group-hover:text-primary transition-colors line-clamp-1">
                {prev.title}
              </p>
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <button
              onClick={() => navigate(`/말씀/설교/${next.id}`)}
              className="flex-1 text-right px-4 py-3.5 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all group"
            >
              <p className="text-body-5 text-grey-5 mb-1">다음 설교</p>
              <p className="text-body-3 font-medium text-grey-9 group-hover:text-primary transition-colors line-clamp-1">
                {next.title}
              </p>
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
