import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import defaultBanner from "@/assets/church_img_1.jpeg";

const STEPS = [
  { id: 1, label: "등록카드 작성" },
  { id: 2, label: "교역자와의 만남" },
  { id: 3, label: "새가족 교육" },
  { id: 4, label: "교회 등록" },
];

export default function FirstVisitSection() {
  const { currentUser } = useAuth();

  return (
    <div
      className="relative mt-10 px-8 py-20"
      style={{
        backgroundImage: `url('${defaultBanner}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* 어두운 오버레이 (#000000 투명도 80%) */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} />

      {/* 두 버전을 같은 grid 칸에 겹쳐서, 둘 중 더 긴(비로그인) 쪽이 항상 섹션 높이를
          정하게 한다 — 로그인 전/후를 오갈 때 배경 사진 높이가 들쭉날쭉해지지 않도록.
          안 보이는 쪽은 invisible(레이아웃은 차지하되 시각적으로만 숨김)로만 처리한다. */}
      <div className="relative grid">
        <div
          className={`col-start-1 row-start-1 text-center ${currentUser ? "invisible" : ""}`}
          inert={!!currentUser}
          aria-hidden={!!currentUser}
        >
          <div className="mb-12">
            <h2 className="text-headline-3 font-bold text-white mb-4">처음 오셨나요?</h2>
            <p className="text-body-2 text-pale max-w-2xl mx-auto">
              환영합니다! 다음 네 단계로 우리 교회의 가족이 될 수 있어요.
            </p>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-6 mb-12 flex-wrap">
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
          <div className="flex justify-center">
            <Link
              to="/register"
              className="bg-primary-darker text-white rounded-full px-8 py-3 text-body-3 font-semibold hover:bg-blue-9 transition-colors"
            >
              회원가입 하기
            </Link>
          </div>
        </div>

        <div
          className={`col-start-1 row-start-1 flex flex-col items-center justify-center text-center ${currentUser ? "" : "invisible"}`}
          inert={!currentUser}
          aria-hidden={!currentUser}
        >
          <h2 className="text-headline-3 font-bold text-white mb-4">
            {currentUser?.name ?? "성도"}님, 다시 오셨네요
          </h2>
          <p className="text-body-2 text-pale max-w-2xl mx-auto mb-10">
            오늘도 함께해서 반갑습니다.
            <br />
            교적부에서 내 정보와 가족 정보를 확인해 보세요.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              to="/교적부"
              className="inline-flex items-center gap-1.5 bg-white text-primary-darker rounded-full px-8 py-3 text-body-3 font-semibold hover:bg-pale transition-colors"
            >
              교적부 바로가기
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              to="/mypage"
              className="bg-transparent border border-white/50 text-white rounded-full px-8 py-3 text-body-3 font-semibold hover:bg-white/10 transition-colors"
            >
              내 정보 수정
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
