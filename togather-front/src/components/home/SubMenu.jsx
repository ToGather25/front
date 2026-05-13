import { Link } from "react-router";

const MENU_ITEMS = [
  {
    id: "intro",
    label: "교회소개",
    sub: "비전 · 섬기는 사람들 · 오시는 길",
    to: "/교회소개",
    accent: "#3d5588",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 2v4M10 4h4M3 22V9l9-4 9 4v13M9 22v-7h6v7" />
      </svg>
    ),
  },
  {
    id: "news",
    label: "행사 ∙ 소식",
    sub: "캘린더 · 갤러리 · 공지사항",
    to: "/교회행사",
    accent: "#ff961b",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M3 10v4h4l10 5V5L7 10H3zM18 8a4 4 0 0 1 0 8" />
      </svg>
    ),
  },
  {
    id: "bull",
    label: "스마트 주보",
    sub: "주보 · 예배순서 · 교회 소식",
    to: "/주보",
    accent: "#2098f3",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h4M9 12h7M9 16h7M9 8h3" />
      </svg>
    ),
  },
  {
    id: "type",
    label: "성경 타자",
    sub: "필사 · 통독 · 랭킹",
    to: "/말씀",
    accent: "#00ba34",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
      </svg>
    ),
  },
];

export default function SubMenu() {
  return (
    <section className="w-full bg-bluegrey-1 py-[100px]">
      <div className="max-w-[1576px] mx-auto px-4">
        {/* Section head */}
        <div className="mb-8">
          <p className="text-[13px] font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
            SHORTCUTS
          </p>
          <h3 className="text-[44px] font-bold tracking-[-1.2px] text-grey-12 m-0">
            바로가기 메뉴
          </h3>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-6">
          {MENU_ITEMS.map((item, i) => (
            <Link
              key={item.id}
              to={item.to}
              className="group bg-white rounded-[20px] border border-bluegrey-2 p-7 flex items-center gap-5 hover:-translate-y-1 hover:border-blue-3 transition-all duration-200"
              style={{ boxShadow: "0 6px 6px 0 rgba(0,0,0,.06)" }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white"
                style={{ background: item.accent }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[18px] font-bold text-grey-12 tracking-[-0.4px] m-0 leading-tight">
                  {item.label}
                </p>
                <p className="text-[13px] text-grey-6 mt-1.5 m-0 leading-snug">
                  {item.sub}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="w-5 h-5 text-grey-4 shrink-0 group-hover:text-blue-6 group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
