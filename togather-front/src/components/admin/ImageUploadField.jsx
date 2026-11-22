import { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/services/uploadService";
import BubbleLoader from "@/components/common/BubbleLoader";
import ImageCropModal from "./ImageCropModal";

const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

/** 업로드 로직만 떼어낸 훅 — 전체형/인라인형 두 렌더링이 이 하나를 공유한다. */
function useImageUpload(onChange) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // 업로드 중 보여주는 로컬 미리보기(blob URL) — 실제 URL로 교체되거나 컴포넌트가
  // 사라지면 더 이상 필요 없으므로 해제한다.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function uploadFile(file) {
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error("[ImageUploadField] 업로드 실패:", err);
      setError("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  }

  return { uploading, error, setError, previewUrl, uploadFile };
}

/**
 * 관리자 이미지 업로드 공통 필드 — URL 직접 입력 대신 파일을 골라 업로드하고,
 * 폼이 들고 있는 값은 여전히 문자열 URL 하나다(백엔드 모델이 URL 필드를 쓰므로).
 * 파일을 고르면 바로 업로드하지 않고 크롭 모달(ImageCropModal)을 먼저 띄워 위치·확대를
 * 조정하게 한 뒤, 거기서 "적용"을 눌러야 실제 업로드가 시작된다.
 *
 * 백엔드에 업로드 엔드포인트가 아직 없다(docs/backend-requests.md §4-2) — 업로드를
 * 시도하면 지금은 실패하고 에러 메시지가 뜬다. 엔드포인트가 생기면 uploadService만
 * 손보면 되고 이 컴포넌트를 쓰는 화면들은 그대로 둬도 된다.
 *
 * compact: RepeatableFieldRows처럼 여러 필드가 한 줄에 나란히 들어가는 좁은 그리드 셀
 * 안에서 쓸 때 — 라벨/힌트 없이 작은 썸네일 + 버튼만 보여준다(크롭 비율 자체는 동일하게
 * aspect prop을 따른다).
 */
export default function ImageUploadField({
  id,
  label,
  value,
  onChange,
  hint,
  aspect = 16 / 9,
  compact = false,
  ariaLabel,
  wide = false,
}) {
  const fileInputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const { uploading, error, setError, previewUrl, uploadFile } = useImageUpload(onChange);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setError("");
    setPendingFile(file);
  }

  const displayUrl = value || previewUrl;

  const hiddenInputAndModal = (
    <>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={ariaLabel}
      />
      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          aspect={aspect}
          onCancel={() => setPendingFile(null)}
          onConfirm={(croppedFile) => {
            setPendingFile(null);
            void uploadFile(croppedFile);
          }}
        />
      )}
    </>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 rounded-lg border border-grey-3 bg-grey-1 overflow-hidden shrink-0">
          {displayUrl && <img src={displayUrl} alt="" className="w-full h-full object-cover" />}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <BubbleLoader size="sm" className="text-white" />
            </div>
          )}
        </div>
        {hiddenInputAndModal}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-body-5 font-semibold text-grey-7 underline disabled:opacity-50 shrink-0"
        >
          {uploading ? "업로드 중..." : value ? "변경" : "업로드"}
        </button>
        {error && <p className="text-body-5 text-red-500 truncate">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className={labelCls} htmlFor={id}>
          {label}
        </label>
      )}
      {/* 박스 자체가 업로드 버튼이다 — 클릭하면 바로 파일 선택이 열린다(이미지가 있을 때는
          호버 시 "이미지 변경" 오버레이로 같은 동작임을 알려준다). */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`group relative block w-full ${wide ? "" : "max-w-sm"} rounded-xl border border-grey-3 bg-grey-1 overflow-hidden disabled:cursor-wait`}
        style={{ aspectRatio: aspect }}
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="text-white text-body-5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                이미지 변경
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-1 rounded-lg border-2 border-dashed border-grey-3 group-hover:border-primary flex flex-col items-center justify-center gap-0.5 text-grey-5 group-hover:text-primary transition-colors">
            <span className="text-body-5 font-semibold">이미지 없음</span>
            <span className="text-caption">클릭하여 업로드</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <BubbleLoader size="sm" className="text-white" />
          </div>
        )}
      </button>

      {hiddenInputAndModal}

      <div className="flex items-center gap-3 mt-2">
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-body-5 text-grey-5 underline"
          >
            제거
          </button>
        )}
        {error ? (
          <p className="text-body-5 text-red-500">{error}</p>
        ) : (
          hint && <p className="text-body-5 text-grey-5">{hint}</p>
        )}
      </div>
    </div>
  );
}
