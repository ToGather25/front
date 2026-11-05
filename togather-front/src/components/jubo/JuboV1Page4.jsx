import { useContext } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import { JuboV1SectionBar, JuboV1Footer } from "./shared.v1";
import { JuboPrintModeContext } from "./juboPrintMode";

/** 차량운행 한 코스를 "출발(시각) → 경유(시각) → 도착(시각)" 한 줄로 요약한다. */
function summarizeRoute(route) {
  const stops = (route.waypoints ?? []).map((wp) => `${wp.label} (${wp.time})`).join(" → ");
  return `${route.name}   ${stops}`;
}

export default function JuboV1Page4() {
  const { church } = useChurch();
  const printMode = useContext(JuboPrintModeContext);

  const scheduleRows = [
    ...(church.worshipSchedule?.regular ?? []),
    ...(church.worshipSchedule?.departments ?? []),
  ];
  const routes = (church.transportGuide?.routes ?? []).filter((r) => r.waypoints?.length > 0);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 배너 */}
      <div className="shrink-0 bg-blue-4 text-white text-center px-6 py-3 flex flex-col gap-1.5">
        {church.mainBanner?.subtitle && (
          <p className="text-[11px] opacity-90">{church.mainBanner.subtitle}</p>
        )}
        {church.mainBanner?.title && (
          <p className="text-lg font-black whitespace-pre-line">{church.mainBanner.title}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <JuboV1SectionBar title="예배시간" />
        <div className="border border-t-0 border-blue-3">
          <div className="flex bg-blue-3 text-white text-xs font-bold text-center">
            <span className="w-28 shrink-0 py-1.5">구분</span>
            <span className="flex-1 py-1.5">시간</span>
            <span className="w-20 shrink-0 py-1.5">장소</span>
          </div>
          {scheduleRows.map(({ name, time, location }) => (
            <div key={name} className="flex border-b border-blue-2 last:border-b-0 text-xs">
              <span className="w-28 shrink-0 bg-blue-1 text-blue-3 font-bold py-1.5 px-2 truncate">
                {name}
              </span>
              <span className="flex-1 text-center py-1.5">{time}</span>
              <span className="w-20 shrink-0 text-center py-1.5">{location || "-"}</span>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <JuboV1SectionBar title="오시는 길" />
          <div className="px-5 py-3 flex gap-3">
            <div className="w-[180px] h-[150px] shrink-0 border border-blue-3 overflow-hidden">
              <KakaoMap
                address={church.address}
                level={4}
                draggable={false}
                showControls={false}
                printMode={printMode}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5 text-xs">
              <p className="font-bold text-sm text-grey-12">대중교통 이용 안내</p>
              {(church.publicTransit ?? []).map((t, i) => (
                <p key={i} className="text-grey-8">
                  <span className="inline-block rounded-full bg-blue-5 text-white text-[10px] font-bold px-2 py-0.5 mr-1.5">
                    {t.subway}
                  </span>
                  {t.bus} · {t.dropoff}
                </p>
              ))}
            </div>
          </div>
        </div>

        {routes.length > 0 && (
          <div className="mx-5 mt-2 border border-blue-3 bg-blue-1 px-4 py-2.5 text-xs flex flex-col gap-1">
            <p className="font-bold text-blue-5">주일차량운행 노선안내</p>
            {routes.map((route) => (
              <p key={route.name} className="text-grey-9">
                {summarizeRoute(route)}
              </p>
            ))}
          </div>
        )}
      </div>

      <JuboV1Footer church={church} />
    </div>
  );
}
