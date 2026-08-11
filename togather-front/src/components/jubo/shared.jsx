// 주보 컨텐츠 래퍼 — 화면: 반응형 / 인쇄: A4
export function JuboPage({ children, noPadding = false }) {
  return (
    <div className="jubo-page w-full mx-auto bg-white border border-bluegrey-2 shadow-md rounded-2xl overflow-hidden">
      <div className={noPadding ? "" : "p-4 md:p-8 lg:p-10"}>{children}</div>
    </div>
  );
}

// 공통 섹션 타이틀
export function SectionTitle({ icon, children }) {
  return (
    <>
      <h3 className="flex items-center gap-2.5 text-sub-tit-4 font-bold text-grey-11 mb-4">
        {icon}
        {children}
      </h3>
      <div className="border-t-2 border-grey-11" />
    </>
  );
}
