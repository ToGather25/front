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

  const rows = tab === "전체" ? notices : notices.filter(n => n.type === tab);

  return (
    <Section className="py-[100px] bg-white">
      <div className="grid gap-10 items-start" style={{ gridTemplateColumns: "1fr 460px" }}>
        {/* Left: notices */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[13px] font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
                UPDATES
              </p>
              <h3 className="text-[44px] font-bold tracking-[-1.2px] text-grey-12 m-0">
                공지 ∙ 소식
              </h3>
            </div>
            <button className="inline-flex items-center gap-1.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors">
              전체보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-[18px] py-2.5 rounded-full text-[15px] font-semibold transition-all ${
                  t === tab
                    ? "bg-blue-8 text-white"
                    : "bg-transparent text-grey-9 hover:bg-bluegrey-1"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Notice list */}
          <div className="bg-white rounded-[20px] overflow-hidden border border-bluegrey-2">
            {rows.length === 0 ? (
              <div className="py-16 text-center text-grey-5 text-[15px]">공지사항이 없습니다.</div>
            ) : (
              rows.map((n, i) => {
                const tagStyle = TAG_STYLES[n.type] ?? TAG_STYLES["공지"];
                return (
                  <div
                    key={n.id ?? i}
                    className={`flex items-center gap-5 px-7 py-[22px] cursor-pointer hover:bg-bluegrey-1 transition-colors ${
                      i < rows.length - 1 ? "border-b border-bluegrey-2" : ""
                    } ${n.featured ? "bg-blue-1/40" : ""}`}
                  >
                    <span
                      className="text-[12px] font-bold px-2.5 py-1.5 rounded-[6px] min-w-[44px] text-center shrink-0"
                      style={tagStyle}
                    >
                      {n.type}
                    </span>
                    <span className={`flex-1 text-[18px] leading-[1.4] text-grey-11 tracking-[-0.3px] truncate ${n.featured ? "font-semibold" : "font-medium"}`}>
                      {n.featured && (
                        <span className="inline-flex items-center mr-2 px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-6 text-white align-middle">
                          고정
                        </span>
                      )}
                      {n.title}
                    </span>
                    <span className="text-[14px] text-grey-6 shrink-0 tracking-[0.02em]">
                      {n.date}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: upcoming events */}
        <aside>
          <div className="mb-8">
            <p className="text-[13px] font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
              CALENDAR
            </p>
            <h3 className="text-[44px] font-bold tracking-[-1.2px] text-grey-12 m-0">
              다가오는 일정
            </h3>
          </div>

          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {UPCOMING_EVENTS.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-4 p-5 bg-bluegrey-1 rounded-2xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all cursor-pointer"
              >
                <div className="shrink-0 text-center min-w-[52px]">
                  <div className="text-[15px] font-bold text-blue-6 tracking-[0.02em]">{e.d}</div>
                  <div className="text-[12px] font-medium text-grey-6 mt-0.5">{e.w}요일</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold text-grey-12 leading-snug">{e.title}</div>
                  <div className="text-[13px] text-grey-6 mt-1">{e.time}</div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/교회행사"
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-bluegrey-2 text-[15px] font-semibold text-grey-8 hover:border-blue-5 hover:text-blue-6 transition-colors"
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
