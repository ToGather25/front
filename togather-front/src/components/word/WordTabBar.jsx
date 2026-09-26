import { useSearchParams } from "react-router";

const TABS = [
  { label: "예배 안내", tab: "예배 안내" },
  { label: "예배 목록", tab: "예배 목록" },
  { label: "스마트 주보", tab: "스마트 주보" },
];

export default function WordTabBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "예배 목록";

  return (
    <div
      className="border-b border-bluegrey-2 bg-white sticky z-40 transition-[top] duration-300 ease-in-out"
      style={{ top: "var(--header-offset)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex overflow-x-auto">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.tab}
              onClick={() => setSearchParams({ tab: tabItem.tab })}
              className={`px-5 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                activeTab === tabItem.tab
                  ? "border-blue-8 text-blue-8 font-semibold"
                  : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
