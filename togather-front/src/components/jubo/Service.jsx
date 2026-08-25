import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getVolunteer } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function Service() {
  const { church } = useChurch();
  const {
    data: serviceRoles = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getVolunteer(church.id), [church.id], []);

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
        다음 주 봉사 안내
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">봉사 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="text-left py-2 px-4 text-grey-7 font-semibold">구분</th>
              <th className="text-center py-2 px-4 text-grey-7 font-semibold">1부</th>
              <th className="text-center py-2 px-4 text-grey-7 font-semibold">2부</th>
            </tr>
          </thead>
          <tbody>
            {serviceRoles.map(({ role, part1, part2 }) => (
              <tr key={role} className="border-b border-grey-3">
                <td className="py-3 px-4 text-grey-8">{role}</td>
                <td className="py-3 px-4 text-center text-grey-9">{part1}</td>
                <td className="py-3 px-4 text-center text-grey-9">{part2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
