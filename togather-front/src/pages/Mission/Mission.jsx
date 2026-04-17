import { useState } from "react";

const TABS = ["전도", "국내선교", "해외선교", "선교사 파송"];

const TAB_CONTENT = {
  "전도": {
    title: "전도 사역",
    description: "복음을 이웃에게 전하는 전도 사역입니다.",
    items: [
      { name: "노방전도", schedule: "매주 토요일 오전 10:00", location: "교회 주변 일대" },
      { name: "심방전도", schedule: "매주 수요일 오후 2:00", location: "각 가정" },
      { name: "문서전도", schedule: "상시", location: "교회 입구" },
    ],
  },
  "국내선교": {
    title: "국내 선교",
    description: "국내 소외된 이웃과 지역 교회를 섬기는 사역입니다.",
    items: [
      { name: "농어촌 교회 지원", schedule: "분기별", location: "전국 농어촌 지역" },
      { name: "사회복지 사역", schedule: "매월 셋째 주 토요일", location: "지역 복지관" },
      { name: "군 선교", schedule: "매주 일요일", location: "인근 부대" },
    ],
  },
  "해외선교": {
    title: "해외 선교",
    description: "땅 끝까지 복음을 전하는 해외 선교 사역입니다.",
    items: [
      { name: "동남아시아 선교", schedule: "연 2회", location: "태국, 캄보디아" },
      { name: "중앙아시아 선교", schedule: "연 1회", location: "몽골, 키르기스스탄" },
      { name: "단기선교팀", schedule: "여름, 겨울 방학", location: "파송국 현지" },
    ],
  },
  "선교사 파송": {
    title: "파송 선교사",
    description: "교회에서 파송하여 현지에서 사역 중인 선교사님들입니다.",
    items: [
      { name: "김선교 선교사 가정", schedule: "2015년 파송", location: "태국 치앙마이" },
      { name: "이복음 선교사 가정", schedule: "2018년 파송", location: "캄보디아 프놈펜" },
      { name: "박말씀 선교사 가정", schedule: "2021년 파송", location: "몽골 울란바토르" },
    ],
  },
};

export default function Mission() {
  const [activeTab, setActiveTab] = useState("전도");
  const content = TAB_CONTENT[activeTab];

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">전도·선교</h1>
        </div>
      </div>

      {/* Tab Navigation */}
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
        <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">{content.title}</h2>
        <p className="text-body-2 text-grey-7 mb-8">{content.description}</p>

        <div className="grid grid-cols-1 gap-4 max-w-2xl">
          {content.items.map(({ name, schedule, location }) => (
            <div key={name} className="border border-bluegrey-2 rounded-2xl p-6 flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-body-2 font-semibold text-grey-11 mb-1">{name}</p>
                <p className="text-body-4 text-grey-6">{schedule}</p>
                <p className="text-body-4 text-grey-7 mt-0.5">{location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
