import { useEffect } from "react";
import DevicePreviewFrame from "./DevicePreviewFrame";
import SectionPreviewFrame from "./SectionPreviewFrame";

/** 미리보기 버튼을 누르면 뜨는 팝업 — 웹사이트 폭과 모바일 폭을 나란히 보여준다. */
export default function PreviewModal({ overrides, preview, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-[95vw] max-h-[92vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sub-tit-4 font-bold text-grey-10">미리보기</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center rounded-full text-grey-5 hover:bg-grey-1 hover:text-grey-9 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-6 items-start">
          <div>
            <p className="text-body-5 font-semibold text-grey-6 mb-2 text-center">웹사이트</p>
            <div className="border border-grey-2 rounded-xl overflow-hidden">
              <DevicePreviewFrame width={1024} height={700}>
                <SectionPreviewFrame overrides={overrides}>{preview}</SectionPreviewFrame>
              </DevicePreviewFrame>
            </div>
          </div>

          <div>
            <p className="text-body-5 font-semibold text-grey-6 mb-2 text-center">모바일</p>
            <div className="border border-grey-2 rounded-xl overflow-hidden">
              <DevicePreviewFrame width={390} height={700}>
                <SectionPreviewFrame overrides={overrides}>{preview}</SectionPreviewFrame>
              </DevicePreviewFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
