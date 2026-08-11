import { Link } from "react-router";

export default function LoginRequiredModal({ message, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[320px] px-8 py-8 flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-blue-1 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sub-tit-4 font-bold text-grey-12 mb-2">
            로그인이 필요한 서비스입니다
          </p>
          <p className="text-body-4 text-grey-6">{message}</p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border border-bluegrey-2 text-body-4 font-semibold text-grey-9 hover:border-blue-5 hover:text-primary transition-colors"
          >
            취소
          </button>
          <Link
            to="/login"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full bg-primary text-white text-body-4 font-semibold text-center hover:bg-blue-8 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
