export default function PrevNextPagination({ page, hasNext, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span className="text-body-4 font-medium text-grey-8 min-w-[24px] text-center">{page}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
        aria-label="다음 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
