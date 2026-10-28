import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";
import {
  JuboBookHeader,
  JuboBookFooter,
  JuboSectionTitle,
  JuboGreyBox,
  JuboOrderList,
} from "./shared";

export default function JuboPage3({ data }) {
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
  const loading = servicesLoading || orderLoading;

  // 대표 예배(JuboPage2)와 새벽기도회(JuboPage4)를 제외한 나머지 예배(오후예배/수요기도회 등).
  const mainLabel = services[0]?.label;
  const otherServices = services.filter(
    (s) => s.label !== mainLabel && !s.label?.includes("새벽"),
  );

  // "설교"는 예배에 따라 "말씀"으로 불리기도 해서 둘 다 확인한다. "사회"는 현재 백엔드에
  // 없는 역할이지만, 추가되면 바로 채워지도록 똑같이 찾아둔다 — 없으면 "-".
  const clean = (r) => r?.replace(/\s/g, "");
  const findPreacher = (order) =>
    order?.find((r) => clean(r.role) === "설교" || clean(r.role) === "말씀")?.name ?? "-";
  const findLeader = (order) => order?.find((r) => clean(r.role) === "사회")?.name ?? "-";

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="예배 안내" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 flex flex-col gap-4">
        {!loading && otherServices.length === 0 ? (
          <p className="text-center text-xs text-grey-6 py-8">정보 없음</p>
        ) : (
          otherServices.map((s) => {
            const order = orderMap[s.label];
            return (
              <div key={s.label}>
                <JuboSectionTitle
                  title={s.label}
                  right={`사회: ${findLeader(order)} · 설교: ${findPreacher(order)}`}
                />
                <JuboGreyBox>
                  <JuboOrderList order={order} loading={loading} />
                </JuboGreyBox>
              </div>
            );
          })
        )}
      </div>

      <JuboBookFooter church={church} />
    </div>
  );
}
