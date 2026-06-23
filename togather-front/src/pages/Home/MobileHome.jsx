import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useSearch } from "@/contexts/SearchContext";
import KakaoMap from "@/components/common/KakaoMap";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import defaultBanner from "@/assets/default_banner.png";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

function MobileSearchBar() {
  const { setOpen } = useSearch();
  return (
    <div className="px-4 pt-5 py-3">
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-bluegrey-1 border border-bluegrey-2 text-left"
      >
        <img src={IcoSearch} className="w-4 h-4 shrink-0" alt="" />
        <span className="text-[14px] text-grey-5 flex-1">검색어를 입력하세요.</span>
      </button>
    </div>
  );
}

function SectionHeader({ title, to, label = "더 보기 >" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-[17px] font-bold text-grey-11">{title}</span>
      {to && (
        <Link to={to} className="text-[13px] text-primary">
          {label}
        </Link>
      )}
    </div>
  );
}

function WorshipScheduleSection({ schedules }) {
  return (
    <section className="px-5 py-6 border-b border-bluegrey-2">
      <SectionHeader title="예배 안내" to="/교회소개?tab=예배 안내" />
      <div>
        {schedules.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-bluegrey-1 last:border-b-0"
          >
            <span className="text-[15px] font-medium text-grey-11">{item.name}</span>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[13px] text-grey-7">{item.time}</span>
              <span className="text-[12px] text-grey-6">{item.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideoSection({ youtubeUrl }) {
  return (
    <section className="px-5 py-6 border-b border-bluegrey-2">
      <SectionHeader title="예배 영상" to={youtubeUrl || "/"} label="더 보기 >" />
      <a
        href={youtubeUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="aspect-video rounded-xl overflow-hidden bg-grey-3 relative">
          <img
            src={defaultBanner}
            alt="예배 영상 썸네일"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </div>
          </div>
          <span className="absolute bottom-3 left-3 text-white text-[13px] font-medium bg-black/40 px-2 py-1 rounded">
            이번 주 예배
          </span>
        </div>
      </a>
    </section>
  );
}

function SermonSection({ sermon }) {
  return (
    <section className="px-5 py-6 border-b border-bluegrey-2">
      <SectionHeader title="금주 말씀" />
      <div className="rounded-xl bg-blue-1 px-5 py-4">
        <p className="text-[12px] text-grey-7 mb-1">{sermon.date}</p>
        <p
          className="text-[17px] font-bold text-grey-11 leading-snug mb-2"
          style={{ whiteSpace: "pre-line" }}
        >
          {sermon.title}
        </p>
        <p className="text-[13px] text-primary">{sermon.verse}</p>
      </div>
    </section>
  );
}

function DirectionsSection({ church }) {
  return (
    <section className="px-5 py-6 border-b border-bluegrey-2">
      <SectionHeader title="찾아오는 길" to="/교회소개?tab=오시는 길" />
      <div className="h-[200px] rounded-xl overflow-hidden mb-4">
        <KakaoMap
          address={church.address}
          level={church.location?.level ?? 3}
          draggable={false}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0 text-grey-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
            />
          </svg>
          <span className="text-[14px] text-grey-9">{church.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 shrink-0 text-grey-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.61 21 3 14.39 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"
            />
          </svg>
          <span className="text-[14px] text-grey-9">{church.tel}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Link
          to="/교회소개?tab=층별 안내"
          className="block py-3.5 rounded-xl border border-bluegrey-2 text-[15px] font-medium text-grey-9 text-center"
        >
          주차 안내
        </Link>
        <Link
          to="/교회소개?tab=차량운행 안내"
          className="block py-3.5 rounded-xl border border-bluegrey-2 text-[15px] font-medium text-grey-9 text-center"
        >
          셔틀 안내
        </Link>
        <a
          href={`tel:${church.tel?.replace(/[^0-9]/g, "")}`}
          className="block py-3.5 rounded-xl border border-bluegrey-2 text-[15px] font-medium text-grey-9 text-center"
        >
          문의하기
        </a>
      </div>
    </section>
  );
}

function MobileFooter({ church }) {
  return (
    <footer className="bg-bluegrey-1 px-5 py-8">
      <div className="flex items-center gap-2 mb-3">
        <img src={LogoIcon} alt={`${church.name} 로고`} className="w-8 h-8 object-contain" />
        <span className="text-[15px] font-bold text-grey-11">{church.name}</span>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-[12px] text-grey-6">{church.address}</p>
        <p className="text-[12px] text-grey-6">
          TEL: {church.tel}
          {church.fax && `  |  FAX: ${church.fax}`}
        </p>
        {church.email && (
          <p className="text-[12px] text-grey-6">{church.email}</p>
        )}
      </div>
      <div className="flex gap-4">
        <a href="#" className="text-[12px] text-grey-7 underline underline-offset-2">
          개인정보처리방침
        </a>
        <a href="#" className="text-[12px] text-grey-7 underline underline-offset-2">
          이용약관
        </a>
      </div>
      <p className="mt-4 text-[11px] text-grey-6">
        © {new Date().getFullYear()} {church.name}. All rights reserved.
      </p>
    </footer>
  );
}

export default function MobileHome() {
  const { church } = useChurch();

  const sermon = {
    date: "2026년 3월 17일 · 주일 1부 예배",
    title: "사랑으로 부르신\n그 자리에서",
    verse: `요한일서 4:7–12 · ${church.pastor || "담임목사"}`,
  };

  return (
    <div className="flex flex-col bg-white">
      <MobileSearchBar />
      <WorshipScheduleSection schedules={church.worshipSchedule?.regular ?? []} />
      <VideoSection youtubeUrl={church.social?.youtube} />
      <SermonSection sermon={sermon} />
      <DirectionsSection church={church} />
      <MobileFooter church={church} />
    </div>
  );
}
