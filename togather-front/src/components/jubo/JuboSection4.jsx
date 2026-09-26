import { useChurch } from "@/contexts/ChurchContext";

export default function JuboSection4() {
  const { church } = useChurch();

  return (
    <div className="flex flex-col gap-12 px-15 py-12">
      {/* 우리 교회가 돕고 있는 곳 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">우리 교회가 돕고 있는 곳</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5 pb-6 border-b border-bluegrey-2 last:border-0 last:pb-0">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">후원지명</div>
                <div className="text-body-3 text-grey-8">후원 내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 구역 모임 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">구역 모임</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5 pb-6 border-b border-bluegrey-2 last:border-0 last:pb-0">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">구역명</div>
                <div className="text-body-3 text-grey-8">구역 내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
