import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import FallbackImage from "./FallbackImage";
import AvatarIcon from "@/assets/icon-svg/mypage-user-blue.svg";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

function StaffAvatar({ image, name, className }) {
  return (
    <FallbackImage
      src={image}
      alt={name}
      className={`${className} object-cover shrink-0`}
      fallback={
        <div className={`${className} bg-grey-3 shrink-0 flex items-center justify-center`}>
          <img src={AvatarIcon} alt="" className="w-1/3 h-1/3 opacity-60" />
        </div>
      }
    />
  );
}

function StaffCard({ name, role, image, titleLabel, highlight }) {
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-5 md:p-6 flex gap-5 md:gap-6">
      <StaffAvatar
        image={image}
        name={name}
        className="w-28 md:w-32 aspect-[3/4] rounded-xl shrink-0"
      />
      <div className="flex flex-col gap-3 py-1 min-w-0">
        <div>
          <p
            className={`text-body-3 font-bold mb-1 ${highlight ? "text-blue-12" : "text-blue-4"}`}
          >
            {titleLabel}
          </p>
          <p className="text-sub-tit-3 font-bold text-grey-12 truncate">{name}</p>
        </div>
        {role && <p className="text-body-4 text-grey-7 leading-relaxed">{role}</p>}
      </div>
    </div>
  );
}

const STAFF_CHIPS = ["교역자", "시무장로", "협동·사역장로", "은퇴장로", "파송선교사"];

export default function Staff() {
  const { church } = useChurch();
  const { headPastor, clergy, elders, associateElders, retiredElders, missionaries } =
    church.staff;
  const [activeChip, setActiveChip] = useState("교역자");
  const [query, setQuery] = useState("");

  const GROUPS = {
    교역자: clergy,
    시무장로: elders,
    "협동·사역장로": associateElders,
    은퇴장로: retiredElders,
    파송선교사: missionaries,
  };

  const q = query.trim().toLowerCase();
  const matchesQuery = (name) => !q || name.toLowerCase().includes(q);

  const filteredGroup = GROUPS[activeChip].filter((p) => matchesQuery(p.name));
  const showHeadPastor = activeChip === "교역자" && matchesQuery(headPastor.name);
  const isEmpty = filteredGroup.length === 0 && !showHeadPastor;

  return (
    <div>
      {/* 검색 */}
      <div className="relative max-w-[300px] mb-6">
        <img src={IcoSearch} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" alt="" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 직책으로 검색하세요."
          className="w-full pl-10 pr-4 py-2.5 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* 필터 — 모바일: 가로 칩, 데스크톱: 세로 리스트 */}
        <div className="flex flex-wrap gap-2 md:hidden">
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
        <div className="hidden md:flex md:flex-col md:w-[260px] shrink-0 gap-1 bg-white border border-bluegrey-2 rounded-[20px] p-5">
          {STAFF_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-4 py-2.5 rounded-xl text-body-3 font-semibold text-left transition-colors ${
                activeChip === chip
                  ? "bg-primary text-white"
                  : "text-grey-9 hover:bg-blue-1 hover:text-primary"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 w-full min-w-0">
          {isEmpty ? (
            <p className="text-center text-body-3 text-grey-5 py-16">
              해당하는 교역자가 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {showHeadPastor && (
                <StaffCard
                  key={headPastor.name}
                  {...headPastor}
                  titleLabel="담임목사"
                  highlight
                />
              )}
              {filteredGroup.map((p) => (
                <StaffCard key={p.name} {...p} titleLabel={activeChip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
