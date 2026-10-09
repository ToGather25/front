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
  const snsBorderClass = isHome ? "border-white/30" : "border-bluegrey-4";
  const snsColorClass = isHome ? "text-white/60 hover:text-white" : "text-grey-7 hover:text-primary";

  return (
    <>
      {/* Desktop Footer (md 이상에서만 표시) */}
      <footer className={`${bgClass} hidden md:block`}>
        <div className="relative max-w-[1440px] mx-auto px-8 pt-10 pb-16">
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

          <div className="absolute right-40 bottom-8 flex items-center gap-3">
            {church.social?.youtube && (
              <a
                href={church.social.youtube}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-xl border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
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
                className={`w-9 h-9 rounded-2xl border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {church.social?.facebook && (
              <a
                href={church.social.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-2xl border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <span className="text-lg font-bold">f</span>
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
                className={`w-9 h-9 rounded-xl border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
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
                className={`w-9 h-9 rounded-xl border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {church.social?.facebook && (
              <a
                href={church.social.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-xl border ${snsBorderClass} flex items-center justify-center ${snsColorClass} transition-colors`}
              >
                <span className="text-sm font-bold">f</span>
              </a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
