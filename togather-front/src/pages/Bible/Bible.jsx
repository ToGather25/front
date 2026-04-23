import { Link } from "react-router";

export default function Bible() {
  return (
    <div className="max-w-[1576px] mx-auto px-8 py-20 flex flex-col items-center">
      <h1 className="text-sub-tit-1 font-bold text-grey-12 mb-16 text-center">
        오늘 하실 신앙 생활은 무엇인가요?
      </h1>
      <div className="flex gap-6">
        <Link
          to="/말씀/필사"
          className="w-72 h-80 bg-blue-8 rounded-2xl flex flex-col items-center justify-center gap-6 text-white hover:bg-blue-9 transition-colors"
        >
          <span className="text-sub-tit-3 font-semibold">성경 쓰기</span>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </Link>
        <Link
          to="/말씀/읽기"
          className="w-72 h-80 bg-white border-2 border-blue-3 rounded-2xl flex flex-col items-center justify-center gap-6 text-grey-11 hover:bg-blue-1 transition-colors"
        >
          <span className="text-sub-tit-3 font-semibold">성경 읽기</span>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
