import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import { SectionTitle } from "./shared";

export default function Direction() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <KakaoMap
          level={church.location.level}
          address={church.address}
          className="w-full rounded-xl overflow-hidden mb-3"
          style={{ height: 320 }}
        />
        <p className="text-right text-caption text-grey-7">{church.address}</p>
      </div>
      <div>
        <SectionTitle
          icon={
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 3v5h-7V8zM5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm12 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
            </svg>
          }
        >
          셔틀 안내
        </SectionTitle>
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">운행 코스</th>
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">시간 및 경유지</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(({ name, schedule }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3.5 px-4 font-semibold text-grey-10 w-36">{name}</td>
                <td className="py-3.5 px-4 text-grey-6">{schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
