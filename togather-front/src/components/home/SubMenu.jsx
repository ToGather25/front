import { Link } from "react-router";

const SUB_MENU_ITEMS = [
  {
    label: "교회소개",
    to: "/교회소개",
    icon: (
      <svg className="w-7 h-7 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: "행사·소식",
    to: "/교회행사",
    icon: (
      <svg className="w-7 h-7 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: "스마트 주보",
    to: "/주보",
    icon: (
      <svg className="w-7 h-7 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "성경 타자",
    to: "/말씀",
    icon: (
      <svg className="w-7 h-7 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

export default function SubMenu() {
  return (
    <section className="w-full bg-bluegrey-1 py-10">
      <div className="max-w-[1576px] mx-auto px-4">
        <div className="grid grid-cols-4 gap-4">
          {SUB_MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white rounded-2xl shadow-sm border border-bluegrey-2 flex flex-col items-center justify-center gap-4 py-8 px-6 hover:shadow-md hover:border-blue-3 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-1 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-sub-tit-4 font-semibold text-grey-11 tracking-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
