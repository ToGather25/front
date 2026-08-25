import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getOffering } from "@/services/juboService";
import { SectionTitle } from "./shared";

export default function Offering() {
  const { church } = useChurch();
  const {
    data: offering = [],
    loading,
    error,
    refetch,
  } = useFetch(() => getOffering(church.id), [church.id], []);

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
      {loading ? (
        <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-caption text-grey-5 mb-2">예물 안내를 불러오지 못했습니다.</p>
          <button onClick={refetch} className="text-caption text-primary underline">
            다시 시도
          </button>
        </div>
      ) : (
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
      )}
    </>
  );
}
