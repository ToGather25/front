import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";

export default function Direction() {
  const { church } = useChurch();
  const lots = church.parking.lots;
  const [selectedLot, setSelectedLot] = useState(0);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(church.address);
      alert("주소가 복사되었습니다.");
    } catch {
      alert("주소 복사에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:gap-12 md:items-stretch">
      <div className="w-full md:w-[42%] md:max-w-[480px] md:shrink-0 flex flex-col">
        <KakaoMap
          level={church.location.level}
          address={church.address}
          className="w-full flex-1 rounded-2xl overflow-hidden mb-3"
        />
      </div>

      <div className="flex-1 min-w-0 mt-8 md:mt-0">
        <div className="mb-8">
          <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">대중교통</h3>
          {church.publicTransit?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {church.publicTransit.map((route, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-1 px-3 py-1.5 text-body-5 font-semibold text-blue-8">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="4" y="3" width="16" height="14" rx="4" />
                      <path strokeLinecap="round" d="M4 11h16M8 17l-2 3M16 17l2 3" />
                      <circle cx="8" cy="14" r="0.5" fill="currentColor" />
                      <circle cx="16" cy="14" r="0.5" fill="currentColor" />
                    </svg>
                    {route.subway}
                  </span>
                  <svg
                    className="w-4 h-4 text-grey-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-body-5 font-semibold text-grey-9 border border-bluegrey-2">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="4" y="4" width="16" height="12" rx="2" />
                      <path strokeLinecap="round" d="M4 10h16M7 20l1-2M17 20l-1-2" />
                      <circle cx="8" cy="13" r="0.5" fill="currentColor" />
                      <circle cx="16" cy="13" r="0.5" fill="currentColor" />
                    </svg>
                    {route.bus}
                  </span>
                  <svg
                    className="w-4 h-4 text-grey-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-grey-2 px-3 py-1.5 text-body-5 font-semibold text-grey-8">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {route.dropoff}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-4 text-grey-5 text-center">정보가 없습니다.</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 pt-8 border-t border-bluegrey-2">
          <h3 className="text-sub-tit-3 font-bold text-grey-11">주차 안내</h3>
          {lots.length > 1 && (
            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(Number(e.target.value))}
              className="pl-3 pr-8 py-1.5 border border-bluegrey-2 rounded-lg text-body-4 text-grey-8 bg-white"
            >
              {lots.map((lot, i) => (
                <option key={lot.name} value={i}>
                  {lot.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {lots[selectedLot].details.map(({ label, value }) => (
              <tr key={label} className="border-b border-grey-3">
                <td className="py-4 font-semibold text-grey-10 w-36">{label}</td>
                <td className="py-4 text-grey-6">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
