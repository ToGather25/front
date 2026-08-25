import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboInfo } from "@/services/juboService";
import juboConfig from "@/config/jubo.config";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import DefaultBanner from "@/assets/default_banner.png";

export default function Cover() {
  const { church } = useChurch();
  const { cover } = juboConfig;
  const {
    data: juboInfo,
    error: juboInfoError,
    refetch: refetchJuboInfo,
  } = useFetch(() => getJuboInfo(church.id), [church.id], null);
  const { mainVerse, mainTitle, items, year } = church.vision;

  const churchPhoto = cover.photos?.church;
  const panoramaPhoto = cover.photos?.panorama ?? DefaultBanner;
  const groupPhoto = cover.photos?.group;

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-3 bg-white rounded-xl border border-bluegrey-2">
        {juboInfoError?.response?.status === 404 ? (
          <span className="text-caption text-grey-5">아직 발행된 주보가 없습니다.</span>
        ) : juboInfoError ? (
          <button
            onClick={refetchJuboInfo}
            className="text-caption text-primary underline"
          >
            주보 정보를 불러오지 못했습니다. 다시 시도
          </button>
        ) : (
          <>
            <span className="text-caption text-grey-6">{juboInfo?.issueNo ?? ""}</span>
            <span className="text-body-3 font-semibold text-grey-9">{juboInfo?.date ?? ""}</span>
          </>
        )}
      </div>

      {/* 표어 + 교회 사진 */}
      <div
        className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-bluegrey-2"
        style={{ minHeight: 260 }}
      >
        <div className="flex flex-col justify-center gap-4 px-6 py-6 sm:w-[38%] sm:shrink-0 bg-white">
          <span className="self-start px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold">
            {year}년 표어
          </span>
          <h2 className="text-[22px] md:text-[26px] font-bold leading-[1.35] text-grey-12">
            {mainVerse.replace(/^"|"$/g, "")}
          </h2>
          <p className="text-caption text-grey-6">{mainTitle}</p>
        </div>
        <div className="flex-1 relative overflow-hidden bg-grey-3 min-h-[220px]">
          {churchPhoto ? (
            <img src={churchPhoto} alt="교회 건물" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-2 to-blue-3 flex items-center justify-center text-grey-5 text-caption">
              교회 사진
            </div>
          )}
          <div className="absolute top-4 left-4">
            <img src={LogoIcon} className="h-10 w-auto object-contain" alt={church.name} />
          </div>
        </div>
      </div>

      {/* 파노라마 사진 */}
      <div className="w-full rounded-xl overflow-hidden border border-bluegrey-2 h-48 sm:h-[280px]">
        <img src={panoramaPhoto} alt="예배 전경" className="w-full h-full object-cover" />
      </div>

      {/* 3대 실천사항 + 단체 사진 */}
      <div
        className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-bluegrey-2"
        style={{ minHeight: 220 }}
      >
        <div
          className="flex flex-col items-center justify-center gap-3 px-8 py-6 sm:w-[38%] sm:shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <p className="text-[11px] font-semibold text-blue-3 tracking-widest">[3대 실천사항]</p>
          <div className="flex flex-col items-center gap-1.5">
            {items.map(({ label }) => (
              <p key={label} className="text-sub-tit-3 font-bold text-white">
                {label}
              </p>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-grey-3">
          {groupPhoto ? (
            <img src={groupPhoto} alt="공동체 단체 사진" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-grey-3 to-grey-4 flex items-center justify-center text-grey-5 text-caption">
              공동체 사진
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
