import MainBanner from "@/components/home/MainBanner";
import SearchSection from "@/components/home/SearchSection";
import SubMenu from "@/components/home/SubMenu";
import WorshipSection from "@/components/home/WorshipSection";
import ServiceBand from "@/components/home/ServiceBand";
import NoticeSection from "@/components/home/NoticeSection";
import DirectionsSection from "@/components/home/DirectionsSection";
import ScrollDownButton from "@/components/home/ScrollDownButton";
import MobileHome from "@/pages/Home/MobileHome";

export default function Home() {
  return (
    <>
      <div className="md:hidden">
        <MobileHome />
      </div>
      <div className="hidden md:flex md:flex-col">
        <div data-home-section>
          <MainBanner />
        </div>
        <div data-home-section className="min-h-screen flex flex-col justify-center">
          <SearchSection />
          <SubMenu />
        </div>
        <div data-home-section className="min-h-screen flex flex-col justify-center">
          <WorshipSection />
          <ServiceBand />
        </div>
        <div data-home-section className="min-h-screen flex flex-col justify-center">
          <NoticeSection />
        </div>
        <div data-home-section className="min-h-screen flex flex-col justify-center">
          <DirectionsSection />
        </div>
        <ScrollDownButton />
      </div>
    </>
  );
}
