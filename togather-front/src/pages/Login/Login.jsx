import { useState, useTransition } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import googleIcon from "@/assets/oAuth/google.png";
import kakaoIcon from "@/assets/oAuth/kakao.png";
import naverIcon from "@/assets/oAuth/naver.png";

const OAUTH_PROVIDERS = [
  { key: "kakao", name: "카카오", icon: kakaoIcon },
  { key: "google", name: "구글", icon: googleIcon },
  { key: "naver", name: "네이버", icon: naverIcon },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { church } = useChurch();
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    setError(null);
    startTransition(async () => {
      try {
        await login({ email, password });
      } catch {
        setError("이메일 또는 비밀번호가 일치하지 않습니다.");
      }
    });
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-9 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10 via-blue-9 to-blue-7 opacity-90" />
        {/* 장식 원 */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-40 right-8 w-40 h-40 rounded-full bg-blue-7/40" />

        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-headline-4 font-bold text-white mb-3">
            {church?.name ?? "ToGather"}
          </h1>
          <p className="text-body-2 text-white/70 leading-relaxed">
            말씀과 공동체가 함께하는
            <br />
            교회 커뮤니티 서비스
          </p>
        </div>

        <div className="relative">
          <div className="border-t border-white/20 pt-8">
            <p className="text-body-4 text-white/50 mb-4">서비스 안내</p>
            <ul className="flex flex-col gap-3">
              {["스마트 주보 · 예배 안내", "성경 읽기 · 쓰기", "갤러리 · 교회 행사"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-body-4 text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 오른쪽 폼 영역 */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-headline-5 font-bold text-grey-11 mb-2">로그인</h2>
            <p className="text-body-3 text-grey-6">계정 정보를 입력해 주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">이메일</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">비밀번호</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5 text-body-5 text-grey-7">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" name="saveId" className="accent-blue-7 w-4 h-4" />
                  아이디 저장
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" name="keepLogin" className="accent-blue-7 w-4 h-4" />
                  로그인 유지
                </label>
              </div>
              <Link
                to="/find-password"
                className="text-body-5 text-blue-6 hover:text-blue-8 transition-colors"
              >
                비밀번호 찾기
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-4 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-bold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
            >
              {isPending ? "확인 중..." : "로그인"}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-8">
            <div className="flex-1 h-px bg-grey-2" />
            <span className="text-body-5 text-grey-5">또는</span>
            <div className="flex-1 h-px bg-grey-2" />
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            {OAUTH_PROVIDERS.map((provider) => (
              <button
                key={provider.key}
                type="button"
                aria-label={`${provider.name}로 로그인`}
                className="w-12 h-12 rounded-full border border-grey-2 flex items-center justify-center overflow-hidden hover:brightness-95 active:scale-95 transition-all"
              >
                <img
                  src={provider.icon}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6 text-body-4 text-grey-7">
            <Link to="/find-id" className="hover:text-blue-7 transition-colors">
              아이디 찾기
            </Link>
            <span className="text-grey-3">|</span>
            <Link
              to="/register"
              className="text-blue-7 font-semibold hover:text-blue-8 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
