import { useChurch } from "@/contexts/ChurchContext";
import { JuboV1SectionBar, JuboV1RunningHeader } from "./shared.v1";

// 조모임 표 한 열에 보여줄 구역 수 — Figma 기준 한 열에 2~4개씩 묶어 가로로 배치한다.
const DISTRICTS_PER_COLUMN = 4;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function JuboV1Page2({ data }) {
  const { church } = useChurch();
  const sections = data?.sections;
  const news = sections?.news ?? [];
  const districts = sections?.districts ?? [];
  const offering = sections?.offering ?? [];
  const support = sections?.support ?? [];
  const districtColumns = chunk(districts, DISTRICTS_PER_COLUMN);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboV1RunningHeader church={church} dateLabel={data?.dateLabel} />

      <div className="flex-1 min-h-0 flex flex-col px-5 pt-3 pb-4 gap-3">
        <JuboV1SectionBar title={`${church.name} 소식`} />
        {news.length === 0 ? (
          <p className="flex-[3] min-h-0 flex items-center justify-center text-[10px] text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-[3] min-h-0 overflow-y-auto border border-blue-3 px-5 py-3">
            <div className="flex flex-col gap-2.5">
              {news.map((group, i) => (
                <div key={i} className="text-[10px]">
                  <p className="font-bold text-xs text-grey-12">
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
          </div>
        )}

        <JuboV1SectionBar title="조모임" />
        {districts.length === 0 ? (
          <p className="flex-1 min-h-0 flex items-center justify-center text-[10px] text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-1 min-h-0 flex gap-2">
            {districtColumns.map((col, i) => (
              <div key={i} className="flex-1 min-h-0 flex flex-col border border-blue-3 overflow-hidden">
                <div className="shrink-0 flex bg-blue-3 text-white text-[10px] font-bold text-center">
                  <span className="flex-1 py-1.5">조이름</span>
                  <span className="flex-1 py-1.5">조장</span>
                  <span className="flex-1 py-1.5">장소</span>
                </div>
                <div className="flex-1 flex flex-col">
                  {col.map(({ name, location, leader }) => (
                    <div
                      key={name}
                      className="flex-1 flex items-center border-b border-blue-2 last:border-b-0 text-[10px]"
                    >
                      <span className="flex-1 h-full flex items-center justify-center bg-blue-1 text-blue-5 font-bold text-center">
                        {name}
                      </span>
                      <span className="flex-1 text-center">{leader || "-"}</span>
                      <span className="flex-1 text-center">{location || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <JuboV1SectionBar title="헌 금" />
        <div className="flex-[2] min-h-0 overflow-y-auto border border-blue-3 px-5 py-3 flex flex-col gap-1 text-[10px]">
          <div className="flex flex-col gap-0.5 text-grey-10 font-bold">
            <p>* {church.profile?.offeringNote || "헌금은 교회 입구에 있는 헌금함에 직접 넣어주세요"}</p>
            {church.profile?.offeringAccountNumber && (
              <p>
                * 온라인 헌금 계좌안내 (예금주: {church.profile.offeringAccountHolder}) /{" "}
                {church.profile.offeringAccountNumber}({church.profile.offeringBankName})
              </p>
            )}
          </div>

          {offering.length > 0 && (
            <div className="flex flex-col divide-y divide-blue-2">
              {offering.map(({ title, items }) => (
                <div key={title} className="flex gap-3 py-1.5">
                  <span className="w-16 shrink-0 font-bold text-blue-5">{title}</span>
                  <span className="flex-1 text-grey-9">{items.join(" ")}</span>
                </div>
              ))}
            </div>
          )}

          {support.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {support.map(({ title, items }) => (
                <div key={title} className="flex gap-3">
                  <span className="w-16 shrink-0 font-bold">* {title}</span>
                  <span className="flex-1 text-grey-9">{items.join(" ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
