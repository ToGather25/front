import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";

export default function JuboSection2() {
  const { church } = useChurch();
  const {
    data: services = [],
    loading: servicesLoading,
    error: servicesError,
  } = useFetch(() => getWorshipServices(church.id), [church.id], []);
  const {
    data: orderMap = {},
    loading: orderLoading,
    error: orderError,
  } = useFetch(() => getWorshipOrder(church.id), [church.id], {});

  const activeLabel = services[0]?.label ?? null;
  const order = activeLabel ? (orderMap[activeLabel] ?? []) : [];
  const loading = servicesLoading || orderLoading;
  const error = servicesError || orderError;

  return (
    <div className="flex flex-col gap-12 px-15 py-12">
      {/* 예배 안내 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">예배 안내</h3>
        </div>

        {loading ? (
          <p className="text-center text-body-4 text-grey-5 py-8">불러오는 중...</p>
        ) : error ? (
          <p className="text-center text-body-4 text-grey-5 py-8">예배 정보를 불러오지 못했습니다.</p>
        ) : order.length === 0 ? (
          <p className="text-center text-body-4 text-grey-5 py-8">예배 정보가 없습니다.</p>
        ) : (
          <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
            <div className="grid grid-cols-2 gap-x-25 gap-y-5">
              {order.map(({ role, name }, i) => (
                <div key={i} className="flex gap-5">
                  <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">{role}</div>
                  <div className="text-body-3 text-grey-8">{name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 이번주 소식 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">이번주 소식</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">소식 제목</div>
                <div className="text-body-3 text-grey-8">소식 내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
