import { NavLink } from "react-router";

const TABS = [
  { label: "실시간 예배", to: "/말씀/방송" },
  { label: "예배 목록", to: "/말씀/설교" },
  { label: "예배 안내", to: "/말씀/안내" },
  { label: "스마트 주보", to: "/주보" },
];

export default function WordTabBar() {
  return (
    <div
      className="border-b border-bluegrey-2 bg-white sticky z-40 transition-[top] duration-300 ease-in-out"
      style={{ top: "var(--header-offset)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
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
