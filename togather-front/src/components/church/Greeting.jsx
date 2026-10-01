import { useChurch } from "@/contexts/ChurchContext";
import FallbackImage from "./FallbackImage";
import ChurchLogo from "@/components/common/ChurchLogo";
import AvatarIcon from "@/assets/icon-svg/mypage-user-blue.svg";

export default function Greeting() {
  const { church } = useChurch();
  const { title, paragraphs, signature } = church.greeting;
  const { image: pastorImage } = church.staff.headPastor;

  return (
    <div className="flex flex-col-reverse md:flex-row md:gap-10 md:items-center">
      <div className="md:flex-[2]">
        <div className="mb-10">
          <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-4">{title}</h2>
          <p className="text-body-1 text-primary font-medium">{church.name} 홈페이지를 방문해주셔서 감사합니다.</p>
          <div className="w-12 h-px bg-grey-3 my-10" />
        </div>

        <div className="flex flex-col gap-2 text-body-3 text-bluegrey-9">
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
        </div>
      </div>

      <div className="flex flex-col gap-4 md:shrink-0">
        <FallbackImage
          src={pastorImage}
          alt="담임목사 사진"
          className="w-full h-48 md:w-48 md:h-64 rounded-2xl object-cover"
          fallback={
            <div className="w-full h-48 md:w-48 md:h-64 bg-grey-3 rounded-2xl flex items-center justify-center">
              <img src={AvatarIcon} alt="" className="w-12 h-12 opacity-60" />
            </div>
          }
        />
        <p className="text-body-3 text-grey-7 text-right">
          {signature.church} {signature.title} <strong>{signature.name}</strong>
        </p>
      </div>
    </div>
  );
}
