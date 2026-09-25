import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";

export default function Direction() {
  const { church } = useChurch();

  return (
    <div className="relative py-[120px]">
      {/* 어두운 배경 + 배경 이미지 */}
      <div className="absolute inset-0 bg-primary-darker" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-darker/60 to-primary-darker/90" />

      {/* 콘텐츠 */}
      <div className="relative px-[180px] flex justify-center">
        <div className="w-full flex flex-col gap-16">
          {/* 타이틀 */}
          <div className="text-center">
            <p className="text-pale text-[30px] font-bold mb-4">Contact Us</p>
            <h2 className="text-white text-[40px] font-bold">찾아오시는 길</h2>
          </div>

          {/* 지도 */}
          <div className="w-full rounded-[24px] overflow-hidden border-2 border-grey-10 h-[546px] bg-grey-1">
            <KakaoMap
              level={church.location?.level ?? 3}
              address={church.address}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
