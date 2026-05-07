import { Outlet, Link, NavLink } from "react-router";
import { useState, useEffect, useRef } from "react";
import LogoIcon from "@/assets/icons/512x512.png";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";

function FloatingGyojeokbu() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return (
    <Link
      to="/교적부"
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-5 rounded-full bg-primary text-white text-btn-2 font-semibold shadow-lg hover:bg-blue-8 active:scale-95 transition-all"
    >
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
      교적부
    </Link>
  );
}

function Header() {
  const { church } = useChurch();
  const { currentUser, logout } = useAuth();
  const NAV_ITEMS = church.nav;
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-bluegrey-2">
      <div className="max-w-[1920px] mx-auto px-8 h-[72px] flex items-center justify-between gap-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 w-[180px]">
          <img
            src={church.logoUrl ?? LogoIcon}
            className="h-9 w-9 object-contain"
            alt={`${church.name} 로고`}
          />
          <span className="font-semibold text-grey-11 text-body-2 whitespace-nowrap">{church.name}</span>
        </Link>

        {/* GNB */}
        <nav className="flex items-center gap-10">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button className="text-body-2 font-medium text-grey-10 hover:text-primary transition-colors py-2 whitespace-nowrap">
                  {item.label}
                </button>
                {openMenu === item.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-bluegrey-2 rounded-xl shadow-lg py-2 min-w-36 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="block px-4 py-2 text-body-3 text-grey-9 hover:bg-bluegrey-1 hover:text-primary transition-colors whitespace-nowrap"
                        onClick={() => setOpenMenu(null)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) =>
                  `text-body-2 font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-primary font-bold border-b-2 border-primary pb-0.5"
                      : "text-grey-10 hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-4 shrink-0 justify-end">
          {currentUser ? (
            <>
              <Link
                to="/mypage"
                className="text-body-3 font-semibold text-grey-9 hover:text-primary transition-colors"
              >
                마이페이지
              </Link>
              <button
                onClick={logout}
                className="text-body-3 font-semibold text-grey-9 hover:text-primary transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-body-3 font-semibold text-grey-9 hover:text-primary transition-colors"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                className="text-body-3 font-semibold text-grey-9 hover:text-primary transition-colors"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { church } = useChurch();
  return (
    <footer className="bg-bluegrey-1 border-t border-bluegrey-2">
      <div className="max-w-[1920px] mx-auto px-8 py-14 flex items-end justify-between gap-8">
        {/* Left: logo + info */}
        <div className="flex gap-16 items-start">
          {/* Logo */}
          <div className="flex items-center gap-2.5 h-[52px]">
            <img
              src={church.logoUrl ?? LogoIcon}
              className="h-12 w-12 object-contain"
              alt={`${church.name} 로고`}
            />
            <span className="font-semibold text-grey-10 text-sub-tit-5 whitespace-nowrap">{church.name}</span>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 py-2">
            {/* Links */}
            <div className="flex items-center gap-10 text-body-3 font-bold text-grey-10">
              <Link to="/privacy" className="hover:text-blue-7 transition-colors">개인정보취급방침</Link>
              <Link to="/terms" className="hover:text-blue-7 transition-colors">이용 약관</Link>
            </div>
            {/* Contact */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-10 text-body-3 text-grey-9">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-grey-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{church.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0 text-grey-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>TEL <strong>{church.tel}</strong></span>
                  {church.fax && (
                    <>
                      <span className="text-grey-5">|</span>
                      <span>FAX <strong>{church.fax}</strong></span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-body-3 text-grey-9">
                <svg className="w-5 h-5 shrink-0 text-grey-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>{church.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: SNS */}
        <div className="flex items-center gap-4 pb-1">
          <a href="#" aria-label="YouTube"
            className="w-12 h-12 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-7 hover:text-primary hover:border-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram"
            className="w-12 h-12 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-7 hover:text-primary hover:border-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a href="#" aria-label="Facebook"
            className="w-12 h-12 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-7 hover:text-primary hover:border-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <FloatingGyojeokbu />
      </div>
    </AuthProvider>
  );
}
