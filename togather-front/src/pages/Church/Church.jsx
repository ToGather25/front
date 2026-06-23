import { useState } from "react";
import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import KakaoMapRoute from "@/components/common/KakaoMapRoute";

const TABS = [
  "인사말", "교회 비전", "교회 연혁", "예배 안내", "섬기는 사람들",
  "층별 안내", "오시는 길", "차량운행 안내",
];

// ── 인사말 ─────────────────────────────────────────────
function Greeting() {
  const { church } = useChurch();
  const { title, paragraphs, signature } = church.greeting;

  return (
    <div className="flex flex-col-reverse md:flex-row md:gap-10 md:items-start">
      <div className="flex-1">
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-6">{title}</h2>
        <div className="flex flex-col gap-4 text-body-2 text-grey-8">
          {paragraphs.map((text, i) => (
            <p key={i}>
              {text.split("\n").map((line, j) => (
                <span key={j}>{line}{j < text.split("\n").length - 1 && <br />}</span>
              ))}
            </p>
          ))}
          <p className="text-right text-body-3 text-grey-7 mt-4">
            {signature.church} {signature.title} <strong>{signature.name}</strong>
          </p>
        </div>
      </div>
      <div className="w-full h-48 md:w-48 md:h-64 bg-grey-3 rounded-2xl shrink-0 flex items-center justify-center text-grey-5 text-body-4">
        목사님 사진
      </div>
    </div>
  );
}

