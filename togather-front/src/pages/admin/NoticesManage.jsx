import { useState } from "react";
import { DUMMY_NOTICES } from "@/data/dummy/notices";

const TABS = ["전체", "공지", "행사", "소식"];

const TAG_STYLES = {
  공지: { background: "rgba(61,85,136,.12)", color: "#2b3c61" },
  행사: { background: "rgba(255,150,27,.14)", color: "#cc6600" },
  소식: { background: "rgba(32,152,243,.14)", color: "#1a7bc0" },
};

function NoticeModal({ notice, onClose, onSave }) {
  const isEdit = !!notice;
  const [form, setForm] = useState(notice ?? { type: "공지", title: "", body: "", author: "", featured: false });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
      <div className="bg-white rounded-2xl p-8 w-[560px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">{isEdit ? "공지 수정" : "공지 등록"}</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">카테고리</label>
              <select className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary bg-white"
                value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                {["공지", "행사", "소식"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">작성자</label>
              <input className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
                value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))} placeholder="작성자" />
            </div>
          </div>
          <div>
            <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">제목</label>
            <input className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
              value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="공지 제목" />
          </div>
          <div>
            <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">내용</label>
            <textarea rows={5} className="w-full border border-grey-3 rounded-xl px-4 py-3 text-body-4 focus:outline-none focus:border-primary resize-none"
              value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} placeholder="공지 내용을 입력하세요" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({...p, featured: e.target.checked}))} className="w-4 h-4 accent-primary" />
            <span className="text-body-4 text-grey-8">상단 고정</span>
          </label>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors">취소</button>
          <button onClick={() => { onSave(form); onClose(); }} className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors">
            {isEdit ? "저장" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NoticesManage() {
  const [tab, setTab] = useState("전체");
  const [notices, setNotices] = useState(DUMMY_NOTICES.map(n => ({ ...n, views: Math.floor(Math.random() * 500 + 10) })));
  const [modal, setModal] = useState(null); // null | "new" | { notice }
  const [search, setSearch] = useState("");

  const filtered = notices
    .filter(n => tab === "전체" || n.type === tab)
    .filter(n => n.title.includes(search));

  function handleSave(form) {
    if (form.id) {
      setNotices(prev => prev.map(n => n.id === form.id ? { ...n, ...form } : n));
    } else {
      setNotices(prev => [{ ...form, id: Date.now(), date: new Date().toISOString().slice(0,10), views: 0 }, ...prev]);
    }
  }

  function handleDelete(id) {
    if (confirm("삭제하시겠습니까?")) setNotices(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div>
      {modal && (
        <NoticeModal
          notice={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">공지/행사 관리</h1>
        <button onClick={() => setModal("new")} className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          공지 등록
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-body-5 font-medium transition-colors ${t === tab ? "bg-primary text-white" : "bg-white border border-grey-3 text-grey-7 hover:border-primary hover:text-primary"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <input
            className="border border-grey-3 rounded-xl pl-9 pr-4 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary w-64"
            placeholder="제목 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
        <div className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
          style={{ gridTemplateColumns: "48px 80px 1fr 80px 100px 72px 80px 100px" }}>
          <span className="text-center">No</span>
          <span className="text-center">구분</span>
          <span className="pl-2">제목</span>
          <span className="text-center">작성자</span>
          <span className="text-center">작성일</span>
          <span className="text-center">조회</span>
          <span className="text-center">고정</span>
          <span className="text-center">관리</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">공지사항이 없습니다.</div>
        ) : filtered.map((n, i) => (
          <div key={n.id}
            className={`grid items-center px-6 py-3.5 hover:bg-grey-1 transition-colors ${i < filtered.length - 1 ? "border-b border-grey-2" : ""}`}
            style={{ gridTemplateColumns: "48px 80px 1fr 80px 100px 72px 80px 100px" }}>
            <span className="text-body-5 text-grey-5 text-center">{i + 1}</span>
            <span className="flex justify-center">
              <span className="text-body-5 font-bold px-2 py-0.5 rounded" style={TAG_STYLES[n.type] ?? TAG_STYLES["공지"]}>{n.type}</span>
            </span>
            <span className="pl-2 text-body-4 text-grey-9 truncate flex items-center gap-1.5 pr-4">
              {n.featured && (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                  <line x1="6" y1="8.5" x2="6" y2="11"/><path d="M2.5 8.5h7v-.88a1 1 0 00-.56-.9l-.89-.44A1 1 0 018 5.38V3h.5a1 1 0 000-2H3.5a1 1 0 000 2H4v2.38a1 1 0 01-.56.9l-.89.44a1 1 0 00-.55.9Z"/>
                </svg>
              )}
              {n.title}
            </span>
            <span className="text-body-5 text-grey-6 text-center">{n.author}</span>
            <span className="text-body-5 text-grey-6 text-center">{n.date?.replace(/-/g, ".")}</span>
            <span className="text-body-5 text-grey-6 text-center">{n.views}</span>
            <span className="text-center">
              {n.featured
                ? <span className="text-body-5 font-semibold text-primary">고정</span>
                : <span className="text-body-5 text-grey-4">-</span>
              }
            </span>
            <div className="flex gap-1.5 justify-center">
              <button onClick={() => setModal(n)} className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors">수정</button>
              <button onClick={() => handleDelete(n.id)} className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
