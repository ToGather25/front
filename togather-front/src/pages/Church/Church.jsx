import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";

const TABS = [
  "인사말", "교회 연혁·비전", "예배 안내", "섬기는 사람들",
  "층별 안내", "오시는 길", "차량운행 안내",
];

// ── 인사말 ─────────────────────────────────────────────
function Greeting() {
  const { church } = useChurch();
  const { title, paragraphs, signature } = church.greeting;

  return (
    <div className="flex gap-10 items-start">
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
      <div className="w-48 h-64 bg-grey-3 rounded-2xl shrink-0 flex items-center justify-center text-grey-5 text-body-4">
        목사님 사진
      </div>
    </div>
  );
}

// ── 교회 비전 ──────────────────────────────────────────
function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;

  return (
    <div>
      <div className="bg-grey-2 rounded-2xl p-6 text-center mb-10">
        <p className="text-sub-tit-4 font-semibold text-grey-10">{mainTitle}</p>
        <p className="text-body-2 text-grey-7 mt-1">{mainVerse}</p>
      </div>
      <div className="relative flex flex-col items-start gap-6 ml-20">
        {items.map(({ label, description }, i) => (
          <div key={label} className="flex items-center gap-8" style={{ marginLeft: i * 40 }}>
            <div className="w-36 h-36 rounded-full border-2 border-bluegrey-3 flex items-center justify-center shrink-0">
              <span className="text-sub-tit-4 font-semibold text-grey-9">{label}</span>
            </div>
            <p className="text-body-2 text-grey-7">── {description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 예배 안내 ──────────────────────────────────────────
function WorshipInfo() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;

  return (
    <div className="grid grid-cols-2 gap-10">
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
function Staff() {
  const { church } = useChurch();
  const { filterTags, headPastor, clergy } = church.staff;

  return (
    <div>
      <div className="flex items-center gap-2 border border-bluegrey-2 rounded-full px-4 py-2 mb-6 max-w-md">
        <svg className="w-4 h-4 text-grey-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5" placeholder="교역자 검색" />
      </div>
      <div className="flex gap-2 mb-8">
        {filterTags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-grey-2 text-body-5 text-grey-7 rounded-full">{tag}</span>
        ))}
      </div>

      <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">담임목사</h3>
      <div className="border border-bluegrey-2 rounded-2xl p-6 mb-6">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-grey-3 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <p className="text-body-3 font-semibold text-grey-11">{headPastor.name}</p>
              <button className="text-body-5 text-blue-7 border border-blue-7 px-3 py-0.5 rounded-full">설교방송</button>
            </div>
            <p className="text-body-5 text-grey-6">{headPastor.tel}</p>
            <p className="text-body-5 text-grey-6">{headPastor.email}</p>
            <p className="text-body-4 text-grey-7 mt-2">{headPastor.role}</p>
          </div>
          <div className="flex flex-col gap-2 text-body-5 text-grey-7 w-40">
            <div>
              <p className="text-grey-5 text-body-5">학력</p>
              {headPastor.education.map((item) => <p key={item}>{item}</p>)}
            </div>
            <div className="mt-1">
              <p className="text-grey-5 text-body-5">약력</p>
              {headPastor.career.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">교역자</h3>
      <div className="grid grid-cols-2 gap-4">
        {clergy.map(({ name, tel, email, role }) => (
          <div key={name} className="border border-bluegrey-2 rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-grey-3 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-body-4 font-semibold text-grey-11">{name}</p>
                  <button className="text-body-5 text-blue-7 border border-blue-7 px-2 py-0.5 rounded-full">설교방송</button>
                </div>
                <p className="text-body-5 text-grey-6">{tel}</p>
                <p className="text-body-5 text-grey-6">{email}</p>
                <p className="text-body-5 text-grey-7 mt-1">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 교회 연혁 ──────────────────────────────────────────
function History() {
  const { church } = useChurch();

  return (
    <div className="max-w-2xl">
      {church.history.map(({ era, events }) => (
        <div key={era} className="flex gap-10 mb-10">
          <h3 className="text-headline-3 font-bold text-grey-11 w-28 shrink-0 pt-1">{era}</h3>
          <ul className="flex-1 flex flex-col gap-2">
            {events.map(({ date, content }) => (
              <li key={date} className="flex items-start gap-4 text-body-4">
                <span className="text-blue-7 shrink-0">◆</span>
                <span className="text-grey-7 w-24 shrink-0">{date}</span>
                <span className="text-grey-9">{content}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── 층별 안내 ──────────────────────────────────────────
function FloorGuide() {
  const { church } = useChurch();

  return (
    <div className="max-w-lg">
      <table className="w-full text-body-4 border-t border-bluegrey-3">
        <tbody>
          {church.floorGuide.map(({ floor, rooms }) => (
            <tr key={floor} className="border-b border-grey-3">
              <td className="py-4 font-semibold text-grey-10 w-16">{floor}</td>
              <td className="py-4 text-grey-8">{rooms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 오시는 길 ──────────────────────────────────────────
function Direction() {
  const { church } = useChurch();
  return (
    <div className="max-w-2xl">
      <KakaoMap
        level={church.location.level}
        address={church.address}
        className="w-full h-72 rounded-2xl overflow-hidden mb-4"
      />
      <p className="text-body-4 text-grey-7">{church.address}</p>
    </div>
  );
}

// ── 차량운행 안내 ──────────────────────────────────────
function TransportGuide() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;

  return (
    <div className="max-w-2xl">
      <table className="w-full text-body-4 border-t border-bluegrey-3 mb-8">
        <tbody>
          {routes.map(({ name, schedule }) => (
            <tr key={name} className="border-b border-grey-3">
              <td className="py-4 font-semibold text-grey-10 w-32">{name}</td>
              <td className="py-4 text-grey-6">{schedule}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <KakaoMap
        level={church.location.level}
        address={church.address}
        className="w-full h-64 rounded-2xl overflow-hidden"
      />
    </div>
  );
}

function HistoryAndVision() {
  return (
    <div className="flex flex-col gap-16">
      <Vision />
      <div className="border-t border-bluegrey-2 pt-12">
        <History />
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  "인사말": <Greeting />,
  "예배 안내": <WorshipInfo />,
  "섬기는 사람들": <Staff />,
  "교회 연혁·비전": <HistoryAndVision />,
  "층별 안내": <FloorGuide />,
  "오시는 길": <Direction />,
  "차량운행 안내": <TransportGuide />,
};

export default function Church() {
  const [activeTab, setActiveTab] = useState("인사말");

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
      <div className="border-b border-bluegrey-2 bg-white sticky top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
      <div className="max-w-[1576px] mx-auto px-8 py-10">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
