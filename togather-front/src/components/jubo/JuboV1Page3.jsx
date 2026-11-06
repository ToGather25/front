import { useChurch } from "@/contexts/ChurchContext";
import { JuboV1SectionBar, JuboV1RunningHeader } from "./shared.v1";

/** 예배안내 표 한 열 — 역할/값 줄바꿈 리스트. */
function ServiceColumn({ label, order }) {
  return (
    <div className="flex-1 border-r border-blue-3 last:border-r-0 min-w-0">
      <div className="bg-blue-3 text-white text-xs font-bold text-center py-2">{label}</div>
      {(order ?? []).map(({ role, name }, i) => (
        <div key={i} className="flex gap-2 border-b border-blue-2 px-2.5 py-1.5 text-xs">
          <span className="w-10 shrink-0 font-bold text-blue-3">{role}</span>
          <span className="flex-1 whitespace-pre-line">{name}</span>
        </div>
      ))}
      {(!order || order.length === 0) && (
        <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
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

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <JuboV1SectionBar title="설교요약" />
        <div className="px-5 py-4 border border-t-0 border-blue-3 flex flex-col gap-3">
          {!sermon?.title ? (
            <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
          ) : (
            <>
              <p className="text-center text-lg font-black text-grey-12">{sermon.title}</p>
              {sermon.scripture && (
                <p className="text-center text-xs leading-relaxed text-grey-6 whitespace-pre-line">
                  {sermon.scripture}
                </p>
              )}
              {sermon?.outline?.length > 0 && (
                <div className="flex flex-col gap-1 text-xs">
                  <p className="font-bold text-blue-5">{"<나눔을 위한 질문>"}</p>
                  {sermon.outline.map((q, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="text-blue-5 font-bold">*</span>
                      <span className="flex-1">{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-3 flex-1 flex flex-col min-h-0">
          <JuboV1SectionBar title="예배안내" />
          {otherServices.length === 0 ? (
            <p className="text-center text-xs text-grey-6 py-4 border border-t-0 border-blue-3">
              정보 없음
            </p>
          ) : (
            <div className="flex border border-t-0 border-blue-3">
              {otherServices.map((s) => (
                <ServiceColumn key={s.label} label={s.label} order={orderMap[s.label]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
