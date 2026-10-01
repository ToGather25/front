import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import BubbleLoader from "@/components/common/BubbleLoader";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";
import logo from "@/assets/icons/옥길교회_logo.png";

export default function JuboPage2({ data }) {
  const { church } = useChurch();
  const {
    data: services = [],
    loading: servicesLoading,
  } = useFetch(() => getWorshipServices(church.id), [church.id], []);
  const {
    data: orderMap = {},
    loading: orderLoading,
  } = useFetch(() => getWorshipOrder(church.id), [church.id], {});

  const activeLabel = services[0]?.label ?? null;
  const order = activeLabel ? (orderMap[activeLabel] ?? []) : [];
  const loading = servicesLoading || orderLoading;

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <div className="flex items-stretch">
        <div className="flex-3 bg-primary text-white px-4 py-2">
          <h2 className="text-sm font-bold">예배 및 소식</h2>
        </div>
        <div className="flex-1 bg-blue-3 text-white px-4 py-2 flex items-center justify-center">
          <span className="text-xs">{data?.dateLabel || ""}</span>
        </div>
      </div>
      {/* 상단: 예배 시간 + 부분 예배 안내 (높이 제한) */}
      <div className="flex-2 px-6 pt-6 overflow-y-auto min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-primary rounded" />
          <h3 className="text-sm font-bold text-grey-12">예배 안내</h3>
        </div>

        <div className="bg-grey-1 rounded-2 px-3 py-2 min-h-[470px] flex flex-col justify-center">
          {/* 부분 예배 안내 */}
          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center w-full">
                <BubbleLoader size="xs" />
              </div>
            ) : order.length === 0 ? (
              <p className="text-center text-xs text-grey-6">정보 없음</p>
            ) : (
              order.map(({ role, name }, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <div className="font-bold text-grey-12 min-w-fit">{role}</div>
                  <div className="text-grey-8">{name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 하단: 예배 순서 (남은 공간 차지) */}
      <div className="flex-1 px-6 pt-3 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-primary rounded" />
            <h3 className="text-sm font-bold text-grey-12">이번주 소식</h3>
          </div>

          <div className="bg-grey-1 rounded-2 px-3 py-2 min-h-[180px] flex items-center">
            {loading ? (
              <div className="flex justify-center w-full">
                <BubbleLoader size="sm" />
              </div>
            ) : order.length === 0 ? (
              <p className="text-center text-xs text-grey-6 w-full">정보 없음</p>
            ) : (
              <div className="w-full grid grid-cols-2 gap-1 gap-y-0.5">
                {order.map(({ role, name }, i) => (
                  <div key={i} className="flex gap-1 text-xs">
                    <div className="font-semibold text-grey-12 w-14 shrink-0">{role}</div>
                    <div className="text-grey-8 truncate text-xs">{name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 로고 */}
        <div className="shrink-0 flex justify-center pb-4 pt-2">
          <img src={church.logoUrl || logo} alt={church.name} className="h-6" />
        </div>
      </div>
    </div>
  );
}
