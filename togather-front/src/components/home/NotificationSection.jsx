import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import { getPhotos } from "@/services/galleryService";

export default function NotificationSection() {
  const navigate = useNavigate();
  const { church } = useChurch();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // 공지사항 조회 (최근 3개)
  const { data: responseData = { data: [] } } = useFetch(
    () => getNotices(church.id, { page: 1, limit: 3 }),
    [church.id],
    { data: [] }
  );
  const notices = responseData.data;

  // 갤러리 사진 조회 (최근 3개)
  const { data: allPhotos = [] } = useFetch(
    () => getPhotos(church.id, { limit: 3 }),
    [church.id],
    []
  );
  const photos = allPhotos.slice(0, 3).map((photo) => ({
    id: photo.id,
    title: photo.title,
    date: photo.date?.replace(/-/g, ".") || "",
    imageUrl: photo.imageUrl,
  }));

  // 3초마다 자동으로 다음 사진으로 전환
  useEffect(() => {
    if (photos.length < 2) return;
    const timer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <div className="pb-[140px] px-[200px] flex justify-center w-full">
      <div className="w-[1520px]">
        {/* 타이틀 */}
        <div className="text-center mb-14">
          <p className="text-pale text-headline-5 font-semibold mb-4">Notice</p>
          <h2 className="text-grey-12 text-section-title font-bold">주요 알림</h2>
        </div>

        {/* 공지 + 주보 */}
        <div className="grid grid-cols-2 gap-10">
          {/* 공지 알림 */}
          <div className="bg-bluegrey-1 rounded-2xl p-12 flex flex-col min-h-[330px] shadow-xl">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-grey-12 text-headline-4 font-bold">공지사항</h3>
              <button
                onClick={() => navigate("/공지사항")}
                className="w-8 h-8 flex items-center justify-center text-bluegrey-5 hover:opacity-70 transition-opacity"
                aria-label="공지사항 전체보기"
              >
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            {notices.length === 0 ? (
              <div className="flex-1 min-h-[200px] flex items-center justify-center">
                <p className="text-grey-6 text-body-2">등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {[...notices].sort((a, b) => {
                  if (a.featured && !b.featured) return -1;
                  if (!a.featured && b.featured) return 1;
                  return 0;
                }).map((notice, i) => (
                  <div key={notice.id}>
                    <button
                      onClick={() => navigate(`/공지사항?id=${notice.id}`)}
                      className="w-full flex gap-5 items-start text-left hover:opacity-70 transition-opacity"
                    >
                      <div
                        className={`w-2 h-8 rounded-sm shrink-0 ${
                          notice.featured ? "bg-primary" : "bg-grey-4"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-grey-11 text-body-1 font-medium mb-2 line-clamp-2">
                          {notice.title}
                        </p>
                        <p className="text-grey-6 text-body-2">{notice.date}</p>
                      </div>
                    </button>
                    {i < notices.length - 1 && (
                      <div className="mt-4 ml-7 border-t border-dotted border-bluegrey-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OK 갤러리 */}
          <div className="bg-primary rounded-2xl p-12 flex flex-col min-h-[330px] shadow-xl">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-white text-headline-4 font-bold">{church.shortName} 갤러리</h3>
              <button
                onClick={() => navigate("/갤러리")}
                className="w-8 h-8 flex items-center justify-center text-white hover:opacity-70 transition-opacity"
                aria-label="갤러리 전체보기"
              >
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            {photos.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/70 text-body-2">등록된 사진이 없습니다.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <button
                  onClick={() => navigate("/갤러리")}
                  className="w-full flex-1 rounded-xl overflow-hidden"
                >
                  {photos[activePhotoIndex].imageUrl ? (
                    <img
                      src={photos[activePhotoIndex].imageUrl}
                      alt={photos[activePhotoIndex].title}
                      className="w-full h-full min-h-[220px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[220px] bg-white/10" />
                  )}
                </button>

                {photos.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {photos.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setActivePhotoIndex(idx)}
                        aria-label={`${idx + 1}번째 사진`}
                        className={`h-2 rounded-full transition-all ${
                          idx === activePhotoIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
