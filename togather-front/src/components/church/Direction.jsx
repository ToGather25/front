import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";

export default function Direction() {
  const { church } = useChurch();
  return (
    <div className="flex flex-col md:flex-row md:gap-12 md:items-start">
      <div className="flex-1">
        <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">주차 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {church.parking.details.map(({ label, value }) => (
              <tr key={label} className="border-b border-grey-3">
                <td className="py-4 font-semibold text-grey-10 w-36">{label}</td>
                <td className="py-4 text-grey-6">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full md:w-[480px] md:shrink-0">
        <KakaoMap
          level={church.location.level}
          address={church.address}
          className="w-full h-72 rounded-2xl overflow-hidden mb-3"
        />
        <p className="text-body-4 text-grey-7">{church.address}</p>
      </div>
    </div>
  );
}
