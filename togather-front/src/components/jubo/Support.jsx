import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getSupport } from "@/services/juboService";
import { SectionTitle } from "./shared";

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
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">후원 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
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
      )}
    </>
  );
}
