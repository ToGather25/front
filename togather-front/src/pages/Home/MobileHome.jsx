import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useSearch } from "@/contexts/SearchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
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

function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[17px] font-bold text-grey-11">{title}</span>
      {to && (
        <Link to={to} className="flex items-center gap-0.5 text-[13px] text-grey-6">
          더보기
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

function WeeklySermonSection({ sermon }) {
  return (
    <section className="px-5 py-6">
      <SectionHeader title="이번주 말씀" to="/주보?tab=예배" />
      <div className="rounded-2xl bg-bluegrey-1 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-semibold text-grey-11">{sermon.service}</span>
          <span className="text-[12px] text-grey-6">
            {sermon.pastor} | {sermon.date}
          </span>
        </div>
        <div className="rounded-xl bg-white py-3 my-5">
          <p className="text-[15px] font-bold text-primary text-center leading-snug">
            {sermon.title}
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {sermon.summary.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-grey-7 leading-snug">
              <span className="w-1 h-1 rounded-full bg-grey-5 mt-1.5 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BibleVerseSection({ verse }) {
  return (
    <section className="px-5 py-6">
      <SectionHeader title="오늘의 성경 말씀" />
      <div className="rounded-xl bg-gradient-to-r from-[#FB923C] to-[#FDE8D5] px-5 py-6">
        <p
          className="text-[15px] font-bold text-grey-11 text-center leading-relaxed"
          style={{ whiteSpace: "pre-line" }}
        >
          {verse.text}
        </p>
        <p className="text-[12px] text-grey-9/70 text-right mt-3">{verse.reference}</p>
      </div>
    </section>
  );
}

function NoticeAlertSection({ notices }) {
  const [top, ...rest] = notices;
  return (
    <section className="px-5 py-6">
      <SectionHeader title="공지 알림" to="/공지사항" />
      {top && (
        <Link
          to={`/공지사항?id=${top.id}`}
          className="flex items-center justify-between pb-4 mb-4 border-b border-bluegrey-2"
        >
          <span className="text-[14px] font-medium text-grey-9 truncate">
            [{top.type}] {top.title}
          </span>
          <span className="text-[12px] text-grey-6 shrink-0 ml-3">{top.date}</span>
        </Link>
      )}
      <div className="flex gap-3 overflow-x-auto -mx-5 px-5 scrollbar-hide">
        {rest.slice(0, 6).map((n) => (
          <Link
            key={n.id}
            to={`/공지사항?id=${n.id}`}
            className="shrink-0 w-[150px] rounded-xl border border-bluegrey-2 px-4 py-3.5"
          >
            <p className="text-[13px] font-bold text-grey-11 leading-snug line-clamp-2 mb-1.5">
              {n.title}
            </p>
            <p className="text-[12px] text-grey-6 leading-snug line-clamp-2">{n.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VideoSection({ youtubeUrl, pastor, title, isLive }) {
  return (
    <section className="px-5 py-6">
      <SectionHeader title="예배 영상" to={youtubeUrl || "/"} />
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
          {isLive && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500 text-white text-[12px] font-bold">
              Live
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5">
            <span className="self-start px-2 py-1 rounded bg-black/40 text-white text-[12px] font-medium">
              {pastor}
            </span>
            <p className="text-white text-[16px] font-bold leading-snug">{title}</p>
          </div>
        </div>
      </a>
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
      <div className="flex gap-4 mb-4">
        <a href="#" className="text-[12px] text-grey-7 underline underline-offset-2">
          개인정보취급방침
        </a>
        <a href="#" className="text-[12px] text-grey-7 underline underline-offset-2">
          이용약관
        </a>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-[12px] text-grey-6">주소: {church.address}</p>
        <p className="text-[12px] text-grey-6">
          TEL: {church.tel}
          {church.fax && `  |  FAX: ${church.fax}`}
        </p>
      </div>
      <p className="text-[11px] text-grey-6">
        Copyright © {church.name.startsWith("Togather") ? church.name : "Togather"} All rights reserved.
      </p>
    </footer>
  );
}

export default function MobileHome() {
  const { church } = useChurch();
  const { data: notices = [] } = useFetch(
    () => getNotices(church.id),
    [church.id],
    []
  );

  const sermon = {
    service: "1부 예배",
    pastor: church.pastor || "담임목사",
    date: "2026.07.12",
    title: `"영광을 받으신 만유의 주여"`,
    summary: [
      "설교 말씀에 대한 내용을 요약한 한줄 설명",
      "설교 말씀에 대한 내용을 요약한 한줄 설명",
      "설교 말씀에 대한 내용을 요약한 한줄 설명",
      "설교 말씀에 대한 내용을 요약한 한줄 설명",
    ],
  };

  const verse = {
    text: `"모세에게 이르시되\n내가 긍휼히 여길 자를 긍휼히 여기고\n불쌍히 여길 자를 불쌍히 여기리라 하셨으니"`,
    reference: "로마서 9:15",
  };

  return (
    <div className="flex flex-col bg-white">
      <MobileSearchBar />
      <WeeklySermonSection sermon={sermon} />
      <BibleVerseSection verse={verse} />
      <NoticeAlertSection notices={notices} />
      <VideoSection
        youtubeUrl={church.social?.youtube}
        pastor={`${sermon.pastor} 목사`}
        title={sermon.title.replace(/^"|"$/g, "")}
        isLive={false}
      />
      <MobileFooter church={church} />
    </div>
  );
}
