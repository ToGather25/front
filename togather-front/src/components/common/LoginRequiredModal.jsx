import { Link } from "react-router";

export default function LoginRequiredModal({ message, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[320px] md:max-w-[450px] px-8 py-10 md:py-12 flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-1 flex items-center justify-center">
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-primary"
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
          <p className="text-sub-tit-4 md:text-sub-tit-3 font-bold text-grey-12 mb-2">
            로그인이 필요한 서비스입니다
          </p>
          <p className="text-body-4 md:text-body-3 text-grey-6">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 md:py-3.5 rounded-full border border-bluegrey-2 text-body-4 md:text-body-3 font-semibold text-grey-9 hover:border-blue-5 hover:text-primary transition-colors"
          >
            취소
          </button>
          <Link
            to="/login"
            onClick={onCancel}
            className="flex-1 py-3 md:py-3.5 rounded-full bg-primary text-white text-body-4 md:text-body-3 font-semibold text-center hover:bg-blue-8 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
