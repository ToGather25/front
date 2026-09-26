import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import churchSermonBg from "@/assets/church_sermon.png";

export default function Direction() {
  const { church } = useChurch();

  return (
    <div
      className="relative py-[200px]"
      style={{
        backgroundImage: `url('${churchSermonBg}')`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* 어두운 오버레이 (#1A2439 투명도 80%) */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(26, 36, 57, 0.8)" }} />

      {/* 콘텐츠 */}
      <div className="relative px-[180px] flex justify-center">
        <div className="w-full flex flex-col gap-16">
          {/* 타이틀 */}
          <div className="text-center">
            <p className="text-pale text-headline-5 font-semibold mb-4">Contact Us</p>
            <h2 className="text-white text-section-title font-bold">찾아오시는 길</h2>
          </div>

          {/* 지도 */}
          <div className="w-full rounded-2xl overflow-hidden border-2 border-grey-10 h-[600px] bg-grey-1">
            <KakaoMap
              level={church.location?.level ?? 3}
              address={church.address}
              draggable={false}
              className="w-full h-full"
              showTraffic
            />
          </div>
        </div>
      </div>
    </div>
  );
}
