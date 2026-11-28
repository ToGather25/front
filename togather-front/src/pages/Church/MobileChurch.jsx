import { useState, useEffect, useRef } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import FallbackImage from "@/components/church/FallbackImage";
import AvatarIcon from "@/assets/web-icon/mypage-user-blue.svg";
import IcoSearch from "@/assets/web-icon/search-grey.svg";
import Vision1 from "@/assets/web-icon/vision-1.png";
import Vision2 from "@/assets/web-icon/vision-2.png";
import Vision3 from "@/assets/web-icon/vision-3.png";
import Vision4 from "@/assets/web-icon/vision-4.png";

const VISION_ICONS = [Vision1, Vision2, Vision3, Vision4];

const TABS = ["인사말", "교회 비전", "교회 연혁", "섬기는 사람들", "층별 안내", "오시는 길", "차량운행 안내"];

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

/** ────────── 인사말 ────────── */
function GreetingTab({ church }) {
  const { title, paragraphs, signature } = church.greeting;
  const { image: pastorImage } = church.staff.headPastor;

  return (
    <div className="px-5 py-5 flex flex-col gap-5">
      <FallbackImage
        src={pastorImage}
        alt="담임목사 사진"
        className="w-full h-56 rounded-xl object-cover"
        fallback={
          <div className="w-full h-56 bg-grey-3 rounded-xl flex items-center justify-center">
            <img src={AvatarIcon} alt="" className="w-10 h-10 opacity-60" />
          </div>
        }
      />
      <div>
        <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-1.5">{title}</h2>
        <p className="text-body-5 text-primary font-medium">{church.name} 홈페이지를 방문해주셔서 감사합니다.</p>
      </div>
      <div className="flex flex-col gap-3 text-body-5 text-grey-8 leading-relaxed">
        {paragraphs.map((text, i) => (
          <p key={i} className="whitespace-pre-line">{text}</p>
        ))}
      </div>
      <p className="text-body-5 text-grey-7 text-right">
        {signature.church} {signature.title} <span className="font-bold text-primary">{signature.name}</span>
      </p>
    </div>
  );
}

