import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMapRoute from "@/components/common/KakaoMapRoute";

/** 경유지 첫~끝 구간을 "출발지~도착지" 형태로 요약한다. */
function routeSpan(waypoints) {
  if (!waypoints || waypoints.length === 0) return "";
  if (waypoints.length === 1) return waypoints[0].label;
  return `${waypoints[0].label}~${waypoints[waypoints.length - 1].label}`;
}

function RouteHeading({ route }) {
  const span = routeSpan(route.waypoints);
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: route.color }} />
      <h3 className="text-sub-tit-3 font-bold text-grey-11">{route.name}</h3>
      {span && <span className="text-body-5 text-grey-5">{span}</span>}
    </div>
  );
}

function RouteTable({ route }) {
  const { waypoints } = route;
  if (!waypoints || waypoints.length === 0) {
    return <p className="py-6 text-body-5 text-grey-5">경유지 정보가 없습니다.</p>;
  }
  return (
    <table className="w-full text-body-4 text-center border-t border-bluegrey-3">
      <thead>
        <tr className="bg-bluegrey-1 border-b border-bluegrey-3">
          {waypoints.map((w) => (
            <th key={w.label} className="py-3 font-semibold text-grey-9">
              {w.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-bluegrey-2">
          {waypoints.map((w) => (
            <td key={w.label} className="py-4 text-grey-7">
              {w.time ?? "-"}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export default function TransportGuide() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;
  const [selectedName, setSelectedName] = useState(null); // null = 전체
  const selectedRoute = routes.find((r) => r.name === selectedName) ?? null;

  return (
    <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
      {/* 코스 목록 — 현재 선택된 항목(전체 또는 코스 1개)만 남색 알약 배경을 갖고,
          나머지는 구분선으로만 나뉜 평범한 행으로 표시한다. */}
      <div className="md:w-[300px] md:shrink-0 border border-bluegrey-2 rounded-2xl p-3">
        <button
          type="button"
          onClick={() => setSelectedName(null)}
          className={`w-full text-left px-5 py-3.5 rounded-xl text-body-3 font-semibold transition-colors ${
            selectedName === null ? "bg-primary text-white" : "text-grey-9 hover:bg-bluegrey-1"
          }`}
        >
          전체
        </button>
        <div className="mt-1 divide-y divide-bluegrey-1">
          {routes.map((route) => {
            const active = selectedName === route.name;
            return (
              <button
                key={route.name}
                type="button"
                onClick={() => setSelectedName(route.name)}
                className={`w-full flex items-center gap-2 px-5 py-3.5 text-body-4 text-left rounded-xl transition-colors ${
                  active ? "bg-primary text-white my-1" : "text-grey-10 hover:bg-bluegrey-1"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: active ? "#fff" : route.color }}
                />
                <span className="font-semibold">{route.name}</span>
                <span className={`text-caption truncate ${active ? "text-white/70" : "text-grey-5"}`}>
                  {routeSpan(route.waypoints)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 전체 선택 시 코스별 시간표만, 특정 코스 선택 시 그 코스의 시간표 + 지도 */}
      <div className="flex-1 mt-6 md:mt-0 min-w-0">
        {selectedRoute ? (
          <div>
            <RouteHeading route={selectedRoute} />
            <RouteTable route={selectedRoute} />
            {selectedRoute.waypoints?.length > 0 && (
              <KakaoMapRoute
                address={church.address}
                level={church.location?.level ?? 5}
                routes={[selectedRoute]}
                className="w-full h-[300px] rounded-2xl overflow-hidden mt-6"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {routes.map((route) => (
              <div key={route.name}>
                <RouteHeading route={route} />
                <RouteTable route={route} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
