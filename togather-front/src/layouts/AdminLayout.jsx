import { NavLink, Outlet, useNavigate } from "react-router";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { useEffect } from "react";
import IcoChart from "@/assets/icon-svg/admin-chart-white.svg";
import IcoMonitor from "@/assets/icon-svg/admin-monitor-white.svg";
import IcoBook from "@/assets/icon-svg/admin-book-white.svg";
import IcoAnnounce from "@/assets/icon-svg/admin-announcement-white.svg";
import IcoUsers from "@/assets/icon-svg/admin-users-white.svg";
import IcoFile from "@/assets/icon-svg/admin-file-white.svg";
import IcoSiteSettings from "@/assets/icon-svg/admin-site-settings-white.svg";
import IcoCalendar from "@/assets/icon-svg/mypage-calendar-white.svg";

const MENU = [
  { label: "대시보드", to: "/admin", end: true, icon: IcoChart },
  { label: "메인 페이지 관리", to: "/admin/main", icon: IcoMonitor },
  { label: "예배 및 설교 관리", to: "/admin/worship", icon: IcoBook },
  { label: "공지사항 관리", to: "/admin/notices", icon: IcoAnnounce },
  { label: "교회행사 관리", to: "/admin/events", icon: IcoCalendar },
  { label: "교인 관리", to: "/admin/members", icon: IcoUsers },
  { label: "스마트 주보 관리", to: "/admin/jubo", icon: IcoFile },
  { label: "사이트 기본 설정", to: "/admin/settings", icon: IcoSiteSettings },
];

function AdminGuard({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.isAdmin) {
      void navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser?.isAdmin) return null;
  return children;
}

function AdminLayoutInner() {
  const { currentUser, logout } = useAuth();

  return (
    <AdminGuard>
      <div className="min-h-screen flex" style={{ background: "#f4f6fb" }}>
        {/* Sidebar */}
        <aside
          className="w-[220px] shrink-0 flex flex-col min-h-screen"
          style={{ background: "#1a2540" }}
        >
          {/* Logo / title */}
          <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,.08)" }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,.12)" }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/50 leading-none mb-0.5">
                  ToGather
                </p>
                <p className="text-[13px] font-bold text-white leading-none">관리자</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
            {MENU.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={item.icon}
                      className={`w-[18px] h-[18px] shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-55"}`}
                      alt=""
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom user info */}
          <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,.08)" }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                {currentUser?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-white/40 truncate">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 bg-white border-b border-grey-3 flex items-center justify-between px-8 shrink-0">
            <span />
            <div className="flex items-center gap-3">
              <span className="text-body-4 text-grey-8">
                <strong className="text-grey-11">{currentUser?.name}</strong> 님
              </span>
              <button
                onClick={logout}
                className="px-4 py-1.5 rounded-full border border-grey-3 text-body-5 font-medium text-grey-7 hover:border-grey-5 hover:text-grey-9 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

export default function AdminLayout() {
  return (
    <AuthProvider>
      <AdminLayoutInner />
    </AuthProvider>
  );
}
