import { useState } from "react";
import { Link } from "react-router";

const MENU_ITEMS = [
  {
    id: "intro",
    label: "교회소개",
    sub: "비전 · 섬기는 사람들 · 오시는 길",
    to: "/교회소개",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M12 2v4M10 4h4M3 22V9l9-4 9 4v13M9 22v-7h6v7" />
      </svg>
    ),
  },
  {
    id: "news",
    label: "행사 ∙ 소식",
    sub: "캘린더 · 갤러리 · 공지사항",
    to: "/교회행사",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M3 10v4h4l10 5V5L7 10H3zM18 8a4 4 0 0 1 0 8" />
      </svg>
    ),
  },
  {
    id: "bull",
    label: "스마트 주보",
    sub: "주보 · 예배순서 · 교회 소식",
    to: "/주보/목록",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h4M9 12h7M9 16h7M9 8h3" />
      </svg>
    ),
  },
  {
    id: "type",
    label: "성경 타자",
    sub: "필사 · 통독 · 랭킹",
    to: "/말씀/필사",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
      </svg>
    ),
  },
];

export default function MenuCards() {
  const [activeMenu, setActiveMenu] = useState("intro");

  return (
    <section className="w-full py-[100px] flex flex-col items-center">
      <div className="grid grid-cols-4 gap-6 w-full max-w-[950px]">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            onClick={() => setActiveMenu(item.id)}
            className={`group h-40 rounded-2xl border p-4 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-all duration-200 ${
              activeMenu === item.id
                ? "bg-primary border-primary text-white"
                : "bg-white border-bluegrey-2 hover:bg-primary hover:border-primary"
            }`}
          >
            <div className={`shrink-0 transition-colors pb-5 ${
              activeMenu === item.id ? "text-white" : "text-primary group-hover:text-white"
            }`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className={`text-body-2 font-bold tracking-[-0.4px] m-0 leading-tight transition-colors ${
                activeMenu === item.id ? "text-white" : "text-grey-12 group-hover:text-white"
              }`}>
                {item.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
