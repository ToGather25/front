import { useChurch } from "@/contexts/ChurchContext";
import KakaoMapRoute from "@/components/common/KakaoMapRoute";

export default function TransportGuide() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;
  const hasAnyRoute = routes.some((r) => r.waypoints?.length > 0);

  return (
    <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
      <div className="flex-1">
        <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">코스 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {routes.map(({ name, schedule, color }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-4 w-8 pr-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ background: color ?? "var(--color-primary)" }}
                  />
                </td>
                <td className="py-4 font-semibold text-grey-10 w-28">{name}</td>
                <td className="py-4 text-grey-6">{schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!hasAnyRoute && (
          <p className="mt-4 text-body-5 text-grey-5">
            경유지 좌표를 입력하면 지도에 경로가 표시됩니다.
          </p>
        )}
      </div>

      <div className="w-full md:w-[480px] md:shrink-0">
        <KakaoMapRoute
          address={church.address}
          level={church.location?.level ?? 5}
          routes={routes}
          className="w-full h-[300px] rounded-2xl overflow-hidden"
        />
        {hasAnyRoute && (
          <div className="mt-3 flex flex-wrap gap-3">
            {routes
              .filter((r) => r.waypoints?.length > 0)
              .map(({ name, color }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-body-5 text-grey-7">{name}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
