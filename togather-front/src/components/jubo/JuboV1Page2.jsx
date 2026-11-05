import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNews, getDistricts, getOffering } from "@/services/juboService";
import { JuboV1SectionBar, JuboV1RunningHeader } from "./shared.v1";
import BubbleLoader from "@/components/common/BubbleLoader";

// 조모임 표 한 열에 보여줄 구역 수 — Figma 기준 한 열에 2~4개씩 묶어 가로로 배치한다.
const DISTRICTS_PER_COLUMN = 4;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function JuboV1Page2({ data }) {
  const { church } = useChurch();
  const { data: news = [], loading: newsLoading } = useFetch(
    () => getNews(church.id),
    [church.id],
    [],
  );
  const { data: districts = [], loading: districtsLoading } = useFetch(
    () => getDistricts(church.id),
    [church.id],
    [],
  );
  const { data: offering = [], loading: offeringLoading } = useFetch(
    () => getOffering(church.id),
    [church.id],
    [],
  );
  const districtColumns = chunk(districts, DISTRICTS_PER_COLUMN);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboV1RunningHeader church={church} dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <JuboV1SectionBar title="교회소식" />
        <div className="px-5 py-3 border border-t-0 border-blue-3">
          {newsLoading ? (
            <div className="flex justify-center py-4">
              <BubbleLoader size="sm" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {news.map((group, i) => (
                <div key={i} className="text-xs">
                  <p className="font-bold text-sm text-grey-12">
                    {i + 1}. {group.title}
                  </p>
                  {group.items.map((item, j) => (
                    <p key={j} className="text-grey-8">
                      {item}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3">
          <JuboV1SectionBar title="조모임" />
          <div className="px-5 py-3 flex gap-2">
            {districtsLoading ? (
              <div className="flex justify-center py-4 w-full">
                <BubbleLoader size="sm" />
              </div>
            ) : districts.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4 w-full">정보 없음</p>
            ) : (
              districtColumns.map((col, i) => (
                <div key={i} className="flex-1 border border-blue-3">
                  <div className="flex bg-blue-3 text-white text-[11px] font-bold text-center">
                    <span className="flex-1 py-1.5">조이름</span>
                    <span className="flex-1 py-1.5">조장</span>
                    <span className="flex-1 py-1.5">장소</span>
                  </div>
                  {col.map(({ name, location, leader }) => (
                    <div key={name} className="flex border-b border-blue-2 last:border-b-0 text-xs">
                      <span className="flex-1 bg-blue-1 text-blue-5 font-bold text-center py-1.5">
                        {name}
                      </span>
                      <span className="flex-1 text-center py-1.5">{leader || "-"}</span>
                      <span className="flex-1 text-center py-1.5">{location || "-"}</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-3">
          <JuboV1SectionBar title="헌 금" />
          <div className="px-5 py-3 border border-t-0 border-blue-3 flex flex-col gap-1.5 text-xs">
            {offeringLoading ? (
              <div className="flex justify-center py-4">
                <BubbleLoader size="sm" />
              </div>
            ) : offering.length === 0 ? (
              <p className="text-center text-grey-6 py-4">정보 없음</p>
            ) : (
              offering.map(({ title, items }) => (
                <div key={title} className="flex gap-3">
                  <span className="w-16 shrink-0 font-bold text-blue-5">{title}</span>
                  <span className="flex-1 text-grey-9">{items.join(" ")}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
