import { useChurch } from "@/contexts/ChurchContext";
import logo from "@/assets/icons/옥길교회_logo.png";
import locationIcon from "@/assets/icon-svg/footer-location.svg";
import phoneIcon from "@/assets/icon-svg/footer-phone.svg";
import mailIcon from "@/assets/icon-svg/footer-email.svg";
import quoteLeft from "@/assets/icon-svg/quote-left.svg";
import quoteRight from "@/assets/icon-svg/quote-right.svg";

export default function JuboPage1({ data }) {
  const { church } = useChurch();

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* 상단: 이미지 (360px 고정, Figma 493/1372 비율) */}
      <div className="h-[360px] bg-bluegrey-1 rounded-3 flex-shrink-0 flex items-center justify-center">
        <span className="text-xs text-grey-6">예배 사진</span>
      </div>

      {/* 하단: 콘텐츠 영역 (235px = 595 - 360) */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 정보 박스들 (235px) */}
        <div className="w-[235px] flex flex-col flex-shrink-0">
          {/* 미션 섹션 (bg-[#eceef3] - 밝은 회색 블루) */}
          <div className="bg-blue-1 rounded-3 p-4 flex-1 flex flex-col items-center justify-center">
            <div className="text-caption text-grey-6 text-xs mb-4 font-semibold">MISSION</div>
            <div className="text-lg font-medium text-grey-12 text-center leading-snug space-y-2" style={{ fontFamily: '"Gowun Batang", serif' }}>
              {church.slogan?.missions?.split(',').map((line, i) => (
                <div key={i}>{line.trim()}</div>
              ))}
            </div>
          </div>

          {/* 교회 정보 섹션 (bg-[#7d8daf] - 회색 블루) */}
          <div className="bg-blue-4 text-white rounded-3 p-3 flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="font-semibold text-lg mb-3 text-center">{church.website}</div>
            <div className="space-y-3 text-field-desc text-center max-w-[150px]">
              <div className="flex gap-1.5 items-center justify-center">
                <img src={locationIcon} alt="위치" className="w-4 h-4 flex-shrink-0" style={{ filter: 'brightness(0) invert(1)' }} />
                <span className="line-clamp-2 text-xs">{church.address}</span>
              </div>
              <div className="flex gap-1.5 items-center justify-center">
                <img src={phoneIcon} alt="전화" className="w-4 h-4 flex-shrink-0" style={{ filter: 'brightness(0) invert(1)' }} />
                <div className="text-xs">
                  <div>T. {church.tel}</div>
                  <div>F. {church.fax}</div>
                </div>
              </div>
              <div className="flex gap-1.5 items-center justify-center">
                <img src={mailIcon} alt="이메일" className="w-4 h-4 flex-shrink-0" style={{ filter: 'brightness(0) invert(1)' }} />
                <span className="truncate text-xs">{church.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 메인 콘텐츠 (남은 공간) */}
        <div className="flex-1 flex flex-col justify-between relative">
          {/* 날짜 - 오른쪽 위에 띠 모양 */}
          <div className="self-end pr-3">
            <div
              className="text-xs text-primary font-semibold px-3 py-2 bg-bluegrey-2"
              style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}
            >
              {data?.dateLabel || "연/월/일"}
            </div>
          </div>

          {/* 표어 - 왼쪽 정렬, 위 아래 rounded 띠 */}
          <div className="flex-1 flex flex-col justify-center gap-2 px-3">
            <div className="inline-flex items-center gap-2 w-fit">
              <div className="w-1 h-4 bg-primary rounded" />
              <span className="text-xs text-grey-6 font-semibold">{church.slogan?.year}년 표어</span>
            </div>

            {/* 큰 제목 - quote 아이콘 포함 */}
            <div
              className="relative flex items-center justify-center bg-bluegrey-1 py-15 px-3 mt-2"
              style={{ borderTopRightRadius: '40px', borderBottomLeftRadius: '40px' }}
            >
              <img src={quoteLeft} alt="" className="absolute w-10 h-10 flex-shrink-0" style={{ top: '15px', left: '15px' }} />
              <div className="text-headline-3 font-semibold text-grey-12 text-center leading-snug max-w-[200px] break-words whitespace-pre-wrap" style={{ fontFamily: '"Gowun Batang", serif' }}>
                {church.slogan?.title}
              </div>
              <img src={quoteRight} alt="" className="absolute w-10 h-10 flex-shrink-0" style={{ bottom: '15px', right: '15px' }} />
            </div>
          </div>

          {/* 로고 - 크기 증대 */}
          <div className="flex justify-center pb-4">
            <img src={church.logoUrl || logo} alt={church.name} className="h-9 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
