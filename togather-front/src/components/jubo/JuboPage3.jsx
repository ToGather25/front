import { useChurch } from "@/contexts/ChurchContext";
import logo from "@/assets/icons/옥길교회_logo.png";

export default function JuboPage3({ data }) {
  const { church } = useChurch();

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <div className="flex items-stretch">
        <div className="flex-3 bg-primary text-white px-4 py-2">
          <h2 className="text-sm font-bold">봉사 및 예물</h2>
        </div>
        <div className="flex-1 bg-blue-3 text-white px-4 py-2 flex items-center justify-center">
          <span className="text-xs">{data?.dateLabel || ""}</span>
        </div>
      </div>
      {/* 상단: 다음주 봉사 안내 (높이 제한) */}
      <div className="flex-1 px-6 pt-6 overflow-y-auto min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-primary rounded" />
          <h3 className="text-sm font-bold text-grey-12">다음주 봉사 안내</h3>
        </div>

        <div className="bg-grey-1 rounded-2 px-3 py-2 min-h-[160px] flex items-center">
          <div className="w-full space-y-1">
            {church.nurturePrograms?.slice(0, 3).map((program, i) => (
              <div key={i} className="flex gap-2 text-xs border-b border-grey-2 last:border-0 pb-0.5 last:pb-0">
                <div className="font-semibold text-grey-12 w-14 shrink-0">{program.title}</div>
                <div className="text-grey-8 text-xs truncate">{program.schedule}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단: 향기로운 예물 (남은 공간 차지) */}
      <div className="flex-3 px-6 pt-3 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-primary rounded" />
            <h3 className="text-sm font-bold text-grey-12">향기로운 예물</h3>
          </div>

          <div className="bg-grey-1 rounded-2 px-3 py-2 min-h-[500px] flex items-center">
            <div className="w-full space-y-1">
              {church.districtMeetings?.slice(0, 3).map((district) => (
                <div key={district.name} className="flex gap-2 text-xs border-b border-grey-2 last:border-0 pb-0.5 last:pb-0">
                  <div className="font-semibold text-grey-12 w-14 shrink-0">{district.name}</div>
                  <div className="text-grey-8 text-xs truncate">{district.leader}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 로고 */}
        <div className="shrink-0 flex justify-center pb-4 pt-2">
          <img src={church.logoUrl || logo} alt={church.name} className="h-6" />
        </div>
      </div>
    </div>
  );
}
