function TrendIcon({ trend }) {
  if (trend > 0) return <span className="text-[10px] text-blue-7">▲</span>;
  if (trend < 0) return <span className="text-[10px] text-red-400">▼</span>;
  return null;
}

function RankTable({ title, rows, unit }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-grey-2 rounded-t-xl px-4 py-2.5 text-center">
        <span className="text-body-3 font-semibold text-grey-10">{title}</span>
      </div>
      <div className="border border-t-0 border-bluegrey-2 rounded-b-xl overflow-hidden">
        {rows.map(({ rank, name, count }, i) => (
          <div key={rank} className={`flex items-center px-4 py-3 gap-4 ${i < rows.length - 1 ? "border-b border-bluegrey-2" : ""}`}>
            <span className="w-5 text-body-4 text-grey-7 font-medium shrink-0">{rank}</span>
            <span className="flex-1 text-body-3 text-grey-10">{name}</span>
            <span className="text-body-3 text-grey-9">{count.toLocaleString()}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BibleRankingView({ neighbors, monthly, total, unit = "절" }) {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-8">
      {/* 내 순위 — 3인 원형 */}
      <div className="flex items-end justify-center gap-8 mb-10">
        {neighbors.map((u, i) => {
          const isMe = u.name === "나";
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`rounded-full flex items-center justify-center font-bold text-grey-10 ${
                isMe ? "w-36 h-36 bg-grey-6 text-white text-sub-tit-2" : "w-28 h-28 bg-grey-2 text-sub-tit-3"
              }`}>
                {u.name}
              </div>
              <div className="text-center">
                <p className="text-body-3 font-medium text-grey-9 flex items-center justify-center gap-1">
                  {u.rank}위 <TrendIcon trend={u.trend} />
                </p>
                <p className="text-body-4 text-grey-5">{u.count.toLocaleString()}{unit}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 순위표 2열 */}
      <div className="flex gap-6">
        <RankTable title="월간 순위표" rows={monthly} unit={unit} />
        <RankTable title="전체 순위표" rows={total} unit={unit} />
      </div>
    </div>
  );
}
