import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Offering() {
  const { offering } = juboConfig;
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        }
      >
        향기로운 예물
      </SectionTitle>
      <table className="w-full text-caption mt-1">
        {offering.map(({ title, items }) => (
          <tbody key={title}>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <td colSpan={2} className="py-2 px-4 font-semibold text-grey-8">
                {title}
              </td>
            </tr>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-7">{item}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </>
  );
}
