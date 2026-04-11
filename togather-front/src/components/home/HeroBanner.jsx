import { useChurch } from "@/contexts/ChurchContext";

export default function HeroBanner() {
  const { church } = useChurch();
  const { title, subtitle } = church.heroBanner;

  return (
    <div className="relative w-full h-[480px] bg-blue-9 overflow-hidden">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />

      {/* 장식 원형 */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-7/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-2xl" />

      {/* 콘텐츠 */}
      <div className="relative h-full max-w-[1576px] mx-auto px-8 flex flex-col justify-end pb-14">
        <div className="flex flex-col gap-4">
          <p
            className="text-headline-3 font-semibold text-white leading-snug"
            style={{ whiteSpace: "pre-line" }}
          >
            {title}
          </p>
          <p
            className="text-body-2 text-white/70 leading-relaxed"
            style={{ whiteSpace: "pre-line" }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