// ── 교회 비전 ──────────────────────────────────────────
function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;

  const D    = 280;
  const SIDE = 220;
  const TH   = Math.round(SIDE * Math.sqrt(3) / 2);
  const W    = SIDE + D;
  const H    = TH + D;

  const layout = [
    { item: items[0], left: Math.round((W - D) / 2), top: 0,  z: 3, delay: "0s"    },
    { item: items[1], left: 0,                        top: TH, z: 2, delay: "0.25s" },
    { item: items[2], left: W - D,                    top: TH, z: 1, delay: "0.5s"  },
  ];

  return (
    <div>
      <style>{`
        @keyframes circleIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="bg-blue-1 rounded-2xl px-12 py-20 text-center mb-10">
        <p className="text-sub-tit-4 font-semibold text-grey-9">{mainTitle}</p>
        <p className="text-body-2 text-grey-8 mt-1">{mainVerse}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-body-2 text-grey-7 text-center">{items[0].description}</p>

        <div className="flex items-start gap-10">
          <p className="text-body-2 text-grey-7 text-right w-40 pt-70">{items[1].description}</p>

          <div className="overflow-x-auto w-full">
            <div className="relative shrink-0" style={{ width: W, height: H }}>
              {layout.map(({ item, left, top, z, delay }) => (
                <div
                  key={item.label}
                  className="absolute rounded-full border-2 border-grey-9 bg-transparent flex items-center justify-center"
                  style={{
                    width: D, height: D, left, top, zIndex: z,
                    animation: `circleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both`,
                  }}
                >
                  <span className="text-sub-tit-3 font-semibold text-grey-10 text-center px-8 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-body-2 text-grey-7 text-left w-40 pt-70">{items[2].description}</p>
        </div>
      </div>
    </div>
  );
}

// ── 예배 안내 ──────────────────────────────────────────
function WorshipInfo() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">정기 예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {regular.map(({ name, time, location }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">주일학교예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {departments.map(({ name, time, location }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 섬기는 사람들 ──────────────────────────────────────
const STAFF_CHIPS = ["교역자", "시무장로", "협동·사역장로", "은퇴장로", "파송선교사"];

const MicIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
  </svg>
);

function PersonCard({ name, tel, email, role, showSermon = false }) {
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-grey-3 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-body-3 font-semibold text-grey-11 truncate">{name}</p>
            {showSermon && (
              <button className="flex items-center gap-1 text-body-5 text-blue-7 border border-blue-7 px-2 py-0.5 rounded-full shrink-0">
                <MicIcon />설교방송
              </button>
            )}
          </div>
          <p className="text-body-5 text-grey-6">{tel}</p>
          <p className="text-body-5 text-grey-6">{email}</p>
          <p className="text-body-5 text-grey-7 mt-1">{role}</p>
        </div>
      </div>
    </div>
  );
}

function Staff() {
  const { church } = useChurch();
  const { headPastor, clergy, elders, associateElders, retiredElders, missionaries } = church.staff;
  const [activeChip, setActiveChip] = useState("교역자");

  return (
    <div>
      {/* 칩 필터 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {STAFF_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-5 py-2 rounded-full text-body-3 font-semibold transition-all ${
              activeChip === chip
                ? "bg-primary text-white"
                : "border border-bluegrey-2 text-grey-8 hover:border-blue-5 hover:text-primary"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 교역자 */}
      {activeChip === "교역자" && (
        <div>
          {/* 담임목사 — 와이드 카드 */}
          <div className="border border-primary/20 bg-blue-1/30 rounded-2xl p-7 mb-6 flex gap-8">
            <div className="w-24 h-24 rounded-2xl bg-grey-3 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-caption font-bold text-primary uppercase tracking-widest">담임목사</span>
                  <h3 className="text-sub-tit-3 font-bold text-grey-12 mt-0.5">{headPastor.name}</h3>
                </div>
                <button className="flex items-center gap-1.5 text-body-4 text-blue-7 border border-blue-7 px-4 py-1.5 rounded-full shrink-0">
                  <MicIcon />설교방송
                </button>
              </div>
              <p className="text-body-4 text-grey-6 mb-4">{headPastor.tel} · {headPastor.email}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-bluegrey-2">
                <div>
                  <p className="text-caption font-bold text-grey-7 mb-2 tracking-wider">학력</p>
                  <ul className="flex flex-col gap-1.5">
                    {headPastor.education.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-body-4 text-grey-8">
                        <span className="text-primary shrink-0 mt-1">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-caption font-bold text-grey-7 mb-2 tracking-wider">약력</p>
                  <ul className="flex flex-col gap-1.5">
                    {headPastor.career.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-body-4 text-grey-8">
                        <span className="text-primary shrink-0 mt-1">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* 교역자 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clergy.map((p) => <PersonCard key={p.name} {...p} showSermon />)}
          </div>
        </div>
      )}

      {/* 시무장로 */}
      {activeChip === "시무장로" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {elders.map((p) => <PersonCard key={p.name} {...p} />)}
        </div>
      )}

      {/* 협동·사역장로 */}
      {activeChip === "협동·사역장로" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {associateElders.map((p) => <PersonCard key={p.name} {...p} />)}
        </div>
      )}

      {/* 은퇴장로 */}
      {activeChip === "은퇴장로" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {retiredElders.map((p) => <PersonCard key={p.name} {...p} />)}
        </div>
      )}

      {/* 파송선교사 */}
      {activeChip === "파송선교사" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {missionaries.map((p) => (
            <div key={p.name} className="border border-bluegrey-2 rounded-2xl p-5 shadow-sm">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-full bg-grey-3 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-body-3 font-semibold text-grey-11">{p.name}</p>
                    <span className="px-2 py-0.5 rounded-full bg-point-1 text-point-7 text-body-5 font-semibold shrink-0">{p.location}</span>
                  </div>
                  <p className="text-body-5 text-grey-6">{p.tel}</p>
                  <p className="text-body-5 text-grey-6">{p.email}</p>
                  <p className="text-body-5 text-grey-7 mt-1">{p.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 교회 연혁 ──────────────────────────────────────────
const HISTORY_ROW = ({ era, events, isLast, style }) => (
  <div className="flex gap-5" style={style}>
    <div className="flex flex-col items-center">
      <div className="w-3.5 h-3.5 rounded-full bg-blue-7 ring-4 ring-blue-1 shrink-0 mt-1.5 z-10" />
      {!isLast && <div className="w-px flex-1 bg-grey-3 mt-1.5" />}
    </div>
    <div className="flex-1 pb-6">
      <h3 className="text-headline-4 font-bold text-grey-11 mb-2">{era}</h3>
      <div className="border border-bluegrey-2 rounded-xl overflow-hidden">
        {events.map(({ date, content }, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-2.5 border-b border-grey-2 last:border-b-0 text-body-4">
            <span className="text-blue-7 w-24 shrink-0 font-medium">{date}</span>
            <span className="text-grey-8">{content}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function History() {
  const { church } = useChurch();
  const [startIdx, setStartIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const VISIBLE = 2;
  const items = church.history;
  const canUp   = startIdx > 0;
  const canDown = startIdx + VISIBLE < items.length;
  const visible = items.slice(startIdx, startIdx + VISIBLE);

  const go = (delta) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setStartIdx((i) => i + delta);
      setFading(false);
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOutUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>

      {(canUp || canDown) && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => go(-1)}
            disabled={!canUp || fading}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              canUp && !fading
                ? "border-blue-7 text-blue-7 hover:bg-blue-1"
                : "border-grey-3 text-grey-4 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            disabled={!canDown || fading}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              canDown && !fading
                ? "border-blue-7 text-blue-7 hover:bg-blue-1"
                : "border-grey-3 text-grey-4 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {visible.map(({ era, events }, i) => (
        <HISTORY_ROW
          key={`${startIdx}-${era}`}
          era={era}
          events={events}
          isLast={i === visible.length - 1 && !canDown}
          style={
            fading
              ? { animation: `fadeOutUp 0.28s ease-in ${i * 0.06}s both` }
              : { animation: `fadeUp 0.4s ease-out ${i * 0.1}s both` }
          }
        />
      ))}
    </div>
  );
}

// ── 층별 안내 ──────────────────────────────────────────
function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = church.floorGuide[selectedIdx];

  return (
    <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
      <style>{`@keyframes floorFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {/* 좌: 표 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">층별 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {church.floorGuide.map(({ floor, rooms }, i) => (
              <tr
                key={floor}
                onClick={() => setSelectedIdx(i)}
                className={`border-b border-grey-3 cursor-pointer transition-colors ${
                  i === selectedIdx ? "bg-blue-1" : "hover:bg-grey-1"
                }`}
              >
                <td className={`py-3.5 pl-2 w-28 font-semibold ${i === selectedIdx ? "text-primary" : "text-grey-8"}`}>
                  {floor}
                </td>
                <td className={`py-3.5 ${i === selectedIdx ? "text-grey-9" : "text-grey-7"}`}>
                  {rooms}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 우: 사진 */}
      <div className="w-full md:w-[420px] md:shrink-0">
        <div
          key={selected.floor}
          className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bluegrey-2"
          style={{ animation: "floorFadeIn 0.3s ease both" }}
        >
          {selected.image ? (
            <img
              src={selected.image}
              alt={`${selected.floor} 사진`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-grey-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-body-5">{selected.floor} 사진</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 오시는 길 ──────────────────────────────────────────
function Direction() {
  const { church } = useChurch();
  return (
    <div className="flex flex-col md:flex-row md:gap-12 md:items-start">
      {/* 좌측: 주차 안내 */}
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

      {/* 우측: 지도 */}
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

// ── 차량운행 안내 ──────────────────────────────────────
function TransportGuide() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;
  const hasAnyRoute = routes.some((r) => r.waypoints?.length > 0);

  return (
    <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
      {/* 좌측: 운행 코스 */}
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

      {/* 우측: 경로 지도 */}
      <div className="w-full md:w-[480px] md:shrink-0">
        <KakaoMapRoute
          address={church.address}
          level={church.location?.level ?? 5}
          routes={routes}
          className="w-full h-[300px] rounded-2xl overflow-hidden"
        />
        {hasAnyRoute && (
          <div className="mt-3 flex flex-wrap gap-3">
            {routes.filter((r) => r.waypoints?.length > 0).map(({ name, color }) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-body-5 text-grey-7">{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  "인사말": <Greeting />,
  "교회 비전": <Vision />,
  "교회 연혁": <History />,
  "예배 안내": <WorshipInfo />,
  "섬기는 사람들": <Staff />,
  "층별 안내": <FloorGuide />,
  "오시는 길": <Direction />,
  "차량운행 안내": <TransportGuide />,
};

export default function Church() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "인사말";

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">교회 소개</h1>
        </div>
      </div>

      {/* Sub-tab Navigation — Figma main_box_nav 스타일 */}
      <div className="border-b border-bluegrey-2 bg-white sticky top-14 md:top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
                className={`px-5 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                  activeTab === tab
                    ? "border-blue-8 text-blue-8 font-semibold"
                    : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1576px] mx-auto px-4 pt-6 pb-10 md:px-8 md:pt-10 md:pb-20">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
