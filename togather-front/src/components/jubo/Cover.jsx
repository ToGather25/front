import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboInfo, getCover } from "@/services/juboService";
import ChurchLogo from "@/components/common/ChurchLogo";
import DefaultBanner from "@/assets/default_banner.png";

const EMPTY_COVER = { photos: {} };

export default function Cover({ issue }) {
  const { church } = useChurch();
  const {
    data: currentInfo,
    error: juboInfoError,
    refetch: refetchJuboInfo,
  } = useFetch(() => (issue ? Promise.resolve(null) : getJuboInfo(church.id)), [church.id, issue], null);
  // 표지 사진은 발행호와 무관하게 항상 "현재" 섹션 콘텐츠 하나뿐이다(과거 발행호별
  // 개별 사진을 백엔드가 아직 지원하지 않음 — 다른 6개 연동 섹션과 동일한 제약).
  const { data: cover } = useFetch(() => getCover(church.id), [church.id], EMPTY_COVER);
  // 목록에서 과거 발행호를 골라 들어온 경우 그 발행호 정보를, 아니면 현재 발행 주보 정보를 쓴다.
  const juboInfo = issue ? { issueNo: issue.issueNo, date: issue.dateLabel } : currentInfo;
  const { mainVerse, mainTitle, items, year } = church.vision;
  const { title: sloganTitle, scripture: sloganScripture, year: sloganYear } = church.slogan || {};

  const churchPhoto = cover.photos?.church;
  const panoramaPhoto = cover.photos?.panorama ?? DefaultBanner;
  const groupPhoto = cover.photos?.group;

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-3 bg-white rounded-xl border border-bluegrey-2">
        {juboInfoError?.response?.status === 404 ? (
          <span className="w-full text-center text-caption text-grey-5">
            아직 발행된 주보가 없습니다.
          </span>
        ) : juboInfoError ? (
          <button
            onClick={refetchJuboInfo}
            className="w-full text-center text-caption text-primary underline"
          >
            주보 정보를 불러오지 못했습니다.
          </button>
        ) : (
          <>
            <span className="text-caption text-grey-6">{juboInfo?.issueNo ?? ""}</span>
            <span className="text-body-3 font-semibold text-grey-9">{juboInfo?.date ?? ""}</span>
          </>
        )}
      </div>

      {/* 올해 표어 + 성경구절 */}
      {sloganTitle && sloganScripture && (
        <div
          className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-bluegrey-2 min-h-[150px]"
        >
          <div className="flex flex-col justify-center gap-4 px-6 py-6 sm:w-[38%] sm:shrink-0">
            <span className="self-start px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold">
              {sloganYear}년 표어
            </span>
            <h2 className="text-sub-tit-3 font-bold leading-[1.35] text-primary">
              {sloganTitle}
            </h2>
            <p className="text-field-desc text-grey-7">{sloganScripture}</p>
          </div>
          <div className="flex-1 relative overflow-hidden bg-grey-3 min-h-[180px]">
            {churchPhoto ? (
              <img src={churchPhoto} alt="교회 건물" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-2 to-blue-3 flex items-center justify-center text-grey-5 text-caption">
                교회 사진
              </div>
            )}
            <div className="absolute top-4 left-4">
              <ChurchLogo className="h-10 w-auto object-contain" alt={church.name} />
            </div>
          </div>
        </div>
      )}

      {/* 파노라마 사진 */}
      <div className="w-full rounded-xl overflow-hidden border border-bluegrey-2 h-[250px]">
        <img src={panoramaPhoto} alt="예배 전경" className="w-full h-full object-cover" />
      </div>

      {/* 3대 실천사항 + 단체 사진 */}
      <div
        className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-bluegrey-2 min-h-[150px]"
      >
        <div
          className="flex flex-col items-center justify-center gap-3 px-8 py-6 sm:w-[38%] sm:shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <p className="text-field-desc font-semibold text-blue-3 tracking-widest">[실천사항]</p>
          <div className="flex flex-col items-center gap-1">
            {items.map(({ label }) => (
              <p key={label} className="text-body-3 font-bold text-white">
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
