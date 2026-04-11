import { Link } from "react-router";
import LogoIcon from "../../../public/icons/512x512.png";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import { getEvents } from "@/services/eventsService";

// ── 섹션 공통 컨테이너 ──────────────────────────────────
function Section({ className = "", children }) {
  return (
    <section className={`w-full ${className}`}>
      <div className="max-w-[1576px] mx-auto px-4">{children}</div>
    </section>
  );
}

// ── 섹션 타이틀 ────────────────────────────────────────
function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`text-[2rem] font-bold text-grey-12 leading-tight ${className}`}>
      {children}
    </h2>
  );
}

// ── 히어로 배너 ────────────────────────────────────────
function HeroBanner() {
  const { church } = useChurch();
  const { title, subtitle } = church.heroBanner;
  return (
    <div className="relative w-full h-[480px] bg-blue-9 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative h-full max-w-[1576px] mx-auto px-4 flex flex-col items-end justify-end pb-16">
        <div className="flex flex-col gap-4 text-right">
          <p className="text-[2.5rem] font-medium text-white leading-[1.15]" style={{ whiteSpace: "pre-line" }}>
            {title}
          </p>
          <p className="text-base text-white/80 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 검색 섹션 ──────────────────────────────────────────
function SearchSection() {
  return (
    <section className="w-full py-10 flex flex-col items-center gap-5">
      <p className="text-xl font-semibold text-grey-12 tracking-tight">원하는 기능이 있으신가요?</p>
      <div className="flex items-center gap-3 px-6 py-3.5 bg-bluegrey-1 border-2 border-bluegrey-2 rounded-full w-full max-w-[600px]">
        <svg className="w-6 h-6 text-grey-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className="flex-1 bg-transparent outline-none text-body-2 text-grey-10 placeholder:text-grey-6"
        />
      </div>
    </section>
  );
}

// ── 서브 메뉴 (4개 바로가기) ───────────────────────────
const SUB_MENU_ITEMS = [
  {
    label: "교회소개",
    to: "/교회소개",
    icon: (
      <svg className="w-8 h-8 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: "행사·소식",
    to: "/교회행사",
    icon: (
      <svg className="w-8 h-8 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    label: "스마트 주보",
    to: "/주보",
    icon: (
      <svg className="w-8 h-8 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "성경 타자",
    to: "/말씀/필사",
    icon: (
      <svg className="w-8 h-8 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

function SubMenu() {
  return (
    <section className="w-full bg-bluegrey-1 py-12">
      <div className="max-w-[1576px] mx-auto px-4">
        <div className="grid grid-cols-4 gap-6">
          {SUB_MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-5 py-8 px-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-1 border border-blue-3 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-xl font-semibold text-grey-12 tracking-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 예배 안내 + 예배 영상 ──────────────────────────────
function ScheduleRow({ name, time }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base font-semibold text-grey-12 w-28">{name}</span>
      <div className="flex-1 mx-3 border-t-2 border-dashed border-bluegrey-3" />
      <span className="text-base text-grey-9">{time}</span>
    </div>
  );
}

function WorshipSection() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;
  const mid = Math.ceil(regular.length / 2);
  const left = regular.slice(0, mid);
  const right = regular.slice(mid);
  const deptMid = Math.ceil(departments.length / 2);
  const deptLeft = departments.slice(0, deptMid);
  const deptRight = departments.slice(deptMid);

  return (
    <Section className="py-12">
      <div className="flex gap-8 items-start">
        <SectionTitle className="sr-only">예배 안내 & 예배 영상</SectionTitle>

        {/* 예배 안내 카드 */}
        <div className="flex-1 border-2 border-bluegrey-2 rounded-2xl p-10 flex flex-col gap-8">
          <h3 className="text-2xl font-bold text-grey-12">예배 안내</h3>
          {/* 정기 예배 */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-4 flex-1">
              {left.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {right.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
          </div>
          <hr className="border-t border-bluegrey-2" />
          {/* 부서 예배 */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-4 flex-1">
              {deptLeft.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {deptRight.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
          </div>
        </div>

        {/* 예배 영상 카드 */}
        <div className="w-[400px] border-2 border-bluegrey-2 rounded-2xl p-8 flex flex-col gap-4 items-center justify-center">
          <h3 className="text-2xl font-bold text-grey-12 self-start">예배 영상</h3>
          <div className="relative w-full aspect-video bg-bluegrey-3 rounded-xl overflow-hidden border border-blue-3">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <span className="absolute top-3 right-3 bg-red-50 border border-red-400 text-red-500 text-xs font-semibold px-2 py-0.5 rounded">
              Live
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── 공지 알림 ──────────────────────────────────────────
function NoticeSection() {
  const { church } = useChurch();
  const { data: notices = [], loading } = useFetch(
    () => getNotices(church.id),
    [church.id],
    []
  );
  const featured = notices.find((n) => n.featured);
  const cards = notices.filter((n) => !n.featured);

  return (
    <Section className="py-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SectionTitle>공지 알림</SectionTitle>
          <button className="flex items-center gap-1 text-body-3 font-medium text-grey-9 hover:text-blue-7 transition-colors">
            더보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Featured notice */}
        {featured && (
          <div className="bg-white border-2 border-bluegrey-2 rounded-2xl flex items-center gap-5 px-6 py-5">
            <span className="shrink-0 bg-blue-1 text-blue-6 text-body-5 font-semibold px-3 py-1 rounded">
              {featured.type}
            </span>
            <p className="flex-1 text-base text-grey-12 font-light truncate">{featured.title}</p>
            <span className="shrink-0 text-body-5 text-grey-7">{featured.date}</span>
          </div>
        )}

        {/* Card grid */}
        <div className="grid grid-cols-4 gap-6">
          {cards.map((n) => (
            <div key={n.id} className="bg-white border-2 border-bluegrey-2 rounded-2xl p-6 flex flex-col gap-2">
              <p className="text-base font-medium text-grey-12 truncate">{n.title}</p>
              <p className="text-sm font-light text-grey-9 line-clamp-2 whitespace-pre-line">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── 찾아오시는 길 ──────────────────────────────────────
function DirectionsSection() {
  const { church } = useChurch();
  return (
    <Section className="py-12">
      <div className="flex flex-col gap-6">
        <SectionTitle>찾아오시는 길</SectionTitle>
        <div className="flex gap-8">
          {/* 지도 카드 */}
          <div className="flex-1 border-2 border-bluegrey-2 rounded-2xl p-10 flex flex-col gap-6">
            <div className="w-full h-60 bg-bluegrey-3 rounded-xl border-2 border-bluegrey-2 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-grey-7">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-body-5">지도 영역</span>
              </div>
            </div>
            <p className="text-body-3 text-grey-8">주소: {church.address}</p>
          </div>

          {/* 버튼 그룹 */}
          <div className="w-72 flex flex-col gap-3 self-stretch">
            {["주차 안내", "셔틀 안내", "문의하기"].map((label) => (
              <button
                key={label}
                className="flex-1 bg-blue-6 hover:bg-blue-7 transition-colors rounded-xl px-8 flex items-center justify-between text-white"
              >
                <span className="text-xl font-bold py-7">{label}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── 스마트 주보 미리보기 ───────────────────────────────
function JuboPreviewSection() {
  const { church } = useChurch();
  const vision = church.yearlyVision ?? {};
  return (
    <Section className="py-12 pb-20">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SectionTitle>스마트 주보</SectionTitle>
          <Link
            to="/주보"
            className="flex items-center gap-1 text-body-3 font-medium text-grey-9 hover:text-blue-7 transition-colors"
          >
            전체 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        <div className="border-2 border-bluegrey-2 rounded-2xl p-8 flex items-center gap-6">
          {/* 이전 버튼 */}
          <button className="w-12 h-12 rounded-full bg-white border-2 border-bluegrey-2 flex items-center justify-center hover:border-blue-7 hover:text-blue-7 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* 주보 내용 */}
          <div className="flex-1 flex gap-6 items-stretch">
            {/* 표어 카드 */}
            <div className="bg-blue-1/60 rounded-xl flex flex-col items-center justify-center gap-4 px-12 py-8">
              <div className="w-28 h-28 rounded-full bg-blue-5 flex flex-col items-center justify-center text-white">
                <span className="text-base font-semibold">{vision.year}</span>
                <span className="text-sm">표어</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-base font-semibold text-grey-12">{vision.verse}</p>
                <p className="text-sm text-grey-8">{church.name} 공동체 비전 ToGather</p>
              </div>
            </div>

            {/* 교회 이미지 */}
            <div className="flex-1 rounded-xl bg-bluegrey-3 overflow-hidden relative min-h-[200px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-grey-7">
                  <img src={LogoIcon} className="w-12 h-12 opacity-30" alt="" />
                </div>
              </div>
            </div>
          </div>

          {/* 다음 버튼 */}
          <button className="w-12 h-12 rounded-full bg-white border-2 border-bluegrey-2 flex items-center justify-center hover:border-blue-7 hover:text-blue-7 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </Section>
  );
}

// ── 메인 페이지 ────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <SearchSection />
      <SubMenu />
      <WorshipSection />
      <NoticeSection />
      <DirectionsSection />
      <JuboPreviewSection />
    </div>
  );
}
