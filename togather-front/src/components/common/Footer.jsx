import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import FooterLocation from "@/assets/icon-svg/footer-location.svg";
import FooterPhone from "@/assets/icon-svg/footer-phone.svg";
import FooterEmail from "@/assets/icon-svg/footer-email.svg";
import ChurchLogo from "@/components/common/ChurchLogo";

export default function Footer({ isHome = false }) {
  const { church } = useChurch();

  const bgClass = isHome ? "bg-primary-darker" : "bg-bluegrey-1";
  const borderClass = isHome ? "border-primary" : "border-bluegrey-2";
  const textColorClass = isHome ? "text-white" : "text-grey-10";
  const linkColorClass = isHome ? "hover:text-white/80" : "hover:text-blue-7";
  const bodyColorClass = isHome ? "text-white/80" : "text-grey-9";
  const snsBorderClass = isHome ? "border-white/30" : "border-bluegrey-2";
  const snsColorClass = isHome ? "text-white/60 hover:text-white" : "text-grey-7 hover:text-primary";

  return (
    <>
      {/* Desktop Footer (md 이상에서만 표시) */}
      <footer className={`${bgClass} hidden md:block`}>
        <div className="max-w-[1440px] mx-auto px-8 pt-10 pb-16 flex items-end justify-between gap-8">
          <div className="flex gap-16 items-start">
            <div className="flex items-center gap-2.5 h-[52px]">
              <ChurchLogo
                className="h-30 w-30 object-contain transition-[filter] duration-300"
                style={{ filter: isHome ? "brightness(0) invert(1)" : "none" }}
                alt={`${church.name} 로고`}
              />
            </div>
            <div className="flex flex-col gap-5 py-2">
              <div className={`flex items-center gap-10 text-body-2 font-bold ${textColorClass}`}>
                <Link to="/privacy" className={`font-extrabold transition-colors ${linkColorClass}`}>
                  개인정보취급방침
                </Link>
                <Link to="/terms" className={`transition-colors ${linkColorClass}`}>
                  이용 약관
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className={`flex items-center gap-10 text-body-3 ${bodyColorClass}`}>
                  <div className="flex items-center gap-2">
                    <img src={FooterLocation} className={`w-5 h-5 shrink-0 ${isHome ? "invert brightness-0" : ""}`} alt="" />
                    <span>{church.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={FooterPhone} className={`w-5 h-5 shrink-0 ${isHome ? "invert brightness-0" : ""}`} alt="" />
                    <span>
                      TEL <strong>{church.tel}</strong>
                    </span>
                    {church.fax && (
                      <>
                        <span className={isHome ? "text-white/40" : "text-grey-5"}>|</span>
                        <span>
                          FAX <strong>{church.fax}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-body-3 ${bodyColorClass}`}>
                  <img src={FooterEmail} className={`w-5 h-5 shrink-0 ${isHome ? "invert brightness-0" : ""}`} alt="" />
                  <span>{church.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-1">
            {church.social?.youtube && (
              <a
                href={church.social.youtube}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}
            {church.social?.instagram && (
              <a
                href={church.social.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile Footer (md 미만에서만 표시) */}
      <footer className={`${bgClass} border-t ${borderClass} md:hidden pb-[calc(64px+env(safe-area-inset-bottom))]`}>
        <div className="flex flex-col items-center gap-5 px-6 py-8">
          {/* 로고 */}
          <Link to="/">
            <ChurchLogo className="h-10 w-auto object-contain" alt={`${church.name} 로고`} />
          </Link>

          {/* 약관 */}
          <div className={`flex items-center gap-5 text-[13px] font-medium ${isHome ? "text-white/70" : "text-grey-7"}`}>
            <Link
              to="/privacy"
              className={`font-bold ${isHome ? "text-white hover:text-white/80" : "text-grey-9 hover:text-primary"} transition-colors`}
            >
              개인정보취급방침
            </Link>
            <span className={`w-px h-3 ${isHome ? "bg-white/30" : "bg-bluegrey-3"}`} />
            <Link to="/terms" className={`${isHome ? "text-white/70 hover:text-white/80" : "hover:text-primary"} transition-colors`}>
              이용 약관
            </Link>
          </div>

          {/* 교회 정보 */}
          <div className={`flex flex-col items-center gap-1.5 text-[12px] ${isHome ? "text-white/60" : "text-grey-6"} text-center`}>
            <span>{church.address}</span>
            <span>
              TEL {church.tel}
              {church.fax ? ` · FAX ${church.fax}` : ""}
            </span>
            {church.email && <span>{church.email}</span>}
          </div>

          {/* SNS 아이콘 */}
          <div className="flex items-center gap-3">
            {church.social?.youtube && (
              <a
                href={church.social.youtube}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-full border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}
            {church.social?.instagram && (
              <a
                href={church.social.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-full border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
