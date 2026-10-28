import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";
import {
  JuboBookHeader,
  JuboBookFooter,
  JuboSectionTitle,
  JuboGreyBox,
  JuboOrderList,
  JuboWhiteTable,
} from "./shared";

export default function JuboPage2({ data }) {
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

  // 첫 번째 서비스(보통 "주일 오전예배")를 이 페이지의 대표 예배로 삼는다 — 나머지는 JuboPage3에서.
  const mainService = services[0];
  const mainOrder = mainService ? orderMap[mainService.label] : undefined;

  // 교회 설정(worshipSchedule)의 "N부 예배" 항목 수만큼 행을 만든다(예: 1부/2부).
  const parts = (church.worshipSchedule?.regular ?? []).filter((s) => s.name?.includes("부 예배"));

  // "대표기도"는 "기도" 역할 값이 "OOO목사 / OOO목사"처럼 "/"로 부별 담당자가 나뉜 문자열로
  // 들어있어 그걸 부 수만큼 쪼갠다. "설교"는 부별 구분이 없어 같은 값을 모든 부에 그대로 쓴다.
  // "사회"는 현재 백엔드에 없는 역할이지만, 추가되면 바로 채워지도록 똑같은 방식으로 찾아둔다 —
  // 값이 없으면(아직 미지원) splitByPart가 전부 "-"로 채운다.
  const findRole = (roleName) =>
    mainOrder?.find((r) => r.role?.replace(/\s/g, "") === roleName)?.name;
  const splitByPart = (value, count) => {
    if (!value) return Array(count).fill("-");
    const split = value.split("/").map((s) => s.trim());
    return split.length >= count ? split.slice(0, count) : Array(count).fill(split[0]);
  };
  const preacherByPart = splitByPart(findRole("설교"), parts.length);
  const leaderByPart = splitByPart(findRole("사회"), parts.length);
  const prayerByPart = splitByPart(findRole("기도"), parts.length);

  const summaryRows = parts.map((p, i) => {
    const label = p.name.match(/^\d+부/)?.[0] ?? p.name;
    const time = p.time?.replace(/^주일\s*/, ""); // "주일 오전 9시" → "오전 9시"
    return {
      part: time ? `${label}(${time})` : label,
      preacher: preacherByPart[i] ?? "-",
      leader: leaderByPart[i] ?? "-",
      prayer: prayerByPart[i] ?? "-",
    };
  });

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="예배 안내" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4">
        <JuboSectionTitle title={mainService?.label || "주일 예배"} />

        <JuboWhiteTable
          className="mb-3"
          rows={summaryRows}
          rowKey="part"
          columns={[
            { key: "part", header: "" },
            { key: "preacher", header: "설교" },
            { key: "leader", header: "사회" },
            { key: "prayer", header: "대표기도" },
          ]}
        />

        <JuboGreyBox>
          <JuboOrderList order={mainOrder} loading={loading} />
        </JuboGreyBox>
      </div>

      <JuboBookFooter church={church} />
    </div>
  );
}
