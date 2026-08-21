import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import {
  getCommunities,
  getPhotos,
  createCommunity,
  createPhoto,
  deletePhoto,
} from "@/services/galleryService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function CommunityModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", desc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("공동체 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[480px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">공동체 등록</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>공동체 이름</label>
            <input
              className={inputCls}
              placeholder="예) 청년부"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>소개</label>
            <input
              className={inputCls}
              placeholder="예) 젊은 에너지로 하나님을 찾는"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
        </div>
        {error && <p className="text-body-5 text-red-500 mt-3">{error}</p>}
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", date: "", desc: "", imageUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("사진 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[480px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">사진 등록</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>제목</label>
            <input
              className={inputCls}
              placeholder="예) 여름 수련회"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>날짜</label>
            <input
              className={inputCls}
              placeholder="예) 2026년 8월 1일"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>설명</label>
            <input
              className={inputCls}
              placeholder="사진에 대한 간단한 설명"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>이미지 URL</label>
            <input
              className={inputCls}
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>
        </div>
        {error && <p className="text-body-5 text-red-500 mt-3">{error}</p>}
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryManage() {
  const { church } = useChurch();
  const [communities, setCommunities] = useState([]);
  const [communityError, setCommunityError] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  function fetchCommunities(cancelledRef) {
    setCommunityError(false);
    return getCommunities(church.id)
      .then((list) => {
        if (!cancelledRef?.current) setCommunities(list);
      })
      .catch(() => {
        if (!cancelledRef?.current) setCommunityError(true);
      });
  }

  useEffect(() => {
    const cancelledRef = { current: false };
    fetchCommunities(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [church.id]);

  function fetchPhotos(communityId, cancelledRef) {
    setPhotoError(false);
    return getPhotos(church.id, { communityId })
      .then((list) => {
        if (!cancelledRef?.current) setPhotos(list);
      })
      .catch(() => {
        if (!cancelledRef?.current) setPhotoError(true);
      });
  }

  useEffect(() => {
    if (!selectedId) return;
    const cancelledRef = { current: false };
    fetchPhotos(selectedId, cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [church.id, selectedId]);

  async function handleSaveCommunity(form) {
    const created = await createCommunity(church.id, form);
    setCommunities((prev) => [...prev, created]);
  }

  async function handleSavePhoto(form) {
    const created = await createPhoto(church.id, { ...form, communityId: selectedId });
    setPhotos((prev) => [created, ...prev]);
  }

  async function handleDeletePhoto(photoId) {
    if (!confirm("삭제하시겠습니까?")) return;
    setDeletingId(photoId);
    setDeleteError("");
    try {
      await deletePhoto(church.id, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setDeleteError("사진 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  const selectedCommunity = communities.find((c) => c.id === selectedId);

  return (
    <div>
      {showCommunityModal && (
        <CommunityModal
          onClose={() => setShowCommunityModal(false)}
          onSave={handleSaveCommunity}
        />
      )}
      {showPhotoModal && (
        <PhotoModal onClose={() => setShowPhotoModal(false)} onSave={handleSavePhoto} />
      )}

      {/* 공동체 관리 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">갤러리 관리</h1>
        <button
          onClick={() => setShowCommunityModal(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          공동체 등록
        </button>
      </div>

      {communityError ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-white rounded-2xl border border-grey-2">
          <p className="text-body-4 text-grey-7">불러오지 못했습니다. 다시 시도해 주세요.</p>
          <button
            onClick={() => fetchCommunities()}
            className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`text-left bg-white rounded-2xl border p-5 transition-colors ${
                selectedId === c.id ? "border-primary" : "border-grey-2 hover:border-blue-4"
              }`}
            >
              <p className="text-body-3 font-semibold text-grey-11 truncate">{c.name}</p>
              {c.desc && <p className="text-body-5 text-grey-6 mt-1 truncate">{c.desc}</p>}
            </button>
          ))}
        </div>
      )}

      {/* 사진 관리 */}
      <div className="bg-white rounded-2xl border border-grey-2 p-6">
        {!selectedId ? (
          <p className="text-body-4 text-grey-6 text-center py-10">
            공동체를 먼저 선택해 주세요.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sub-tit-4 font-bold text-grey-10">
                {selectedCommunity?.name} 사진
              </h2>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
              >
                사진 등록
              </button>
            </div>

            {deleteError && <p className="text-body-5 text-red-500 mb-3">{deleteError}</p>}

            {photoError ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <p className="text-body-4 text-grey-7">불러오지 못했습니다. 다시 시도해 주세요.</p>
                <button
                  onClick={() => fetchPhotos(selectedId)}
                  className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : photos.length === 0 ? (
              <p className="text-body-4 text-grey-6 text-center py-10">등록된 사진이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((p) => (
                  <div key={p.id} className="rounded-xl border border-grey-2 overflow-hidden">
                    <div className="aspect-square bg-grey-2 flex items-center justify-center">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-body-5 font-semibold text-grey-10 truncate">{p.title}</p>
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        disabled={deletingId === p.id}
                        className="mt-2 text-body-5 text-grey-5 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === p.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
