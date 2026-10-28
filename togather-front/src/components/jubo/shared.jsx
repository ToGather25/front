import { Link } from "react-router";
import BubbleLoader from "@/components/common/BubbleLoader";
import logoFallback from "@/assets/icons/옥길교회_logo.png";
import { BOOK_ABBREV } from "@/config/bible.config";

// JuboPageSystem(북뷰, JuboPage2~8)의 공통 조각 — 상단 타이틀바/날짜, 섹션 소제목,
// 회색 박스, 예배 순서(역할/담당자) 리스트, 하단 로고. Figma 디자인의 반복 패턴을 공유한다.

/** 북뷰 페이지 상단 타이틀바 — 진한 바탕 제목 + 연한 바탕 날짜. */
export function JuboBookHeader({ title, dateLabel }) {
  return (
    <div className="flex items-stretch shrink-0">
      <div className="flex-3 bg-primary text-white px-4 py-2">
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="flex-1 bg-blue-3 text-white px-4 py-2 flex items-center justify-center">
        <span className="text-xs">{dateLabel || ""}</span>
      </div>
    </div>
  );
}

/** 북뷰 페이지 하단 중앙 로고. */
export function JuboBookFooter({ church }) {
  return (
    <div className="shrink-0 flex justify-center pb-4 pt-2">
      <img src={church.logoUrl || logoFallback} alt={church.name} className="h-6" />
    </div>
  );
}

/** 왼쪽 파란 포인트 바 + 굵은 소제목(필요 시 우측 보조 텍스트). */
export function JuboSectionTitle({ title, right }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-1 h-4 bg-primary rounded shrink-0" />
        <h3 className="text-md font-semibold text-grey-12 truncate">{title}</h3>
      </div>
      {right && <div className="text-sm font-semibold text-grey-12 tracking-wide">{right}</div>}
    </div>
  );
}

/** 연회색 둥근 박스 — 섹션 본문 컨테이너. */
export function JuboGreyBox({ children, className = "" }) {
  return <div className={`bg-bluegrey-1 rounded-lg pl-8 py-4 ${className}`}>{children}</div>;
}

/**
 * 흰 배경 요약 표 — 제목 바로 아래 올라가는 N열×M행 표(예: 1부/2부 시간표).
 * `columns`로 열 구성, `rows`로 행 데이터를 넘기면 그만큼 렌더된다.
 *
 * @param {{key:string, header?:string, headerClassName?:string, className?:string,
 *   render?:(row:object)=>any}[]} columns - 열 정의. render가 있으면 그 결과를, 없으면
 *   row[key]를 그대로 찍는다. 첫 번째 열은 기본적으로 굵게, 나머지는 회색으로 스타일된다.
 * @param {object[]} rows - 행 데이터.
 * @param {string} [rowKey="name"] - React key로 쓸 필드명.
 */
export function JuboWhiteTable({ columns, rows, rowKey = "name", className = "" }) {
  if (!rows || rows.length === 0) return null;
  const hasHeader = columns.some((c) => c.header);
  return (
    <div className={`bg-white border border-bluegrey-6 rounded-lg px-3 py-2 ${className}`}>
      <table className="w-full text-sm">
        {hasHeader && (
          <thead>
            <tr className="border-b border-grey-2">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.headerClassName ?? "py-1.5 px-2 text-grey-9 font-bold text-center"}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {hasHeader && (
            <tr aria-hidden="true">
              <td colSpan={columns.length} className="pt-3" />
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row[rowKey] ?? i}>
              {columns.map((col) => (
                <td key={col.key} className="py-1.5 text-center text-grey-7">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "출애굽기 20장 7절" 같은 문구에서 성경 읽기 화면으로 이동할 book/chapter를 뽑아낸다 — 알려진
 * 책 이름이 아니면(오타, 책 이름 없음 등) null을 반환해 링크를 걸지 않는다. */
function parseScriptureRef(text) {
  const m = text?.match(/^(\S+)\s*(\d+)\s*장/);
  if (!m || !BOOK_ABBREV[m[1]]) return null;
  return { book: m[1], chapter: Number(m[2]) };
}

/** 역할/담당자 쌍 리스트(예배 순서, 새벽기도회 순서 등). "성경봉독" 행의 담당자 텍스트는
 * 해당 구절로 바로 이동하는 링크로 렌더한다. */
export function JuboOrderList({ order, loading, emptyText = "정보 없음" }) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BubbleLoader size="xs" />
      </div>
    );
  }
  if (!order || order.length === 0) {
    return <p className="text-center text-xs text-grey-6 py-4">{emptyText}</p>;
  }
  return (
    <div>
      {order.map(({ role, name }, i) => {
        const isScripture = role?.replace(/\s/g, "") === "성경봉독";
        const scripture = isScripture ? parseScriptureRef(name) : null;
        return (
          <div key={i} className="flex gap-4 py-2 text-sm">
            <div
              className="w-20 shrink-0 font-semibold text-grey-12 [text-align:justify] [text-align-last:justify] [text-justify:inter-character]"
            >
              {role}
            </div>
            {scripture ? (
              <Link
                to="/말씀/읽기"
                state={scripture}
                className="flex-1 font-light text-center tracking-widest whitespace-pre-line text-blue-600 underline hover:text-blue-700"
              >
                {name}
              </Link>
            ) : (
              <div className="flex-1 font-light text-center tracking-widest whitespace-pre-line">
                {name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 주보 컨텐츠 래퍼 — 화면: 반응형 / 인쇄: A4
export function JuboPage({ children, noPadding = false }) {
  return (
    <div className="jubo-page w-[90%] mx-auto bg-white border border-bluegrey-2 shadow-md overflow-hidden min-h-[750px]">
      <div className={noPadding ? "" : "p-4 md:p-8 lg:p-10"}>{children}</div>
    </div>
  );
}

// 공통 섹션 타이틀
export function SectionTitle({ icon, children }) {
  return (
    <>
      <h3 className="flex items-center gap-2.5 text-sub-tit-4 font-bold text-grey-11 mb-4">
        {icon}
        {children}
      </h3>
      <div className="border-t-2 border-grey-11" />
    </>
  );
}
