import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function News() {
  const { news } = juboConfig;
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z"
            />
          </svg>
        }
      >
        교회 소식
      </SectionTitle>
      <table className="w-full text-caption mt-1">
        {news.map((section, i) => (
          <tbody key={i}>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <td colSpan={2} className="py-2 px-4 font-semibold text-grey-8">
                {i + 1}. {section.title}
              </td>
            </tr>
            {section.items.map((item, j) => (
              <tr key={j} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-9 w-48">{item}</td>
                <td className="py-3 px-4 text-grey-6">내용을 입력하세요.</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </>
  );
}
