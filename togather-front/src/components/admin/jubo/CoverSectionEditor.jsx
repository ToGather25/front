import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getCover, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

const EMPTY_PHOTOS = { church: "", panorama: "", group: "" };

export default function CoverSectionEditor({ churchId, juboId }) {
  const {
    data: initial,
    loading: prefillLoading,
    error: prefillError,
    refetch: refetchPrefill,
  } = useFetch(() => getCover(churchId), [churchId], null);
  const [photos, setPhotos] = useState(EMPTY_PHOTOS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) {
      setPhotos({
        church: initial.photos?.church ?? "",
        panorama: initial.photos?.panorama ?? "",
        group: initial.photos?.group ?? "",
      });
    }
  }, [initial]);

  function updatePhoto(field, value) {
    setPhotos((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "COVER", {
        photos: {
          church: photos.church || null,
          panorama: photos.panorama || null,
          group: photos.group || null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[CoverSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h3 className="text-body-3 font-bold text-grey-10 mb-4">표지 사진</h3>
      {prefillLoading && <p className="text-caption text-grey-5 mb-3">불러오는 중...</p>}
      {prefillError && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-caption text-grey-5">직전 발행본을 불러오지 못했습니다.</p>
          <button
            onClick={refetchPrefill}
            className="text-caption text-primary underline"
            type="button"
          >
            다시 시도
          </button>
        </div>
      )}
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="block text-caption text-grey-6 mb-1" htmlFor="cover-church-photo">
            교회 건물 사진 URL
          </label>
          <input
            id="cover-church-photo"
            className={inputCls}
            placeholder="https://..."
            value={photos.church}
            onChange={(e) => updatePhoto("church", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-caption text-grey-6 mb-1" htmlFor="cover-panorama-photo">
            예배 전경 사진 URL
          </label>
          <input
            id="cover-panorama-photo"
            className={inputCls}
            placeholder="https://..."
            value={photos.panorama}
            onChange={(e) => updatePhoto("panorama", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-caption text-grey-6 mb-1" htmlFor="cover-group-photo">
            공동체 단체 사진 URL
          </label>
          <input
            id="cover-group-photo"
            className={inputCls}
            placeholder="https://..."
            value={photos.group}
            onChange={(e) => updatePhoto("group", e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
