import { Link } from "react-router";
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Ministers() {
  const { ministers } = juboConfig;
  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      >
        섬기는 분들
      </SectionTitle>
      <div className="mt-5 flex flex-col gap-6">
        {ministers.map(({ title, items }) => (
          <div key={title}>
            <p className="text-caption font-bold text-grey-9 mb-2 px-1">{title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {items.map((item) => {
                const [role, name] = item.split("|").map((s) => s.trim());
                return (
                  <Link
                    key={item}
                    to="/교적부"
                    className="group flex items-center gap-2.5 p-3 rounded-xl border border-bluegrey-2 bg-white hover:border-primary hover:bg-blue-1 transition-all print:pointer-events-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-bluegrey-2 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                      <svg
                        className="w-4 h-4 text-grey-6 group-hover:text-primary transition-colors"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-grey-6 truncate mb-1">{role}</p>
                      <p className="text-caption font-semibold text-grey-10 group-hover:text-primary transition-colors truncate">
                        {name || role}
                      </p>
                    </div>
                    <svg
                      className="w-3.5 h-3.5 text-grey-4 group-hover:text-primary ml-auto shrink-0 transition-colors print:hidden"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
