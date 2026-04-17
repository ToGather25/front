import { useChurch } from "@/contexts/ChurchContext";
import defaultBanner from "@/assets/default_banner.png";

export default function MainBanner() {
  const { church } = useChurch();
  const { url, title, subtitle } = church.mainBanner;
  const bgImage = url || defaultBanner;

  return (
    <div
      className="relative w-full h-[480px] bg-blue-9 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />

      {/* 콘텐츠 */}
      <div className="relative h-full max-w-[1576px] mx-auto px-8 flex flex-col justify-end pb-14">
        <div className="flex flex-col gap-4">
          <p
            className="text-headline-2 font-semibold text-white"
            style={{ whiteSpace: "pre-line" }}
          >
            {title}
          </p>
          <p
            className="text-body-2 text-white/70"
            style={{ whiteSpace: "pre-line" }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
