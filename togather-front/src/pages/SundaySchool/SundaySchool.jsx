import { useState } from "react";

const DEPARTMENTS = [
  {
    key: "유치부",
    ageRange: "만 4–7세",
    worship: { time: "주일 오전 11:00", location: "유치부실 (2층)" },
    pastor: { name: "담당 교역자", role: "유치부 전도사", tel: "010-0000-0000" },
    vision: "하나님을 사랑하는 어린이",
    description:
      "유치부는 만 4세~7세 어린이들이 처음으로 하나님을 만나는 소중한 공간입니다.\n말씀과 찬양, 놀이를 통해 하나님의 사랑을 배우고 신앙의 첫 걸음을 내딛습니다.",
    activities: ["주일 예배", "VBS (여름성경학교)", "어린이 찬양대", "성탄절 발표회"],
    color: "point-4",
  },
  {
    key: "초등부",
    ageRange: "초등학교 1–6학년",
    worship: { time: "주일 오전 11:00", location: "초등부실 (3층)" },
    pastor: { name: "담당 교역자", role: "초등부 전도사", tel: "010-0000-0000" },
    vision: "말씀으로 자라나는 어린이",
    description:
      "초등부는 초등학교 1~6학년 어린이들이 함께하는 공동체입니다.\n성경 말씀을 체계적으로 배우며 또래와 신앙 안에서 건강하게 성장합니다.",
    activities: ["주일 예배", "성경퀴즈대회", "제자훈련", "수련회"],
    color: "blue-5",
  },
  {
    key: "중고등부",
    ageRange: "중학교 1학년 – 고등학교 3학년",
    worship: { time: "주일 오전 11:00", location: "중고등부실 (4층)" },
    pastor: { name: "담당 교역자", role: "중고등부 전도사", tel: "010-0000-0000" },
    vision: "세상을 변화시키는 다음 세대",
    description:
      "중고등부는 중·고등학생들이 신앙과 삶의 질문을 함께 나누는 공동체입니다.\n말씀 묵상과 소그룹 활동을 통해 하나님 안에서 정체성을 세워갑니다.",
    activities: ["주일 예배", "소그룹 모임", "청소년 수련회", "봉사활동"],
    color: "blue-7",
  },
  {
    key: "대학부",
    ageRange: "대학교 1–4학년",
    worship: { time: "주일 오후 1:00", location: "대예배실 (1층)" },
    pastor: { name: "담당 교역자", role: "대학부 전도사", tel: "010-0000-0000" },
    vision: "하나님 나라를 꿈꾸는 청년",
    description:
      "대학부는 대학생들이 캠퍼스와 교회를 잇는 신앙 공동체입니다.\n말씀과 기도, 교제를 통해 하나님의 부르심을 발견하고 삶에서 실천합니다.",
    activities: ["주일 예배", "성경 공부", "캠퍼스 전도", "단기선교"],
    color: "primary",
  },
  {
    key: "청년부",
    ageRange: "20대 – 30대 초반",
    worship: { time: "주일 오후 2:00", location: "대예배실 (1층)" },
    pastor: { name: "담당 교역자", role: "청년부 담당 목사", tel: "010-0000-0000" },
    vision: "함께 세워가는 하나님 나라",
    description:
      "청년부는 20~30대 청년들이 신앙 안에서 함께 성장하는 공동체입니다.\n예배와 소그룹, 섬김을 통해 일상 속 그리스도인의 삶을 실천합니다.",
    activities: ["주일 예배", "소그룹 (셀)", "찬양팀", "지역사회 봉사"],
    color: "blue-8",
  },
];

function DeptContent({ dept }) {
  return (
    <div className="flex flex-col gap-10">
      {/* 소개 */}
      <div className="flex gap-10 items-start">
        <div className="flex-1">
          <div className="inline-block px-3 py-1 bg-blue-1 text-blue-7 text-body-5 font-semibold rounded-full mb-3">
            {dept.ageRange}
          </div>
          <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">{dept.key}</h2>
          <p className="text-body-2 text-blue-6 font-medium mb-5">"{dept.vision}"</p>
          <div className="text-body-3 text-grey-7 whitespace-pre-line leading-relaxed">
            {dept.description}
          </div>
        </div>
        <div className="w-52 h-52 rounded-2xl bg-grey-2 shrink-0 flex items-center justify-center text-grey-5 text-body-4">
          부서 사진
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 예배 안내 */}
        <div className="border border-bluegrey-2 rounded-2xl p-6">
          <h3 className="text-sub-tit-5 font-semibold text-grey-10 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-7 inline-block" />
            예배 안내
          </h3>
          <dl className="flex flex-col gap-2 text-body-4">
            <div className="flex gap-2">
              <dt className="text-grey-5 w-16 shrink-0">시간</dt>
              <dd className="text-grey-9">{dept.worship.time}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-grey-5 w-16 shrink-0">장소</dt>
              <dd className="text-grey-9">{dept.worship.location}</dd>
            </div>
          </dl>
        </div>

        {/* 담당 교역자 */}
        <div className="border border-bluegrey-2 rounded-2xl p-6">
          <h3 className="text-sub-tit-5 font-semibold text-grey-10 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-7 inline-block" />
            담당 교역자
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-grey-3 shrink-0" />
            <div>
              <p className="text-body-3 font-semibold text-grey-11">{dept.pastor.name}</p>
              <p className="text-body-5 text-grey-6">{dept.pastor.role}</p>
              <p className="text-body-5 text-grey-6">{dept.pastor.tel}</p>
            </div>
          </div>
        </div>

        {/* 주요 활동 */}
        <div className="border border-bluegrey-2 rounded-2xl p-6">
          <h3 className="text-sub-tit-5 font-semibold text-grey-10 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-7 inline-block" />
            주요 활동
          </h3>
          <ul className="flex flex-col gap-2">
            {dept.activities.map((act) => (
              <li key={act} className="flex items-center gap-2 text-body-4 text-grey-8">
                <span className="text-blue-5 text-body-5">◆</span>
                {act}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SundaySchool() {
  const [activeTab, setActiveTab] = useState(DEPARTMENTS[0].key);
  const dept = DEPARTMENTS.find((d) => d.key === activeTab);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">주일학교</h1>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="border-b border-bluegrey-2 bg-white sticky top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveTab(d.key)}
                className={`px-6 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                  activeTab === d.key
                    ? "border-blue-8 text-blue-8 font-semibold"
                    : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
                }`}
              >
                {d.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1576px] mx-auto px-8 py-10">
        <DeptContent dept={dept} />
      </div>
    </div>
  );
}
