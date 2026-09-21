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
        <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-1 px-4 py-1">
          <p className="text-body-4 text-grey-8">{church.address}</p>
          <button
            type="button"
            onClick={handleCopyAddress}
            aria-label="주소 복사"
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-grey-6 hover:text-primary hover:bg-blue-2 transition-colors"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 mt-8 md:mt-0">
        {church.publicTransit?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">대중교통</h3>
            <div className="flex flex-col gap-3">
              {church.publicTransit.map((route, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-bluegrey-2 bg-bluegrey-1/60 px-4 py-3"
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
                  <span className="inline-flex items-center gap-1 text-body-4 text-grey-7">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"
                      />
                      <circle cx="12" cy="9.5" r="2.2" />
                    </svg>
                    {route.dropoff}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
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
