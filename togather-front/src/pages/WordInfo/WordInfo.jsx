import WordTabBar from "@/components/word/WordTabBar";
import WorshipInfo from "@/components/church/WorshipInfo";

export default function WordInfo() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-4 pb-6 md:px-8 md:pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">예배·방송</h1>
        </div>
      </div>

      <WordTabBar />

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12">
        <WorshipInfo />
      </div>
    </div>
  );
}
