import { useChurch } from "@/contexts/ChurchContext";

export default function WorshipInfo() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">정기 예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {regular.map(({ name, time, location }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">주일학교예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {departments.map(({ name, time, location }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
