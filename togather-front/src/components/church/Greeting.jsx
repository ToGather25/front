import { useChurch } from "@/contexts/ChurchContext";
import FallbackImage from "./FallbackImage";
import ChurchLogo from "@/components/common/ChurchLogo";
import AvatarIcon from "@/assets/icon-svg/mypage-user-blue.svg";

export default function Greeting() {
  const { church } = useChurch();
  const { title, paragraphs, signature } = church.greeting;
  const { image: pastorImage } = church.staff.headPastor;

  return (
    <div className="flex flex-col-reverse md:flex-row md:gap-10 md:items-start">
      <div className="flex-1">
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-6">{title}</h2>
        <div className="flex flex-col gap-4 text-body-2 text-grey-8">
          {paragraphs.map((text, i) => (
            <p key={i}>
              {text.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
          <div className="flex items-center justify-end gap-3 mt-4">
            <p className="text-body-3 text-grey-7">
              {signature.church} {signature.title} <strong>{signature.name}</strong>
            </p>
            <FallbackImage
              src={signature.signatureImage}
              alt="서명"
              className="h-10 w-auto object-contain"
              fallback={
                <ChurchLogo alt="교회 로고" className="h-10 w-auto object-contain opacity-40" />
              }
            />
          </div>
        </div>
      </div>
      <FallbackImage
        src={pastorImage}
        alt="담임목사 사진"
        className="w-full h-48 md:w-48 md:h-64 rounded-2xl shrink-0 object-cover"
        fallback={
          <div className="w-full h-48 md:w-48 md:h-64 bg-grey-3 rounded-2xl shrink-0 flex items-center justify-center">
            <img src={AvatarIcon} alt="" className="w-12 h-12 opacity-60" />
          </div>
        }
      />
    </div>
  );
}
