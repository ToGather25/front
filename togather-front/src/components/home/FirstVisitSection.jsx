import { Link } from "react-router";
import FileHeartIcon from "@/assets/icon-svg/file-heart-02.png";
import UsersIcon from "@/assets/icon-svg/users-01.png";
import PencilIcon from "@/assets/icon-svg/pencil-line.png";
import CheckHeartIcon from "@/assets/icon-svg/check-heart.png";
import RightArrowIcon from "@/assets/icon-svg/right-arrow.svg";

const STEPS = [
  { id: 1, label: "등록카드 작성", icon: FileHeartIcon },
  { id: 2, label: "교역자와의 만남", icon: UsersIcon },
  { id: 3, label: "새가족 교육", icon: PencilIcon },
  { id: 4, label: "교회 등록", icon: CheckHeartIcon },
];

export default function FirstVisitSection() {
  return (
    <div className="bg-bluegrey-1 py-12 -mx-8 px-8">
      <div className="text-center mb-12">
        <h2 className="text-headline-3 font-bold text-grey-11 mb-4">
          처음 오셨나요?
        </h2>
        <p className="text-body-2 text-grey-7 max-w-2xl mx-auto">
         옥길교회의 가족이 되어 보세요
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-end justify-center gap-6 mb-12 flex-wrap">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-end gap-6">
            <div className="flex flex-col items-center">
              <div className="h-20 flex items-center justify-center mb-4">
                <img src={step.icon} alt={step.label} className="w-12 h-12 object-contain" />
              </div>
              <p className="text-body-4 font-medium text-grey-10 text-center w-24">
                {step.label}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <img src={RightArrowIcon} alt="다음" className="w-6 h-6 mb-8" />
            )}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <Link
          to="/register"
          className="bg-primary text-white rounded-full px-8 py-3 text-body-3 font-semibold hover:bg-blue-8 transition-colors"
        >
          회원가입 하기
        </Link>
      </div>
    </div>
  );
}
