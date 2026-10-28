import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getDistricts } from "@/services/juboService";
import {
  JuboBookHeader,
  JuboBookFooter,
  JuboSectionTitle,
  JuboGreyBox,
  JuboWhiteTable,
} from "./shared";

export default function JuboPage6({ data }) {
  const { church } = useChurch();
  const { data: districts = [], loading } = useFetch(
    () => getDistricts(church.id),
    [church.id],
    [],
  );

  // "오전 9시"/"오후 3시" → "9:00"/"15:00". "종일"처럼 시각이 없는 값은 그대로 둔다.
  const formatHour = (text) => {
    const m = text?.match(/(오전|오후)\s*(\d+)시/);
    if (!m) return text;
    let hour = Number(m[2]);
    if (m[1] === "오후" && hour !== 12) hour += 12;
    if (m[1] === "오전" && hour === 12) hour = 0;
    return `${hour}:00`;
  };
  const formatTimeRange = (text) => text?.split("~").map((s) => formatHour(s.trim())).join("~");

  const lotRows = (church.parking?.lots ?? []).map((lot) => ({
    name: lot.name,
    time: formatTimeRange(lot.details?.find((d) => d.label?.includes("시간"))?.value) ?? "-",
  }));
  const routeRows = (church.transportGuide?.routes ?? []).map((route) => {
    const waypoints = route.waypoints ?? [];
    const first = waypoints[0]?.time;
    const last = waypoints[waypoints.length - 1]?.time;
    return { name: route.name, time: first && last ? `${first}~${last}` : "-" };
  });

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="기타 안내" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 flex flex-col gap-4">
        <div>
          <JuboSectionTitle title="구역 모임" />
          <JuboGreyBox>
            {loading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : districts.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="divide-y divide-grey-2 pr-8">
                {districts.map(({ name, location, time, leader }) => (
                  <div key={name} className="flex gap-4 py-3 text-sm">
                    <div className="w-16 shrink-0 font-bold text-grey-12">{name}</div>
                    <div className="flex-1 text-bluegrey-8 font-light">
                      {[location, time, leader].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </JuboGreyBox>
        </div>

        <div className="flex-1 min-h-0">
          <JuboSectionTitle title="주차 및 셔틀 안내" />
          <div className="grid grid-cols-2 gap-3">
            <JuboWhiteTable
              rows={lotRows}
              columns={[{ key: "name", header: "주차장 위치" }, { key: "time", header: "시간(주일)" }]}
            />
            <JuboWhiteTable
              rows={routeRows}
              columns={[{ key: "name", header: "운행코스" }, { key: "time", header: "시간" }]}
            />
          </div>
        </div>
      </div>

      <JuboBookFooter church={church} />
    </div>
  );
}
