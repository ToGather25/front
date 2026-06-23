// 숫자를 한국어 단위로 포맷 (예: 12345566 → "1234만 5566절")
function formatKorean(n) {
  if (n < 1000) return `${n.toLocaleString()}`;
  const man = Math.floor(n / 10000);
  const rest = n % 10000;
  if (man === 0) return `${rest.toLocaleString()}`;
  if (rest === 0) return `${man.toLocaleString()}만`;
  return `${man.toLocaleString()}만 ${rest.toLocaleString()}`;
}

function TrendIcon({ trend }) {
  if (trend > 0) return <span className="text-[10px] text-blue-7 font-bold">▲{Math.abs(trend)}</span>;
  if (trend < 0) return <span className="text-[10px] text-red-400 font-bold">▼{Math.abs(trend)}</span>;
  return <span className="text-[10px] text-grey-4">—</span>;
}

function RankTable({ title, rows, unit }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="bg-grey-2 rounded-t-xl px-4 py-2.5 text-center shrink-0">
        <span className="text-body-3 font-semibold text-grey-10">{title}</span>
      </div>
      <div className="border border-t-0 border-bluegrey-2 rounded-b-xl overflow-hidden flex flex-col flex-1">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 flex-1 text-grey-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l7-7 4 4 7-7M3 19h18" />
            </svg>
            <p className="text-body-5">아직 기록이 없습니다</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {rows.map(({ rank, name, count, trend }, i) => (
              <div key={rank} className={`flex items-center px-4 py-3 gap-3 ${i < rows.length - 1 ? "border-b border-bluegrey-2" : ""}`}>
                <span className="w-5 text-body-4 text-grey-7 font-medium shrink-0 text-center">{rank}</span>
                <span className="flex-1 text-body-3 text-grey-10 truncate">{name}</span>
                <span className="text-body-4 text-grey-6 shrink-0">{formatKorean(count)}{unit}</span>
                {trend !== undefined && (
                  <span className="w-9 text-right shrink-0"><TrendIcon trend={trend} /></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BibleRankingView({ neighbors, monthly, total, unit = "절" }) {
  const isNewUser = !neighbors || neighbors.every(u => u.count === 0);

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8">
      {/* 포디움 */}
      <div className="flex items-end justify-center gap-8 mb-10">
        {isNewUser ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-28 h-28 rounded-full bg-blue-1 border-2 border-blue-3 flex items-center justify-center text-4xl">📖</div>
            <p className="text-body-3 font-semibold text-grey-8">첫 구절을 읽고 랭킹에 진입해보세요!</p>
            <p className="text-body-5 text-blue-5">0절</p>
          </div>
        ) : (
          neighbors.map((u, i) => {
            const isMe = u.name === "나";
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`rounded-full flex items-center justify-center font-bold ${
                  isMe
                    ? "w-36 h-36 bg-blue-7 text-white text-sub-tit-2 shadow-lg shadow-blue-3"
                    : "w-24 h-24 bg-grey-2 text-grey-9 text-sub-tit-3"
                }`}>
                  {u.name}
                </div>
                <div className="text-center">
                  <p className="text-body-4 font-medium text-grey-8 flex items-center justify-center gap-1">
                    {u.rank}위 <TrendIcon trend={u.trend} />
                  </p>
                  <p className="text-body-5 text-grey-5">{formatKorean(u.count)}{unit}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 순위표 2열 */}
      <div className="flex gap-6">
        <RankTable title="월간 순위표" rows={monthly} unit={unit} />
        <RankTable title="전체 순위표" rows={total} unit={unit} />
      </div>
    </div>
  );
}
