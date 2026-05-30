import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import Section from "@/components/common/Section";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { bg: "rgba(61,85,136,.12)",  color: "#2b3c61" },
  행사: { bg: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { bg: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

const UPCOMING_EVENTS = [
  { d: "03.22", w: "토", title: "구역장 모임",        time: "14:00 본당" },
  { d: "03.24", w: "주", title: "새 가족 환영회",      time: "예배 후 친교실" },
  { d: "03.29", w: "금", title: "성가대 부활절 연습",  time: "20:00 4층" },
  { d: "04.05", w: "주", title: "부활주일 연합 예배",  time: "11:00 본당" },
];

export default function NoticeSection() {
  const { church } = useChurch();
  const { data: notices = [] } = useFetch(
    () => getNotices(church.id),
    [church.id],
    []
  );
  const [tab, setTab] = useState("전체");

  const rows = (tab === "전체" ? notices : notices.filter(n => n.type === tab)).slice(0, 5);

  return (
    <Section className="py-[100px] bg-bluegrey-1">
      <div className="grid gap-10" style={{ gridTemplateColumns: "1fr 460px" }}>
        {/* Left: notices */}
        <div className="flex flex-col">
          <div className="mb-8">
            <p className="text-caption font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3 ml-1">
              UPDATES
            </p>
            <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
              공지 ∙ 소식
            </h3>
          </div>

          {/* Tabs + 전체보기 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {TABS.map(t => (
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
            <Link to="/공지사항" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors">
              전체보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          {/* Notice list */}
          <div className="flex-1 flex flex-col bg-white rounded-[20px] overflow-hidden border border-bluegrey-2">
            {rows.length === 0 ? (
              <div className="py-16 text-center text-grey-5 text-[15px]">공지사항이 없습니다.</div>
            ) : (
              rows.map((n, i) => {
                const tagStyle = TAG_STYLES[n.type] ?? TAG_STYLES["공지"];
                return (
                  <Link
                    key={n.id ?? i}
                    to={`/공지사항?id=${n.id}`}
                    className={`flex items-center gap-5 px-7 py-[22px] hover:bg-bluegrey-1 transition-colors border-b border-bluegrey-2`}
                  >
                    <span
                      className="text-body-3 font-bold px-2.5 py-1.5 rounded-[6px] min-w-[44px] text-center shrink-0"
                      style={tagStyle}
                    >
                      {n.type}
                    </span>
                    <span className={`flex-1 text-sub-tit-4 leading-[1.4] text-grey-11 tracking-[-0.3px] truncate ${n.featured ? "font-semibold" : "font-medium"}`}>
                      {n.featured && (
                        <span className="inline-flex items-center justify-center shrink-0 mr-3 align-middle rounded-[5px] w-[22px] h-[22px] bg-blue-7">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              })
            )}
          </div>
        </div>

        {/* Right: upcoming events */}
        <aside className="flex flex-col">
          <div className="mb-8">
            <p className="text-caption font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3 ml-1">
              CALENDAR
            </p>
            <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
              다가오는 일정
            </h3>
          </div>

          <ul className="flex-1 flex flex-col gap-3 list-none m-0 p-0">
            {UPCOMING_EVENTS.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all cursor-pointer"
              >
                <div className="shrink-0 min-w-[52px] mt-[2px]">
                  <div className="text-[15px] font-bold text-blue-6 tracking-[0.02em]">{e.d}</div>
                  <div className="text-body-5 font-medium text-grey-6 mt-0.5">{e.w}요일</div>
                </div>
                <div className="min-w-0">
                  <div className="text-body-2 font-semibold text-grey-12 leading-snug">{e.title}</div>
                  <div className="text-caption text-grey-6 mt-1">{e.time}</div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/교회행사"
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-white rounded-2xl border border-bluegrey-2 text-[15px] font-semibold text-grey-8 hover:border-blue-5 hover:text-blue-6 transition-colors"
          >
            캘린더로 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </aside>
      </div>
    </Section>
  );
}
