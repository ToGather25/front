import { useState } from "react";
import PreviewModal from "./PreviewModal";

/**
 * 교회소개 섹션 편집 화면 공통 레이아웃 — 좌측에 편집 폼을 두고, "미리보기" 버튼을 누르면
 * 웹사이트 폭/모바일 폭 미리보기를 팝업으로 띄운다(PreviewModal).
 */
export default function SectionEditorLayout({ title, description, actions, overrides, preview, children }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-5 font-bold text-grey-11">{title}</h1>
          {description && <p className="text-body-4 text-grey-5 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-grey-3 text-body-4 font-semibold text-grey-7 hover:border-primary hover:text-primary transition-colors"
          >
            미리보기
          </button>
          {actions}
        </div>
      </div>

      <div className="flex flex-col gap-5">{children}</div>

      {previewOpen && (
        <PreviewModal overrides={overrides} preview={preview} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
