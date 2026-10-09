import { Link } from "react-router";
import defaultBanner from "@/assets/default_banner.png";

const STEPS = [
  { id: 1, label: "등록카드 작성" },
  { id: 2, label: "교역자와의 만남" },
  { id: 3, label: "새가족 교육" },
  { id: 4, label: "교회 등록" },
];

export default function FirstVisitSection() {
  return (
    <div
      className="relative -mx-8 px-8 py-20"
      style={{
        backgroundImage: `url('${defaultBanner}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* 어두운 오버레이 (#000000 투명도 80%) */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} />

      <div className="relative text-center mb-12">
        <h2 className="text-headline-3 font-bold text-white mb-4">
          처음 오셨나요?
        </h2>
        <p className="text-body-2 text-pale max-w-2xl mx-auto">
          환영합니다! 다음 네 단계로 우리 교회의 가족이 될 수 있어요.
        </p>
      </div>

      {/* Steps */}
      <div className="relative flex items-center justify-center gap-6 mb-12 flex-wrap">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <span className="bg-white rounded-full px-4 py-1 text-body-5 font-bold text-primary">
                STEP {String(step.id).padStart(2, "0")}.
              </span>
              <p className="text-body-3 font-semibold text-white text-center w-28">
                {step.label}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <svg
                className="w-5 h-5 text-white/60 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="relative flex justify-center">
        <Link
          to="/register"
          className="bg-primary-darker text-white rounded-full px-8 py-3 text-body-3 font-semibold hover:bg-blue-9 transition-colors"
        >
          회원가입 하기
        </Link>
      </div>
    </div>
  );
}
