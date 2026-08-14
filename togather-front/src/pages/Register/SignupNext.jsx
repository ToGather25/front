import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { getErrorMessage } from "@/utils/apiErrors";

const PW_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupNext() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { church } = useChurch();
  const { completeRegistration, login } = useAuth();

  const memberName = searchParams.get("name") ?? null;

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done | invalid
  const [showModal, setShowModal] = useState(false);
  const [completeError, setCompleteError] = useState("");

  useEffect(() => {
    if (!token) setStatus("invalid");
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (name === "username") {
      setErrors((prev) => ({
        ...prev,
        username: value && !EMAIL_RULE.test(value) ? "이메일 형식으로 입력해 주세요 (예: hong@example.com)." : "",
      }));
      return;
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password:
          value && !PW_RULE.test(value) ? "영문·숫자·특수문자 조합 8자 이상이어야 합니다." : "",
        confirm:
          nextForm.confirm && nextForm.confirm !== value ? "비밀번호가 일치하지 않습니다." : "",
      }));
      return;
    }

    if (name === "confirm") {
      setErrors((prev) => ({
        ...prev,
        confirm: value && value !== nextForm.password ? "비밀번호가 일치하지 않습니다." : "",
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!EMAIL_RULE.test(form.username))
      errs.username = "이메일 형식으로 입력해 주세요 (예: hong@example.com).";
    if (!PW_RULE.test(form.password))
      errs.password = "영문·숫자·특수문자 조합 8자 이상이어야 합니다.";
    if (form.password !== form.confirm) errs.confirm = "비밀번호가 일치하지 않습니다.";
    return errs;
  };

  const canSubmit =
    EMAIL_RULE.test(form.username) &&
    form.password.length >= 8 &&
    form.password === form.confirm &&
    status === "idle";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setStatus("submitting");
    try {
      await completeRegistration({ token, username: form.username, password: form.password });
      setStatus("done");
      setShowModal(true);
    } catch (err) {
      setErrors({ submit: getErrorMessage(err) });
      setStatus("idle");
    }
  };

  const handleComplete = async () => {
    setShowModal(false);
    try {
      await login({ email: form.username, password: form.password });
    } catch {
      setCompleteError(
        "가입은 완료됐지만 자동 로그인에 실패했습니다. 아래 로그인 페이지에서 다시 시도해 주세요.",
      );
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 border rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all ${
      errors[field] ? "border-red-400 bg-red-50" : "border-bluegrey-2"
    }`;

  if (status === "invalid") {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-grey-1 px-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-bluegrey-2 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">잘못된 접근입니다</h2>
          <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
            이 페이지는 관리자의 승인 링크를 통해서만 접근할 수 있습니다.
          </p>
          <Link
            to="/register"
            className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
          >
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h1 className="text-headline-4 font-bold text-white mb-3">
              {church?.name ?? "ToGather"}
            </h1>
            <p className="text-body-2 text-white/70 leading-relaxed">
              교회 성도님들을 위한
              <br />
              커뮤니티 서비스 회원가입
            </p>
          </div>

          <div className="relative">
            <div className="border-t border-white/20 pt-8">
              <p className="text-body-4 text-white/50 mb-5">가입 절차</p>
              <ol className="flex flex-col gap-4">
                {[
                  { step: "01", text: "정보 입력 및 가입 신청" },
                  { step: "02", text: "관리자 승인 후 가입 링크 발송" },
                  { step: "03", text: "링크를 통해 계정 생성 완료" },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="text-body-5 font-bold text-blue-4 w-8 shrink-0">{step}</span>
                    <span className="text-body-4 text-white/80">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* 오른쪽 폼 영역 */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* 단계 표시 */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-body-4 text-grey-6">정보 입력</span>
              </div>
              <div className="flex-1 h-px bg-blue-7 mx-1" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-body-4 font-semibold text-blue-7">계정 생성</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-headline-5 font-bold text-grey-11 mb-2">계정 만들기</h2>
              {memberName ? (
                <p className="text-body-3 text-grey-6">
                  <span className="font-semibold text-blue-7">{memberName}</span> 성도님,
                  환영합니다! 로그인에 사용할 계정 정보를 설정해 주세요.
                </p>
              ) : (
                <p className="text-body-3 text-grey-6">사용할 아이디와 비밀번호를 설정해 주세요.</p>
              )}
            </div>

            {completeError && (
              <div className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">
                {completeError}{" "}
                <Link to="/login" className="underline font-semibold">
                  로그인 페이지로 이동
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 아이디(이메일) */}
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  아이디(이메일) <span className="text-red-400">*</span>
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="이메일 형식으로 입력해 주세요 (예: hong@example.com)"
                  className={inputCls("username")}
                />
                <p className="mt-1 h-[18px] text-body-5 text-red-500">{errors.username}</p>
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  비밀번호 <span className="text-red-400">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="영문·숫자·특수문자 조합 8자 이상"
                  className={inputCls("password")}
                />
                <p className="mt-1 h-[18px] text-body-5 text-red-500">{errors.password}</p>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  비밀번호 확인 <span className="text-red-400">*</span>
                </label>
                <input
                  name="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  className={inputCls("confirm")}
                />
                <p className="mt-1 h-[18px] text-body-5 text-red-500">{errors.confirm}</p>
              </div>

              {errors.submit && (
                <p className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {errors.submit}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
              >
                {status === "submitting" ? "처리 중..." : "가입하기"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 완료 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
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
            <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">
              {church?.name ?? "교회"}의 일원이 된 것을 축하합니다!
            </h2>
            <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
              이제 모든 교회 서비스를 이용할 수 있습니다.
            </p>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
