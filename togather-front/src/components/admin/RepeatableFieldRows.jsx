import ImageUploadField from "./ImageUploadField";

const inputCls =
  "border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-10 focus:outline-none focus:border-primary transition-colors";

/**
 * 평평한(flat) 필드로만 이루어진 반복 입력 리스트 — 층별안내/대중교통/주차 상세/연혁 등
 * "같은 모양의 행이 여러 개"인 섹션에서 공통으로 쓴다. 필드별 textarea 여부만 다르면 되는
 * 경우를 모두 커버하므로 섹션별로 매번 새 리스트 UI를 만들지 않는다.
 *
 * @param {{key:string, placeholder:string, type?:"text"|"image"}[]} fields - type이 "image"면
 *   텍스트 입력 대신 좁은 셀에 맞는 인라인 이미지 업로드(ImageUploadField compact)를 보여준다.
 */
export default function RepeatableFieldRows({ rows, onChange, fields, addLabel, emptyRow }) {
  const update = (i, key, val) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, emptyRow]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid gap-3 items-center"
          style={{ gridTemplateColumns: `${fields.map(() => "1fr").join(" ")} auto` }}
        >
          {fields.map((f) =>
            f.type === "image" ? (
              <ImageUploadField
                key={f.key}
                compact
                value={row[f.key] ?? ""}
                onChange={(url) => update(i, f.key, url)}
                ariaLabel={`${addLabel} ${i + 1} ${f.placeholder}`}
              />
            ) : (
              <input
                key={f.key}
                className={inputCls}
                value={row[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => update(i, f.key, e.target.value)}
                aria-label={`${addLabel} ${i + 1} ${f.placeholder}`}
              />
            ),
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`${addLabel} ${i + 1} 삭제`}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-5 hover:bg-grey-2 hover:text-red-500 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="mt-1 flex items-center gap-2 text-body-4 text-primary font-medium hover:underline w-fit"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {addLabel} 추가
      </button>
    </div>
  );
}
