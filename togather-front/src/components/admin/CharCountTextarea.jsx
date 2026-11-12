/** 요청서가 요구하는 "최소~최대 글자수" 조건을 입력창에서 바로 보여주는 textarea. */
export default function CharCountTextarea({ id, label, value, onChange, min, max, placeholder, rows = 6 }) {
  const len = value.length;
  const tooShort = min != null && len > 0 && len < min;
  const tooLong = max != null && len > max;
  const invalid = tooShort || tooLong;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-body-5 font-semibold text-grey-7 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none transition-colors ${
          invalid ? "border-red-400" : "border-grey-3 focus:border-primary"
        }`}
      />
      {(min != null || max != null) && (
        <p className={`text-body-5 mt-1 ${invalid ? "text-red-500" : "text-grey-5"}`}>
          {len}자
          {min != null && max != null ? ` (최소 ${min}자 · 최대 ${max}자)` : ""}
          {tooShort && " · 최소 글자수 미달"}
          {tooLong && " · 최대 글자수 초과"}
        </p>
      )}
    </div>
  );
}
