import { useActionState } from "react";

async function loginAction(prevState, formData) {
  const email = formData.get("email");
  await new Promise(res => setTimeout(res, 1000));
  if (email === "test@test.com") return { message: "환영합니다!" };
  return { error: "이메일 또는 비밀번호가 일치하지 않습니다." };
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-bluegrey-2">
      <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-8 text-center">로그인</h2>

      <form action={formAction} className="flex flex-col gap-y-5">
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-blue-7 text-white rounded-lg font-bold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
        >
          {isPending ? "확인 중..." : "로그인"}
        </button>

        {state?.error && <p className="text-center text-red-500 text-body-4 font-medium">{state.error}</p>}
        {state?.message && <p className="text-center text-green-500 text-body-4 font-medium">{state.message}</p>}
      </form>
    </div>
  );
}