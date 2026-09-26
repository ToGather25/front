import { useChurch } from "@/contexts/ChurchContext";

export default function JuboSection3() {
  const { church } = useChurch();

  return (
    <div className="flex flex-col gap-12 px-15 py-12">
      {/* 다음주 봉사 안내 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">다음주 봉사 안내</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">제목</div>
                <div className="text-body-3 text-grey-8">내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 향기로운 예물 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">향기로운 예물</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">십일조</div>
              <div className="flex-1 grid grid-cols-4 gap-5 text-body-4 text-grey-8">
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">선교 헌금</div>
              <div className="flex-1 grid grid-cols-4 gap-5 text-body-4 text-grey-8">
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">건축 헌금</div>
              <div className="flex-1 grid grid-cols-4 gap-5 text-body-4 text-grey-8">
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
                <div>임재호(유정아)</div>
                <div>-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
