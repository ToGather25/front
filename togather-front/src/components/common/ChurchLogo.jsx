import { useChurch } from "@/contexts/ChurchContext";

/**
 * 교회 로고. church.logoUrl이 있으면 이미지, 없으면 "교회 로고" 텍스트를 보여준다.
 * 특정 이미지 파일을 기본값으로 쓰지 않는다 — 어느 교회에나 적용되는 플랫폼이라
 * 특정 교회의 로고를 다른 교회 화면에 기본으로 노출하면 안 된다.
 * @param {{ className?: string, alt?: string, style?: object }} props
 */
export default function ChurchLogo({ className = "", alt = "", style }) {
  const { church } = useChurch();

  if (church.logoUrl) {
    return <img src={church.logoUrl} alt={alt} className={className} style={style} />;
  }

  return (
    <span
      className={`inline-flex items-center justify-center text-center leading-tight text-grey-5 ${className}`}
      style={style}
    >
      교회 로고
    </span>
  );
}
