import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import juboConfig from "@/config/jubo.config";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import DefaultBanner from "@/assets/default_banner.png";

const TABS = ["표지", "예배", "소식", "봉사", "예물", "후원", "구역", "섬기는 분들", "오시는 길"];

// A4 page wrapper — screen: 794×1123px / print: 210×297mm
function JuboPage({ children, noPadding = false }) {
  return (
    <div
      className="jubo-page mx-auto bg-white border border-bluegrey-2 shadow-lg overflow-y-auto"
      style={{ width: 1100, height: 1300 }}
    >
      <div className={noPadding ? "h-full" : "p-10 h-full"}>
        {children}
      </div>
    </div>
  );
}

// 공통 섹션 타이틀
function SectionTitle({ icon, children }) {
  return (
    <>
      <h3 className="flex items-center gap-2.5 text-[18px] font-bold text-grey-11 mb-4">
        {icon}{children}
      </h3>
      <div className="border-t-2 border-grey-11" />
    </>
  );
}

// ── 표지 ───────────────────────────────────────────────
function Cover() {
  const { church } = useChurch();
  const { cover } = juboConfig;
  const { mainVerse, mainTitle, items, year } = church.vision;

  const churchPhoto   = cover.photos?.church;
  const panoramaPhoto = cover.photos?.panorama ?? DefaultBanner;
  const groupPhoto    = cover.photos?.group;

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-8 py-3.5 border-b border-bluegrey-2 shrink-0">
        <span className="text-[13px] text-grey-6">{cover.issueNumber}</span>
        <span className="text-[14px] font-semibold text-grey-9">{cover.date}</span>
      </div>

      {/* 표어 + 교회 사진 */}
      <div className="flex shrink-0" style={{ height: 310 }}>
        <div className="flex flex-col justify-center gap-4 px-10 py-8" style={{ width: "40%" }}>
          <span className="self-start px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold">
            {year}년 표어
          </span>
          <h2 className="text-[26px] font-bold leading-[1.35] text-grey-12">
            {mainVerse.replace(/^"|"$/g, "")}
          </h2>
          <p className="text-[13px] text-grey-6">{mainTitle}</p>
        </div>
        <div className="flex-1 relative overflow-hidden bg-grey-3">
          {churchPhoto
            ? <img src={churchPhoto} alt="교회 건물" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-2 to-blue-3 flex items-center justify-center text-grey-5 text-[13px]">교회 사진</div>
          }
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
            <img src={LogoIcon} className="h-6 w-auto object-contain" alt={church.name} />
          </div>
        </div>
      </div>

      {/* 파노라마 사진 (전체 너비) */}
      <div className="w-full shrink-0 overflow-hidden" style={{ height: 380 }}>
        <img src={panoramaPhoto} alt="예배 전경" className="w-full h-full object-cover" />
      </div>

      {/* 3대 실천사항 + 단체 사진 */}
      <div className="flex flex-1">
        <div
          className="flex flex-col items-center justify-center gap-3 px-8 shrink-0"
          style={{ width: "40%", background: "var(--color-primary)" }}
        >
          <p className="text-[11px] font-semibold text-blue-3 tracking-widest">[3대 실천사항]</p>
          <div className="flex flex-col items-center gap-1.5">
            {items.map(({ label }) => (
              <p key={label} className="text-[20px] font-bold text-white">{label}</p>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-grey-3">
          {groupPhoto
            ? <img src={groupPhoto} alt="공동체 단체 사진" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-grey-3 to-grey-4 flex items-center justify-center text-grey-5 text-[13px]">공동체 사진</div>
          }
        </div>
      </div>
    </div>
  );
}

// ── 예배 ───────────────────────────────────────────────
const SIDEBAR_SERVICES = [
  { label: "전체",      group: "main" },
  { label: "주일오전예배", group: "main" },
  { label: "새벽기도회",  group: "main" },
  { label: "수요기도회",  group: "main" },
  { label: "금요기도회",  group: "main" },
  { label: "유치부",    group: "sub" },
  { label: "초등부",    group: "sub" },
  { label: "중고등부",   group: "sub" },
  { label: "대학청년부",  group: "sub" },
];

function Worship() {
  const { worshipOrder, worshipScheduleSummary } = juboConfig;
  const [selected, setSelected] = useState("주일오전예배");

  return (
    <div className="flex gap-0 border border-bluegrey-2 rounded-xl overflow-hidden h-full">
      {/* 사이드바 */}
      <div className="w-32 shrink-0 border-r border-bluegrey-2 bg-bluegrey-1 py-3">
        <p className="text-[10px] font-bold text-grey-6 uppercase tracking-wider px-3 mb-2">기관</p>
        {SIDEBAR_SERVICES.map(({ label, group }, i) => {
          const isFirst = group === "sub" && SIDEBAR_SERVICES[i - 1]?.group === "main";
          return (
            <div key={label}>
              {isFirst && <div className="h-px bg-bluegrey-2 mx-3 my-1.5" />}
              <button
                onClick={() => setSelected(label)}
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                  selected === label ? "bg-primary text-white font-semibold" : "text-grey-9 hover:bg-bluegrey-2"
                }`}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {/* 순서 */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="mb-4">
          <h3 className="text-[16px] font-bold text-grey-11">예배 순서</h3>
          <p className="text-[12px] text-grey-6 mt-0.5">{selected} · 주일 오전 예배 (09:00 ~ 11:00)</p>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="text-left py-2 px-3 text-grey-7 font-semibold w-1/4">순서</th>
              <th className="py-2 px-3 text-grey-7 font-semibold text-center">1부</th>
              <th className="py-2 px-3 text-grey-7 font-semibold text-center">2부</th>
            </tr>
          </thead>
          <tbody>
            {worshipOrder.map(({ order, part1, part2 }, i) => (
              <tr key={i} className="border-b border-grey-3">
                <td className="py-2.5 px-3 text-grey-9 font-medium">{order}</td>
                <td className="py-2.5 px-3 text-grey-7 text-center whitespace-pre-line">{part1}</td>
                <td className="py-2.5 px-3 text-grey-7 text-center whitespace-pre-line">{part2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모임 안내 */}
      <div className="w-40 shrink-0 border-l border-bluegrey-2 p-4">
        <h4 className="text-[13px] font-bold text-grey-10 mb-3">예배 및 모임 안내</h4>
        {worshipScheduleSummary.map(({ label, time }) => (
          <div key={label} className="flex justify-between items-start py-2 border-b border-grey-3">
            <span className="text-[11px] text-grey-8 leading-tight">{label}</span>
            <span className="text-[11px] text-grey-10 font-semibold text-right leading-tight">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 소식 ───────────────────────────────────────────────
function News() {
  const { news } = juboConfig;
  return (
    <>
      <SectionTitle icon={
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z" /><path d="M17 20v-8H7v8M7 4v4h8" />
        </svg>
      }>교회 소식</SectionTitle>
      <table className="w-full text-[13px] mt-1">
        {news.map((section, i) => (
          <tbody key={i}>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <td colSpan={2} className="py-2 px-4 font-semibold text-grey-8">{i + 1}. {section.title}</td>
            </tr>
            {section.items.map((item, j) => (
              <tr key={j} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-9 w-48">{item}</td>
                <td className="py-3 px-4 text-grey-6">내용을 입력하세요.</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </>
  );
}

// ── 봉사 ───────────────────────────────────────────────
function Service() {
  const { serviceRoles } = juboConfig;
  return (
    <>
      <SectionTitle icon={
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      }>다음 주 봉사 안내</SectionTitle>
      <table className="w-full text-[13px] mt-1">
        <thead>
          <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
            <th className="text-left py-2 px-4 text-grey-7 font-semibold">구분</th>
            <th className="text-center py-2 px-4 text-grey-7 font-semibold">1부</th>
            <th className="text-center py-2 px-4 text-grey-7 font-semibold">2부</th>
          </tr>
        </thead>
        <tbody>
          {serviceRoles.map(({ role, part1, part2 }) => (
            <tr key={role} className="border-b border-grey-3">
              <td className="py-3 px-4 text-grey-8">{role}</td>
              <td className="py-3 px-4 text-center text-grey-9">{part1}</td>
              <td className="py-3 px-4 text-center text-grey-9">{part2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ── 예물 ───────────────────────────────────────────────
function Offering() {
  const { offering } = juboConfig;
  return (
    <>
      <SectionTitle icon={
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      }>향기로운 예물</SectionTitle>
      <table className="w-full text-[13px] mt-1">
        {offering.map(({ title, items }) => (
          <tbody key={title}>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <td colSpan={2} className="py-2 px-4 font-semibold text-grey-8">{title}</td>
            </tr>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-7">{item}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </>
  );
}

// ── 후원 ───────────────────────────────────────────────
function Support() {
  const { support } = juboConfig;
  return (
    <>
      <SectionTitle icon={
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      }>우리 교회가 돕고 있는 곳</SectionTitle>
      <table className="w-full text-[13px] mt-1">
        <thead>
          <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">기관</th>
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">대상</th>
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">후원구역</th>
          </tr>
        </thead>
        <tbody>
          {support.map(({ organization, target, region }, i) => (
            <tr key={i} className="border-b border-grey-3">
              <td className="py-3.5 px-4 text-grey-9 text-center">{organization}</td>
              <td className="py-3.5 px-4 text-grey-7 text-center">{target}</td>
              <td className="py-3.5 px-4 text-grey-7 text-center">{region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ── 구역 ───────────────────────────────────────────────
function District() {
  const { districts } = juboConfig;
  return (
    <>
      <SectionTitle icon={
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      }>구역 모임</SectionTitle>
      <table className="w-full text-[13px] mt-1">
        <thead>
          <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">구역</th>
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">모임 장소</th>
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">모임 시간</th>
            <th className="py-2 px-4 text-grey-7 font-semibold text-center">구역장</th>
          </tr>
        </thead>
        <tbody>
          {districts.map(({ name, location, time, leader }) => (
            <tr key={name} className="border-b border-grey-3">
              <td className="py-4 px-4 text-grey-9 font-semibold text-center">{name}</td>
              <td className="py-4 px-4 text-grey-7 text-center">{location}</td>
              <td className="py-4 px-4 text-grey-7 text-center">{time}</td>
              <td className="py-4 px-4 text-grey-7 text-center">{leader}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ── 섬기는 분들 ────────────────────────────────────────
function Ministers() {
  const { ministers } = juboConfig;
  return (
    <>
      <SectionTitle icon={
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      }>섬기는 분들</SectionTitle>
      <div className="mt-5 flex flex-col gap-6">
        {ministers.map(({ title, items }) => (
          <div key={title}>
            <p className="text-[13px] font-bold text-grey-9 mb-2 px-1">{title}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {items.map((item) => {
                const [role, name] = item.split("|").map((s) => s.trim());
                return (
                  <Link
                    key={item}
                    to="/교적부"
                    className="group flex items-center gap-2.5 p-3 rounded-xl border border-bluegrey-2 bg-white hover:border-primary hover:bg-blue-1 transition-all print:pointer-events-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-bluegrey-2 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                      <svg className="w-4 h-4 text-grey-6 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-grey-6 truncate">{role}</p>
                      <p className="text-[13px] font-semibold text-grey-10 group-hover:text-primary transition-colors truncate">{name || role}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-grey-4 group-hover:text-primary ml-auto shrink-0 transition-colors print:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 오시는 길 ──────────────────────────────────────────
function Direction() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <KakaoMap
          level={church.location.level}
          address={church.address}
          className="w-full rounded-xl overflow-hidden mb-3"
          style={{ height: 320 }}
        />
        <p className="text-[13px] text-grey-7">{church.address}</p>
      </div>
      <div>
        <SectionTitle icon={
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8zM5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm12 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
          </svg>
        }>셔틀 안내</SectionTitle>
        <table className="w-full text-[13px] mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">운행 코스</th>
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">시간 및 경유지</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(({ name, schedule }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3.5 px-4 font-semibold text-grey-10 w-36">{name}</td>
                <td className="py-3.5 px-4 text-grey-6">{schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 탭별 렌더 ──────────────────────────────────────────
function renderTab(tab) {
  switch (tab) {
    case "표지":      return <JuboPage noPadding><Cover /></JuboPage>;
    case "예배":      return <JuboPage><Worship /></JuboPage>;
    case "소식":      return <JuboPage><News /></JuboPage>;
    case "봉사":      return <JuboPage><Service /></JuboPage>;
    case "예물":      return <JuboPage><Offering /></JuboPage>;
    case "후원":      return <JuboPage><Support /></JuboPage>;
    case "구역":      return <JuboPage><District /></JuboPage>;
    case "섬기는 분들": return <JuboPage><Ministers /></JuboPage>;
    case "오시는 길":  return <JuboPage><Direction /></JuboPage>;
    default:         return null;
  }
}

// ── 메인 ───────────────────────────────────────────────
export default function Jubo() {
  const [activeTab, setActiveTab] = useState("표지");

  return (
    <>
      <style>{`
        @media print {
          header, footer, .jubo-no-print { display: none !important; }
          body { margin: 0; background: white; }
          @page { size: A4; margin: 0; }
          .jubo-page {
            width: 210mm !important;
            min-height: 297mm !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
          .jubo-page > div {
            height: auto !important;
          }
        }
      `}</style>

      <div className="max-w-[1576px] mx-auto px-8 py-10">
        {/* 헤더 — 프린트 시 숨김 */}
        <div className="jubo-no-print">
          <h1 className="text-sub-tit-1 font-bold text-grey-12 mb-6">스마트 주보</h1>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-body-3 border transition-colors font-medium ${
                    activeTab === tab
                      ? "bg-primary border-primary text-white font-semibold"
                      : "bg-white border-bluegrey-3 text-grey-8 hover:border-primary hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 프린트 버튼 */}
            <button
              onClick={() => window.print()}
              title="인쇄 / PDF 저장"
              className="bg-bluegrey-1 border border-bluegrey-3 rounded-lg p-2 hover:bg-bluegrey-2 transition-colors"
            >
              <svg className="w-5 h-5 text-grey-9" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* A4 페이지 콘텐츠 */}
        {renderTab(activeTab)}
      </div>
    </>
  );
}
