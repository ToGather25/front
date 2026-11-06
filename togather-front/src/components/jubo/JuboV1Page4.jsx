import { useContext } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import { JuboV1SectionBar, JuboV1Footer } from "./shared.v1";
import { JuboPrintModeContext } from "./juboPrintMode";

/** 차량운행 한 코스를 "출발(시각) → 경유(시각) → 도착(시각)" 한 줄로 요약한다. */
function summarizeRoute(route) {
  const stops = (route.waypoints ?? []).map((wp) => `${wp.label} (${wp.time})`).join(" → ");
  return (
    <>
      <span className="font-bold">{route.name}:</span>   {stops}
    </>
  );
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
        {church.slogan?.title && (
          <p className="text-lg font-black">{church.slogan.title}</p>
        )}
        {church.slogan?.scripture && (
          <p className="px-18 text-[11px] opacity-90">{church.slogan.scripture}</p>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-5 pt-3 pb-4 gap-3">
        <JuboV1SectionBar title="예배시간" />
        {scheduleRows.length === 0 ? (
          <p className="flex-[2] min-h-0 flex items-center justify-center text-xs text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-[2] min-h-0 flex flex-col border border-blue-3 overflow-hidden">
            <div className="shrink-0 flex bg-blue-3 text-white text-[10px] font-bold text-center">
              <span className="w-28 shrink-0 py-1">구분</span>
              <span className="flex-1 py-1">시간</span>
              <span className="w-20 shrink-0 py-1">장소</span>
            </div>
            <div className="flex-1 flex flex-col">
              {scheduleRows.map(({ name, time, location }) => (
                <div
                  key={name}
                  className="flex-1 flex items-center border-b border-blue-2 last:border-b-0 text-[10px]"
                >
                  <span className="w-28 h-full shrink-0 flex items-center bg-blue-1 text-blue-3 font-bold px-2 truncate">
                    {name}
                  </span>
                  <span className="flex-1 text-center">{time}</span>
                  <span className="w-20 shrink-0 text-center">{location || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <JuboV1SectionBar title="오시는 길" />
        <div
          className={`flex-1 min-h-0 overflow-y-auto flex gap-3 ${
            (church.publicTransit ?? []).length === 0 ? "border border-blue-3 px-5 py-3" : ""
          }`}
        >
          <div className="w-[240px] h-[150px] shrink-0 border border-blue-3 overflow-hidden">
            <KakaoMap
              address={church.address}
              level={5}
              draggable={false}
              showControls={false}
              printMode={printMode}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 text-xs">
            <p className="font-bold text-sm text-grey-12">대중교통 이용 안내</p>
            {(church.publicTransit ?? []).map((t, i) => (
              <p key={i} className="text-grey-8 text-[10px]">
                <span className="inline-block rounded-full bg-blue-5 text-white font-bold px-2 py-0.5 mr-1.5">
                  {t.subway}
                </span>
                {t.bus} · {t.dropoff}
              </p>
            ))}
          </div>
        </div>

        {routes.length > 0 && (
          <div className="shrink-0 border border-blue-3 bg-blue-1 px-3 py-1.5 text-[9px] leading-snug flex flex-col gap-0.5">
            <p className="font-bold text-[12px] text-blue-5 pb-1">주일차량운행 노선안내</p>
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
