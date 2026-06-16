import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

const ADMIN_CONTACT = "010-0000-0000"; // TODO: church.config에서 관리팀 연락처 주입

export default function Register() {
  const { church } = useChurch();
  const [form, setForm] = useState({
    name: "",
    birthdate: "",
    phone: "",
    isNewcomer: false,
    agreePrivacy: false,
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | duplicate | done
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (status === "duplicate") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      // TODO: POST /api/register/request
      await new Promise((r) => setTimeout(r, 800));
      // 이미 존재하거나 승인 대기 중이면 서버에서 409 반환
      const isDuplicate = false; // 백엔드 연동 시 교체
      if (isDuplicate) {
        setStatus("duplicate");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("duplicate"); // 실패 시 임시 처리
    }
  };

  const copyContact = () => {
    navigator.clipboard.writeText(ADMIN_CONTACT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inputCls =
    "w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

  if (status === "done") {
    return (
      <div className="max-w-md mx-auto my-16 p-10 bg-white rounded-2xl shadow-xl border border-bluegrey-2 text-center">
        <div className="text-5xl mb-5">🎉</div>
        <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">가입 신청이 완료되었습니다</h2>
        <p className="text-body-3 text-grey-7 leading-relaxed">
          관리팀의 승인 후 가입 링크를 보내드립니다.<br />
          승인 완료까지 1~2 영업일이 소요될 수 있습니다.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-bluegrey-2">
      {/* 단계 표시 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">1</span>
          <span className="text-body-4 font-semibold text-blue-7">정보 입력</span>
        </div>
        <div className="flex-1 h-px bg-bluegrey-2 mx-1" />
        <div className="flex items-center gap-2 opacity-40">
          <span className="w-6 h-6 rounded-full bg-bluegrey-3 text-white text-body-5 font-bold flex items-center justify-center">2</span>
          <span className="text-body-4 text-grey-6">계정 생성</span>
        </div>
      </div>

      <h1 className="text-sub-tit-2 font-bold text-grey-11 text-center mb-2">회원가입</h1>
      <p className="text-body-4 text-grey-6 text-center mb-8">
        {church?.name ?? "교회"} 성도이신가요? 먼저 정보를 입력해 주세요.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1">이름 <span className="text-red-400">*</span></label>
          <input name="name" type="text" required value={form.name} onChange={handleChange}
            placeholder="홍길동" className={inputCls} />
        </div>

        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1">생년월일 <span className="text-red-400">*</span></label>
          <input name="birthdate" type="date" required value={form.birthdate} onChange={handleChange}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1">휴대폰 번호 <span className="text-red-400">*</span></label>
          <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
            placeholder="010-0000-0000" className={inputCls} />
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
          <label htmlFor="isNewcomer" className="text-body-3 text-blue-8 cursor-pointer select-none">
            새신자입니다
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="agreePrivacy"
            name="agreePrivacy"
            type="checkbox"
            required
            checked={form.agreePrivacy}
            onChange={handleChange}
            className="w-4 h-4 mt-0.5 accent-blue-7 shrink-0"
          />
          <label htmlFor="agreePrivacy" className="text-body-4 text-grey-7 cursor-pointer select-none leading-relaxed">
            <span className="text-red-400">*</span> 개인정보 수집·이용에 동의합니다.
            수집된 정보는 교회 구성원 관리 목적으로만 사용됩니다.
          </label>
        </div>

        {/* 중복/승인 대기 에러 */}
        {status === "duplicate" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-4 text-red-700 leading-relaxed">
            이미 존재하거나 승인 처리 중인 계정입니다.{" "}
            <button
              type="button"
              onClick={copyContact}
              className="font-semibold underline hover:text-red-900 transition-colors"
            >
              관리팀
            </button>
            에 요청하세요.
            {copied && <span className="ml-2 text-green-600">✓ 연락처가 복사되었습니다</span>}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || !form.agreePrivacy}
          className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors mt-1"
        >
          {status === "submitting" ? "신청 중..." : "가입 신청하기"}
        </button>
      </form>

      <p className="text-center text-body-4 text-grey-6 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="text-blue-7 hover:underline font-semibold">로그인</Link>
      </p>
    </div>
  );
}
