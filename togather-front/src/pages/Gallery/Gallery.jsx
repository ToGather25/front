import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getCommunities, getPhotos } from "@/services/galleryService";

function PhotoModal({ photo, photos, currentIndex, onClose, onPrev, onNext }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation arrows */}
        <div className="relative">
          <div className="w-full h-72 bg-grey-3 flex items-center justify-center">
            <span className="text-grey-5 text-body-4">사진</span>
          </div>
          {currentIndex > 0 && (
            <button
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
            >
              ‹
            </button>
          )}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
            >
              ›
            </button>
          )}
          {/* Dot indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? "bg-primary" : "bg-white/60"}`} />
            ))}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-1">{photo.title}</h3>
          <p className="text-body-5 text-grey-6 mb-3">{photo.date}</p>
          <p className="text-body-4 text-grey-8 whitespace-pre-line">{photo.desc}</p>
        </div>
      </div>
    </div>
  );
}

function PhotoGrid({ church, community, onBack }) {
  const { data: photos = [], loading } = useFetch(
    () => getPhotos(church.id, { communityId: community.id }),
    [church.id, community.id],
    []
  );
  const [modalIdx, setModalIdx] = useState(null);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-body-4 text-grey-6 hover:text-blue-7 transition-colors">
          ← 목록
        </button>
        <h2 className="text-sub-tit-3 font-bold text-grey-11">{community.name}</h2>
      </div>
      {loading ? (
        <div className="text-center py-20 text-body-4 text-bluegrey-5">불러오는 중...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 text-body-4 text-bluegrey-5">사진이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setModalIdx(idx)}
              className="bg-grey-3 rounded-2xl h-48 flex items-center justify-center cursor-pointer hover:bg-grey-4 transition-colors"
            >
              <span className="text-grey-5 text-body-4">사진</span>
            </div>
          ))}
        </div>
      )}

      {modalIdx !== null && (
        <PhotoModal
          photo={photos[modalIdx]}
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

function CommunityCard({ community, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col rounded-2xl border border-grey-3 overflow-hidden hover:border-blue-6 transition-colors text-left"
    >
      <div className="aspect-square w-full bg-grey-4 group-hover:bg-grey-5 transition-colors flex items-center justify-center">
        <span className="text-grey-6 text-body-4">사진</span>
      </div>
      <div className="p-4">
        <p className="text-sub-tit-5 font-semibold text-grey-11 truncate">{community.name}</p>
        <p className="text-body-5 text-grey-6 mt-0.5 truncate">{community.desc}</p>
      </div>
    </button>
  );
}

function CommunityListRow({ community, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-4 py-4 border-b border-grey-3 hover:bg-grey-1 transition-colors text-left"
    >
      <div className="min-w-0">
        <p className="text-body-2 font-semibold text-grey-11 truncate">{community.name}</p>
        <p className="text-body-5 text-grey-6 mt-0.5 truncate">{community.desc}</p>
      </div>
      <svg
        className="w-4 h-4 text-grey-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function ViewToggle({ viewMode, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-grey-3 p-1 self-end">
      {[
        { value: "card", label: "카드보기" },
        { value: "list", label: "리스트보기" },
      ].map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-body-5 font-medium transition-colors ${
            viewMode === opt.value
              ? "bg-primary text-white"
              : "text-grey-6 hover:text-grey-9"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Gallery() {
  const { church } = useChurch();
  const { data: communities = [], loading } = useFetch(
    () => getCommunities(church.id),
    [church.id],
    []
  );
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const communityName = searchParams.get("community");
    if (!communityName || communities.length === 0) return;
    const matched = communities.find((c) => c.name === communityName);
    if (matched) setSelected(matched);
  }, [searchParams, communities]);

  return (
    <div className="max-w-[1576px] mx-auto px-4 pt-6 pb-10 md:px-8 md:pt-10 md:pb-20">
      {!selected ? (
        /* Community List */
        loading ? (
          <div className="text-center py-20 text-body-4 text-bluegrey-5">불러오는 중...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>

            {viewMode === "card" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {communities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onSelect={() => setSelected(community)}
                  />
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto w-full">
                {communities.map((community) => (
                  <CommunityListRow
                    key={community.id}
                    community={community}
                    onSelect={() => setSelected(community)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <PhotoGrid church={church} community={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}
