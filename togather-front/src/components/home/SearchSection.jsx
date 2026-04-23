export default function SearchSection() {
  return (
    <section className="w-full py-10 flex flex-col items-center gap-4">
      <p className="text-sub-tit-3 font-semibold text-grey-11 tracking-tight">
        원하는 기능이 있으신가요?
      </p>
      <div className="flex items-center gap-3 px-5 py-3 bg-bluegrey-1 border border-bluegrey-3 rounded-full w-full max-w-[560px] focus-within:border-blue-5 transition-colors">
        <svg
          className="w-5 h-5 text-grey-6 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className="flex-1 bg-transparent outline-none text-body-2 text-grey-10 placeholder:text-grey-6"
        />
      </div>
    </section>
  );
}
