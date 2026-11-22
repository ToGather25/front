import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import { searchSermons } from "@/services/sermonService";
import { getPhotos } from "@/services/galleryService";
import { lookupVerseText } from "@/utils/bibleVerse";
import defaultBanner from "@/assets/default_banner.png";
import IcoSearch from "@/assets/web-icon/search-grey.svg";
import IcoMenu01 from "@/assets/mob-icon/icon-main-menu-01.svg";
import IcoMenu02 from "@/assets/mob-icon/icon-main-menu-02.svg";
import IcoMenu03 from "@/assets/mob-icon/icon-main-menu-03.svg";
import IcoMenu04 from "@/assets/mob-icon/icon-main-menu-04.svg";

function MobileSearchBar() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) void navigate(`/검색?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSearch} className="px-4 pt-5 py-3">
      <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full border border-bluegrey-3">
        <button type="submit" aria-label="검색" className="shrink-0">
          <img src={IcoSearch} className="w-4 h-4" alt="" />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="검색어를 입력하세요."
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] text-grey-10 placeholder:text-grey-5"
        />
      </div>
    </form>
  );
}

function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[17px] font-bold text-grey-11">{title}</span>
      {to && (
        <Link to={to} className="flex items-center gap-0.5 text-[13px] text-grey-6">
          더보기
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

function IconGyojeokbu() {
  return (
    <svg
      className="w-8 h-8 text-grey-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 19.5A2.5 2.5 0 017 17h11M4.5 19.5A2.5 2.5 0 007 22h11a1 1 0 001-1V4a1 1 0 00-1-1H7a2.5 2.5 0 00-2.5 2.5v14z"
      />
    </svg>
  );
}

const QUICK_MENU = [
  { label: "교회소개", to: "/교회소개" },
  { label: "행사・소식", to: "/교회행사" },
  { label: "스마트 주보", to: "/주보" },
  { label: "교적부", to: "/교적부" },
];

function QuickMenu() {
  return (
    <div className="flex justify-center gap-[29px] px-5 pb-6 pt-1">
      {QUICK_MENU.map((item, i) => (
        <Link
          key={item.label}
          to={item.to}
          className="flex flex-col items-center gap-[11px] w-[58px]"
        >
          <div className="w-full h-[58px] rounded-[14px] bg-bluegrey-2 flex items-center justify-center">
            {i === 0 && <img src={IcoMenu01} className="w-8 h-8" alt="" />}
            {i === 1 && <img src={IcoMenu02} className="w-8 h-8" alt="" />}
            {i === 2 && <img src={IcoMenu03} className="w-8 h-8" alt="" />}
            {i === 3 && <img src={IcoMenu04} className="w-8 h-8" alt="" />}
          </div>
          <span className="text-[12px] font-semibold text-grey-10 text-center">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

function ThisWeekMessageSection({ sermon }) {
  const verseText = sermon?.scripture ? lookupVerseText(sermon.scripture) : null;
  const dateLabel = sermon?.sermonDate
    ? `${new Date(sermon.sermonDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} 주일 예배`
    : "";

  return (
    <section className="px-5 py-6">
      <SectionHeader title="이번주 말씀" to="/주보?tab=예배" />
      <div className="rounded-2xl bg-bluegrey-1 px-5 py-4">
        {sermon ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-grey-11">{dateLabel}</span>
              <span className="text-[12px] text-grey-6">{sermon.preacher} 목사</span>
            </div>
            <div className="rounded-xl bg-white py-5 my-5 px-4">
              <p
                className="text-[15px] font-bold text-grey-11 text-center leading-relaxed"
                style={{ fontFamily: '"Gowun Batang", serif' }}
              >
                {verseText || sermon.scripture}
              </p>
            </div>
            <p className="text-[12px] text-grey-6 text-right">{sermon.scripture}</p>
          </>
        ) : (
          <p className="text-[13px] text-grey-6 text-center py-4">아직 준비된 말씀이 없습니다</p>
        )}
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
          className="flex items-center justify-between pb-4 mb-4 border-b border-bluegrey-3"
        >
          <span className="text-[14px] font-medium text-grey-9 truncate">
            [{top.type}] {top.title}
          </span>
          <span className="text-[12px] text-grey-6 shrink-0 ml-3">{top.date}</span>
        </Link>
      )}
      <div className="flex flex-col gap-3">
        {rest.slice(0, 6).map((n) => (
          <Link
            key={n.id}
            to={`/공지사항?id=${n.id}`}
            className="flex items-center gap-3 rounded-xl border border-bluegrey-3 px-4 py-3.5"
          >
            <span className="w-1 h-8 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-grey-11 leading-snug truncate">
                {n.title}
              </p>
              <p className="text-[12px] text-grey-6 leading-snug truncate">{n.body}</p>
            </div>
            <span className="text-[12px] text-grey-6 shrink-0">{n.date}</span>
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
      <a href={youtubeUrl || "#"} target="_blank" rel="noopener noreferrer" className="block">
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

function GallerySection({ photos }) {
  if (!photos.length) return null;
  return (
    <section className="px-5 py-6">
      <SectionHeader title="갤러리" to="/갤러리" />
      <div className="flex gap-3 overflow-x-auto -mx-5 px-5 scrollbar-hide">
        {photos.map((p) => (
          <Link
            key={p.id}
            to="/갤러리"
            className="relative shrink-0 w-[298px] h-[186px] rounded-[10px] overflow-hidden"
          >
            <img
              src={p.imageUrl || defaultBanner}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-[14px] font-semibold">{p.title}</p>
              <p className="text-[12px] text-white/70">{p.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function MobileHome() {
  const { church } = useChurch();
  const { data: noticeResponse = { data: [] } } = useFetch(
    () => getNotices(church.id, { limit: 10 }),
    [church.id],
    { data: [] },
  );
  const { data: sermonResponse = { sermons: [] } } = useFetch(
    () => searchSermons(church.id, { size: 10 }),
    [church.id],
    { sermons: [] },
  );
  const { data: photos = [] } = useFetch(
    () => getPhotos(church.id, { limit: 6 }),
    [church.id],
    [],
  );
  const sundaySermon = sermonResponse.sermons.find((s) => s.worshipType?.startsWith("주일"));

  return (
    <div className="flex flex-col bg-white">
      <MobileSearchBar />
      <ThisWeekMessageSection sermon={sundaySermon} />
      <QuickMenu />
      <VideoSection
        youtubeUrl={
          sundaySermon?.youtubeVideoId ?? sundaySermon?.videoId
            ? `https://www.youtube.com/watch?v=${sundaySermon.youtubeVideoId ?? sundaySermon.videoId}`
            : church.social?.youtube
        }
        pastor={`${sundaySermon?.preacher || church.pastor || "담임목사"} 목사`}
        title={sundaySermon?.title ?? ""}
        isLive={false}
      />
      <NoticeAlertSection notices={noticeResponse.data} />
      <GallerySection photos={photos} />
    </div>
  );
}
