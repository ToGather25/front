import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import KakaoMap from "@/components/common/KakaoMap";
import IcoLocation from "@/assets/icon-svg/main-location.svg";
import IcoPhone from "@/assets/icon-svg/main-phone.svg";
import IcoBus from "@/assets/icon-svg/main-bus.svg";
import IcoEnter from "@/assets/icon-svg/main-enter.svg";

export default function DirectionsSection() {
  const { church } = useChurch();

  const infoRows = [
    {
      icon: <img src={IcoLocation} className="w-5 h-5" alt="" />,
      label: "주소",
      content: church.address,
    },
    {
      icon: <img src={IcoPhone} className="w-5 h-5" alt="" />,
      label: "전화",
      content: `TEL ${church.tel}${church.fax ? ` · FAX ${church.fax}` : ""}`,
    },
    {
      icon: <img src={IcoBus} className="w-5 h-5" alt="" />,
      label: "대중교통",
      content: "지하철 7호선 까치울역 2번 출구 · 버스 56, 74, 88번",
    },
  ];

  return (
    <Section className="py-[120px] bg-white">
      <div className="mb-8">
        <p className="text-caption font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3 ml-1">
          DIRECTIONS
        </p>
        <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0 mb-8">
          찾아오시는 길
        </h3>
      </div>

      <div className="grid gap-8 items-stretch" style={{ gridTemplateColumns: "1fr 540px" }}>
        {/* Map */}
        <div className="rounded-[20px] overflow-hidden bg-bluegrey-2">
          <KakaoMap
            level={church.location?.level ?? 3}
            address={church.address}
            draggable={false}
            className="w-full h-full"
          />
        </div>

        {/* Info — 지도 높이에 맞춰 flex 분배 */}
        <div className="h-full flex flex-col py-3">
          {/* 주소·전화·교통 정보 */}
          <div className="flex flex-col gap-5 shrink-0">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                  {row.icon}
                </div>
                <div className="pt-1">
                  <span className="text-caption font-bold text-grey-7 uppercase tracking-[0.06em]">
                    {row.label}
                  </span>
                  <p className="text-[15px] text-grey-9 leading-[1.6] mt-0.5 m-0">
                    {row.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-6">
            {[
              { label: "주차 안내", to: "/교회소개?tab=오시는 길" },
              { label: "셔틀 안내", to: "/교회소개?tab=차량운행 안내" },
              { label: "문의하기", to: "/문의하기" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="h-18 flex items-center justify-between px-6 rounded-xl bg-primary text-white font-bold text-body-2 hover:bg-blue-8 active:scale-[0.99] transition-all"
              >
                <span>{label}</span>
                <img src={IcoEnter} className="w-5 h-5 opacity-70" alt="" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
