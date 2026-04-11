import { Link } from "react-router";

const MOCK_USER = {
  name: "홍길동",
  email: "hong@gmail.com",
  community: "청년부",
  joinDate: "2024.03.01",
};

const STATS = [
  { label: "성경 읽기", value: "34절", sub: "이번 주" },
  { label: "성경 쓰기", value: "12절", sub: "이번 주" },
  { label: "연속 출석", value: "7일", sub: "streak" },
];

const MENUS = [
  { label: "내 정보 수정", icon: "✏️" },
  { label: "비밀번호 변경", icon: "🔒" },
  { label: "알림 설정", icon: "🔔" },
  { label: "개인정보 처리방침", icon: "📄" },
  { label: "이용약관", icon: "📋" },
  { label: "로그아웃", icon: "🚪", danger: true },
];

export default function MyPage() {
  return (
    <div className="max-w-lg mx-auto px-8 py-10">
      <h1 className="text-sub-tit-2 font-bold text-grey-11 mb-8">마이 페이지</h1>

      {/* Profile Card */}
      <div className="bg-primary rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-sub-tit-3 font-bold">
            {MOCK_USER.name[0]}
          </div>
          <div>
            <p className="text-sub-tit-4 font-bold">{MOCK_USER.name}</p>
            <p className="text-body-4 text-white/70">{MOCK_USER.email}</p>
            <p className="text-body-5 text-white/60 mt-0.5">{MOCK_USER.community} · {MOCK_USER.joinDate} 가입</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ label, value, sub }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-sub-tit-5 font-bold">{value}</p>
              <p className="text-body-5 text-white/70">{label}</p>
              <p className="text-body-5 text-white/50">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to="/말씀/읽기"
          className="border border-bluegrey-2 rounded-2xl p-4 flex items-center gap-3 hover:bg-grey-1 transition-colors"
        >
          <span className="text-2xl">📖</span>
          <div>
            <p className="text-body-3 font-semibold text-grey-10">성경 읽기</p>
            <p className="text-body-5 text-grey-6">오늘도 말씀 읽기</p>
          </div>
        </Link>
        <Link
          to="/말씀/필사"
          className="border border-bluegrey-2 rounded-2xl p-4 flex items-center gap-3 hover:bg-grey-1 transition-colors"
        >
          <span className="text-2xl">✍️</span>
          <div>
            <p className="text-body-3 font-semibold text-grey-10">성경 쓰기</p>
            <p className="text-body-5 text-grey-6">오늘도 성경 필사</p>
          </div>
        </Link>
      </div>

      {/* Settings Menu */}
      <div className="border border-bluegrey-2 rounded-2xl overflow-hidden">
        {MENUS.map(({ label, icon, danger }, i) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-5 py-4 text-body-3 transition-colors ${
              i < MENUS.length - 1 ? "border-b border-grey-3" : ""
            } ${danger ? "text-red-500 hover:bg-red-50" : "text-grey-9 hover:bg-grey-1"}`}
          >
            <span>{icon}</span>
            {label}
            {!danger && (
              <svg className="w-4 h-4 text-grey-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
