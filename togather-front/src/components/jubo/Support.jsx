import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getSupport } from "@/services/juboService";
import { SectionTitle } from "./shared";
import BubbleLoader from "@/components/common/BubbleLoader";

export default function Support() {
  const { church } = useChurch();
  const {
    data: support = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getSupport(church.id), [church.id], []);

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
      {loading ? (
        <div className="flex justify-center py-10">
          <BubbleLoader size="sm" />
        </div>
      ) : error?.response?.status === 404 ? (
        <p className="text-center text-caption text-grey-5 py-10">아직 발행된 주보가 없습니다.</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">후원 안내를 불러오지 못했습니다.</p>
        </div>
      ) : Array.isArray(support) && support.length > 0 ? (
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-3">
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">기관</th>
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">대상</th>
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">후원구역</th>
            </tr>
          </thead>
          <tbody>
            {support.map(({ organization, target, region }, i) => (
              <tr key={i} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-7">{organization}</td>
                <td className="py-3 px-4 text-grey-7">{target}</td>
                <td className="py-3 px-4 text-grey-7">{region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-caption text-grey-5 py-10">후원 기관 정보를 불러올 수 없습니다.</p>
      )}
    </>
  );
}
