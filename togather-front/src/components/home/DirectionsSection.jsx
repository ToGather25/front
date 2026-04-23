import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import SectionTitle from "@/components/common/SectionTitle";
import KakaoMap from "@/components/common/KakaoMap";

const DIRECTION_BUTTONS = [
  { label: "주차 안내", icon: "🚗" },
  { label: "셔틀 안내", icon: "🚌" },
  { label: "문의하기", icon: "📞" },
];

export default function DirectionsSection() {
  const { church } = useChurch();

  return (
    <Section className="py-12 bg-white">
      <div className="flex flex-col gap-6">
        <SectionTitle>찾아오시는 길</SectionTitle>
        <div className="flex gap-6">
          {/* 지도 카드 */}
          <div className="flex-1 border border-bluegrey-2 rounded-2xl p-6 flex flex-col gap-4 bg-white">
            <KakaoMap
              level={church.location.level}
              address={church.address}
              draggable={false}
              className="w-full h-60 rounded-xl overflow-hidden"
            />
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-grey-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-body-3 text-grey-7">{church.address}</p>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="w-64 flex flex-col gap-3">
            {DIRECTION_BUTTONS.map(({ label }) => (
              <button
                key={label}
                className="flex-1 bg-primary hover:bg-blue-7 transition-colors rounded-xl px-6 flex items-center justify-between text-white group"
              >
                <span className="text-sub-tit-4 font-bold py-6">{label}</span>
                <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
