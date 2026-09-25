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
        {church.publicTransit?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">대중교통</h3>
            <div className="flex flex-col gap-2">
              {church.publicTransit.map((route, i) => (
                <div key={i} className="py-2 text-body-4 text-grey-8">
                  <span className="font-semibold">{route.subway}</span>
                  <span className="text-grey-5 mx-2">→</span>
                  <span className="font-semibold">{route.bus}</span>
                  <span className="text-grey-5 mx-2">→</span>
                  <span className="text-grey-7">{route.dropoff}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
