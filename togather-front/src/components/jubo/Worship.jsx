import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";

export default function Worship() {
  const { church } = useChurch();
  const { data: services = [], loading: servicesLoading } = useFetch(
    () => getWorshipServices(church.id),
    [church.id],
    [],
  );
  const { data: orderMap = {}, loading: orderLoading } = useFetch(
    () => getWorshipOrder(church.id),
    [church.id],
    {},
  );
  const [selected, setSelected] = useState(null);

  const activeLabel = selected ?? services[0]?.label ?? null;
  const order = activeLabel ? (orderMap[activeLabel] ?? []) : [];
  const loading = servicesLoading || orderLoading;

  return (
    <div className="flex flex-col md:flex-row border border-bluegrey-2 rounded-xl overflow-hidden">
      {/* 사이드바 */}
      <div className="md:w-36 md:shrink-0 border-b md:border-b-0 md:border-r border-bluegrey-2 bg-bluegrey-1 py-3 flex md:flex-col overflow-x-auto">
        {services.map(({ label }) => (
          <button
            key={label}
            onClick={() => setSelected(label)}
            className={`w-full text-left px-3 py-2 text-caption transition-colors shrink-0 ${
              activeLabel === label
                ? "bg-primary text-white font-semibold"
                : "text-grey-9 hover:bg-bluegrey-2 font-medium"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 예배 순서 */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex items-baseline gap-2 mb-5">
          <h3 className="text-body-2 font-bold text-grey-11">예배 순서</h3>
          {activeLabel && <p className="text-body-5 text-grey-6">{activeLabel}</p>}
        </div>
        <div className="border-t border-grey-11 mb-1" />
        {loading ? (
          <p className="text-center text-caption text-grey-5 py-10">불러오는 중...</p>
        ) : order.length === 0 ? (
          <p className="text-center text-caption text-grey-5 py-10">예배 순서가 없습니다.</p>
        ) : (
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-bluegrey-2">
                <th className="text-left py-2.5 px-3 text-grey-7 font-semibold w-1/3">역할</th>
                <th className="py-2.5 px-3 text-grey-7 font-semibold text-center">담당자</th>
              </tr>
            </thead>
            <tbody>
              {order.map(({ role, name }, i) => (
                <tr key={i} className="border-b border-grey-3">
                  <td className="py-3 px-3 text-grey-9 font-medium tracking-widest">{role}</td>
                  <td className="py-3 px-3 text-grey-7 text-center whitespace-pre-line">{name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 예배 및 모임 안내 */}
      <div className="md:w-44 md:shrink-0 border-t md:border-t-0 md:border-l border-bluegrey-2 p-4 md:p-5">
        <h4 className="text-body-5 font-bold text-grey-10 mb-4">예배 및 모임 안내</h4>
        {services.map(({ label, time }) => (
          <div
            key={label}
            className="flex justify-between items-start py-2.5 border-b border-grey-3 last:border-0"
          >
            <span className="text-caption text-grey-8 leading-snug">{label}</span>
            <span className="text-caption text-grey-10 font-semibold text-right leading-snug">
              {time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
