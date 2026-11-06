import { useChurch } from "@/contexts/ChurchContext";
import { JuboV1SectionBar, JuboV1Footer } from "./shared.v1";
import churchSermonBg from "@/assets/church_sermon.png";

/** 예배 순서표 한 열(1부/2부 등) — 왼쪽 라벨 칸 + 오른쪽 값 칸. */
function OrderColumn({ label, order }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col border border-blue-3 min-w-0">
      <div className="shrink-0 bg-blue-3 text-white text-[10px] font-bold text-center py-1.5">{label}</div>
      <div className="flex-1 flex flex-col">
        {(order ?? []).map(({ role, name }, i) => (
          <div key={i} className="flex-1 flex items-center border-b border-blue-2 last:border-b-0 text-[10px]">
            <div className="w-16 h-full shrink-0 bg-blue-1 text-grey-8 font-bold flex items-center justify-center text-center">
              {role}
            </div>
            <div className="flex-1 flex items-center justify-center text-center whitespace-pre-line px-1">
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JuboV1Page1({ data }) {
  const { church } = useChurch();
  const sections = data?.sections;
  const services = sections?.worshipServices ?? [];
  const orderMap = sections?.worshipOrder ?? {};
  const volunteer = sections?.volunteer ?? [];
  const sermon = sections?.sermonNote;
  const mainServices = services.slice(0, 2);

  const founded = church.history?.foundedDate || church.history?.foundedYear;

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 표지 배너 — 대비를 낮춘 흑백 예배 사진 위에 표어/말씀 */}
      <div className="relative h-[190px] shrink-0 overflow-hidden flex flex-col items-center justify-center text-center text-white px-6 py-4 gap-1.5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${churchSermonBg}')`, filter: "grayscale(100%) contrast(70%)" }}
        />
        <div className="absolute inset-0 bg-blue-10/50" />
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2 text-[10px] opacity-90">
          <span>{founded ? `SINCE ${founded}` : ""}</span>
          <span>{data?.dateLabel ? `주후 ${data.dateLabel}` : ""}</span>
        </div>
        <p className="relative text-[11px] tracking-widest opacity-80">
          {church.denomination} · {church.name}
        </p>
        <p
          className="relative text-3xl font-semibold whitespace-pre-line leading-snug"
          style={{ fontFamily: '"Gowun Batang", serif' }}
        >
          {sermon?.title || "설교 제목"}
        </p>
        <p className="relative -mt-2 text-[10px] leading-relaxed opacity-90 whitespace-pre-line">
          {sermon?.scripture || ""}
        </p>
        {church.slogan?.title && (
          <p className="relative text-[15px] font-semibold mt-1.5">
            {church.slogan.title}
          </p>
        )}
        {church.slogan?.scripture && (
          <p className="px-18 relative text-[11px] leading-relaxed opacity-90">
            {church.slogan.scripture}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-5 pt-3 pb-4 gap-3">
        <JuboV1SectionBar
          title="주일예배"
          right="하나님은 영이시니 예배하는 자가 영과 진리로 예배할지니라 (요4:24)"
        />
        {mainServices.length === 0 ? (
          <p className="flex-[8] min-h-0 flex items-center justify-center text-xs text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-[9] min-h-0 flex gap-2 overflow-hidden text-[10px]">
            {mainServices.map((s) => (
              <OrderColumn key={s.label} label={s.label} order={orderMap[s.label]} />
            ))}
          </div>
        )}
        <p className="shrink-0 text-[9px] text-grey-6">* 표는 일어서서</p>

        <JuboV1SectionBar title="다음주 예배위원" />
        {volunteer.length === 0 ? (
          <p className="flex-[1] min-h-0 flex items-center justify-center text-xs text-grey-6 border border-blue-3">
            정보 없음
          </p>
        ) : (
          <div className="flex-[1] min-h-0 overflow-hidden flex border border-blue-3 text-[11px]">
            {volunteer.map(({ role, part2 }) => (
              <div key={role} className="flex-1 flex flex-col border-r border-blue-2 last:border-r-0">
                <div className="shrink-0 bg-blue-1 text-grey-8 font-bold text-center py-1">{role}</div>
                <div className="flex-1 flex items-center justify-center text-center truncate px-0.5">
                  {part2 || "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <JuboV1Footer church={church} />
    </div>
  );
}
