import { useState } from "react";

const TABS = ["새가족", "소그룹", "제자훈련", "성경공부"];

const TAB_CONTENT = {
  "새가족": {
    title: "새가족 사역",
    description: "처음 교회를 찾아오신 분들이 잘 정착할 수 있도록 돕는 사역입니다.",
    items: [
      { name: "새가족 환영 예배", schedule: "매주 일요일 2부 예배 후", location: "새가족실" },
      { name: "새가족 교육", schedule: "매월 첫째 주 토요일 오전 10:00", location: "교육관 201호" },
      { name: "새가족 심방", schedule: "등록 후 2주 이내", location: "각 가정" },
    ],
  },
  "소그룹": {
    title: "소그룹 모임",
    description: "지역별·연령별로 모여 말씀을 나누고 교제하는 소그룹 모임입니다.",
    items: [
      { name: "청년 소그룹", schedule: "매주 금요일 오후 7:30", location: "각 구역 가정" },
      { name: "장년 구역 모임", schedule: "매주 목요일 오후 7:00", location: "각 구역 가정" },
      { name: "여성 모임", schedule: "매주 화요일 오전 10:00", location: "교회 소회의실" },
    ],
  },
  "제자훈련": {
    title: "제자훈련",
    description: "그리스도의 제자로 세워지기 위한 체계적인 훈련 과정입니다.",
    items: [
      { name: "제자훈련 1단계", schedule: "매주 수요일 오후 7:30 (20주)", location: "교육관 302호" },
      { name: "제자훈련 2단계", schedule: "매주 목요일 오후 7:30 (20주)", location: "교육관 302호" },
      { name: "사역훈련", schedule: "1, 2단계 수료 후 진행", location: "교육관 303호" },
    ],
  },
  "성경공부": {
    title: "성경공부",
    description: "깊이 있는 말씀 묵상과 성경 전체를 체계적으로 배우는 과정입니다.",
    items: [
      { name: "구약 성경공부", schedule: "매주 화요일 오후 7:00", location: "본당 소예배실" },
      { name: "신약 성경공부", schedule: "매주 목요일 오전 10:00", location: "교육관 201호" },
      { name: "성경통독반", schedule: "연 2회 (봄·가을)", location: "교육관 301호" },
    ],
  },
};

export default function Nurture() {
  const [activeTab, setActiveTab] = useState("새가족");
  const content = TAB_CONTENT[activeTab];

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">양육·훈련</h1>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
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
