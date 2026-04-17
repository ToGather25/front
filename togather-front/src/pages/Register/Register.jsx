import { useActionState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

async function registerAction(prevState, formData) {
  const password = formData.get("password");
  const confirm = formData.get("confirm");
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };
  await new Promise((res) => setTimeout(res, 800));
  return { message: "회원가입이 완료되었습니다." };
}

export default function Register() {
  const { church } = useChurch();
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-sub-tit-2 font-bold text-grey-11 text-center mb-8">회원가입</h1>

      <form action={formAction} className="flex flex-col gap-5">
        {[
          { label: "이름", name: "name", type: "text", placeholder: "홍길동" },
          { label: "이메일", name: "email", type: "email", placeholder: "example@email.com" },
          { label: "비밀번호", name: "password", type: "password", placeholder: "8자 이상 입력하세요" },
          { label: "비밀번호 확인", name: "confirm", type: "password", placeholder: "비밀번호를 한 번 더 입력하세요" },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name}>
            <label className="block text-field-title font-semibold text-grey-7 mb-1 uppercase tracking-wide">
              {label}
            </label>
            <input
              name={name}
              type={type}
              required
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all"
            />
          </div>
        ))}

        <div>
          <label className="block text-field-title font-semibold text-grey-7 mb-1 uppercase tracking-wide">
            소속 공동체
          </label>
          <select
            name="community"
            className="w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none"
          >
            <option value="">선택하세요</option>
            {church.communities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-blue-8 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-9 disabled:bg-blue-4 transition-colors mt-2"
        >
          {isPending ? "처리 중..." : "가입하기"}
        </button>

        {state?.error && <p className="text-center text-red-500 text-body-4">{state.error}</p>}
        {state?.message && <p className="text-center text-blue-7 text-body-4">{state.message}</p>}
      </form>

      <p className="text-center text-body-4 text-grey-6 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="text-blue-7 hover:underline font-semibold">로그인</Link>
      </p>
    </div>
  );
}
