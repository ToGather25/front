import { useChurch } from "@/contexts/ChurchContext";
import { JuboV1SectionBar, JuboV1RunningHeader } from "./shared.v1";

/** 예배안내 표 한 열 — 역할/값 줄바꿈 리스트. */
function ServiceColumn({ label, order }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col border-r border-blue-3 last:border-r-0 min-w-0">
      <div className="shrink-0 bg-blue-3 text-white text-[10px] font-bold text-center py-2">{label}</div>
      {!order || order.length === 0 ? (
        <p className="flex-1 flex items-center justify-center text-[10px] text-grey-6">정보 없음</p>
      ) : (
        <div className="flex-1 flex flex-col">
          {order.map(({ role, name }, i) => (
            <div
              key={i}
              className="flex-1 flex items-center gap-2 border-b border-blue-2 last:border-b-0 px-2.5 text-[10px]"
            >
              <span className="w-10 shrink-0 font-bold text-blue-3">{role}</span>
              <span className="flex-1 whitespace-pre-line">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JuboV1Page3({ data }) {
  const { church } = useChurch();
  const sections = data?.sections;
  const sermon = sections?.sermonNote;
  const services = sections?.worshipServices ?? [];
  const orderMap = sections?.worshipOrder ?? {};

  // 대표 예배(JuboV1Page1에서 이미 보여준 1부/2부)를 뺀 나머지 예배 — 오후/금요 등.
  const mainLabels = services.slice(0, 2).map((s) => s.label);
  const otherServices = services.filter((s) => !mainLabels.includes(s.label));

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboV1RunningHeader church={church} dateLabel={data?.dateLabel} />

      <div className="flex-1 min-h-0 flex flex-col px-5 pt-3 pb-4 gap-3">
        <JuboV1SectionBar title="설교요약" />
        {!sermon?.title ? (
          <p className="flex-[2] min-h-0 flex items-center justify-center text-[10px] text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-[2] min-h-0 overflow-y-auto border border-blue-3 px-5 py-4 flex flex-col gap-3">
            <p className="text-center text-base font-black text-grey-12">{sermon.title}</p>
            {sermon.scripture && (
              <p className="text-center text-[10px] leading-relaxed text-grey-6 whitespace-pre-line">
                {sermon.scripture}
              </p>
            )}
            {sermon?.outline?.length > 0 && (
              <div className="flex flex-col gap-1 text-[10px]">
                <p className="font-bold text-blue-5">{"<나눔을 위한 질문>"}</p>
                {sermon.outline.map((q, i) => (
                  <div key={i} className="flex gap-1.5">
                    <span className="text-blue-5 font-bold">*</span>
                    <span className="flex-1">{q}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <JuboV1SectionBar title="예배안내" />
        {otherServices.length === 0 ? (
          <p className="flex-1 min-h-0 flex items-center justify-center text-[10px] text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-1 min-h-0 flex border border-blue-3 overflow-hidden">
            {otherServices.map((s) => (
              <ServiceColumn key={s.label} label={s.label} order={orderMap[s.label]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
