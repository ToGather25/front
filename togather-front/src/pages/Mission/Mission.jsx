import { useState } from "react";

const TABS = ["전도회 소개", "국내·해외 선교", "선교지 소식"];

const EVANGELISM_INFO = {
  description:
    "전도회는 복음을 이웃에게 전하고자 뜻을 모은 성도들의 모임입니다.\n정기적인 전도 훈련과 현장 전도를 통해 지역 사회에 그리스도의 사랑을 전합니다.",
  leader: { name: "전도회장 홍길동 집사", tel: "010-0000-0000" },
  schedule: "매주 토요일 오전 9:30 교회 로비 집결",
  activities: [
    { name: "노방전도", schedule: "매주 토요일 오전 10:00", location: "교회 주변 일대" },
    { name: "심방전도", schedule: "매주 수요일 오후 2:00", location: "각 가정" },
    { name: "문서전도", schedule: "상시", location: "교회 입구" },
    { name: "전도 훈련", schedule: "매월 첫째 주 토요일", location: "교육관 201호" },
  ],
};

const MISSION_CONTENT = {
  국내: {
    title: "국내 선교",
    description: "소외된 이웃과 지역 교회를 섬기는 국내 선교 사역입니다.",
    items: [
      { name: "농어촌 교회 지원", schedule: "분기별", location: "전국 농어촌 지역" },
      { name: "사회복지 사역", schedule: "매월 셋째 주 토요일", location: "지역 복지관" },
      { name: "군 선교", schedule: "매주 일요일", location: "인근 부대" },
    ],
  },
  해외: {
    title: "해외 선교",
    description: "땅 끝까지 복음을 전하는 해외 선교 사역입니다.",
    items: [
      { name: "동남아시아 선교", schedule: "연 2회", location: "태국, 캄보디아" },
      { name: "중앙아시아 선교", schedule: "연 1회", location: "몽골, 키르기스스탄" },
      { name: "단기선교팀", schedule: "여름, 겨울 방학", location: "파송국 현지" },
    ],
  },
};

const MISSION_NEWS = [
  {
    id: 1,
    title: "태국 치앙마이 선교 보고",
    date: "2026.04.20",
    location: "태국",
    missionary: "김선교 선교사",
    summary:
      "현지 교회 개척을 위한 연합 예배를 드렸습니다. 많은 현지인이 참석하여 복음을 들었습니다.",
  },
  {
    id: 2,
    title: "캄보디아 프놈펜 어린이 사역",
    date: "2026.03.15",
    location: "캄보디아",
    missionary: "이복음 선교사",
    summary:
      "지역 어린이 약 80명에게 성경 이야기를 전하고 함께 예배드렸습니다.",
  },
  {
    id: 3,
    title: "몽골 울란바토르 동계 사역",
    date: "2026.01.05",
    location: "몽골",
    missionary: "박말씀 선교사",
    summary:
      "영하 30도의 혹독한 추위 속에서도 성도들이 모여 말씀을 나눴습니다.",
  },
];

export default function Mission() {
  const [activeTab, setActiveTab] = useState("전도회 소개");
  const [missionType, setMissionType] = useState("국내");

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

        {/* 전도회 소개 */}
        {activeTab === "전도회 소개" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">전도회 소개</h2>
            <p className="text-body-2 text-grey-7 mb-8 whitespace-pre-line">{EVANGELISM_INFO.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-2xl">
              <div className="border border-bluegrey-2 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-body-5 text-grey-5 mb-0.5">회장</p>
                  <p className="text-body-3 font-semibold text-grey-11">{EVANGELISM_INFO.leader.name}</p>
                  <p className="text-body-5 text-grey-6">{EVANGELISM_INFO.leader.tel}</p>
                </div>
              </div>
              <div className="border border-bluegrey-2 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-body-5 text-grey-5 mb-0.5">정기 집결</p>
                  <p className="text-body-3 font-semibold text-grey-11">{EVANGELISM_INFO.schedule}</p>
                </div>
              </div>
            </div>

            <h3 className="text-sub-tit-4 font-semibold text-grey-10 mb-4">주요 사역</h3>
            <div className="grid grid-cols-1 gap-4 max-w-2xl">
              {EVANGELISM_INFO.activities.map(({ name, schedule, location }) => (
                <div key={name} className="border border-bluegrey-2 rounded-2xl p-6 flex items-start gap-6">
                  <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
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
        )}

        {/* 국내·해외 선교 */}
        {activeTab === "국내·해외 선교" && (
          <div>
            {/* 국내/해외 토글 */}
            <div className="flex items-center gap-1 bg-bluegrey-1 rounded-xl p-1 w-fit mb-8">
              {["국내", "해외"].map((type) => (
                <button
                  key={type}
                  onClick={() => setMissionType(type)}
                  className={`px-7 py-2 rounded-lg text-body-3 font-semibold transition-all ${
                    missionType === type
                      ? "bg-white text-primary shadow-sm"
                      : "text-grey-7 hover:text-grey-10"
                  }`}
                >
                  {type} 선교
                </button>
              ))}
            </div>

            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">
              {MISSION_CONTENT[missionType].title}
            </h2>
            <p className="text-body-2 text-grey-7 mb-8">
              {MISSION_CONTENT[missionType].description}
            </p>

            <div className="grid grid-cols-1 gap-4 max-w-2xl">
              {MISSION_CONTENT[missionType].items.map(({ name, schedule, location }) => (
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
        )}

        {/* 선교지 소식 */}
        {activeTab === "선교지 소식" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">선교지 소식</h2>
            <p className="text-body-2 text-grey-7 mb-8">현지에서 전해오는 생생한 선교 소식을 전합니다.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MISSION_NEWS.map((news) => (
                <div
                  key={news.id}
                  className="border border-bluegrey-2 rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-36 bg-bluegrey-1 flex items-center justify-center">
                    <svg className="w-10 h-10 text-bluegrey-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-1 text-blue-7 text-body-5 font-semibold rounded-full">
                        {news.location}
                      </span>
                      <span className="text-body-5 text-grey-5">{news.date}</span>
                    </div>
                    <p className="text-body-2 font-semibold text-grey-11 mb-1 line-clamp-1">{news.title}</p>
                    <p className="text-body-4 text-grey-6 mb-3">{news.missionary}</p>
                    <p className="text-body-4 text-grey-7 line-clamp-2">{news.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
