import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { searchSermons } from "@/services/sermonService";
import { useState } from "react";

function Icon({ d, size = 18, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function ScheduleGroup({ title, items, onSelect }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-body-3 font-bold text-grey-11 mb-3">{title}</h3>
      <div className="flex flex-col gap-3">
        {items.map((w) => (
          <button
            key={w.name}
            type="button"
            onClick={() => onSelect(w.name)}
            className="flex items-center justify-between p-4 rounded-xl border border-bluegrey-2 shadow-md text-left"
          >
            <p className="text-body-5 text-grey-8">
              <span className="text-body-4 font-bold text-grey-11">{w.name}</span> {w.time}
              {w.location && <span className="block text-caption text-grey-6 mt-0.5">장소: {w.location}</span>}
            </p>
            <Icon d="M9 6l6 6-6 6" size={18} className="shrink-0 text-grey-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** 선택한 예배의 설교 목록 — 관리자 설교 DB(searchSermons)를 worshipType으로 필터링한다.
 * 유튜브 영상과 1:1로 연결이 보장되지 않아 재생 연결 없이 정보만 보여준다. */
function SermonListScreen({ church, worshipType, onBack }) {
  const { data, loading } = useFetch(
    () => searchSermons(church.id, { worshipType, size: 30 }),
    [church.id, worshipType],
    { sermons: [] },
  );
  const sermons = data?.sermons ?? [];

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col">
      <header className="h-14 grid grid-cols-[36px_1fr_36px] items-center px-2 border-b border-bluegrey-2 shrink-0">
        <button type="button" onClick={onBack} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center text-grey-9">
          <Icon d="M15 18l-6-6 6-6" size={22} strokeWidth={2} />
        </button>
        <h2 className="text-center text-body-3 font-bold text-grey-11">예배 목록</h2>
        <span />
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-caption text-grey-6 mb-3">{worshipType}</p>
        {loading ? (
          <p className="text-center text-body-5 text-grey-5 py-10">불러오는 중...</p>
        ) : sermons.length === 0 ? (
          <p className="text-center text-body-5 text-grey-5 py-10">등록된 설교가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sermons.map((s) => (
              <div key={`${s.sermonDate}-${s.title}`} className="p-4 rounded-xl border border-bluegrey-2">
                <p className="text-caption text-grey-6 mb-1">{s.sermonDate}</p>
                <p className="text-body-4 font-bold text-grey-11 mb-1">{s.title}</p>
                <p className="text-caption text-grey-7">
                  {s.preacher}
                  {s.scripture && ` · ${s.scripture}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileWorshipInfo() {
  const { church } = useChurch();
  const [sermonFilter, setSermonFilter] = useState(null);
  const { regular, departments } = church.worshipSchedule;

  // WorshipInfo.jsx(데스크톱)와 동일한 그룹 기준 — 주일 1~3부·주일학교(0~4) / 평일(4~).
  const sundayWorship = regular.slice(0, 4);
  const weekdayWorship = regular.slice(4);

  return (
    <div className="px-5 py-4 flex flex-col gap-6">
      <ScheduleGroup title="주일 예배" items={sundayWorship} onSelect={setSermonFilter} />
      <ScheduleGroup title="평일 예배 및 기도회" items={weekdayWorship} onSelect={setSermonFilter} />
      <ScheduleGroup title="주일 학교" items={departments} onSelect={setSermonFilter} />

      {sermonFilter && (
        <SermonListScreen church={church} worshipType={sermonFilter} onBack={() => setSermonFilter(null)} />
      )}
    </div>
  );
}
