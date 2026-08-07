const STATS = [
  {
    label: "전체 교인 수",
    value: "1,248명",
    sub: "지난달 대비 +12명",
    color: "#3b5280",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "이번 주 출석",
    value: "864명",
    sub: "출석률 69.2%",
    color: "#2563eb",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <polyline points="9,11 12,14 22,4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    label: "신규 등록",
    value: "23명",
    sub: "이번 달 누계",
    color: "#059669",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    label: "온라인 조회",
    value: "3,521회",
    sub: "이번 주 홈페이지",
    color: "#d97706",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

const SCHEDULE = [
  { date: "05.25", day: "일", title: "주일 1·2부 예배", time: "09:30 / 11:00 본당" },
  { date: "05.28", day: "수", title: "수요 예배", time: "19:30 본당" },
  { date: "05.29", day: "목", title: "구역장 모임", time: "14:00 소강당" },
  { date: "05.31", day: "토", title: "청년부 수련회 출발", time: "08:00 교회 앞" },
  { date: "06.01", day: "일", title: "주일 연합 예배", time: "10:30 본당" },
];

const NOTICES = [
  { type: "공지", title: "2026년 상반기 행사 일정 안내", date: "2026.05.20" },
  { type: "행사", title: "어버이주일 특별 예배 안내", date: "2026.05.18" },
  { type: "공지", title: "주차 안내 변경", date: "2026.05.15" },
  { type: "소식", title: "봄 야외 예배 참가 신청 결과", date: "2026.05.10" },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-headline-5 font-bold text-grey-11 mb-6">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-6 border border-grey-2 flex items-start gap-4"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.color + "18", color: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-body-5 text-grey-6 mb-0.5">{s.label}</p>
              <p className="text-sub-tit-2 font-bold text-grey-11 leading-none mb-1">{s.value}</p>
              <p className="text-body-5 text-grey-5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Chart area */}
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sub-tit-5 font-bold text-grey-10">주간 출석 현황</h2>
            <div className="flex gap-1">
              {["1주", "2주", "3주", "4주"].map((w) => (
                <button
                  key={w}
                  className="px-3 py-1 rounded-full text-body-5 text-grey-6 hover:bg-grey-2 transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          {/* Bar chart placeholder */}
          <div className="flex items-end gap-4 h-44">
            {[65, 82, 70, 78, 90, 74, 68].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${h}%`, background: i === 4 ? "#3b5280" : "#dbe5f4" }}
                />
                <span className="text-[10px] text-grey-5">
                  {["일", "월", "화", "수", "목", "금", "토"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-4">이번 주 일정</h2>
          <ul className="flex flex-col gap-2.5">
            {SCHEDULE.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 py-2.5 border-b border-grey-2 last:border-0"
              >
                <div className="shrink-0 text-center w-10">
                  <div className="text-[13px] font-bold text-primary">{s.date}</div>
                  <div className="text-[11px] text-grey-5">{s.day}요일</div>
                </div>
                <div>
                  <p className="text-body-4 font-semibold text-grey-10 leading-snug">{s.title}</p>
                  <p className="text-body-5 text-grey-5 mt-0.5">{s.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent notices */}
      <div className="bg-white rounded-2xl border border-grey-2 p-6 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sub-tit-5 font-bold text-grey-10">최근 공지</h2>
          <a href="/admin/notices" className="text-body-5 text-primary hover:underline">
            전체 보기
          </a>
        </div>
        <div className="divide-y divide-grey-2">
          {NOTICES.map((n, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <span className="text-body-5 font-bold px-2 py-0.5 rounded text-primary bg-blue-1 shrink-0">
                {n.type}
              </span>
              <span className="flex-1 text-body-4 text-grey-9 truncate">{n.title}</span>
              <span className="text-body-5 text-grey-5 shrink-0">{n.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
