import MainBanner from "@/components/home/MainBanner";
import MenuCards from "@/components/home/MenuCards";
import MessageSection from "@/components/home/MessageSection";
import NotificationSection from "@/components/home/NotificationSection";
import Direction from "@/components/home/Direction";
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
        <div data-home-section className="flex flex-col justify-center">
          <MenuCards />
        </div>
        <div data-home-section className="min-h-screen flex flex-col justify-center">
          <MessageSection />
        </div>
        <div data-home-section className="min-h-screen flex flex-col justify-center">
          <NotificationSection />
        </div>
        <div data-home-section className="flex flex-col justify-center">
          <Direction />
        </div>
        <ScrollDownButton />
      </div>
    </>
  );
}
