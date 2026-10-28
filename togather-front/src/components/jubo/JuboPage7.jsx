import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getSupport, getMinisters } from "@/services/juboService";
import { JuboBookHeader, JuboBookFooter, JuboSectionTitle, JuboGreyBox } from "./shared";

export default function JuboPage7({ data }) {
  const { church } = useChurch();
  const { data: support = [], loading: supportLoading } = useFetch(
    () => getSupport(church.id),
    [church.id],
    [],
  );
  const { data: ministers = [], loading: ministersLoading } = useFetch(
    () => getMinisters(church.id),
    [church.id],
    [],
  );

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="기타 안내" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 flex flex-col gap-4">
        <div>
          <JuboSectionTitle title="우리 교회가 돕고 있는 곳" />
          <JuboGreyBox>
            {supportLoading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : support.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="divide-y divide-grey-2 pr-8">
                {support.map(({ title, items }) => (
                  <div key={title} className="flex gap-4 py-4 text-sm">
                    <div className="font-bold text-grey-12 w-16 shrink-0">{title}</div>
                    <div className="flex-1 flex flex-wrap gap-x-3 gap-y-0.5 text-bluegrey-8">
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

        <div className="flex-1 min-h-0">
          <JuboSectionTitle title="섬기는 분들" />
          <JuboGreyBox>
            {ministersLoading ? (
              <p className="text-center text-xs text-grey-6 py-4">불러오는 중...</p>
            ) : ministers.length === 0 ? (
              <p className="text-center text-xs text-grey-6 py-4">정보 없음</p>
            ) : (
              <div className="divide-y divide-grey-2 pr-8">
                {ministers.map(({ title, items }) => (
                  <div key={title} className="flex gap-2 py-4 text-sm">
                    <div className="font-bold text-grey-12 w-16 shrink-0">{title}</div>
                    <div className="flex-1 flex flex-wrap font-light gap-x-4 gap-y-0.5 text-bluegrey-8">
                      {items.map((item) => {
                        const [role, name] = item.split("|").map((s) => s.trim());
                        if (!name) return <span key={item}>{role}</span>;
                        // 찬양팀만 "이름 | 역할"로, 나머지(교역자/장로 등)는 "이름(역할)"로 표기.
                        const label =
                          title === "찬양팀" ? `${name} | ${role}` : `${name}(${role})`;
                        return <span key={item}>{label}</span>;
                      })}
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
