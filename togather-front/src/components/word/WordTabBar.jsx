import { NavLink } from "react-router";

const TABS = [
  { label: "실시간 설교 보기", to: "/말씀/방송" },
  { label: "설교 목록", to: "/말씀/설교" },
  { label: "찬양 리스트", to: "/말씀/찬양" },
];

export default function WordTabBar() {
  return (
    <div className="border-b border-bluegrey-2 bg-white sticky top-[72px] z-40">
      <div className="max-w-[1576px] mx-auto px-8">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-5 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                  isActive
                    ? "border-blue-8 text-blue-8 font-semibold"
                    : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
