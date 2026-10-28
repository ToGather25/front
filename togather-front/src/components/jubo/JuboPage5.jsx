import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getOffering, getPrayerTopics, getVolunteer } from "@/services/juboService";
import { JuboBookHeader, JuboBookFooter, JuboSectionTitle, JuboGreyBox } from "./shared";

export default function JuboPage5({ data }) {
  const { church } = useChurch();
  const { data: offering = [], loading: offeringLoading } = useFetch(
    () => getOffering(church.id),
    [church.id],
    [],
  );
  const { data: prayerTopics = [], loading: prayerLoading } = useFetch(
    () => getPrayerTopics(church.id),
    [church.id],
    [],
  );
  const { data: volunteer = [], loading: volunteerLoading } = useFetch(
    () => getVolunteer(church.id),
    [church.id],
    [],
  );

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="예물/기도 제목/다음주 봉사 안내" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 flex flex-col gap-4">
        <div>
          <JuboSectionTitle title="향기로운 예물" />
          <JuboGreyBox>
            {offeringLoading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : offering.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="space-y-4">
                {offering.map(({ title, items }) => (
                  <div key={title} className="flex gap-2 text-sm">
                    <div className="font-semibold text-grey-12 w-16 shrink-0">{title}</div>
                    <div className="flex-1 flex flex-wrap gap-x-6 gap-y-0.5 text-bluegrey-8 font-light">
                      {items.map((item, i) => (
                        <span key={i}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </JuboGreyBox>
        </div>

        <div>
          <JuboSectionTitle title="기도 제목" />
          <JuboGreyBox>
            {prayerLoading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : prayerTopics.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="space-y-1">
                {prayerTopics.map((item, i) => (
                  <div key={i} className="flex justify-between gap-2 text-sm">
                    <span className="text-grey-12">
                      ({i + 1}) {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-bluegrey-8 shrink-0">{item.subtitle}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </JuboGreyBox>
        </div>

        <div className="flex-1 min-h-0">
          <JuboSectionTitle title="다음주 봉사 안내" />
          <JuboGreyBox>
            {volunteerLoading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : volunteer.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="space-y-2">
                {volunteer.map(({ role, part1, part2 }, i) => (
                  <div key={role} className="flex gap-10 text-sm">
                    <div className="font-semibold text-grey-12 w-16 shrink-0">
                      {i + 1}. {role}
                    </div>
                    <div className="flex-1 text-bluegrey-8 font-light">
                      [1부] {part1}　[2부] {part2}
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
