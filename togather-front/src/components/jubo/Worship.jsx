import { useState } from "react";
import juboConfig from "@/config/jubo.config";

const SIDEBAR_SERVICES = [
  { label: "전체", group: "main" },
  { label: "주일 오전예배", group: "main" },
  { label: "주일 오후예배", group: "main" },
  { label: "새벽기도회", group: "main" },
  { label: "수요예배", group: "main" },
  { label: "금요기도회", group: "main" },
  { label: "유치부", group: "sub" },
  { label: "초등부", group: "sub" },
  { label: "중고등부", group: "sub" },
  { label: "대학청년부", group: "sub" },
];

export default function Worship() {
  const { worshipOrder, worshipScheduleSummary } = juboConfig;
  const [selected, setSelected] = useState("주일 오전예배");

  return (
    <div className="flex flex-col md:flex-row border border-bluegrey-2 rounded-xl overflow-hidden">
      {/* 사이드바 */}
      <div className="md:w-36 md:shrink-0 border-b md:border-b-0 md:border-r border-bluegrey-2 bg-bluegrey-1 py-3 flex md:flex-col overflow-x-auto">
        <p className="text-[10px] font-bold text-grey-6 uppercase tracking-wider px-3 mb-2 md:block hidden">
          기관
        </p>
        {SIDEBAR_SERVICES.map(({ label, group }, i) => {
          const isFirst = group === "sub" && SIDEBAR_SERVICES[i - 1]?.group === "main";
          return (
            <div key={label} className="shrink-0">
              {isFirst && <div className="h-px bg-bluegrey-2 mx-3 my-1.5 md:block hidden" />}
              <button
                onClick={() => setSelected(label)}
                className={`w-full text-left px-3 py-2 text-caption transition-colors ${
                  selected === label
                    ? "bg-primary text-white font-semibold"
                    : "text-grey-9 hover:bg-bluegrey-2 font-medium"
                }`}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {/* 예배 순서 */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex items-baseline gap-2 mb-5">
          <h3 className="text-body-2 font-bold text-grey-11">예배 순서</h3>
          <p className="text-body-5 text-grey-6">
            {selected === "주일 오전예배" && "주일 오전 예배 (1부 - 오전 09:00, 2부 - 오전 11:00)"}
            {selected === "주일 오후예배" && "주일 오후 예배 (오후 2:00)"}
            {selected === "새벽기도회" && "새벽기도회 (오전 5:30)"}
            {selected === "수요예배" && "수요 예배 (오전 11:00)"}
            {selected === "금요기도회" && "금요기도회 (오후 8:00)"}
          </p>
        </div>
        <div className="border-t border-grey-11 mb-1" />
        <table className="w-full text-caption">
          <thead>
            <tr className="border-b border-bluegrey-2">
              <th className="text-left py-2.5 px-3 text-grey-7 font-semibold w-1/4" />
              <th className="py-2.5 px-3 text-grey-7 font-semibold text-center">1부</th>
              <th className="py-2.5 px-3 text-grey-7 font-semibold text-center">2부</th>
            </tr>
          </thead>
          <tbody>
            {worshipOrder.map(({ order, part1, part2 }, i) => (
              <tr key={i} className="border-b border-grey-3">
                <td className="py-3 px-3 text-grey-9 font-medium tracking-widest">{order}</td>
                <td className="py-3 px-3 text-grey-7 text-center whitespace-pre-line">{part1}</td>
                <td className="py-3 px-3 text-grey-7 text-center whitespace-pre-line">{part2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 예배 및 모임 안내 */}
      <div className="md:w-44 md:shrink-0 border-t md:border-t-0 md:border-l border-bluegrey-2 p-4 md:p-5">
        <h4 className="text-body-5 font-bold text-grey-10 mb-4">예배 및 모임 안내</h4>
        {worshipScheduleSummary.map(({ label, time }) => (
          <div
            key={label}
            className="flex justify-between items-start py-2.5 border-b border-grey-3 last:border-0"
          >
            <span className="text-caption text-grey-8 leading-snug">{label}</span>
            <span className="text-caption text-grey-10 font-semibold text-right leading-snug">
              {time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
