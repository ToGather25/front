import MainBanner from "@/components/home/MainBanner";
import SearchSection from "@/components/home/SearchSection";
import SubMenu from "@/components/home/SubMenu";
import WorshipSection from "@/components/home/WorshipSection";
import NoticeSection from "@/components/home/NoticeSection";
import DirectionsSection from "@/components/home/DirectionsSection";
import JuboPreviewSection from "@/components/home/JuboPreviewSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <MainBanner />
      <SearchSection />
      <SubMenu />
      <WorshipSection />
      <NoticeSection />
      <DirectionsSection />
      <JuboPreviewSection />
    </div>
  );
}
