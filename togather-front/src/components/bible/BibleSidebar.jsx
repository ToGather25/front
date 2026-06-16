import { Link } from "react-router";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";

/**
 * 성경 읽기/쓰기 공통 좌측 사이드바
 * props:
 *   sidebarOpen      bool
 *   onToggle         () => void
 *   menus            string[]
 *   menuIcons        { [menu]: ReactNode }
 *   activeMenu       string
 *   onMenuChange     (menu: string) => void
 *   switchTo         { to: string, label: string }  — 읽기↔쓰기 전환 링크
 */
export default function BibleSidebar({
  sidebarOpen,
  onToggle,
  menus,
  menuIcons = {},
  activeMenu,
  onMenuChange,
  switchTo,
}) {
  return (
    <div
      className={`bg-grey-1 border-r border-bluegrey-2 flex flex-col transition-all duration-300 overflow-hidden ${
        sidebarOpen ? "w-56" : "w-14"
      }`}
    >
      {/* 헤더 — 로고 + 햄버거 */}
      <div
        className={`flex items-center h-[60px] shrink-0 border-b border-bluegrey-2 ${
          sidebarOpen ? "justify-between pl-3 pr-3" : "justify-center"
        }`}
      >
        {sidebarOpen && (
          <img src={LogoIcon} className="h-6 w-auto pl-2 object-contain" alt="" />
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] shrink-0 text-grey-6 hover:text-grey-9"
        >
          <span
            className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${
              sidebarOpen ? "w-5 rotate-45 translate-y-[7px]" : "w-5"
            }`}
          />
          <span
            className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${
              sidebarOpen ? "w-5 opacity-0" : "w-5 opacity-100"
            }`}
          />
          <span
            className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${
              sidebarOpen ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"
            }`}
          />
        </button>
      </div>

      {/* 메뉴 */}
      <nav className="flex flex-col py-2">
        {menus.map((menu) => (
          <button
            key={menu}
            onClick={() => onMenuChange(menu)}
            className={`flex items-center py-3 text-body-3 transition-colors ${
              sidebarOpen ? "gap-3 px-4" : "justify-center px-0"
            } ${
              activeMenu === menu
                ? "bg-grey-3 text-grey-11 font-semibold"
                : "text-grey-8 hover:bg-bluegrey-1"
            }`}
          >
            {menuIcons[menu]}
            {sidebarOpen && menu}
          </button>
        ))}
      </nav>

      {/* 하단 — 나가기 + 전환 버튼 */}
      <div className="mt-auto border-t border-bluegrey-2 h-20 flex items-center gap-2 px-2">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-grey-6 hover:text-grey-9 hover:bg-bluegrey-1 transition-colors ${
            sidebarOpen ? "flex-1" : "w-full"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {sidebarOpen && <span className="text-[10px] whitespace-nowrap">나가기</span>}
        </Link>

        {sidebarOpen && switchTo && (
          <Link
            to={switchTo.to}
            className="flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-grey-6 hover:text-grey-9 hover:bg-bluegrey-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span className="text-[10px] whitespace-nowrap">{switchTo.label}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
