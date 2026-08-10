import PopupClose from "@/assets/icon-svg/popup-close.svg";
import ArrowBack from "@/assets/icon-svg/mypage-arrow-back.svg";

export function IconClose() {
  return <img src={PopupClose} className="w-5 h-5" alt="" />;
}

export function IconBack() {
  return <img src={ArrowBack} className="w-[18px] h-[18px]" alt="" />;
}

export function ReadonlyField({ label, value, note }) {
  return (
    <div>
      <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
      <div className="border border-grey-3 rounded-lg px-4 py-3 text-body-4 text-grey-8 bg-grey-2 cursor-not-allowed select-none">
        {value}
      </div>
      {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
    </div>
  );
}

export function InputField({ label, value, onChange, placeholder, type = "text", note }) {
  return (
    <div>
      <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors"
      />
      {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
    </div>
  );
}

export function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-6 hover:text-grey-9 transition-colors"
        >
          <IconClose />
        </button>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    "답변 완료": "text-green-700 bg-green-50 border border-green-200",
    "답변 대기": "text-amber-600 bg-amber-50 border border-amber-200",
    "진행 중": "text-blue-600 bg-blue-50 border border-blue-200",
    "참석 예정": "text-teal-700 bg-teal-50 border border-teal-200",
    미정: "text-grey-6 bg-grey-2 border border-grey-4",
  };
  return (
    <span
      className={`text-body-5 rounded-full px-3 py-1 whitespace-nowrap ${styles[status] ?? "text-grey-7 bg-grey-2"}`}
    >
      {status}
    </span>
  );
}

export function Pagination({ total, perPage, current, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-5">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-body-5 transition-colors ${
            p === current ? "bg-primary text-white font-semibold" : "text-grey-7 hover:bg-grey-2"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
