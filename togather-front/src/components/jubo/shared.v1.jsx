import logoFallback from "@/assets/icons/옥길교회_logo.png";

// version1(4페이지) 템플릿 전용 공통 조각 — Figma "주보 4개 ver." 기준.
// v2(shared.jsx)와는 시각 언어가 달라(섹션 바가 전체 폭을 채우는 진한 블루 바 등) 분리했다.

/** 섹션 제목 — 전체 폭을 채우는 진한 블루 바. */
export function JuboV1SectionBar({ title, right }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-blue-5 text-white px-4 py-2 w-full shrink-0">
      <h3 className="text-body-4 font-bold">{title}</h3>
      {right && <span className="text-[11px] font-light opacity-90">{right}</span>}
    </div>
  );
}

/** 페이지 2·3 상단의 얇은 러닝 헤더 — 로고/교회명 + 날짜. */
export function JuboV1RunningHeader({ church, dateLabel }) {
  return (
    <div className="flex items-center justify-between border-b border-blue-2 px-2 py-3 shrink-0">
      <div className="flex items-center gap-2">
        <img src={church.logoUrl || logoFallback} alt={church.name} className="h-6" />
      </div>
      <span className="text-xs text-grey-7">{dateLabel || ""}</span>
    </div>
  );
}

/** 페이지 1·4 하단 푸터 — 로고 + 담임목사/주소/연락처. */
export function JuboV1Footer({ church }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-blue-1 px-5 py-3.5 shrink-0">
      <img src={church.logoUrl || logoFallback} alt={church.name} className="h-7" />
      <div className="text-right text-[11px] leading-snug text-grey-9">
        <p className="font-bold text-xs">담임목사 {church.pastor}</p>
        <p>{church.address}</p>
        <p>
          TEL {church.tel}
          {church.fax && ` | FAX ${church.fax}`}
        </p>
      </div>
    </div>
  );
}
