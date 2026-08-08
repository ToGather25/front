import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import FallbackImage from "./FallbackImage";
import AvatarIcon from "@/assets/icon-svg/mypage-user-blue.svg";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const MicIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
    />
  </svg>
);

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

function PersonCard({ name, role, image, location, showSermon = false }) {
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-5 shadow-sm">
      <div className="flex gap-3">
        <StaffAvatar image={image} name={name} className="w-20 aspect-[1/1.2] rounded-xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-body-3 font-semibold text-grey-11 truncate">{name}</p>
              {location && (
                <span className="px-2 py-0.5 rounded-full bg-point-1 text-point-7 text-body-5 font-semibold shrink-0">
                  {location}
                </span>
              )}
            </div>
            {showSermon && (
              <Link
                to="/말씀/설교"
                className="flex items-center gap-1 text-body-5 text-blue-7 border border-blue-7 px-2 py-0.5 rounded-full shrink-0"
              >
                <MicIcon />
                설교영상
              </Link>
            )}
          </div>
          <p className="text-body-5 text-grey-7">{role}</p>
        </div>
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
      <div className="relative max-w-xs mb-4">
        <img src={IcoSearch} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" alt="" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="w-full pl-10 pr-4 py-2.5 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
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

      {isEmpty ? (
        <p className="text-center text-body-3 text-grey-5 py-16">해당하는 교역자가 없습니다.</p>
      ) : (
        <div>
          {showHeadPastor && (
            <div className="border border-primary/20 bg-blue-1/30 rounded-2xl p-7 mb-6 flex flex-col md:flex-row gap-6 md:gap-8">
              <StaffAvatar
                image={headPastor.image}
                name={headPastor.name}
                className="w-44 aspect-[1/1.2] rounded-2xl"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <span className="text-caption font-bold text-primary uppercase tracking-widest">
                      담임목사
                    </span>
                    <h3 className="text-sub-tit-3 font-bold text-grey-12 mt-0.5">
                      {headPastor.name}
                    </h3>
                  </div>
                  <Link
                    to="/말씀/설교"
                    className="flex items-center gap-1.5 text-body-4 text-blue-7 border border-blue-7 px-4 py-1.5 rounded-full shrink-0"
                  >
                    <MicIcon />
                    설교영상
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-bluegrey-2">
                  <div>
                    <p className="text-caption font-bold text-grey-7 mb-2 tracking-wider">학력</p>
                    <ul className="flex flex-col gap-1.5">
                      {headPastor.education.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-body-4 text-grey-8">
                          <span className="text-primary shrink-0 mt-1">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-caption font-bold text-grey-7 mb-2 tracking-wider">약력</p>
                    <ul className="flex flex-col gap-1.5">
                      {headPastor.career.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-body-4 text-grey-8">
                          <span className="text-primary shrink-0 mt-1">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredGroup.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGroup.map((p) => (
                <PersonCard key={p.name} {...p} showSermon={activeChip === "교역자"} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
