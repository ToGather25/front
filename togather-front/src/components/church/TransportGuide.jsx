import { useChurch } from "@/contexts/ChurchContext";

export default function TransportGuide() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;

  const validRoutes = routes.filter((r) => r.waypoints && r.waypoints.length > 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-primary rounded-sm" />
        <h3 className="text-sub-tit-2 font-bold text-grey-11">
          코스별 차량운행 안내
        </h3>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-body-3 border-t border-bluegrey-3">
          <thead>
            <tr className="bg-bluegrey-1 border-b border-bluegrey-3">
              <th className="py-4 px-5 text-center font-semibold text-grey-9">코스</th>
              <th className="py-4 px-5 text-center font-semibold text-grey-9">위치</th>
              <th className="py-4 px-5 text-center font-semibold text-grey-9">시간</th>
            </tr>
          </thead>
          <tbody>
            {validRoutes.map((route) => (
              route.waypoints?.map((wp, idx) => (
                <tr key={`${route.name}-${idx}`} className="border-b border-bluegrey-2">
                  {/* 코스명 (첫 행만) */}
                  {idx === 0 && (
                    <td className="py-4 px-5 text-center align-middle font-semibold text-grey-11 bg-bluegrey-1" rowSpan={route.waypoints.length}>
                      {route.name}
                    </td>
                  )}

                  {/* 위치 */}
                  <td className={`py-4 px-5 text-center ${wp.label.includes('출발') || wp.label.includes('도착') ? 'text-grey-7' : 'text-primary font-semibold'}`}>
                    {wp.label}
                  </td>

                  {/* 시간 */}
                  <td className="py-4 px-5 text-center text-grey-7">{wp.time}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {/* 주의사항 */}
      {church.transportGuide?.notes && church.transportGuide.notes.length > 0 && (
        <div className="mt-8">
          <ul className="space-y-2 text-body-4 text-grey-6">
            {church.transportGuide.notes.map((note, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="shrink-0">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
