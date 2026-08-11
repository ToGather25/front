import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

function maskId(id) {
  if (id.length <= 4) return `${id[0]}${"*".repeat(Math.max(id.length - 1, 3))}`;
  return `${id.slice(0, 4)}${"*".repeat(id.length - 4)}`;
}

const MOCK_FOUND_ID = "test1234";

export default function FindId() {
  const { church } = useChurch();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | found
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
      // TODO: API 연동 — 이름+휴대폰 번호로 계정 조회
      setStatus("found");
    } catch {
      setStatus("idle");
      setError("일치하는 계정을 찾을 수 없습니다. 다시 시도해 주세요.");
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
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
          </div>
          <h1 className="text-headline-4 font-bold text-white mb-3">
            {church?.name ?? "ToGather"}
          </h1>
          <p className="text-body-2 text-white/70 leading-relaxed">
            등록하신 정보로
            <br />
            아이디를 찾아드려요
          </p>
        </div>
      </div>

      {/* 오른쪽 폼 영역 */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {status === "found" ? (
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
              <h2 className="text-headline-5 font-bold text-grey-11 mb-3">아이디를 찾았습니다</h2>
              <p className="text-body-3 text-grey-6 leading-relaxed mb-6">
                입력하신 정보와 일치하는 아이디입니다.
              </p>
              <p className="text-sub-tit-3 font-bold text-blue-7 bg-blue-1 rounded-xl py-4 mb-8">
                {maskId(MOCK_FOUND_ID)}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
                >
                  로그인으로 돌아가기
                </Link>
                <Link
                  to="/find-password"
                  className="text-body-4 text-grey-6 hover:text-blue-7 transition-colors"
                >
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-headline-5 font-bold text-grey-11 mb-2">아이디 찾기</h2>
                <p className="text-body-3 text-grey-6">
                  가입 시 등록한 이름과 휴대폰 번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                    이름
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="홍길동"
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
                  {status === "submitting" ? "확인 중..." : "아이디 찾기"}
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
