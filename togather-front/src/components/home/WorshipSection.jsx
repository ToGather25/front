import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import SectionTitle from "@/components/common/SectionTitle";

function ScheduleRow({ name, time }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-body-2 font-semibold text-grey-11 shrink-0 w-28">{name}</span>
      <div className="flex-1 border-t border-dashed border-bluegrey-3" />
      <span className="text-body-3 text-grey-7 shrink-0">{time}</span>
    </div>
  );
}

export default function WorshipSection() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;
  const mid = Math.ceil(regular.length / 2);
  const left = regular.slice(0, mid);
  const right = regular.slice(mid);
  const deptMid = Math.ceil(departments.length / 2);
  const deptLeft = departments.slice(0, deptMid);
  const deptRight = departments.slice(deptMid);

  return (
    <Section className="py-12 bg-white">
      <SectionTitle className="sr-only">예배 안내 & 예배 영상</SectionTitle>
      <div className="flex gap-6 items-start">
        {/* 예배 안내 카드 */}
        <div className="flex-1 border border-bluegrey-2 rounded-2xl p-8 flex flex-col gap-7 bg-white">
          <h3 className="text-sub-tit-2 font-bold text-grey-12">예배 안내</h3>

          {/* 정기 예배 */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-3 flex-1">
              {left.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {right.map((s) => <ScheduleRow key={s.name} {...s} />)}
            </div>
          </div>

          <hr className="border-t border-bluegrey-2" />

          {/* 부서 예배 */}
          <div>
            <p className="text-body-4 font-medium text-grey-7 mb-3">부서 예배</p>
            <div className="flex gap-10">
              <div className="flex flex-col gap-3 flex-1">
                {deptLeft.map((s) => <ScheduleRow key={s.name} {...s} />)}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {deptRight.map((s) => <ScheduleRow key={s.name} {...s} />)}
              </div>
            </div>
          </div>
        </div>

        {/* 예배 영상 카드 */}
        <div className="w-[380px] border border-bluegrey-2 rounded-2xl p-6 flex flex-col gap-4 bg-white">
          <h3 className="text-sub-tit-2 font-bold text-grey-12">예배 영상</h3>
          <div className="relative w-full aspect-video bg-bluegrey-2 rounded-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 shadow-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <span className="absolute top-2.5 right-2.5 bg-red-50 border border-red-300 text-red-500 text-btn-xs font-semibold px-2 py-0.5 rounded">
              LIVE
            </span>
          </div>
          <p className="text-body-4 text-grey-6 text-center">최근 예배 영상이 여기에 표시됩니다</p>
        </div>
      </div>
    </Section>
  );
}
