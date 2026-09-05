import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import Section from "@/components/common/Section";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { bg: "rgba(61,85,136,.12)", color: "#2b3c61" },
  행사: { bg: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { bg: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const MAX_NOTICE_ROWS = 5;
const MAX_UPCOMING_EVENTS = 4;

const UPCOMING_EVENTS = [
  { id: 1, dateISO: "2026-07-12", title: "구역장 모임", time: "14:00 본당" },
  { id: 2, dateISO: "2026-07-19", title: "새 가족 환영회", time: "예배 후 친교실" },
  { id: 3, dateISO: "2026-07-26", title: "성가대 여름 특별 연습", time: "20:00 4층" },
  { id: 4, dateISO: "2026-08-02", title: "여름 연합 예배", time: "11:00 본당" },
  { id: 5, dateISO: "2026-08-15", title: "광복절 특별 예배", time: "10:30 본당" },
];

function formatEventDate(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { d: `${mm}.${dd}`, w: WEEK_LABELS[d.getDay()] };
}

function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return UPCOMING_EVENTS.filter((e) => new Date(e.dateISO + "T00:00:00") >= today).slice(
    0,
    MAX_UPCOMING_EVENTS,
  );
}

export default function NoticeSection() {
  const { church } = useChurch();
  const { data: notices = [] } = useFetch(
    () => getNotices(church.id, { limit: 30 }),
    [church.id],
    [],
  );
  const [tab, setTab] = useState("전체");

  const rows = (tab === "전체" ? notices : notices.filter((n) => n.type === tab)).slice(
    0,
    MAX_NOTICE_ROWS,
  );
  const upcomingEvents = getUpcomingEvents();

  return (
    <Section className="py-[100px] bg-bluegrey-1">
      <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1fr_460px]">
        {/* Left: notices */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
              공지 ∙ 소식
            </h3>
          </div>

          {/* Tabs + 전체보기 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-[18px] py-2.5 rounded-full text-[15px] font-semibold transition-all ${
                    t === tab
                      ? "bg-blue-8 text-white"
                      : "bg-transparent text-grey-9 hover:bg-bluegrey-2"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Link
              to="/공지사항"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors"
            >
              전체보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          {/* Notice list — 실제 항목이 MAX_NOTICE_ROWS보다 적어도(0건 포함) 빈 자리를
              투명 placeholder 행으로 채워 카드 높이가 항상 5행분으로 고정되게 한다. */}
          <div className="flex-1 relative bg-white rounded-[20px] overflow-hidden border border-bluegrey-2">
            {rows.map((n, i) => {
              const tagStyle = TAG_STYLES[n.type] ?? TAG_STYLES["공지"];
              return (
                <Link
                  key={n.id ?? i}
                  to={`/공지사항?id=${n.id}`}
                  className={`flex items-center gap-5 px-7 py-[22px] hover:bg-bluegrey-1 transition-colors border-b border-bluegrey-2 last:border-b-0`}
                >
                  <span
                    className="text-body-3 font-bold px-2.5 py-1.5 rounded-[6px] min-w-[44px] text-center shrink-0"
                    style={tagStyle}
                  >
                    {n.type}
                  </span>
                  <span
                    className={`flex-1 text-sub-tit-4 leading-[1.4] text-grey-11 tracking-[-0.3px] truncate ${n.featured ? "font-semibold" : "font-medium"}`}
                  >
                    {n.featured && (
                      <span className="inline-flex items-center justify-center shrink-0 mr-3 align-middle rounded-[5px] w-[22px] h-[22px] bg-blue-7">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="17" x2="12" y2="22" />
                          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                        </svg>
                      </span>
                    )}
                    {n.title}
                  </span>
                  <span className="text-body-3 text-grey-6 shrink-0 tracking-[0.02em]">
                    {n.date}
                  </span>
                </Link>
              );
            })}
            {Array.from({ length: MAX_NOTICE_ROWS - rows.length }).map((_, i) => (
              <div
                key={`notice-pad-${i}`}
                aria-hidden="true"
                className="invisible flex items-center gap-5 px-7 py-[22px] border-b border-bluegrey-2 last:border-b-0"
              >
                <span className="text-body-3 font-bold px-2.5 py-1.5 rounded-[6px] min-w-[44px] text-center shrink-0">
                  -
                </span>
                <span className="flex-1 text-sub-tit-4">-</span>
                <span className="text-body-3 shrink-0">-</span>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-grey-5 text-[15px]">
                공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right: upcoming events */}
        <aside className="flex flex-col">
          <div className="mb-8">
            <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
              다가오는 일정
            </h3>
          </div>

          {/* 실제 일정이 MAX_UPCOMING_EVENTS보다 적어도(0건 포함) 빈 자리를 투명
              placeholder 카드로 채워 리스트 높이가 항상 4건분으로 고정되게 한다. */}
          <ul className="flex-1 relative flex flex-col gap-3 list-none m-0 p-0 bg-white rounded-2xl border border-bluegrey-2">
            {upcomingEvents.map((e) => {
              const { d, w } = formatEventDate(e.dateISO);
              return (
                <Link
                  key={e.id}
                  to={`/교회행사/${e.id}`}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all"
                >
                  <div className="shrink-0 min-w-[52px] mt-[2px]">
                    <div className="text-[15px] font-bold text-blue-6 tracking-[0.02em]">{d}</div>
                    <div className="text-body-5 font-medium text-grey-6 mt-0.5">{w}요일</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-body-2 font-semibold text-grey-12 leading-snug truncate">
                      {e.title}
                    </div>
                    <div className="text-caption text-grey-6 mt-1">{e.time}</div>
                  </div>
                </Link>
              );
            })}
            {Array.from({ length: MAX_UPCOMING_EVENTS - upcomingEvents.length }).map((_, i) => (
              <li
                key={`upcoming-pad-${i}`}
                aria-hidden="true"
                className="invisible flex items-start gap-4 p-5 rounded-2xl border border-bluegrey-2"
              >
                <div className="shrink-0 min-w-[52px] mt-[2px]">
                  <div className="text-[15px] font-bold">00.00</div>
                  <div className="text-body-5 font-medium mt-0.5">월요일</div>
                </div>
                <div className="min-w-0">
                  <div className="text-body-2 font-semibold leading-snug truncate">-</div>
                  <div className="text-caption mt-1">-</div>
                </div>
              </li>
            ))}
            {upcomingEvents.length === 0 && (
              <li className="absolute inset-0 flex items-center justify-center text-center text-grey-5 text-[15px] list-none">
                예정된 일정이 없습니다.
              </li>
            )}
          </ul>

          <Link
            to="/교회행사"
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-white rounded-2xl border border-bluegrey-2 text-[15px] font-semibold text-grey-8 hover:border-blue-5 hover:text-blue-6 transition-colors"
          >
            캘린더로 보기
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </aside>
      </div>
    </Section>
  );
}
