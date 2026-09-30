import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import logo from "@/assets/icons/옥길교회_logo.png";

export default function JuboPage4({ data }) {
  const { church } = useChurch();

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <div className="flex items-stretch">
        <div className="flex-3 bg-primary text-white px-4 py-2">
          <h2 className="text-sm font-bold">기타안내</h2>
        </div>
        <div className="flex-1 bg-blue-3 text-white px-4 py-2 flex items-center justify-center">
          <span className="text-xs">{data?.dateLabel || ""}</span>
        </div>
      </div>
      {/* 구역모임 */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded" />
          <h3 className="text-sm font-bold text-grey-12">구역모임</h3>
        </div>

        <div className="bg-grey-1 rounded-2 px-3 py-1.5 min-h-[200px] flex items-center">
          <div className="w-full space-y-0.5">
            <div className="flex gap-2 items-start text-xs">
              <div className="font-semibold text-grey-12 w-12 shrink-0">성명</div>
              <div className="text-grey-8 text-xs">{church.staff?.headPastor?.name}</div>
            </div>
            <div className="flex gap-2 items-start text-xs">
              <div className="font-semibold text-grey-12 w-12 shrink-0">연락</div>
              <div className="text-grey-8 text-xs">{church.staff?.headPastor?.tel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 섬기는 분들 */}
      <div className="px-6 pt-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded" />
          <h3 className="text-sm font-bold text-grey-12">섬기는 분들</h3>
        </div>

        <div className="bg-grey-1 rounded-2 px-3 py-1.5 min-h-[230px] flex items-center">
          <div className="w-full space-y-0.5">
            {church.staff?.clergy?.slice(0, 2).map((pastor) => (
              <div key={pastor.name} className="text-xs border-b border-grey-2 last:border-0 pb-0.5 last:pb-0">
                <div className="font-semibold text-grey-12 text-xs">{pastor.name}</div>
                <div className="text-grey-8 text-xs">{pastor.tel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오시는 길 */}
      <div className="flex-1 px-6 pt-3 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-primary rounded" />
            <h3 className="text-sm font-bold text-grey-12">오시는 길</h3>
          </div>

          <div className="bg-grey-1 rounded-2 px-3 py-1.5 text-xs min-h-[200px] flex gap-3">
            {/* 왼쪽: 카카오맵 */}
            <div className="kakao-map-container w-[280px] h-[170px] flex-shrink-0 rounded overflow-hidden">
              <KakaoMap
                address={church.address}
                level={5}
                draggable={false}
                showControls={false}
                showInfoWindow={false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* 오른쪽: 정보 */}
            <div className="flex-1 space-y-0.5 flex flex-col justify-center">
              <div className="flex gap-2 items-start">
                <div className="font-semibold text-grey-12 w-10 shrink-0 text-xs">주소</div>
                <div className="text-grey-9 text-xs line-clamp-2">{church.address}</div>
              </div>

              <div className="flex gap-2 items-start">
                <div className="font-semibold text-grey-12 w-10 shrink-0 text-xs">전화</div>
                <div className="text-grey-9 text-xs">{church.tel}</div>
              </div>

              <div className="flex gap-2 items-start">
                <div className="font-semibold text-grey-12 w-10 shrink-0 text-xs">이메일</div>
                <div className="text-grey-9 text-xs truncate">{church.email}</div>
              </div>
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
