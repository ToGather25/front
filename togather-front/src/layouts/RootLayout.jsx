import { Outlet, Link, NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import FooterLocation from "@/assets/icon-svg/footer-location.svg";
import FooterPhone from "@/assets/icon-svg/footer-phone.svg";
import FooterEmail from "@/assets/icon-svg/footer-email.svg";
import SearchOverlay from "@/components/common/SearchOverlay";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─────────────────────────────────────────────────────
// Desktop Header (md 이상에서만 표시)
// ─────────────────────────────────────────────────────
function DesktopHeader() {
  const { church } = useChurch();
  const { currentUser, logout } = useAuth();
  const NAV_ITEMS = church.nav;
  const [openMenu, setOpenMenu] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-bluegrey-2 hidden md:block"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="max-w-[1920px] mx-auto px-8 h-[72px] flex items-center justify-between gap-16">
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 w-[180px]"
          onMouseEnter={() => setOpenMenu(null)}
        >
          <img
            src={church.logoUrl ?? LogoIcon}
            className="h-22 w-22 object-contain"
            alt={`${church.name} 로고`}
          />
        </Link>

        <nav className="flex items-center gap-10 h-full">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center h-full"
              onMouseEnter={() => setOpenMenu(item.children ? item.label : null)}
            >
              {item.children ? (
                <button
                  className={`text-body-2 font-medium transition-colors whitespace-nowrap py-2 ${
                    openMenu === item.label ? "text-primary" : "text-grey-10 hover:text-primary"
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <NavLink
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
              )}
            </div>
          ))}
        </nav>

        <div
          className="flex items-center gap-2.5 shrink-0 justify-end"
          onMouseEnter={() => setOpenMenu(null)}
        >
          {currentUser ? (
            <>
              <Link
                to="/교적부"
                className="px-4 py-2 rounded-full bg-primary text-white text-body-3 font-semibold hover:bg-blue-8 active:scale-95 transition-all whitespace-nowrap"
              >
                교적부
              </Link>
              <span className="w-px h-[18px] bg-bluegrey-3 shrink-0" />
              <Link
                to="/mypage"
                className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-3 font-semibold text-grey-9 hover:text-primary hover:border-blue-5 transition-colors whitespace-nowrap"
              >
                마이페이지
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-3 font-semibold text-grey-9 hover:text-primary hover:border-blue-5 transition-colors whitespace-nowrap"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLoginRequired(true)}
                className="px-4 py-2 rounded-full bg-grey-4 text-grey-6 text-body-3 font-semibold cursor-default whitespace-nowrap"
              >
                교적부
              </button>
              <span className="w-px h-[18px] bg-bluegrey-3 shrink-0" />
              <Link
                to="/register"
                className="px-4 py-2 rounded-full border border-bluegrey-2 text-body-3 font-semibold text-grey-9 hover:text-primary hover:border-blue-5 transition-colors whitespace-nowrap"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-primary text-white text-body-3 font-semibold hover:bg-blue-8 active:scale-95 transition-all whitespace-nowrap"
              >
                로그인
              </Link>
            </>
          )}
        </div>

        {/* 로그인 필요 모달 */}
        {showLoginRequired && (
          <LoginRequiredModal
            message="교적부를 이용하려면 로그인해 주세요."
            onCancel={() => setShowLoginRequired(false)}
          />
        )}
      </div>

      {openMenu && (
        <div
          className="absolute left-0 right-0 bg-white shadow-xl"
          style={{
            animation: "megaFadeIn 0.15s ease-out",
            borderBottom: "2px solid var(--color-primary)",
          }}
        >
          <style>{`
            @keyframes megaFadeIn {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="max-w-[1920px] mx-auto px-8 py-8">
            <div
              className="grid divide-x divide-bluegrey-2"
              style={{
                gridTemplateColumns: `repeat(${NAV_ITEMS.filter((n) => n.children).length}, minmax(0, 1fr))`,
              }}
            >
              {NAV_ITEMS.filter((item) => item.children).map((item) => {
                const active = openMenu === item.label;
                return (
                  <div
                    key={item.label}
                    className={`px-6 flex flex-col gap-1 rounded-md transition-colors ${
                      active ? "bg-blue-1" : ""
                    }`}
                  >
                    <Link
                      to={item.to ?? item.children[0].to}
                      onClick={() => setOpenMenu(null)}
                      className={`text-sub-tit-4 font-bold mb-2 transition-colors ${
                        active ? "text-primary" : "text-grey-10"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.to}
                        onClick={() => setOpenMenu(null)}
                        className="group flex items-center gap-2 px-2 py-2 rounded-md text-body-3 text-grey-7 hover:text-primary hover:bg-blue-1 transition-colors"
                      >
                        <span className="w-1 h-1 rounded-full bg-bluegrey-3 group-hover:bg-primary transition-colors shrink-0" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────
// Desktop Footer (md 이상에서만 표시)
// ─────────────────────────────────────────────────────
function DesktopFooter() {
  const { church } = useChurch();
  return (
    <footer className="bg-bluegrey-1 border-t border-bluegrey-2 hidden md:block">
      <div className="max-w-[1920px] mx-auto px-8 py-14 flex items-end justify-between gap-8">
        <div className="flex gap-16 items-start">
          <div className="flex items-center gap-2.5 h-[52px]">
            <img
              src={church.logoUrl ?? LogoIcon}
              className="w-30 object-contain"
              alt={`${church.name} 로고`}
            />
          </div>
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-10 text-body-2 font-bold text-grey-10">
              <Link to="/privacy" className="font-extrabold hover:text-blue-7 transition-colors">
                개인정보취급방침
              </Link>
              <Link to="/terms" className="hover:text-blue-7 transition-colors">
                이용 약관
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-10 text-body-3 text-grey-9">
                <div className="flex items-center gap-2">
                  <img src={FooterLocation} className="w-5 h-5 shrink-0" alt="" />
                  <span>{church.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={FooterPhone} className="w-5 h-5 shrink-0" alt="" />
                  <span>
                    TEL <strong>{church.tel}</strong>
                  </span>
                  {church.fax && (
                    <>
                      <span className="text-grey-5">|</span>
                      <span>
                        FAX <strong>{church.fax}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-body-3 text-grey-9">
                <img src={FooterEmail} className="w-5 h-5 shrink-0" alt="" />
                <span>{church.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pb-1">
          <a
            href={church.social?.youtube ?? "#"}
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-7 hover:text-primary hover:border-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a
            href={church.social?.instagram ?? "#"}
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-7 hover:text-primary hover:border-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a
            href={church.social?.facebook ?? "#"}
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-7 hover:text-primary hover:border-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────
// Mobile Footer (md 미만에서만 표시)
// ─────────────────────────────────────────────────────
function MobileFooter() {
  const { church } = useChurch();
  return (
    <footer className="bg-bluegrey-1 border-t border-bluegrey-2 md:hidden pb-[calc(64px+env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-5 px-6 py-8">
        {/* 로고 */}
        <Link to="/">
          <img
            src={church.logoUrl ?? LogoIcon}
            className="h-10 w-auto object-contain"
            alt={`${church.name} 로고`}
          />
        </Link>

        {/* 약관 */}
        <div className="flex items-center gap-5 text-[13px] font-medium text-grey-7">
          <Link
            to="/privacy"
            className="font-bold text-grey-9 hover:text-primary transition-colors"
          >
            개인정보취급방침
          </Link>
          <span className="w-px h-3 bg-bluegrey-3" />
          <Link to="/terms" className="hover:text-primary transition-colors">
            이용 약관
          </Link>
        </div>

        {/* 교회 정보 */}
        <div className="flex flex-col items-center gap-1.5 text-[12px] text-grey-6 text-center">
          <span>{church.address}</span>
          <span>
            TEL {church.tel}
            {church.fax ? ` · FAX ${church.fax}` : ""}
          </span>
          {church.email && <span>{church.email}</span>}
        </div>

        {/* SNS 아이콘 */}
        <div className="flex items-center gap-3">
          <a
            href={church.social?.youtube ?? "#"}
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-6 hover:text-primary hover:border-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a
            href={church.social?.instagram ?? "#"}
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-6 hover:text-primary hover:border-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a
            href={church.social?.facebook ?? "#"}
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-bluegrey-2 flex items-center justify-center text-grey-6 hover:text-primary hover:border-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>

        <p className="text-[11px] text-grey-5">© {church.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────
// Mobile Header (md 미만에서만 표시)
// ─────────────────────────────────────────────────────
function MobileHeader({ onMenuOpen }) {
  const { church } = useChurch();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-bluegrey-2 flex items-center justify-between px-5 h-14 md:hidden">
      <Link to="/" className="flex items-center">
        <img
          src={church.logoUrl ?? LogoIcon}
          className="h-8 w-auto object-contain"
          alt={`${church.name} 로고`}
        />
      </Link>
      <button onClick={onMenuOpen} className="p-1.5 -mr-1 text-grey-10" aria-label="메뉴 열기">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────
// Mobile Drawer
// ─────────────────────────────────────────────────────
function MobileDrawer({ isOpen, onClose }) {
  const { church } = useChurch();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 드로어 헤더 */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-bluegrey-2 shrink-0">
          <span className="text-[17px] font-bold text-primary">{church.name}</span>
          <button onClick={onClose} className="p-1.5 -mr-1 text-grey-8" aria-label="메뉴 닫기">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {church.nav.map((item) => (
            <div key={item.label}>
              <Link
                to={item.to ?? item.children?.[0]?.to}
                onClick={onClose}
                className="flex items-center px-5 py-3.5 text-[15px] font-semibold text-grey-10 border-b border-bluegrey-1 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="bg-bluegrey-1 px-5 py-2 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.to}
                      onClick={onClose}
                      className="flex items-center gap-2 py-2 text-[13px] text-grey-7 hover:text-primary transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-bluegrey-4 shrink-0" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 로그인/유틸 */}
        <div
          className="px-5 py-5 border-t border-bluegrey-2 shrink-0"
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          {currentUser ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/mypage"
                onClick={onClose}
                className="block text-center py-2.5 rounded-full bg-primary text-white text-[14px] font-semibold"
              >
                마이페이지
              </Link>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full text-center py-2.5 rounded-full border border-bluegrey-2 text-[14px] font-semibold text-grey-9"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 text-center py-2.5 rounded-full border border-bluegrey-2 text-[14px] font-semibold text-grey-9"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 text-center py-2.5 rounded-full bg-primary text-white text-[14px] font-semibold"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// Bottom Nav Icons
// ─────────────────────────────────────────────────────
function IconBible({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function IconJubo({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function IconHome() {
  return (
    <svg
      className="w-[26px] h-[26px] text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconCalendar({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function IconMyPage({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// Bottom Navigation Bar (md 미만에서만 표시)
// ─────────────────────────────────────────────────────
const HIDE_BOTTOM_NAV_ON = ["/login", "/register"];

function BottomNav() {
  const { pathname } = useLocation();

  if (HIDE_BOTTOM_NAV_ON.some((p) => pathname.startsWith(p))) return null;

  const tabs = [
    {
      label: "성경",
      to: "/말씀/읽기",
      icon: (a) => <IconBible active={a} />,
      match: (p) => p.startsWith("/말씀"),
    },
    {
      label: "주보",
      to: "/주보",
      icon: (a) => <IconJubo active={a} />,
      match: (p) => p.startsWith("/주보"),
    },
    {
      label: "홈",
      to: "/",
      isHome: true,
      icon: () => <IconHome />,
      match: (p) => p === "/",
    },
    {
      label: "캘린더",
      to: "/교회행사",
      icon: (a) => <IconCalendar active={a} />,
      match: (p) => p.startsWith("/교회행사"),
    },
    {
      label: "마이페이지",
      to: "/mypage",
      icon: (a) => <IconMyPage active={a} />,
      match: (p) => p.startsWith("/mypage"),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-bluegrey-2 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-end h-[64px]">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          if (tab.isHome) {
            return (
              <Link key={tab.label} to={tab.to} className="flex-1 flex flex-col items-center pb-2">
                <div className="w-[52px] h-[52px] rounded-full bg-primary flex items-center justify-center shadow-md -mt-4">
                  <IconHome />
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-medium ${active ? "text-primary" : "text-grey-6"}`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 pb-2 pt-2 ${active ? "text-primary" : "text-grey-6"}`}
            >
              {tab.icon(active)}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────
const BIBLE_PAGES = ["/말씀/읽기", "/말씀/필사"];

function Layout() {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showBottomNav = !HIDE_BOTTOM_NAV_ON.some((p) => pathname.startsWith(p));
  const isBiblePage = BIBLE_PAGES.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col">
      {/* 데스크탑 헤더 (bible 전체화면 페이지 제외) */}
      {!isBiblePage && <DesktopHeader />}

      {/* 모바일 헤더 */}
      <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />

      {/* 모바일 드로어 */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* 페이지 컨텐츠 */}
      <main className={`flex-1 ${showBottomNav ? "pb-[64px] md:pb-0" : ""}`}>
        <Outlet />
      </main>

      {/* 데스크탑 푸터 (bible 전체화면 페이지 제외) */}
      {!isBiblePage && <DesktopFooter />}

      {/* 모바일 푸터 (bible 전체화면 페이지 제외) */}
      {!isBiblePage && <MobileFooter />}

      {/* 모바일 바텀 네비 */}
      <BottomNav />

      {/* 검색 오버레이 */}
      <SearchOverlay />
    </div>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Layout />
    </AuthProvider>
  );
}
