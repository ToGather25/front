import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { verifyPasswordReset, resetPassword } from "@/services/accountRecoveryService";

export default function FindPassword() {
  const { church } = useChurch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", phone: "" });
  // 메일/SMS 발송 인프라가 아직 없어 링크 대신 재설정 토큰을 바로 받아
  // 같은 화면에서 새 비밀번호를 입력받는다(백엔드 api-spec §10.10).
  const [status, setStatus] = useState("idle"); // idle | submitting | verified | resetting | done
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
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
      const { resetToken: token } = await verifyPasswordReset(form);
      setResetToken(token);
      setStatus("verified");
    } catch (err) {
      setStatus("idle");
      setError(
        err?.response?.status === 404
          ? "계정 정보를 확인할 수 없습니다. 이메일과 휴대폰 번호를 확인해 주세요."
          : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }
    setStatus("resetting");
    try {
      await resetPassword({ resetToken, newPassword });
      setStatus("done");
    } catch (err) {
      // 토큰은 1회성이라 만료/재사용이면 본인확인부터 다시 해야 한다.
      if (err?.response?.status === 404) {
        setStatus("idle");
        setResetToken(null);
        setError("재설정 시간이 만료되었습니다. 본인 확인부터 다시 진행해 주세요.");
      } else {
        setStatus("verified");
        setError("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-9 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10 via-blue-9 to-blue-7 opacity-90" />

        <div className="relative">
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
          {status === "done" ? (
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
                비밀번호가 변경되었습니다
              </h2>
              <p className="text-body-3 text-grey-6 leading-relaxed mb-8">
                새 비밀번호로 로그인해 주세요.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
              >
                로그인하러 가기
              </button>
            </div>
          ) : status === "verified" || status === "resetting" ? (
            <>
              <div className="mb-10">
                <h2 className="text-headline-5 font-bold text-grey-11 mb-2">새 비밀번호 설정</h2>
                <p className="text-body-3 text-grey-6">
                  본인 확인이 완료되었습니다. 새 비밀번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleReset} className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-body-4 font-semibold text-grey-9 mb-2"
                  >
                    새 비밀번호
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8자 이상 입력해 주세요"
                    className={inputCls}
                  />
                </div>

                {error && <p className="text-body-4 text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "resetting" || !newPassword}
                  className="w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-bluegrey-3 transition-colors"
                >
                  {status === "resetting" ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </>
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
