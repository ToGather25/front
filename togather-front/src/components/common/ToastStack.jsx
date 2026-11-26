const TONE_CLS = {
  success: "bg-grey-11 text-white",
  error: "bg-red-500 text-white",
};

/** useToasts()의 toasts를 화면 하단 중앙에 쌓아 보여준다. */
export default function ToastStack({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`px-5 py-3 rounded-xl text-body-4 font-medium shadow-lg animate-fadeIn ${
            TONE_CLS[t.tone] ?? TONE_CLS.success
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
