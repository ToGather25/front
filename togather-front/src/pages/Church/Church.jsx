import { useSearchParams } from "react-router";
import Greeting from "@/components/church/Greeting";
import Vision from "@/components/church/Vision";
import Staff from "@/components/church/Staff";
import History from "@/components/church/History";
import FloorGuide from "@/components/church/FloorGuide";
import Direction from "@/components/church/Direction";
import TransportGuide from "@/components/church/TransportGuide";

const TABS = [
  "인사말",
  "교회 비전",
  "교회 연혁",
  "섬기는 사람들",
  "층별 안내",
  "오시는 길",
  "차량운행 안내",
];

const TAB_CONTENT = {
  인사말: <Greeting />,
  "교회 비전": <Vision />,
  "교회 연혁": <History />,
  "섬기는 사람들": <Staff />,
  "층별 안내": <FloorGuide />,
  "오시는 길": <Direction />,
  "차량운행 안내": <TransportGuide />,
};

export default function Church() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "인사말";

  return (
    <div>
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">교회 소개</h1>
        </div>
      </div>

      <div className="border-b border-bluegrey-2 bg-white sticky top-14 md:top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
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

      <div className="max-w-[1576px] mx-auto px-4 pt-6 pb-10 md:px-8 md:pt-10 md:pb-20">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
