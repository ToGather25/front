import { useChurch } from "@/contexts/ChurchContext";

export default function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;

  return (
    <div>
      <div className="mb-12">
        <h3 className="text-sub-tit-2 font-bold text-grey-11 mb-3">{mainTitle}</h3>
        <p className="text-body-2 text-grey-7">{mainVerse}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.label} className="bg-white border border-bluegrey-2 rounded-2xl p-8 flex flex-col items-center text-center">
            {/* 아이콘 원형 배경 */}
            <div className="w-24 h-24 rounded-full bg-blue-1 flex items-center justify-center mb-6 shrink-0">
              <svg className="w-12 h-12 text-blue-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* 제목 */}
            <h4 className="text-sub-tit-4 font-bold text-grey-11 mb-3">{item.label}</h4>

            {/* 설명 */}
            <p className="text-body-4 text-grey-7 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
