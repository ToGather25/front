import { useState } from "react";

const DUMMY_SERMONS = [
  {
    id: 1,
    date: "2026.05.25",
    service: "주일 1부",
    title: "부활의 능력",
    pastor: "김영수 담임목사",
    scripture: "롬 8:11",
    views: 312,
  },
  {
    id: 2,
    date: "2026.05.25",
    service: "주일 2부",
    title: "성령으로 충만하라",
    pastor: "박성민 부목사",
    scripture: "엡 5:18",
    views: 287,
  },
  {
    id: 3,
    date: "2026.05.18",
    service: "주일 1부",
    title: "참된 예배",
    pastor: "김영수 담임목사",
    scripture: "요 4:23-24",
    views: 354,
  },
  {
    id: 4,
    date: "2026.05.14",
    service: "수요 예배",
    title: "기도의 능력",
    pastor: "이은혜 전도사",
    scripture: "약 5:16",
    views: 129,
  },
  {
    id: 5,
    date: "2026.05.11",
    service: "주일 1부",
    title: "새 힘을 얻으리니",
    pastor: "김영수 담임목사",
    scripture: "사 40:31",
    views: 401,
  },
  {
    id: 6,
    date: "2026.05.07",
    service: "수요 예배",
    title: "하나님의 뜻",
    pastor: "박성민 부목사",
    scripture: "롬 12:2",
    views: 145,
  },
];

const SERVICE_TYPES = ["전체", "주일 1부", "주일 2부", "수요 예배", "청년 예배"];

function Modal({ onClose, onSave }) {
  const [form, setForm] = useState({
    date: "",
    service: "주일 1부",
    title: "",
    pastor: "",
    scripture: "",
  });
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[520px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">설교 등록</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">날짜</label>
              <input
                type="date"
                className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">
                예배 구분
              </label>
              <select
                className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary bg-white"
                value={form.service}
                onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
              >
                {SERVICE_TYPES.filter((s) => s !== "전체").map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">설교 제목</label>
            <input
              className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
              placeholder="설교 제목 입력"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">설교자</label>
              <input
                className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
                placeholder="설교자 이름"
                value={form.pastor}
                onChange={(e) => setForm((p) => ({ ...p, pastor: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">
                본문 말씀
              </label>
              <input
                className="w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary"
                placeholder="예: 요 3:16"
                value={form.scripture}
                onChange={(e) => setForm((p) => ({ ...p, scripture: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorshipManage() {
  const [filter, setFilter] = useState("전체");
  const [sermons, setSermons] = useState(DUMMY_SERMONS);
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === "전체" ? sermons : sermons.filter((s) => s.service === filter);

  function handleSave(form) {
    setSermons((prev) => [
      {
        id: Date.now(),
        date: form.date,
        service: form.service,
        title: form.title,
        pastor: form.pastor,
        scripture: form.scripture,
        views: 0,
      },
      ...prev,
    ]);
  }

  function handleDelete(id) {
    if (confirm("삭제하시겠습니까?")) setSermons((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={handleSave} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">예배 및 설교 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          설교 등록
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {SERVICE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-body-5 font-medium transition-colors ${t === filter ? "bg-primary text-white" : "bg-white border border-grey-3 text-grey-7 hover:border-primary hover:text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
        <div
          className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
          style={{ gridTemplateColumns: "110px 110px 1fr 140px 100px 80px 100px" }}
        >
          <span>날짜</span>
          <span>예배 구분</span>
          <span>설교 제목</span>
          <span>설교자</span>
          <span>본문 말씀</span>
          <span className="text-center">조회</span>
          <span className="text-center">관리</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">등록된 설교가 없습니다.</div>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s.id}
              className={`grid items-center px-6 py-4 hover:bg-grey-1 transition-colors ${i < filtered.length - 1 ? "border-b border-grey-2" : ""}`}
              style={{ gridTemplateColumns: "110px 110px 1fr 140px 100px 80px 100px" }}
            >
              <span className="text-body-5 text-grey-6">{s.date}</span>
              <span className="text-body-5 font-medium text-primary bg-blue-1 px-2 py-0.5 rounded w-fit">
                {s.service}
              </span>
              <span className="text-body-4 font-medium text-grey-10 truncate pr-4">{s.title}</span>
              <span className="text-body-5 text-grey-7">{s.pastor}</span>
              <span className="text-body-5 text-grey-6">{s.scripture}</span>
              <span className="text-body-5 text-grey-6 text-center">
                {s.views.toLocaleString()}
              </span>
              <div className="flex gap-1.5 justify-center">
                <button className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors">
                  수정
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
