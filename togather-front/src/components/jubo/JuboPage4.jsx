import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipOrder, getNews } from "@/services/juboService";
import {
  JuboBookHeader,
  JuboBookFooter,
  JuboSectionTitle,
  JuboGreyBox,
  JuboWhiteTable,
} from "./shared";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토"];

export default function JuboPage4({ data }) {
  const { church } = useChurch();
  const { data: orderMap = {}, loading: orderLoading } = useFetch(
    () => getWorshipOrder(church.id),
    [church.id],
    {},
  );
  const { data: news = [], loading: newsLoading } = useFetch(
    () => getNews(church.id),
    [church.id],
    [],
  );

  const dawnPrayerOrder = orderMap["새벽기도회"];
  const findDawnRole = (roleName) =>
    dawnPrayerOrder?.find((r) => r.role?.replace(/\s/g, "") === roleName)?.name ?? "-";

  // 백엔드엔 요일별 데이터가 없어 "새벽기도회" 하나의 값(찬송/기도)을 모든 요일에 동일하게
  // 보여준다 — 요일별로 달라지는 값이 생기면 이 자리만 바꾸면 된다. "본문"은 매칭되는
  // 역할 자체가 없어 전부 "-".
  const dawnHymn = findDawnRole("찬송");
  const dawnLeader = findDawnRole("기도");
  const dawnRows = [
    { label: "찬송", ...Object.fromEntries(WEEKDAYS.map((d) => [d, dawnHymn])) },
    { label: "본문", ...Object.fromEntries(WEEKDAYS.map((d) => [d, "-"])) },
    { label: "인도", ...Object.fromEntries(WEEKDAYS.map((d) => [d, dawnLeader])) },
  ];
  const dawnColumns = [
    { key: "label", header: "요일", headerClassName: "py-1.5 px-2 text-grey-7 text-center" },
    ...WEEKDAYS.map((d) => ({ key: d, header: d })),
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="예배 안내 및 교회 소식" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 flex flex-col gap-4">
        <div>
          <JuboSectionTitle title="새벽기도회" />
          {orderLoading ? (
            <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
          ) : (
            <JuboWhiteTable rows={dawnRows} rowKey="label" columns={dawnColumns} />
          )}
        </div>

        <div className="flex-1 min-h-0">
          <JuboSectionTitle title="교회 소식" />
          <JuboGreyBox>
            {newsLoading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : news.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="space-y-2.5">
                {news.map((group, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <div className="font-semibold text-grey-12 shrink-0">
                      {i + 1}. {group.title}
                    </div>
                    <div className="text-bluegrey-8 space-y-0.5">
                      {group.items.map((item, j) => (
                        <p key={j}>{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </JuboGreyBox>
        </div>
      </div>

      <JuboBookFooter church={church} />
    </div>
  );
}
