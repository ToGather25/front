import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { getErrorMessage } from "@/utils/apiErrors";
import IcoPhone from "@/assets/icon-svg/main-phone.svg";

const ADMIN_CONTACT = "02-2615-4067";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

export default function Register() {
  const { church } = useChurch();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    phone: "",
    isNewcomer: false,
    agreePrivacy: false,
  });
  const [status, setStatus] = useState("idle");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleCopyContact() {
    try {
      await navigator.clipboard.writeText(ADMIN_CONTACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 조용히 무시(연락처는 여전히 화면에 보임)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBirthSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      const maxDay = daysInMonth(next.birthYear, next.birthMonth);
      if (next.birthDay && Number(next.birthDay) > maxDay) next.birthDay = "";
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setSubmitError("");
    try {
      const birthdate = `${form.birthYear}-${String(form.birthMonth).padStart(2, "0")}-${String(form.birthDay).padStart(2, "0")}`;
      await register({
        name: form.name,
        birthdate,
        phone: form.phone,
        isNewcomer: form.isNewcomer,
        agreePrivacy: form.agreePrivacy,
      });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      if (err.response?.data?.code === "SU001") {
        setShowDuplicateModal(true);
      } else {
        setSubmitError(getErrorMessage(err));
      }
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";
  const birthSelectCls =
    "px-3 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 bg-white focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

  if (status === "done") {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-grey-1 px-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-bluegrey-2 p-12 text-center">
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
          <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">가입 신청이 완료되었습니다</h2>
          <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
            성도 확인을 위해 관리자 승인 대기 중입니다.
            <br />
            승인이 완료되면 입력하신 번호로 가입 링크가 발송됩니다.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
          >
            로그인으로 돌아가기
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

          <div className="relative">
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
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-body-4 font-semibold text-blue-7">정보 입력</span>
              </div>
              <div className="flex-1 h-px bg-bluegrey-2 mx-1" />
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-6 h-6 rounded-full bg-bluegrey-3 text-white text-body-5 font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-body-4 text-grey-6">계정 생성</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-headline-5 font-bold text-grey-11 mb-2">회원가입</h2>
              <p className="text-body-3 text-grey-6">
                {church?.name ?? "교회"} 성도이신가요? 먼저 정보를 입력해 주세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  이름 <span className="text-red-400">*</span>
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
                  생년월일 <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="birthYear"
                    required
                    value={form.birthYear}
                    onChange={handleBirthSelectChange}
                    className={`${birthSelectCls} flex-1`}
                  >
                    <option value="" disabled>
                      년도
                    </option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}년
                      </option>
                    ))}
                  </select>
                  <select
                    name="birthMonth"
                    required
                    value={form.birthMonth}
                    onChange={handleBirthSelectChange}
                    className={`${birthSelectCls} flex-1`}
                  >
                    <option value="" disabled>
                      월
                    </option>
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </select>
                  <select
                    name="birthDay"
                    required
                    value={form.birthDay}
                    onChange={handleChange}
                    className={`${birthSelectCls} flex-1`}
                  >
                    <option value="" disabled>
                      일
                    </option>
                    {Array.from(
                      { length: daysInMonth(form.birthYear, form.birthMonth) },
                      (_, i) => i + 1,
                    ).map((d) => (
                      <option key={d} value={d}>
                        {d}일
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  휴대폰 번호 <span className="text-red-400">*</span>
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

              <div className="flex items-center gap-3 py-3 px-4 bg-blue-1 rounded-xl border border-blue-2">
                <input
                  id="isNewcomer"
                  name="isNewcomer"
                  type="checkbox"
                  checked={form.isNewcomer}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-7 shrink-0"
                />
                <label
                  htmlFor="isNewcomer"
                  className="text-body-3 text-blue-8 cursor-pointer select-none"
                >
                  새신자입니다
                </label>
              </div>

              <div className="flex items-start gap-3 py-1">
                <input
                  id="agreePrivacy"
                  name="agreePrivacy"
                  type="checkbox"
                  required
                  checked={form.agreePrivacy}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 accent-blue-7 shrink-0"
                />
                <label
                  htmlFor="agreePrivacy"
                  className="text-body-4 text-grey-7 cursor-pointer select-none leading-relaxed"
                >
                  <span className="text-red-400">*</span> 개인정보 수집·이용에 동의합니다. 수집된
                  정보는 교회 구성원 관리 목적으로만 사용됩니다.{" "}
                  <Link to="/privacy" className="text-blue-6 hover:underline">
                    개인정보처리방침
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "submitting" || !form.agreePrivacy}
                className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
              >
                {status === "submitting" ? "신청 중..." : "가입 신청하기"}
              </button>
              {submitError && (
                <p className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}
            </form>

            <p className="text-center text-body-4 text-grey-6 mt-8 border-t border-grey-2 pt-6">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="text-blue-7 hover:underline font-semibold">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 중복 신청 모달 */}
      {showDuplicateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg
                width="24"
                height="24"
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
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">신청을 확인해 주세요</h3>
            <p className="text-body-3 text-grey-7 leading-relaxed mb-6">
              이미 등록된 정보거나
              <br />
              승인 대기 중인 휴대폰 번호입니다.
              <br />
              교회 사무실로 문의해주세요.
            </p>
            <button
              type="button"
              onClick={handleCopyContact}
              className="flex items-center justify-center gap-1.5 text-body-4 text-grey-7 mb-6 mx-auto hover:text-blue-7 transition-colors"
            >
              <img src={IcoPhone} className="w-4 h-4 opacity-80" alt="" />
              {copied ? "복사되었습니다" : ADMIN_CONTACT}
            </button>
            <button
              onClick={() => setShowDuplicateModal(false)}
              className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
