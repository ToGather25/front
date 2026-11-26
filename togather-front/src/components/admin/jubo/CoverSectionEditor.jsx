import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import BubbleLoader from "@/components/common/BubbleLoader";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useFetch } from "@/hooks/useFetch";
import { getCover } from "@/services/juboService";

const EMPTY_PHOTOS = { church: "", panorama: "", group: "" };

const CoverSectionEditor = forwardRef(function CoverSectionEditor({ churchId }, ref) {
  const {
    data: initial,
    loading: prefillLoading,
    error: prefillError,
    refetch: refetchPrefill,
  } = useFetch(() => getCover(churchId), [churchId], null);
  const [photos, setPhotos] = useState(EMPTY_PHOTOS);

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

  useImperativeHandle(ref, () => ({
    getDraft: () => ({
      COVER: {
        photos: {
          church: photos.church || null,
          panorama: photos.panorama || null,
          group: photos.group || null,
        },
      },
    }),
  }));

  return (
    <div>
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
          wide
        />
        <ImageUploadField
          id="cover-panorama-photo"
          label="예배 전경 사진"
          aspect={21 / 9}
          value={photos.panorama}
          onChange={(url) => updatePhoto("panorama", url)}
          wide
        />
        <ImageUploadField
          id="cover-group-photo"
          label="공동체 단체 사진"
          aspect={4 / 3}
          value={photos.group}
          onChange={(url) => updatePhoto("group", url)}
          wide
        />
      </div>
    </div>
  );
});

export default CoverSectionEditor;
