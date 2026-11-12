import { useSearchParams } from "react-router";
import GreetingEditor from "@/components/admin/churchIntro/GreetingEditor";
import VisionEditor from "@/components/admin/churchIntro/VisionEditor";
import StaffEditor from "@/components/admin/churchIntro/StaffEditor";
import HistoryEditor from "@/components/admin/churchIntro/HistoryEditor";
import FloorGuideEditor from "@/components/admin/churchIntro/FloorGuideEditor";
import DirectionEditor from "@/components/admin/churchIntro/DirectionEditor";
import ShuttleEditor from "@/components/admin/churchIntro/ShuttleEditor";

const TABS = [
  "인사말",
  "교회 비전",
  "섬기는 사람들",
  "교회 연혁",
  "층별 안내",
  "오시는 길",
  "차량운행 안내",
];

const TAB_CONTENT = {
  인사말: <GreetingEditor />,
  "교회 비전": <VisionEditor />,
  "섬기는 사람들": <StaffEditor />,
  "교회 연혁": <HistoryEditor />,
  "층별 안내": <FloorGuideEditor />,
  "오시는 길": <DirectionEditor />,
  "차량운행 안내": <ShuttleEditor />,
};

export default function ChurchIntroManage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "인사말";

  return (
    <div>
      <div className="flex overflow-x-auto gap-1 mb-6 border-b border-grey-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSearchParams({ tab })}
            className={`px-4 py-3 text-body-4 whitespace-nowrap border-b-2 transition-colors font-medium ${
              activeTab === tab
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-grey-6 hover:text-grey-9"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {TAB_CONTENT[activeTab]}
    </div>
  );
}
