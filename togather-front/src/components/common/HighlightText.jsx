const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * 텍스트 내에서 검색어와 일치하는 모든 구간을 강조 표시한다.
 * @param {{ text?: string, query?: string, className?: string }} props
 */
export default function HighlightText({ text = "", query = "", className = "text-blue-6 font-bold" }) {
  const q = query.trim();
  if (!q || !text) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className={`bg-transparent ${className}`}>
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
