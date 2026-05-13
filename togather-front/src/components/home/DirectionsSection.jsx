import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import KakaoMap from "@/components/common/KakaoMap";

export default function DirectionsSection() {
  const { church } = useChurch();

  const infoRows = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 2c4 4 6 7 6 11a6 6 0 0 1-12 0c0-4 2-7 6-11z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      ),
      label: "주소",
      content: church.address,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 6c0-1 1-2 2-2h2l2 5-2 2a12 12 0 0 0 5 5l2-2 5 2v2c0 1-1 2-2 2A18 18 0 0 1 4 6z" />
        </svg>
      ),
      label: "전화",
      content: `TEL ${church.tel}${church.fax ? ` · FAX ${church.fax}` : ""}`,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="14" rx="2" />
          <path d="M4 11h16M7 18v2M17 18v2" />
          <circle cx="8" cy="15" r="1" />
          <circle cx="16" cy="15" r="1" />
        </svg>
      ),
      label: "대중교통",
      content: "지하철 7호선 까치울역 2번 출구 · 버스 56, 74, 88번",
    },
  ];

  return (
    <Section className="py-[120px] bg-bluegrey-1">
      <h3 className="text-[44px] font-bold tracking-[-1.2px] text-grey-12 m-0 mb-8">
        찾아오시는 길
      </h3>

      <div className="grid gap-8 items-stretch" style={{ gridTemplateColumns: "1fr 540px" }}>
        {/* Map — 16:9 비율로 높이 결정 */}
        <div className="rounded-[20px] overflow-hidden bg-bluegrey-2" style={{ aspectRatio: "16/9" }}>
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
                  <span className="text-[13px] font-bold text-grey-7 uppercase tracking-[0.06em]">
                    {row.label}
                  </span>
                  <p className="text-[15px] text-grey-9 leading-[1.6] mt-0.5 m-0">
                    {row.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons — 남은 공간 균등 분배 */}
          <div className="flex flex-col gap-3 mt-6 flex-1 min-h-0">
            {["주차 안내", "셔틀 안내", "문의하기"].map((label) => (
              <button
                key={label}
                className="flex-1 flex items-center justify-between px-6 rounded-xl bg-primary text-white font-bold text-[16px] hover:bg-blue-8 active:scale-[0.99] transition-all"
              >
                <span>{label}</span>
                <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
