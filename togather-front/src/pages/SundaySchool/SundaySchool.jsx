import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

// 주일학교 부서명 -> 갤러리 공동체명 (갤러리 쪽 명칭이 다른 경우만 매핑)
const GALLERY_COMMUNITY_MAP = {
  대학·청년부: "청년부",
};


function DeptContent({ dept }) {
  return (
    <div className="flex flex-col gap-8">
      {/* 소개 */}
      <div>
        <div className="inline-block px-3 py-1 bg-blue-1 text-blue-7 text-body-5 font-semibold rounded-full mb-4">
          {dept.ageRange}
        </div>
        <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">{dept.key}</h2>
        <p className="text-body-2 text-blue-6 font-medium mb-4">"{dept.vision}"</p>
        <div className="text-body-3 text-grey-7 whitespace-pre-line leading-relaxed max-w-2xl">
          {dept.description}
        </div>
      </div>

      {/* 카드 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
  const { church } = useChurch();
  const DEPARTMENTS = church.sundaySchool ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const deptNames = DEPARTMENTS.map((d) => d.key);
  const activeTab = deptNames.includes(searchParams.get("tab")) ? searchParams.get("tab") : DEPARTMENTS[0].key;
  const dept = DEPARTMENTS.find((d) => d.key === activeTab);

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="relative h-[150px] bg-blue-9 flex flex-col justify-end overflow-hidden"
        style={
          dept.bgImage
            ? {
                // oxlint-disable-next-line typescript/restrict-template-expressions -- bgImage는 현재 목업 데이터가 모두 null이라 발생하는 오탐, 추후 이미지 연동 시 string이 됨
                backgroundImage: `url(${dept.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 pb-6 md:pb-8 w-full flex items-end justify-between gap-4">
          <div>
            <h1 className="text-headline-4 font-bold text-white">{dept.key}</h1>
          </div>
          <Link
            to={`/갤러리?community=${encodeURIComponent(GALLERY_COMMUNITY_MAP[dept.key] ?? dept.key)}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-body-4 font-medium transition-colors border border-white/30 backdrop-blur-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            부서 사진 보러가기
          </Link>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div
        className="border-b border-bluegrey-2 bg-white sticky z-40 transition-[top] duration-300 ease-in-out"
        style={{ top: "var(--header-offset)" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.key}
                onClick={() => setSearchParams({ tab: d.key })}
                className={`px-6 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                  activeTab === d.key
                    ? "border-blue-8 text-blue-8"
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
      <div className="max-w-[1400px] mx-auto px-4 pt-10 pb-30 md:px-8 md:pt-15 md:pb-40">
        <DeptContent dept={dept} />
      </div>
    </div>
  );
}