/** ────────── 교회 비전 ────────── */
function VisionTab({ church }) {
  const { mainTitle, mainVerse, items } = church.vision;
  const [openIndex, setOpenIndex] = useState(null);
  const displayItems = (items ?? []).filter((item) => item?.title && item?.desc).slice(0, 4);

  return (
    <div className="px-5 py-5 flex flex-col gap-5">
      <div>
        <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-1.5 whitespace-pre-line">{mainTitle}</h2>
        <p className="text-body-5 text-grey-7 whitespace-pre-line">{mainVerse}</p>
      </div>
      <div className="flex flex-col gap-3">
        {displayItems.map((item, i) => {
          const open = openIndex === i;
          const hasDetail = Array.isArray(item.detailedDescription) && item.detailedDescription.length > 0;
          return (
            <div key={item.title} className="border border-bluegrey-2 rounded-xl p-4">
              <button
                type="button"
                onClick={() => hasDetail && setOpenIndex(open ? null : i)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-full bg-blue-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={VISION_ICONS[i % VISION_ICONS.length]} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-4 font-bold text-grey-11">{item.title}</p>
                  <p className="text-caption text-grey-6 leading-relaxed">{item.desc}</p>
                </div>
                {hasDetail && (
                  <Icon d="M6 9l6 6 6-6" size={18} strokeWidth={2} className={`shrink-0 text-grey-5 transition-transform ${open ? "rotate-180" : ""}`} />
                )}
              </button>
              {open && hasDetail && (
                <div className="mt-3 pt-3 border-t border-bluegrey-1 flex flex-col gap-2.5">
                  {item.detailedDescription.map((detail, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className={`w-1 h-3.5 mt-0.5 shrink-0 rounded-sm ${j === 0 ? "bg-primary" : "bg-bluegrey-2"}`} />
                      <div>
                        <p className="text-caption font-bold text-grey-11">{detail.title}</p>
                        <p className="text-caption text-grey-6">{detail.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ────────── 교회 연혁 ────────── 데스크톱(History.jsx)과 같은 "스크롤에 따라 점이
 * 타임라인을 따라 내려가는" 효과 — window 스크롤 기준으로 진행률을 계산해 점/채워진
 * 선의 위치를 갱신한다. */
function HistoryTab({ church }) {
  const { description, foundedYear, items = [] } = church.history ?? {};
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      // 페이지 맨 위일 때는 점이 선 맨 위(진행률 0)에서 시작해야 한다 — 아래 비율
      // 계산은 뷰포트 중앙 기준이라 그 전에는 이미 진행률이 조금 앞서 있을 수 있다.
      if (window.scrollY <= 0) {
        setActiveIndex(0);
        setScrollProgress(0);
        return;
      }

      const children = Array.from(container.querySelectorAll("[data-history-item]"));
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;
      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);

      const containerRect = container.getBoundingClientRect();
      const progress = (viewportCenter - containerRect.top) / containerRect.height;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  return (
    <div className="px-5 py-5 flex flex-col gap-6">
      <div>
        {description && <p className="text-body-5 text-grey-7 leading-relaxed whitespace-pre-line mb-3">{description}</p>}
        {foundedYear && <p className="text-sub-tit-1 font-bold text-blue-2 text-center">since {foundedYear}</p>}
      </div>
      <div ref={containerRef} className="relative pl-6">
        <div className="absolute left-[3px] top-0.5 bottom-0.5 w-0.5 bg-bluegrey-2" />
        <div
          className="absolute left-[3px] top-0.5 w-0.5 bg-primary transition-[height] duration-150 ease-out"
          style={{ height: `calc(${scrollProgress * 100}% - 4px)` }}
        />
        <div
          className="absolute left-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(59,82,128,0.15)] transition-[top] duration-150 ease-out"
          style={{ top: `calc(${scrollProgress * 100}% - 4px)` }}
        />
        <div className="flex flex-col gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              data-history-item
              className={`transition-opacity duration-300 ${Math.abs(i - activeIndex) <= 1 ? "opacity-100" : "opacity-40"}`}
            >
              <h3 className="text-body-3 font-bold text-grey-11 mb-1.5">{item.era}</h3>
              <div className="flex flex-col gap-1">
                {item.events?.map((event, j) => (
                  <p key={j} className="text-caption text-grey-7">
                    <span className="font-medium text-grey-9">{event.date}</span> · {event.content}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ────────── 섬기는 사람들 ────────── */
function StaffCardMobile({ person }) {
  return (
    <div className="p-4 rounded-xl border border-bluegrey-2 flex gap-3.5">
      <div className="w-16 h-20 rounded-lg bg-bluegrey-1 shrink-0 overflow-hidden">
        {person.image && <img src={person.image} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-4 font-bold text-grey-11 truncate">{person.name}</p>
        {(person.tel || person.email) && (
          <p className="text-caption text-grey-6 mt-0.5">
            {person.tel}
            {person.tel && person.email && " · "}
            {person.email}
          </p>
        )}
        {person.role && <p className="text-caption text-grey-7 mt-1 leading-relaxed">{person.role}</p>}
        {person.education?.length > 0 && (
          <div className="mt-2">
            <p className="text-caption font-semibold text-grey-9">[학력]</p>
            {person.education.map((e, i) => (
              <p key={i} className="text-caption text-grey-6">{e}</p>
            ))}
          </div>
        )}
        {person.career?.length > 0 && (
          <div className="mt-2">
            <p className="text-caption font-semibold text-grey-9">[약력]</p>
            {person.career.map((c, i) => (
              <p key={i} className="text-caption text-grey-6">{c}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StaffTab({ church }) {
  const { headPastor, clergy = [], elders = [], associateElders = [], retiredElders = [], missionaries = [] } =
    church.staff;
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = (name) => !q || name.toLowerCase().includes(q);

  const GROUPS = [
    ["담임목사", headPastor ? [headPastor] : []],
    ["교역자", clergy],
    ["시무장로", elders],
    ["협동・사역장로", associateElders],
    ["은퇴장로", retiredElders],
    ["파송선교사", missionaries],
  ].filter(([, list]) => list.length > 0);

  function scrollToGroup(label) {
    document.getElementById(`church-staff-${label}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const visibleGroups = GROUPS.map(([label, list]) => [label, list.filter((p) => matches(p.name))]);
  const isEmpty = visibleGroups.every(([, list]) => list.length === 0);

  return (
    <div className="px-5 py-4 flex flex-col gap-5">
      <div className="bg-bluegrey-2 -mx-5 -mt-4 px-5 py-4">
        <div className="pb-3">
          <p className="text-body-3 font-bold text-grey-11 mb-2">교역자 검색</p>
          <div className="flex items-center gap-2 px-4 h-11 rounded-full bg-white border border-bluegrey-3">
            <img src={IcoSearch} className="w-4 h-4 shrink-0" alt="" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름으로 검색하세요."
              className="flex-1 min-w-0 outline-none text-body-4 text-grey-9 placeholder:text-grey-5 bg-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {GROUPS.map(([label]) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToGroup(label)}
              className="shrink-0 h-8 px-3.5 rounded-full border border-bluegrey-3 text-caption text-grey-7"
            >
              # {label}
            </button>
          ))}
        </div>
      </div>
      {isEmpty ? (
        <p className="text-center text-body-5 text-grey-5 py-10">해당하는 교역자가 없습니다.</p>
      ) : (
        visibleGroups.map(
          ([label, list]) =>
            list.length > 0 && (
              <div key={label} id={`church-staff-${label}`}>
                <h3 className="text-body-3 font-bold text-grey-11 mb-3">{label}</h3>
                <div className="flex flex-col gap-3">
                  {list.map((p) => (
                    <StaffCardMobile key={p.name} person={p} />
                  ))}
                </div>
              </div>
            ),
        )
      )}
    </div>
  );
}

/** ────────── 층별 안내 ────────── */
function FloorTab({ church }) {
  const floorGuide = church.floorGuide ?? [];
  if (floorGuide.length === 0) {
    return <p className="px-5 py-10 text-center text-body-5 text-grey-5">등록된 층별 안내가 없습니다.</p>;
  }
  return (
    <div className="px-5 py-5">
      <ul className="flex flex-col">
        {floorGuide.map(({ floor, rooms }, i) => (
          <li key={floor} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0 pt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-grey-5 shrink-0" />
              {i < floorGuide.length - 1 && <span className="flex-1 w-px bg-bluegrey-2 my-1" />}
            </div>
            <p className="pb-4">
              <span className="block text-body-4 font-bold text-grey-11">{floor}</span>
              <span className="text-caption text-grey-6">{rooms}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** ────────── 오시는 길 ────────── */
function DirectionTab({ church }) {
  const lots = church.parking?.lots ?? [];
  const [selectedLot, setSelectedLot] = useState(0);

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(church.address);
    } catch {
      // 클립보드 미지원 환경 — 조용히 무시
    }
  }

  return (
    <div className="px-5 py-5 flex flex-col gap-6">
      <KakaoMap level={church.location.level} address={church.address} className="w-full h-48 rounded-xl overflow-hidden" />
      <button
        type="button"
        onClick={handleCopyAddress}
        className="flex items-center justify-between p-3.5 rounded-xl border border-bluegrey-2 text-left"
      >
        <span className="text-body-5 text-grey-9">{church.address}</span>
        <span className="text-caption text-primary font-semibold shrink-0 ml-2">복사</span>
      </button>

      <div>
        <h3 className="text-body-3 font-bold text-grey-11 mb-3">대중교통</h3>
        {church.publicTransit?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {church.publicTransit.map((route, i) => (
              <p key={i} className="text-caption text-grey-8">
                <span className="font-semibold text-blue-8">{route.subway}</span>
                {route.bus && <> · {route.bus}</>}
                {route.dropoff && <> · {route.dropoff}</>}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-body-5 text-grey-5">정보가 없습니다.</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-3 font-bold text-grey-11">주차 안내</h3>
          {lots.length > 1 && (
            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(Number(e.target.value))}
              className="px-3 py-1.5 border border-bluegrey-3 rounded-lg text-caption text-grey-8 bg-white"
            >
              {lots.map((lot, i) => (
                <option key={lot.name} value={i}>{lot.name}</option>
              ))}
            </select>
          )}
        </div>
        {lots[selectedLot] ? (
          <dl className="flex flex-col gap-2">
            {lots[selectedLot].details.map(({ label, value }) => (
              <div key={label} className="flex gap-3 text-caption">
                <dt className="font-semibold text-grey-9 w-22 shrink-0">{label}</dt>
                <dd className="text-grey-6">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-body-5 text-grey-5">정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

/** ────────── 차량운행 안내 ────────── */
function RouteCard({ route }) {
  const [open, setOpen] = useState(false);
  const waypoints = route.waypoints ?? [];
  const summary = waypoints.length > 0 ? `${waypoints[0].label} ~ ${waypoints[waypoints.length - 1].label}` : "";

  return (
    <div className="p-4 rounded-xl border border-bluegrey-2">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <p>
          <span className="block text-body-4 font-bold text-grey-11">{route.name}</span>
          <span className="text-caption text-grey-6">{summary}</span>
        </p>
        <Icon d="M6 9l6 6 6-6" size={18} strokeWidth={2} className={`shrink-0 text-grey-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && waypoints.length > 0 && (
        <div className="mt-3 pt-3 border-t border-bluegrey-1 flex flex-col gap-1.5">
          {waypoints.map((wp, i) => (
            <p key={i} className="text-caption text-grey-7">
              {wp.label} <span className="text-grey-5">{wp.time}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function TransportTab({ church }) {
  const { routes = [], notes = [] } = church.transportGuide ?? {};
  const validRoutes = routes.filter((r) => r.waypoints?.length > 0);

  if (validRoutes.length === 0 && notes.length === 0) {
    return <p className="px-5 py-10 text-center text-body-5 text-grey-5">등록된 차량운행 안내가 없습니다.</p>;
  }

  return (
    <div className="px-5 py-5 flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {validRoutes.map((route) => (
          <RouteCard key={route.name} route={route} />
        ))}
      </div>
      {notes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {notes.map((note, i) => (
            <li key={i} className="flex gap-2 text-caption text-grey-7">
              <span className="shrink-0">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TAB_CONTENT = {
  인사말: GreetingTab,
  "교회 비전": VisionTab,
  "교회 연혁": HistoryTab,
  "섬기는 사람들": StaffTab,
  "층별 안내": FloorTab,
  "오시는 길": DirectionTab,
  "차량운행 안내": TransportTab,
};

export default function MobileChurch({ initialTab }) {
  const { church } = useChurch();
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "인사말");
  const ActiveContent = TAB_CONTENT[tab];

  return (
    <div className="w-full">
      <h1 className="px-5 pt-4.5 pb-2 text-sub-tit-3 font-bold text-grey-11">교회 소개</h1>
      <div className="flex gap-5 px-5 overflow-x-auto border-b border-bluegrey-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 py-3 text-body-5 border-b-2 -mb-px whitespace-nowrap ${
              t === tab ? "border-primary text-primary font-bold" : "border-transparent text-grey-6"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <ActiveContent church={church} />
    </div>
  );
}
