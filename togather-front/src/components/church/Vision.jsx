import { useChurch } from "@/contexts/ChurchContext";

export default function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;

  const D = 280;
  const SIDE = 220;
  const TH = Math.round((SIDE * Math.sqrt(3)) / 2);
  const W = SIDE + D;
  const H = TH + D;

  const SIDE_TEXT_W = 160;
  const GAP = 40;
  const TOTAL_W = SIDE_TEXT_W + GAP + W + GAP + SIDE_TEXT_W;

  const layout = [
    { item: items[0], left: Math.round((W - D) / 2), top: 0, z: 3, delay: "0s" },
    { item: items[1], left: 0, top: TH, z: 2, delay: "0.25s" },
    { item: items[2], left: W - D, top: TH, z: 1, delay: "0.5s" },
  ];

  return (
    <div>
      <style>{`
        @keyframes circleIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="bg-blue-1 rounded-2xl px-12 py-20 text-center mb-20">
        <p className="text-sub-tit-4 font-semibold text-grey-9">{mainTitle}</p>
        <p className="text-body-2 text-grey-8 mt-1">{mainVerse}</p>
      </div>

      <div className="overflow-x-auto">
        <div
          className="mx-auto flex flex-col items-center gap-4"
          style={{ width: TOTAL_W, maxWidth: "100%" }}
        >
          <p className="text-body-2 text-grey-7 text-center mb-2" style={{ width: W }}>
            {items[0].description}
          </p>

          <div className="flex items-start gap-10">
            <div className="flex flex-col shrink-0" style={{ width: SIDE_TEXT_W, height: H }}>
              <div style={{ height: TH }} />
              <div className="flex-1 flex items-center">
                <p className="text-body-2 text-grey-7 text-right w-full">{items[1].description}</p>
              </div>
            </div>

            <div className="relative shrink-0 m-5" style={{ width: W, height: H }}>
              {layout.map(({ item, left, top, z, delay }) => (
                <div
                  key={item.label}
                  className="absolute rounded-full border-2 border-grey-9 bg-transparent flex items-center justify-center"
                  style={{
                    width: D,
                    height: D,
                    left,
                    top,
                    zIndex: z,
                    animation: `circleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both`,
                  }}
                >
                  <span className="text-sub-tit-3 font-semibold text-grey-10 text-center px-8 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col shrink-0" style={{ width: SIDE_TEXT_W, height: H }}>
              <div style={{ height: TH }} />
              <div className="flex-1 flex items-center">
                <p className="text-body-2 text-grey-7 text-left w-full">{items[2].description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
