import { useState } from "react";
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
        <div className="grid grid-cols-3 gap-4">
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

export default function Gallery() {
  const { church } = useChurch();
  const { data: communities = [], loading } = useFetch(
    () => getCommunities(church.id),
    [church.id],
    []
  );
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-[1576px] mx-auto px-8 py-10">
      {!selected ? (
        /* Community List */
        loading ? (
          <div className="text-center py-20 text-body-4 text-bluegrey-5">불러오는 중...</div>
        ) : (
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            {communities.map((community, i) => (
              <div
                key={community.id}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors ${
                  i === 0 ? "bg-grey-2 border-grey-3" : "border-grey-3 hover:bg-grey-1"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-grey-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-sub-tit-5 font-semibold text-grey-11">{community.name}</p>
                  <p className="text-body-4 text-grey-6 mt-0.5">{community.desc}</p>
                </div>
                <button
                  onClick={() => setSelected(community)}
                  className="px-4 py-2 bg-grey-3 text-body-4 text-grey-8 rounded-full hover:bg-grey-4 transition-colors shrink-0"
                >
                  사진보기
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <PhotoGrid church={church} community={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}
