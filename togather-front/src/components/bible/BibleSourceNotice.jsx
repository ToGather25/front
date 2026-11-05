/** 성경 본문 출처 표시 — 대한성서공회 개역한글판 이용 규칙(성명표시권) 준수를 위해
 * 성경 본문이 보이는 화면 하단에 둔다. */
export default function BibleSourceNotice({ className = "" }) {
  return (
    <p className={`text-caption-smaller text-grey-5 leading-relaxed ${className}`}>
      성경 본문 출처: 『성경전서 개역한글판』(1961), 대한성서공회.
      <br />
      본 사이트에서 제공하는 성경 본문은 개역한글판을 사용합니다.
    </p>
  );
}
