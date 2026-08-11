import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Support() {
  const { support } = juboConfig;
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
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        }
      >
        우리 교회가 돕고 있는 곳
      </SectionTitle>
      <table className="w-full text-body-4 mt-1 border-collapse">
        <thead>
          <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
            <th className="py-3 px-6 text-grey-7 font-semibold text-center">기관</th>
            <th className="py-3 px-6 text-grey-7 font-semibold text-center">대상</th>
            <th className="py-3 px-6 text-grey-7 font-semibold text-center">후원구역</th>
          </tr>
        </thead>
        <tbody>
          {support.map(({ organization, target, region }, i) => (
            <tr key={i} className="border-b border-grey-3 last:border-b-0">
              <td className="py-5 px-6 text-grey-9 text-center">{organization}</td>
              <td className="py-5 px-6 text-grey-7 text-center">{target}</td>
              <td className="py-5 px-6 text-grey-7 text-center">{region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
