import { useState, useEffect } from "react";
import BubbleLoader from "@/components/common/BubbleLoader";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useFetch } from "@/hooks/useFetch";
import { getCover, updateJuboSection } from "@/services/juboService";

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
      {prefillLoading && <div className="flex justify-center py-2"><BubbleLoader size="sm" /></div>}
      {prefillError && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-caption text-grey-5">직전 발행본을 불러오지 못했습니다.</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <ImageUploadField
          id="cover-church-photo"
          label="교회 건물 사진"
          aspect={4 / 3}
          value={photos.church}
          onChange={(url) => updatePhoto("church", url)}
        />
        <ImageUploadField
          id="cover-panorama-photo"
          label="예배 전경 사진"
          aspect={21 / 9}
          value={photos.panorama}
          onChange={(url) => updatePhoto("panorama", url)}
        />
        <ImageUploadField
          id="cover-group-photo"
          label="공동체 단체 사진"
          aspect={4 / 3}
          value={photos.group}
          onChange={(url) => updatePhoto("group", url)}
        />
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
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
