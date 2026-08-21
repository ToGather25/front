import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/services/eventsService";
import { EVENT_CATEGORIES, getDepartmentStyle } from "@/config/events.config";
import { formatDotDate, formatTimeRange } from "@/utils/date";
import { getRegistrationState } from "@/utils/eventStatus";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function emptyForm() {
  return {
    title: "",
    department: EVENT_CATEGORIES[0],
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    imageUrl: "",
    canRegister: false,
  };
}

function toFormState(event) {
  if (!event) return emptyForm();
  return {
    ...event,
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    imageUrl: event.imageUrl ?? "",
  };
}

function EventFormModal({ event, onClose, onSave, saving }) {
  const isEdit = !!event;
  const [form, setForm] = useState(toFormState(event));

  const set = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.date) return;
    onSave({
      ...form,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      imageUrl: form.imageUrl || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">
          {isEdit ? "행사 수정" : "새 행사 등록"}
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>행사명</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={set("title")}
              placeholder="행사명"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>주최 부서</label>
              <select
                className={`${inputCls} bg-white`}
                value={form.department}
                onChange={set("department")}
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>장소</label>
              <input
                className={inputCls}
                value={form.location}
                onChange={set("location")}
                placeholder="장소"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>행사 날짜</label>
              <input type="date" className={inputCls} value={form.date} onChange={set("date")} />
            </div>
            <div>
              <label className={labelCls}>시작 시간</label>
              <input
                type="time"
                className={inputCls}
                value={form.startTime}
                onChange={set("startTime")}
              />
            </div>
            <div>
              <label className={labelCls}>종료 시간</label>
              <input
                type="time"
                className={inputCls}
                value={form.endTime}
                onChange={set("endTime")}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>상세 내용</label>
            <textarea
              rows={6}
              className={`${inputCls} resize-none`}
              value={form.description}
              onChange={set("description")}
              placeholder="행사 내용을 입력하세요"
            />
            <p className="text-body-5 text-grey-5 mt-1">줄바꿈은 그대로 반영됩니다.</p>
          </div>

          <div>
            <label className={labelCls}>대표 이미지 URL</label>
            <input
              className={inputCls}
              value={form.imageUrl}
              onChange={set("imageUrl")}
              placeholder="비워두면 기본 배너가 표시됩니다"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.canRegister}
              onChange={set("canRegister")}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-body-4 text-grey-8">신청 받기</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            disabled={saving}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:opacity-60 transition-colors"
          >
            {saving ? "저장 중..." : isEdit ? "저장" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

const GRID_COLS = "48px 90px 1fr 130px 120px 100px 110px";

const STATUS_BADGE = {
  open: "bg-blue-1 text-blue-8",
  closed: "bg-grey-2 text-grey-6",
};

const ADMIN_STATUS_LABEL = {
  open: "신청가능",
  closed: "신청마감",
};

export default function EventsManage() {
  const { church } = useChurch();
  const {
    data: events = [],
    loading,
    refetch,
  } = useFetch(() => getEvents(church.id), [church.id], []);
  const [tab, setTab] = useState("전체");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | event
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const filtered = events
    .filter((e) => tab === "전체" || e.department === tab)
    .filter((e) => (e.title ?? "").includes(search) || (e.location ?? "").includes(search))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  async function handleSave(form) {
    setSaving(true);
    try {
      if (form.id) await updateEvent(church.id, form.id, form);
      else await createEvent(church.id, form);
      await refetch();
      setModal(null);
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    setDeleteError(null);
    try {
      await deleteEvent(church.id, id);
      await refetch();
    } catch {
      setDeleteError("삭제할 수 없습니다. 이미 신청 내역이 있는 행사일 수 있습니다.");
    }
  }

  return (
    <div>
      {modal && (
        <EventFormModal
          event={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">교회행사 관리</h1>
        <button
          onClick={() => setModal("new")}
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
          행사 등록
        </button>
      </div>
      {deleteError && <p className="text-body-4 text-red-500 mb-4">{deleteError}</p>}

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-2">
          {["전체", ...EVENT_CATEGORIES].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-body-5 font-medium transition-colors ${
                t === tab
                  ? "bg-primary text-white"
                  : "bg-white border border-grey-3 text-grey-7 hover:border-primary hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <input
            className="border border-grey-3 rounded-xl pl-9 pr-4 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary w-64"
            placeholder="행사명 / 장소 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <img
            src={IcoSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
            alt=""
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
        <div
          className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
          style={{ gridTemplateColumns: GRID_COLS }}
        >
          <span className="text-center">No</span>
          <span className="text-center">부서</span>
          <span className="pl-2">행사명</span>
          <span>장소</span>
          <span className="text-center">행사일시</span>
          <span className="text-center">신청현황</span>
          <span className="text-center">관리</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-grey-5 text-body-3">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">등록된 행사가 없습니다.</div>
        ) : (
          filtered.map((e, i) => {
            const ds = getDepartmentStyle(e.department);
            const regState = getRegistrationState(e);
            return (
              <div
                key={e.id}
                className={`grid items-center px-6 py-3.5 hover:bg-grey-1 transition-colors ${
                  i < filtered.length - 1 ? "border-b border-grey-2" : ""
                }`}
                style={{ gridTemplateColumns: GRID_COLS }}
              >
                <span className="text-body-5 text-grey-5 text-center">{i + 1}</span>
                <span className="flex justify-center">
                  <span className={`text-body-5 font-bold px-2 py-0.5 rounded ${ds.chip}`}>
                    {e.department}
                  </span>
                </span>
                <span className="pl-2 text-body-4 text-grey-9 truncate pr-4">{e.title}</span>
                <span className="text-body-5 text-grey-6 truncate pr-2">{e.location}</span>
                <span className="text-body-5 text-grey-6 text-center leading-tight">
                  {formatDotDate(e.date)}
                  {e.startTime && (
                    <>
                      <br />
                      {formatTimeRange(e.startTime, e.endTime)}
                    </>
                  )}
                </span>
                <span className="text-center">
                  {e.canRegister ? (
                    <span
                      className={`text-body-5 font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[regState.status] ?? STATUS_BADGE.closed}`}
                    >
                      {ADMIN_STATUS_LABEL[regState.status] ?? "-"}
                    </span>
                  ) : (
                    <span className="text-body-5 text-grey-4">-</span>
                  )}
                </span>
                <div className="flex gap-1.5 justify-center">
                  <button
                    onClick={() => setModal(e)}
                    className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
