import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getDistricts } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function District() {
  const { church } = useChurch();
  const {
    data: districts = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getDistricts(church.id), [church.id], []);

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
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        }
      >
        구역 모임
      </SectionTitle>
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">구역 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
        <table className="w-full text-caption mt-1">
          <thead>
            <tr className="bg-bluegrey-1 border-t border-b border-bluegrey-2">
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">구역</th>
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">모임 장소</th>
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">모임 시간</th>
              <th className="py-2 px-4 text-grey-7 font-semibold text-center">구역장</th>
            </tr>
          </thead>
          <tbody>
            {districts.map(({ name, location, time, leader }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-4 px-4 text-grey-9 font-semibold text-center">{name}</td>
                <td className="py-4 px-4 text-grey-7 text-center">{location}</td>
                <td className="py-4 px-4 text-grey-7 text-center">{time}</td>
                <td className="py-4 px-4 text-grey-7 text-center">{leader}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
