import { useChurch } from "@/contexts/ChurchContext";

function Section({ title, items }) {
  // 1-4개: 1개 표, 5개 이상: 3개씩 그룹화
  const tables = [];
  if (items.length <= 4) {
    tables.push(items);
  } else {
    for (let i = 0; i < items.length; i += 3) {
      tables.push(items.slice(i, i + 3));
    }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-primary rounded-sm" />
        <h2 className="text-sub-tit-2 font-bold text-grey-11">{title}</h2>
      </div>
      <div className="space-y-6">
        {tables.map((tableItems, tableIdx) => (
          <table key={tableIdx} className="w-full border-t border-bluegrey-3">
            <thead>
              <tr className="border-b border-bluegrey-3 bg-grey-1">
                {tableItems.map((item) => (
                  <th key={item.name} className="px-4 py-4 text-body-2 font-bold text-grey-11 text-center">{item.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-bluegrey-3">
                {tableItems.map((item) => (
                  <td key={item.name} className="px-4 py-3 text-body-4 text-grey-6 text-center">{item.time} | {item.location}</td>
                ))}
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}

export default function WorshipInfo() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;

  // 주일 예배 (1부, 2부, 오후, 주일 학교 예배)
  const sundayWorship = regular.slice(0, 4);

  // 평일 예배 (수요, 금요, 새벽)
  const weekdayWorship = regular.slice(4);

  return (
    <div className="space-y-8">
      <Section title="주일 예배" items={sundayWorship} />
      <Section title="평일 예배 및 기도회" items={weekdayWorship} />
      <Section title="주일 학교" items={departments} />
    </div>
  );
}
