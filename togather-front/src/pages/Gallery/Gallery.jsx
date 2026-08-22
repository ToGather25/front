import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getCommunities, getPhotos } from "@/services/galleryService";

const AVATAR_GRADIENTS = [
  "from-blue-6 to-blue-9",
  "from-point-5 to-point-8",
  "from-blue-5 to-point-6",
  "from-point-4 to-blue-7",
  "from-blue-7 to-point-7",
  "from-point-6 to-blue-8",
];

function getAvatarGradient(id) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

const PHOTO_FETCH_LIMIT = 200;

function ChevronIcon({ direction = "left", className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CameraIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h3l1.6-2.2A1 1 0 019.4 4.4h5.2a1 1 0 01.8.4L17 7h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function CommunityAvatar({ community }) {
  return (
    <div
      className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(
        community.id,
      )} flex items-center justify-center font-bold text-body-4 text-white`}
    >
      {community.name.charAt(0)}
    </div>
  );
}

function PhotoModal({ photo, community, photos, currentIndex, onClose, onPrev, onNext }) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <CloseIcon />
      </button>

      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-square bg-grey-11 flex items-center justify-center shrink-0">
          {photo.imageUrl ? (
            <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-contain" />
          ) : (
            <CameraIcon className="w-10 h-10 text-grey-7" />
          )}

          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="이전 사진"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronIcon direction="left" className="w-4 h-4" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="다음 사진"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronIcon direction="right" className="w-4 h-4" />
            </button>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-grey-2 shrink-0">
            <CommunityAvatar community={community} />
            <div className="min-w-0">
              <p className="text-body-3 font-semibold text-grey-11 truncate">{community.name}</p>
              <p className="text-body-5 text-grey-6">{photo.date}</p>
            </div>
          </div>
          <div className="overflow-y-auto px-5 py-4">
            <p className="text-sub-tit-4 font-bold text-grey-11 mb-2">{photo.title}</p>
            <p className="text-body-3 text-grey-8 whitespace-pre-line leading-relaxed">
              {photo.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoGrid({ church, community, onBack }) {
  const { data: photos = [], loading } = useFetch(
    () => getPhotos(church.id, { communityId: community.id, limit: PHOTO_FETCH_LIMIT }),
    [church.id, community.id],
    [],
  );
  const [modalIdx, setModalIdx] = useState(null);

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-body-4 text-grey-6 hover:text-blue-7 transition-colors mb-6"
      >
        <ChevronIcon direction="left" className="w-4 h-4" />
        목록
      </button>

      <div className="flex items-center gap-6 md:gap-9 pb-6 md:pb-8 border-b border-grey-2">
        <div
          className={`shrink-0 rounded-full bg-gradient-to-br ${getAvatarGradient(
            community.id,
          )} p-1`}
        >
          <div className="p-1 bg-white rounded-full">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-grey-2 flex items-center justify-center">
              <span className="text-headline-3 font-bold text-grey-7">
                {community.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-sub-tit-1 font-bold text-grey-11">{community.name}</h2>
          {community.desc && (
            <p className="text-body-2 text-grey-7 mt-2 whitespace-pre-line">{community.desc}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-body-4 text-bluegrey-5">불러오는 중...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 text-body-4 text-bluegrey-5">사진이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-1.5 mt-1 md:mt-1.5">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setModalIdx(idx)}
              className="group relative aspect-square bg-grey-3 overflow-hidden"
            >
              {photo.imageUrl ? (
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-grey-5">
                  <CameraIcon className="w-6 h-6" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {modalIdx !== null && (
        <PhotoModal
          photo={photos[modalIdx]}
          community={community}
          photos={photos}
          currentIndex={modalIdx}
          onClose={() => setModalIdx(null)}
          onPrev={() => setModalIdx((i) => Math.max(0, i - 1))}
          onNext={() => setModalIdx((i) => Math.min(photos.length - 1, i + 1))}
        />
      )}
    </div>
  );
}

function CommunityStoryCard({ community, onSelect }) {
  return (
    <button onClick={onSelect} className="group flex flex-col items-center gap-3 text-center">
      <div
        className={`p-1 rounded-full bg-gradient-to-br ${getAvatarGradient(
          community.id,
        )} group-hover:scale-105 transition-transform`}
      >
        <div className="p-1 bg-white rounded-full">
          <div className="w-28 h-28 rounded-full bg-grey-2 flex items-center justify-center">
            <span className="text-headline-3 font-bold text-grey-7">
              {community.name.charAt(0)}
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-[124px]">
        <p className="text-body-3 font-semibold text-grey-11 truncate">{community.name}</p>
        <p className="text-body-5 text-grey-6 truncate">{community.desc}</p>
      </div>
    </button>
  );
}

export default function Gallery() {
  const { church } = useChurch();
  const { data: communities = [], loading } = useFetch(
    () => getCommunities(church.id),
    [church.id],
    [],
  );
  const [selected, setSelected] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const communityName = searchParams.get("community");
    if (!communityName || communities.length === 0) return;
    const matched = communities.find((c) => c.name === communityName);
    if (matched) setSelected(matched);
  }, [searchParams, communities]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-10 pb-15 md:px-8 md:pt-15 md:pb-25">
      {!selected ? (
        /* Community List */
        loading ? (
          <div className="text-center py-20 text-body-4 text-bluegrey-5">불러오는 중...</div>
        ) : (
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="text-sub-tit-2 font-bold text-grey-11">갤러리</h1>
              <p className="text-body-4 text-grey-6 mt-1">공동체를 선택해 사진을 둘러보세요</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-10 gap-x-6 justify-items-center">
              {communities.map((community) => (
                <CommunityStoryCard
                  key={community.id}
                  community={community}
                  onSelect={() => setSelected(community)}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        <PhotoGrid church={church} community={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}
