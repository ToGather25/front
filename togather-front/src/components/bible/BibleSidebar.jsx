import { Link } from "react-router";
import ChurchLogo from "@/components/common/ChurchLogo";

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
        {sidebarOpen && <ChurchLogo className="h-6 w-auto pl-2 object-contain" alt="" />}
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
      <div className="mt-auto flex flex-col py-3 px-3 gap-2">
        <Link
          to="/"
          className="w-full flex items-center justify-center py-3 rounded-lg bg-grey-2 text-grey-7 hover:bg-grey-3 hover:text-grey-10 transition-colors font-medium text-[14px] whitespace-nowrap overflow-hidden"
        >
          {sidebarOpen ? "나가기" : "←"}
        </Link>

        {switchTo && (
          <Link
            to={switchTo.to}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white hover:bg-blue-9 transition-colors font-medium text-[14px] whitespace-nowrap overflow-hidden"
          >
            {sidebarOpen ? switchTo.label : "⇄"}
          </Link>
        )}
      </div>
    </div>
  );
}
