import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getMembers } from "@/services/memberService";
import { getSignupRequests } from "@/services/signupRequestService";
import { getNotices } from "@/services/noticeService";
import { getEvents } from "@/services/eventsService";

const iconCls = { width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24" };

const ICONS = {
  members: (
    <svg {...iconCls}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  pending: (
    <svg {...iconCls}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  events: (
    <svg {...iconCls}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  notices: (
    <svg {...iconCls}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
};

/** "YYYY-MM-DD"/ISO → "MM.DD" */
function shortDate(value) {
  if (!value) return "";
  const [, m, d] = value.slice(0, 10).split("-");
  return m && d ? `${m}.${d}` : "";
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function StatCard({ label, value, sub, color, icon, loading }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-grey-2 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + "18", color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-body-5 text-grey-6 mb-0.5">{label}</p>
        <p className="text-sub-tit-2 font-bold text-grey-11 leading-none mb-1">
          {loading ? "—" : value}
        </p>
        <p className="text-body-5 text-grey-5">{sub}</p>
      </div>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sub-tit-5 font-bold text-grey-10">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { church } = useChurch();

  const { data: memberPage, loading: membersLoading } = useFetch(
    () => getMembers(church.id, { page: 1, size: 1 }),
    [church.id],
    null,
  );
  const { data: pending, loading: pendingLoading } = useFetch(
    () => getSignupRequests("PENDING"),
    [church.id],
    [],
  );
  const { data: notices, loading: noticesLoading } = useFetch(
    () => getNotices(church.id, { limit: 5 }),
    [church.id],
    [],
  );
  const { data: events, loading: eventsLoading } = useFetch(
    () => getEvents(church.id),
    [church.id],
    [],
  );

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (events ?? [])
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-headline-5 font-bold text-grey-11 mb-6">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard
          label="전체 교인 수"
          value={`${memberPage?.pageInfo?.totalElements ?? 0}명`}
          sub="교적부 등록 기준"
          color="#3b5280"
          icon={ICONS.members}
          loading={membersLoading}
        />
        <StatCard
          label="가입 승인 대기"
          value={`${pending.length}건`}
          sub={pending.length > 0 ? "처리가 필요합니다" : "대기 중인 신청 없음"}
          color="#d97706"
          icon={ICONS.pending}
          loading={pendingLoading}
        />
        <StatCard
          label="예정된 행사"
          value={`${(events ?? []).filter((e) => e.date >= today).length}건`}
          sub="오늘 이후 일정"
          color="#2563eb"
          icon={ICONS.events}
          loading={eventsLoading}
        />
        <StatCard
          label="등록된 공지"
          value={`${notices.length}건`}
          sub="최근 5건 기준"
          color="#059669"
          icon={ICONS.notices}
          loading={noticesLoading}
        />
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px" }}>
        <Panel
          title="최근 공지"
          action={
            <Link to="/admin/notices" className="text-body-5 text-primary hover:underline">
              전체 보기
            </Link>
          }
        >
          {noticesLoading ? (
            <p className="py-8 text-center text-body-4 text-grey-5">불러오는 중...</p>
          ) : notices.length === 0 ? (
            <p className="py-8 text-center text-body-4 text-grey-5">등록된 공지가 없습니다.</p>
          ) : (
            <div className="divide-y divide-grey-2">
              {notices.map((n) => (
                <div key={n.id} className="flex items-center gap-4 py-3">
                  <span className="text-body-5 font-bold px-2 py-0.5 rounded text-primary bg-blue-1 shrink-0">
                    {n.type}
                  </span>
                  <span className="flex-1 text-body-4 text-grey-9 truncate">{n.title}</span>
                  <span className="text-body-5 text-grey-5 shrink-0">{n.date}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="다가오는 일정"
          action={
            <Link to="/admin/events" className="text-body-5 text-primary hover:underline">
              전체 보기
            </Link>
          }
        >
          {eventsLoading ? (
            <p className="py-8 text-center text-body-4 text-grey-5">불러오는 중...</p>
          ) : upcoming.length === 0 ? (
            <p className="py-8 text-center text-body-4 text-grey-5">예정된 일정이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {upcoming.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-3 py-2.5 border-b border-grey-2 last:border-0"
                >
                  <div className="shrink-0 text-center w-10">
                    <div className="text-[13px] font-bold text-primary">{shortDate(e.date)}</div>
                    <div className="text-[11px] text-grey-5">
                      {WEEKDAYS[new Date(e.date).getDay()]}요일
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-4 font-semibold text-grey-10 leading-snug truncate">
                      {e.title}
                    </p>
                    <p className="text-body-5 text-grey-5 mt-0.5">
                      {[e.startTime, e.location].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
