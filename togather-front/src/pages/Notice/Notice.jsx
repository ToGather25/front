import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { bg: "rgba(61,85,136,.12)",  color: "#2b3c61" },
  행사: { bg: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { bg: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

const PAGE_SIZE = 10;

function IconPin() {
  return (
    <span className="inline-flex items-center justify-center shrink-0 rounded-[5px] w-[22px] h-[22px] bg-blue-7">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    </span>
  );
}

function Pagination({ total, perPage, current, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-body-4 font-medium transition-colors ${
            p === current ? "bg-primary text-white" : "text-grey-7 hover:bg-grey-2"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

export default function Notice() {
  const { church } = useChurch();
  const { data: notices = [] } = useFetch(
    () => getNotices(church.id),
    [church.id],
    []
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("전체");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id && notices.length > 0) {
      const found = notices.find(n => String(n.id) === id);
      if (found) setSelected(found);
    }
  }, [notices, searchParams]);

  const filtered = tab === "전체" ? notices : notices.filter(n => n.type === tab);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTabChange(t) {
    setTab(t);
    setPage(1);
    setSelected(null);
  }

  function formatDate(dateStr) {
    return dateStr?.replace(/-/g, ".");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-body-5 text-grey-6 mb-1">교회소식</p>
        <h1 className="text-headline-4 font-bold text-grey-11">공지사항</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-5 py-2 rounded-full text-body-4 font-medium transition-colors ${
              t === tab
                ? "bg-primary text-white"
                : "bg-grey-2 text-grey-7 hover:bg-grey-3"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 목록 or 상세 */}
      {selected ? (
        /* 상세 */
        <div className="border border-grey-3 rounded-2xl overflow-hidden">
          {/* 상세 헤더 */}
          <div className="border-b border-grey-3 px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              {selected.featured && (
                <IconPin />
              )}
              <span
                className="text-body-5 font-bold px-1 py-1 rounded-md"
                style={TAG_STYLES[selected.type] ?? TAG_STYLES["공지"]}
              >
                {selected.type}
              </span>
            </div>
            <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">{selected.title}</h2>
            <div className="flex items-center gap-4 text-body-5 text-grey-6">
              <span>{selected.author}</span>
              <span>·</span>
              <span>{formatDate(selected.date)}</span>
            </div>
          </div>
          {/* 본문 */}
          <div className="px-8 py-8 min-h-[200px]">
            <p className="text-body-3 text-grey-9 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
          </div>
          {/* 하단 */}
          <div className="border-t border-grey-3 px-8 py-4 flex justify-end">
            <button
              onClick={() => { setSelected(null); setSearchParams({}); }}
              className="border border-grey-4 text-grey-7 rounded-full px-6 py-2 text-body-4 hover:bg-grey-1 transition-colors"
            >
              목록으로
            </button>
          </div>
        </div>
      ) : (
        /* 목록 */
        <>
          <div className="border border-grey-3 rounded-2xl overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[80px_1fr_80px_100px] bg-grey-1 border-b border-grey-3 px-6 py-3 text-body-5 font-semibold text-grey-7">
              <span className="text-center">구분</span>
              <span className="pl-4">제목</span>
              <span className="text-center">작성자</span>
              <span className="text-center">날짜</span>
            </div>

            {paged.length === 0 ? (
              <div className="py-20 text-center text-grey-5 text-body-3">
                공지사항이 없습니다.
              </div>
            ) : (
              paged.map((n, i) => {
                const tagStyle = TAG_STYLES[n.type] ?? TAG_STYLES["공지"];
                return (
                  <button
                    key={n.id}
                    onClick={() => { setSelected(n); setSearchParams({ id: n.id }); }}
                    className={`w-full grid grid-cols-[80px_1fr_80px_100px] items-center px-6 py-4 text-left transition-colors hover:bg-grey-1 ${
                      i < paged.length - 1 ? "border-b border-grey-3" : ""
                    } ${n.featured ? "bg-blue-1/30" : ""}`}
                  >
                    <span className="flex justify-center">
                      <span
                        className="text-body-5 font-bold px-2.5 py-1 rounded-md text-center"
                        style={tagStyle}
                      >
                        {n.type}
                      </span>
                    </span>
                    <span className="pl-4 flex items-center gap-2 min-w-0">
                      {n.featured && (
                        <IconPin className="shrink-0 text-primary" />
                      )}
                      <span className={`truncate text-body-3 ${n.featured ? "font-semibold text-grey-11" : "text-grey-10"}`}>
                        {n.title}
                      </span>
                    </span>
                    <span className="text-center text-body-5 text-grey-6">{n.author}</span>
                    <span className="text-center text-body-5 text-grey-6">{formatDate(n.date)}</span>
                  </button>
                );
              })
            )}
          </div>

          <Pagination
            total={filtered.length}
            perPage={PAGE_SIZE}
            current={page}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
