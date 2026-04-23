import { useState, useTransition } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";

export default function LoginPage() {
  const { login } = useAuth();
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
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-bluegrey-2">
      <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-8 text-center">로그인</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
        <div>
          <label className="block text-body-4 font-medium text-grey-8 mb-1">이메일</label>
          <input
            name="email" type="email" required
            className="w-full px-4 py-2 border border-bluegrey-3 rounded-lg focus:ring-2 focus:ring-blue-7 focus:border-transparent outline-none transition-all"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-body-4 font-medium text-grey-8 mb-1">비밀번호</label>
          <input
            name="password" type="password" required
            className="w-full px-4 py-2 border border-bluegrey-3 rounded-lg focus:ring-2 focus:ring-blue-7 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center gap-6 text-body-5 text-grey-7 ml-1">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" name="saveId" className="accent-blue-7 w-4 h-4" />
            아이디 저장
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" name="keepLogin" className="accent-blue-7 w-4 h-4" />
            로그인 유지
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 mt-3 bg-blue-7 text-white rounded-lg font-bold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
        >
          {isPending ? "확인 중..." : "로그인"}
        </button>

        {error && <p className="text-center text-red-500 text-body-4 font-medium">{error}</p>}
      </form>

      <div className="flex justify-center items-center gap-3 mt-6 text-body-5 text-grey-6">
        <Link to="/find-id" className="hover:text-blue-7 transition-colors">아이디 찾기</Link>
        <span className="text-grey-4">|</span>
        <Link to="/find-password" className="hover:text-blue-7 transition-colors">비밀번호 찾기</Link>
        <span className="text-grey-4">|</span>
        <Link to="/register" className="hover:text-blue-7 transition-colors">회원가입</Link>
      </div>

      <p className="text-center text-body-5 text-grey-4 mt-6">
        테스트 계정: test@togather.com / test1234
      </p>
    </div>
  );
}