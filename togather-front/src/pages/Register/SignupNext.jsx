import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

const PW_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;

export default function SignupNext() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { church } = useChurch();

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done | invalid
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // token 없이 직접 URL 접근하면 잘못된 접근 처리
    if (!token) setStatus("invalid");
    // TODO: 서버에서 token 유효성 검증
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (form.username.length < 4) errs.username = "아이디는 4자 이상이어야 합니다.";
    if (!PW_RULE.test(form.password)) errs.password = "비밀번호는 영문+숫자 조합 8자 이상이어야 합니다.";
    if (form.password !== form.confirm) errs.confirm = "비밀번호가 일치하지 않습니다.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("submitting");
    try {
      // TODO: POST /api/register/complete  { token, username, password }
      await new Promise((r) => setTimeout(r, 800));
      setStatus("done");
      setShowModal(true);
    } catch {
      setErrors({ submit: "가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요." });
      setStatus("idle");
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 border rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all ${
      errors[field] ? "border-red-400 bg-red-50" : "border-bluegrey-2"
    }`;

  // 잘못된 접근
  if (status === "invalid") {
    return (
      <div className="max-w-md mx-auto my-16 p-10 bg-white rounded-2xl shadow-xl border border-bluegrey-2 text-center">
        <div className="text-5xl mb-5">🚫</div>
        <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">잘못된 접근입니다</h2>
        <p className="text-body-3 text-grey-6">
          이 페이지는 관리자의 승인 링크를 통해서만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-bluegrey-2">
        {/* 단계 표시 */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">✓</span>
            <span className="text-body-4 text-grey-6">정보 입력</span>
          </div>
          <div className="flex-1 h-px bg-blue-7 mx-1" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-7 text-white text-body-5 font-bold flex items-center justify-center">2</span>
            <span className="text-body-4 font-semibold text-blue-7">계정 생성</span>
          </div>
        </div>

        <h1 className="text-sub-tit-2 font-bold text-grey-11 text-center mb-2">계정 만들기</h1>
        <p className="text-body-4 text-grey-6 text-center mb-8">
          사용할 아이디와 비밀번호를 설정해 주세요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-body-4 font-semibold text-grey-8">아이디 <span className="text-red-400">*</span></label>
              <button
                type="button"
                className="text-body-5 text-blue-7 hover:underline"
                onClick={() => {/* TODO: 중복 확인 API */}}
              >
                중복 확인
              </button>
            </div>
            <input name="username" type="text" required value={form.username} onChange={handleChange}
              placeholder="4자 이상 영문/숫자" className={inputCls("username")} />
            {errors.username && <p className="mt-1 text-body-5 text-red-500">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-body-4 font-semibold text-grey-8 mb-1">비밀번호 <span className="text-red-400">*</span></label>
            <input name="password" type="password" required value={form.password} onChange={handleChange}
              placeholder="영문+숫자 조합 8자 이상" className={inputCls("password")} />
            {errors.password && <p className="mt-1 text-body-5 text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-body-4 font-semibold text-grey-8 mb-1">비밀번호 확인 <span className="text-red-400">*</span></label>
            <input name="confirm" type="password" required value={form.confirm} onChange={handleChange}
              placeholder="비밀번호를 한 번 더 입력하세요" className={inputCls("confirm")} />
            {errors.confirm && <p className="mt-1 text-body-5 text-red-500">{errors.confirm}</p>}
          </div>

          {errors.submit && (
            <p className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3">{errors.submit}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors mt-1"
          >
            {status === "submitting" ? "처리 중..." : "가입하기"}
          </button>
        </form>
      </div>

      {/* 완료 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center">
            <div className="text-6xl mb-5">🎊</div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">
              {church?.name ?? "교회"}의 일원이 된 것을 축하합니다!
            </h2>
            <p className="text-body-3 text-grey-7 mb-8">
              이제 모든 교회 서비스를 이용할 수 있습니다.
            </p>
            <button
              onClick={() => { setShowModal(false); navigate("/login"); }}
              className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
            >
              로그인하러 가기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
