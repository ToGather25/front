import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

export default function FindPassword() {
  const { church } = useChurch();
  const [form, setForm] = useState({ email: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | sent
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 800));
      // TODO: API 연동 — 이메일+휴대폰 번호로 계정 확인 후 재설정 링크 발송
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("계정 정보를 확인할 수 없습니다. 다시 시도해 주세요.");
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-9 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10 via-blue-9 to-blue-7 opacity-90" />
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-headline-4 font-bold text-white mb-3">
            {church?.name ?? "ToGather"}
          </h1>
          <p className="text-body-2 text-white/70 leading-relaxed">
            안전한 계정 관리를 위해
            <br />
            본인 확인 후 재설정을 도와드려요
          </p>
        </div>
      </div>

      {/* 오른쪽 폼 영역 */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {status === "sent" ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center mx-auto mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3B5280"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-headline-5 font-bold text-grey-11 mb-3">
                재설정 링크를 보냈습니다
              </h2>
              <p className="text-body-3 text-grey-6 leading-relaxed mb-8">
                {form.email}로 비밀번호 재설정 링크를 보냈습니다.
                <br />
                메일함(스팸함 포함)을 확인해 주세요.
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-headline-5 font-bold text-grey-11 mb-2">비밀번호 찾기</h2>
                <p className="text-body-3 text-grey-6">
                  가입 시 등록한 이메일과 휴대폰 번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                    이메일
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                    휴대폰 번호
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className={inputCls}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-4 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-bold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
                >
                  {status === "submitting" ? "확인 중..." : "재설정 링크 받기"}
                </button>
              </form>

              <p className="text-center text-body-4 text-grey-6 mt-8 border-t border-grey-2 pt-6">
                <Link to="/login" className="text-blue-7 hover:underline font-semibold">
                  로그인으로 돌아가기
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
