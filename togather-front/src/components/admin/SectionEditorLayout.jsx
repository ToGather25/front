import SectionPreviewFrame from "./SectionPreviewFrame";

/**
 * 교회소개 섹션 편집 화면 공통 레이아웃 — 좌측 폼, 우측에 실제 공개 컴포넌트를 그대로
 * 렌더링하는 실시간 미리보기(split-view)를 둔다.
 */
export default function SectionEditorLayout({ title, description, actions, overrides, preview, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-5 font-bold text-grey-11">{title}</h1>
          {description && <p className="text-body-4 text-grey-5 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,440px)" }}>
        <div className="flex flex-col gap-5 min-w-0">{children}</div>

        <div className="sticky top-6 min-w-0">
          <p className="text-body-5 font-semibold text-grey-6 mb-2">실시간 미리보기</p>
          <div className="bg-white border border-grey-2 rounded-2xl p-6 max-h-[calc(100vh-140px)] overflow-y-auto">
            <SectionPreviewFrame overrides={overrides}>{preview}</SectionPreviewFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
