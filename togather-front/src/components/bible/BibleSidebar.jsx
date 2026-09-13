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
  // 모바일 폭에서는 sidebarOpen 값과 무관하게 항상 아이콘 레일(w-14)로 고정한다 —
  // 펼친 상태(w-56)를 기본값으로 두면 좁은 화면에서 본문이 보일 자리가 없어진다.
  // md 이상에서만 sidebarOpen 토글이 실제 너비 차이를 만든다.
  return (
    <div
      className={`bg-grey-1 border-r border-bluegrey-2 flex flex-col transition-all duration-300 overflow-hidden w-14 ${
        sidebarOpen ? "md:w-56" : "md:w-14"
      }`}
    >
      {/* 헤더 — 로고 + 햄버거. 모바일에서는 토글 버튼이 아예 안 보이니 이 줄
          전체를 차지할 이유가 없다 — md 이상에서만 표시하고, 모바일에서는
          그 공간만큼 메뉴 아이콘들이 위로 당겨진다. */}
      <div
        className={`hidden md:flex items-center h-[60px] shrink-0 border-b border-bluegrey-2 justify-center ${
          sidebarOpen ? "md:justify-between md:pl-3 md:pr-3" : ""
        }`}
      >
        {sidebarOpen && (
          <ChurchLogo className="hidden md:block h-6 w-auto pl-2 object-contain" alt="" />
        )}
        {/* 모바일에서는 사이드바 폭이 항상 아이콘 레일로 고정돼 토글이 아무 효과가
            없다 — 눌러도 아무 일도 안 일어나는 버튼을 보이지 않게 한다. */}
        <button
          onClick={onToggle}
          className="hidden md:flex w-8 h-8 flex-col items-center justify-center gap-[5px] shrink-0 text-grey-6 hover:text-grey-9"
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
            className={`flex items-center justify-center py-3 text-body-3 transition-colors ${
              sidebarOpen ? "md:justify-start md:gap-3 md:px-4" : "md:justify-center md:px-0"
            } ${
              activeMenu === menu
                ? "bg-grey-3 text-grey-11 font-semibold"
                : "text-grey-8 hover:bg-bluegrey-1"
            }`}
          >
            {menuIcons[menu]}
            {sidebarOpen && <span className="hidden md:inline">{menu}</span>}
          </button>
        ))}
      </nav>

      {/* 하단 — 나가기 + 전환 버튼. 모바일은 아이콘 레일 폭이라 텍스트가 잘려
          보이므로 아이콘만, md 이상 펼친 상태에서만 라벨 텍스트를 같이 보여준다. */}
      <div className="mt-auto flex flex-col py-3 px-3 gap-2">
        <Link
          to="/"
          className="w-full flex items-center justify-center md:gap-2 py-3 rounded-lg bg-grey-2 text-grey-7 hover:bg-grey-3 hover:text-grey-10 transition-colors font-medium text-[14px] whitespace-nowrap overflow-hidden"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          {sidebarOpen && <span className="hidden md:inline">나가기</span>}
        </Link>

        {switchTo && (
          <Link
            to={switchTo.to}
            className="w-full flex items-center justify-center md:gap-2 py-3 rounded-lg bg-primary text-white hover:bg-blue-9 transition-colors font-medium text-[14px] whitespace-nowrap overflow-hidden"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"
              />
            </svg>
            {sidebarOpen && <span className="hidden md:inline">{switchTo.label}</span>}
          </Link>
        )}
      </div>
    </div>
  );
}
