import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import {
  getWorshipServices,
  getWorshipOrder,
  getVolunteer,
  getSermonNote,
} from "@/services/juboService";
import { JuboV1SectionBar, JuboV1Footer } from "./shared.v1";
import BubbleLoader from "@/components/common/BubbleLoader";
import churchSermonBg from "@/assets/church_sermon.png";

/** 예배 순서표 한 열(1부/2부 등) — 왼쪽 라벨 칸 + 오른쪽 값 칸. */
function OrderColumn({ label, order }) {
  return (
    <div className="flex-1 border border-blue-3 min-w-0">
      <div className="bg-blue-3 text-white text-xs font-bold text-center py-1.5">{label}</div>
      {(order ?? []).map(({ role, name }, i) => (
        <div key={i} className="flex border-b border-blue-2 last:border-b-0 text-xs">
          <div className="w-16 shrink-0 bg-blue-1 text-grey-8 font-bold flex items-center justify-center py-1.5 text-center">
            {role}
          </div>
          <div className="flex-1 flex items-center justify-center py-1.5 text-center whitespace-pre-line px-1">
            {name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JuboV1Page1() {
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
  const { data: volunteer = [], loading: volunteerLoading } = useFetch(
    () => getVolunteer(church.id),
    [church.id],
    [],
  );
  const { data: sermon } = useFetch(() => getSermonNote(church.id), [church.id], null);
  const loading = servicesLoading || orderLoading;
  const mainServices = services.slice(0, 2);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 표지 배너 — 대비를 낮춘 흑백 예배 사진 위에 표어/말씀 */}
      <div className="relative h-[240px] shrink-0 overflow-hidden flex flex-col items-center justify-center text-center text-white px-6 py-4 gap-1.5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${churchSermonBg}')`, filter: "grayscale(100%) contrast(70%)" }}
        />
        <div className="absolute inset-0 bg-blue-10/50" />
        <p className="relative text-[11px] tracking-widest opacity-80">
          {church.denomination} · {church.name}
        </p>
        <p className="relative text-xl font-bold">{sermon?.title || ""}</p>
        {sermon?.scripture && (
          <p className="relative text-xs leading-relaxed opacity-90 max-w-[480px] whitespace-pre-line">
            {sermon.scripture}
          </p>
        )}
        {church.slogan?.title && (
          <p
          className="relative text-2xl font-semibold whitespace-pre-line mt-1.5 leading-snug"
          style={{ fontFamily: '"Gowun Batang", serif' }}
          >
            {church.slogan.title}
          </p>
        )}
        {church.mainBanner?.subtitle && (
          <p className="w-2/3 relative text-[11px] opacity-90">{church.mainBanner.subtitle}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <JuboV1SectionBar
          title="주일예배"
          right="하나님은 영이시니 예배하는 자가 영과 진리로 예배할지니라 (요4:24)"
        />
        <div className="px-5 pt-3 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <BubbleLoader size="sm" />
            </div>
          ) : mainServices.length === 0 ? (
            <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
          ) : (
            <div className="flex gap-2">
              {mainServices.map((s) => (
                <OrderColumn key={s.label} label={s.label} order={orderMap[s.label]} />
              ))}
            </div>
          )}

          <div>
            <JuboV1SectionBar title="다음주 예배위원" />
            {volunteerLoading ? (
              <div className="flex justify-center py-4">
                <BubbleLoader size="sm" />
              </div>
            ) : volunteer.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4 border border-t-0 border-blue-3">
                정보 없음
              </p>
            ) : (
              <div className="flex border border-t-0 border-blue-3 text-xs">
                {volunteer.map(({ role, part2 }) => (
                  <div key={role} className="flex-1 border-r border-blue-2 last:border-r-0">
                    <div className="bg-blue-1 text-grey-8 font-bold text-center py-1.5">{role}</div>
                    <div className="text-center py-1.5">{part2 || "-"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <JuboV1Footer church={church} />
    </div>
  );
}
