import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import juboConfig from "@/config/jubo.config";

const TABS = ["표지", "예배", "소식", "봉사", "예물", "후원", "구역", "섬기는 분들", "오시는 길"];

// ── 표지 ───────────────────────────────────────────────
function Cover() {
  const { church } = useChurch();
  const { cover } = juboConfig;
  const { mainTitle, mainVerse, items } = church.vision;

  return (
    <div className="border border-bluegrey-2 rounded-2xl p-8 max-w-2xl mx-auto">
      <div className="flex justify-between text-body-3 text-grey-8 mb-6">
        <span>{cover.issueNumber}</span>
        <span>{cover.date}</span>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-blue-8 flex flex-col items-center justify-center text-white">
            <span className="text-sub-tit-3 font-bold">{church.vision.year}</span>
            <span className="text-body-3">표어</span>
          </div>
          <p className="text-center text-body-3 text-grey-9 font-medium">{mainVerse}</p>
          <p className="text-center text-body-4 text-grey-7">{mainTitle}</p>
        </div>
        <div className="flex-1 bg-grey-3 rounded-xl min-h-40" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-grey-3 rounded-xl h-36" />
        <div className="bg-primary rounded-xl h-36 flex flex-col items-center justify-center gap-2 text-white">
          <p className="text-body-5">[3대 실천사항]</p>
          {items.map(({ label }) => (
            <p key={label} className="text-sub-tit-5 font-semibold">{label}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 예배 ───────────────────────────────────────────────
function Worship() {
  const { worshipServices, worshipOrder, worshipScheduleSummary } = juboConfig;
  const [selected, setSelected] = useState(worshipServices[0]);

  return (
    <div className="flex gap-6">
      <div className="w-36 shrink-0">
        <p className="text-body-5 text-grey-6 mb-3">기관</p>
        <ul className="flex flex-col gap-1">
          {worshipServices.map((s) => (
            <li key={s}>
              <button
                onClick={() => setSelected(s)}
                className={`w-full text-left text-body-4 px-3 py-1.5 rounded-lg transition-colors ${
                  selected === s ? "bg-primary text-white font-semibold" : "text-grey-9 hover:bg-bluegrey-1"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
          <li className="mt-3 text-body-5 text-grey-6 px-1">유치부</li>
          <li className="text-body-5 text-grey-6 px-1">초등부</li>
          <li className="text-body-5 text-grey-6 px-1">중등부</li>
          <li className="text-body-5 text-grey-6 px-1">대학·청년부</li>
        </ul>
      </div>
      <div className="flex-1 border border-bluegrey-2 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-sub-tit-4 font-semibold text-grey-11">예배 순서</h3>
          <p className="text-body-5 text-grey-6 mt-1">{selected} 주일 오전예배 (예배 - 오전09:00, 2부 - 오전 11:00)</p>
        </div>
        <table className="w-full text-body-4">
          <thead>
            <tr className="border-b border-bluegrey-2">
              <th className="text-left py-2 text-grey-6 font-medium w-1/3">순서</th>
              <th className="text-left py-2 text-grey-6 font-medium">담당</th>
            </tr>
          </thead>
          <tbody>
            {worshipOrder.map(({ order, person }) => (
              <tr key={order} className="border-b border-grey-3">
                <td className="py-2 text-grey-9">{order}</td>
                <td className="py-2 text-grey-8">{person}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-44 shrink-0 border border-bluegrey-2 rounded-2xl p-4">
        <h4 className="text-body-4 font-semibold text-grey-10 mb-3">예배 및 모임 안내</h4>
        {worshipScheduleSummary.map(({ label, time }) => (
          <div key={label} className="flex justify-between items-start py-1.5 border-b border-grey-3 text-body-5">
            <span className="text-grey-8">{label}</span>
            <span className="text-grey-10 font-medium text-right">{time}</span>
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
    <div className="border border-bluegrey-2 rounded-2xl p-6 max-w-2xl mx-auto">
      <h3 className="flex items-center gap-2 text-sub-tit-4 font-semibold text-grey-11 mb-4">
        <span>👥</span> 교회 소식
      </h3>
      <div className="flex flex-col gap-5">
        {news.map((section, i) => (
          <div key={i}>
            <p className="text-body-4 font-semibold text-grey-10 mb-2">{i + 1}. {section.title}</p>
            {section.items.map((item, j) => (
              <div key={j} className="flex gap-4 py-1.5 border-b border-grey-3">
                <span className="text-body-4 text-grey-8 w-40">{item}</span>
                <span className="text-body-4 text-grey-6">내용을 입력하세요. 내용을 입력하세요. 내용을 입력하세요.</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 봉사 ───────────────────────────────────────────────
function Service() {
  const { serviceRoles } = juboConfig;
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-6 max-w-xl mx-auto">
      <h3 className="flex items-center gap-2 text-sub-tit-4 font-semibold text-grey-11 mb-4">
        <span>🙏</span> 다음 주 봉사 안내
      </h3>
      <table className="w-full text-body-4">
        <thead>
          <tr className="border-b border-bluegrey-3">
            <th className="text-left py-2 text-grey-6 font-medium">구분</th>
            <th className="text-center py-2 text-grey-6 font-medium">1부</th>
            <th className="text-center py-2 text-grey-6 font-medium">2부</th>
          </tr>
        </thead>
        <tbody>
          {serviceRoles.map(({ role, part1, part2 }) => (
            <tr key={role} className="border-b border-grey-3">
              <td className="py-2 text-grey-8">{role}</td>
              <td className="py-2 text-center text-grey-9">{part1}</td>
              <td className="py-2 text-center text-grey-9">{part2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 예물 ───────────────────────────────────────────────
function Offering() {
  const { offering } = juboConfig;
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-6 max-w-xl mx-auto">
      <h3 className="flex items-center gap-2 text-sub-tit-4 font-semibold text-grey-11 mb-4">
        <span>🌸</span> 향기로운 예물
      </h3>
      {offering.map(({ title, items }) => (
        <div key={title} className="mb-4">
          <p className="text-body-4 font-semibold text-grey-9 mb-1">{title}</p>
          {items.map((item, i) => (
            <p key={i} className="text-body-4 text-grey-7 ml-3">{item}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── 후원 ───────────────────────────────────────────────
function Support() {
  const { support } = juboConfig;
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-6 max-w-xl mx-auto">
      <h3 className="flex items-center gap-2 text-sub-tit-4 font-semibold text-grey-11 mb-4">
        <span>🤝</span> 교회가 돕고 있는 곳
      </h3>
      {support.map(({ category, items }) => (
        <div key={category} className="mb-4">
          <p className="text-body-4 font-semibold text-grey-9 mb-1">{category}</p>
          {items.map((item, i) => (
            <p key={i} className="text-body-4 text-grey-7 ml-3 py-0.5 border-b border-grey-3">{item}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── 구역 ───────────────────────────────────────────────
function District() {
  const { districts } = juboConfig;
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-6 max-w-2xl mx-auto">
      <h3 className="flex items-center gap-2 text-sub-tit-4 font-semibold text-grey-11 mb-4">
        <span>🏘️</span> 구역 모임
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {districts.map(({ name, location, time, leader }) => (
          <div key={name} className="border border-grey-3 rounded-xl p-4">
            <p className="text-body-4 font-semibold text-grey-10 mb-2">{name}</p>
            <div className="flex justify-between text-body-5 text-grey-7">
              <span>모임 장소</span>
              <span>{location}</span>
            </div>
            <div className="flex justify-between text-body-5 text-grey-7 mt-1">
              <span>모임 시간</span>
              <span>{time}</span>
            </div>
            <div className="flex justify-between text-body-5 text-grey-7 mt-1">
              <span>구역장</span>
              <span>{leader}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 섬기는 분들 ────────────────────────────────────────
function Ministers() {
  const { ministers } = juboConfig;
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-8 max-w-3xl mx-auto">
      <h3 className="flex items-center gap-2 text-sub-tit-4 font-semibold text-grey-11 mb-1">
        <span>👥</span> 섬기는 분들
      </h3>
      <hr className="border-bluegrey-2 mb-6" />
      <div className="grid grid-cols-3 gap-8 text-center">
        {ministers.map(({ title, items }) => (
          <div key={title}>
            <p className="text-sub-tit-5 font-semibold text-grey-10 mb-3">{title}</p>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <p key={item} className="text-body-4 text-grey-8">{item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 오시는 길 ──────────────────────────────────────────
function Direction() {
  const { church } = useChurch();
  return (
    <div className="max-w-2xl mx-auto">
      <KakaoMap
        level={church.location.level}
        address={church.address}
        className="w-full h-72 rounded-2xl overflow-hidden mb-4"
      />
      <p className="text-body-4 text-grey-7">{church.address}</p>
    </div>
  );
}

const TAB_CONTENT = {
  "표지": <Cover />,
  "예배": <Worship />,
  "소식": <News />,
  "봉사": <Service />,
  "예물": <Offering />,
  "후원": <Support />,
  "구역": <District />,
  "섬기는 분들": <Ministers />,
  "오시는 길": <Direction />,
};

export default function Jubo() {
  const [activeTab, setActiveTab] = useState("표지");

  return (
    <div className="max-w-[1576px] mx-auto px-4 py-10">
      <h1 className="text-[2rem] font-semibold text-grey-12 mb-6 tracking-tight">스마트 주보</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-base border-2 transition-colors font-medium ${
                activeTab === tab
                  ? "bg-blue-8 border-blue-10 text-white font-semibold"
                  : "bg-white border-blue-2 text-blue-2 hover:border-blue-5 hover:text-blue-5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="bg-bluegrey-1 border-2 border-bluegrey-4 rounded-lg p-2 hover:bg-bluegrey-2 transition-colors">
          <svg className="w-6 h-6 text-grey-9" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
        </button>
      </div>

      <div>{TAB_CONTENT[activeTab]}</div>
    </div>
  );
}
