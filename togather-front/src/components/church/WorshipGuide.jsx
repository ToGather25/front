import { useChurch } from "@/contexts/ChurchContext";

function Card({ name, time, location }) {
  return (
    <div className="bg-bluegrey-1 rounded-lg p-5 text-center flex flex-col justify-start">
      <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">{name}</h3>
      <p className="text-body-4 text-grey-6 mb-1">{time}</p>
      <p className="text-body-4 text-grey-6">{location}</p>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-primary rounded-sm" />
        <h2 className="text-sub-tit-2 font-bold text-grey-11">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.name} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function WorshipGuide() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;

  // 주일 예배 (1부, 2부, 3부)
  const sundayWorship = regular.slice(0, 3);

  // 평일 예배 (수요, 금요, 새벽)
  const weekdayWorship = regular.slice(3);

  return (
    <div className="space-y-8">
      <Section title="주일 예배" items={sundayWorship} />
      <Section title="평일 예배 및 기도회" items={weekdayWorship} />
      <Section title="주일 학교" items={departments} />
    </div>
  );
}
