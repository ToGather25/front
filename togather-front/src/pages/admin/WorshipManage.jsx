import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import {
  getAdminSermons,
  createSermon,
  updateSermon,
  deleteSermon,
  scheduleBroadcast,
  startBroadcast,
  endBroadcast,
} from "@/services/sermonService";
import { SERVICE_TYPES } from "@/config/sermon.config";

const FILTER_TYPES = ["전체", ...SERVICE_TYPES];

const BROADCAST_LABEL = { BEFORE: "예약됨", LIVE: "방송 중", ENDED: "종료됨" };

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 focus:outline-none focus:border-primary";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function emptyForm() {
  return { sermonDate: "", worshipType: SERVICE_TYPES[0], title: "", preacher: "", scripture: "", youtubeVideoId: "" };
}

function toFormState(sermon) {
  if (!sermon) return emptyForm();
  return { ...emptyForm(), ...sermon };
}

function SermonModal({ initial, onClose, onSave, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => toFormState(initial));

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.sermonDate) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-[520px] shadow-2xl">
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">
          {isEdit ? "설교 수정" : "설교 등록"}
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>날짜</label>
              <input
                type="date"
                className={inputCls}
                value={form.sermonDate}
                onChange={set("sermonDate")}
              />
            </div>
            <div>
              <label className={labelCls}>예배 구분</label>
              <select
                className={`${inputCls} bg-white`}
                value={form.worshipType}
                onChange={set("worshipType")}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>설교 제목</label>
            <input
              className={inputCls}
              placeholder="설교 제목 입력"
              value={form.title}
              onChange={set("title")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>설교자</label>
              <input
                className={inputCls}
                placeholder="설교자 이름"
                value={form.preacher}
                onChange={set("preacher")}
              />
            </div>
            <div>
              <label className={labelCls}>본문 말씀</label>
              <input
                className={inputCls}
                placeholder="예: 요 3:16"
                value={form.scripture}
                onChange={set("scripture")}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>유튜브 영상 ID</label>
            <input
              className={inputCls}
              placeholder="예: dQw4w9WgXcQ (선택)"
              value={form.youtubeVideoId}
              onChange={set("youtubeVideoId")}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors disabled:opacity-50"
          >
            {saving ? (isEdit ? "수정 중..." : "등록 중...") : isEdit ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BroadcastPanel({ broadcast, onClose, onSchedule, onStart, onEnd, scheduling }) {
  const [url, setUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">방송 관리</h3>
        {!broadcast ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>유튜브 라이브 URL</label>
              <input
                className={inputCls}
                placeholder="https://youtube.com/live/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="broadcast-scheduled-at" className={labelCls}>
                예정 시각
              </label>
              <input
                id="broadcast-scheduled-at"
                type="datetime-local"
                className={inputCls}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <button
              onClick={() => onSchedule({ youtubeLiveUrl: url, scheduledStartAt: scheduledAt })}
              disabled={!url || !scheduledAt || scheduling}
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
            >
              {scheduling ? "예약 중..." : "예약"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit px-3 py-1 rounded-full text-body-4 font-semibold bg-blue-1 text-primary">
              {BROADCAST_LABEL[broadcast.status]}
            </span>
            {broadcast.status === "BEFORE" && (
              <button
                onClick={onStart}
                disabled={scheduling}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors disabled:opacity-50"
              >
                {scheduling ? "시작 중..." : "방송 시작"}
              </button>
            )}
            {broadcast.status === "LIVE" && (
              <button
                onClick={onEnd}
                disabled={scheduling}
                className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-body-4 font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {scheduling ? "종료 중..." : "방송 종료"}
              </button>
            )}
            <p className="text-body-5 text-grey-5">
              이 방송 상태는 이 브라우저 세션에서만 추적됩니다. 새로고침하거나 이 설교를
              삭제하면 화면에서 사라지지만, 이미 시작한 방송은 서버에서 계속 진행되며 다시
              종료할 수 없습니다. 방송을 종료한 뒤 페이지를 벗어나 주세요.
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default function WorshipManage() {
  const { church } = useChurch();
  const [filter, setFilter] = useState("전체");
  const [sermons, setSermons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);
  const [broadcasts, setBroadcasts] = useState({});
  const [broadcastSermonId, setBroadcastSermonId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminSermons(church.id).then((list) => {
      if (!cancelled) setSermons(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id]);

  const filtered = filter === "전체" ? sermons : sermons.filter((s) => s.worshipType === filter);

  async function handleSave(form) {
    setActionError(null);
    setSaving(true);
    try {
      if (editingSermon) {
        const updated = await updateSermon(church.id, editingSermon.id, form);
        setSermons((prev) => prev.map((s) => (s.id === editingSermon.id ? updated : s)));
      } else {
        const created = await createSermon(church.id, form);
        setSermons((prev) => [created, ...prev]);
      }
      setShowModal(false);
      setEditingSermon(null);
    } catch {
      setActionError("설교 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const hasBroadcast = !!broadcasts[id];
    const message = hasBroadcast
      ? "이 설교에 예약/진행 중인 방송이 있습니다. 삭제해도 서버의 방송은 계속 남아있을 수 있습니다. 그래도 삭제하시겠습니까?"
      : "삭제하시겠습니까?";
    if (!confirm(message)) return;
    setActionError(null);
    try {
      await deleteSermon(church.id, id);
      setSermons((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setActionError("설교 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  async function handleSchedule({ youtubeLiveUrl, scheduledStartAt }) {
    setActionError(null);
    setScheduling(true);
    try {
      const result = await scheduleBroadcast(church.id, {
        sermonId: broadcastSermonId,
        youtubeLiveUrl,
        scheduledStartAt,
      });
      setBroadcasts((prev) => ({ ...prev, [broadcastSermonId]: result }));
    } catch {
      setActionError("방송 예약에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setScheduling(false);
    }
  }

  async function handleStart() {
    setActionError(null);
    setScheduling(true);
    try {
      const bc = broadcasts[broadcastSermonId];
      const result = await startBroadcast(church.id, bc.id);
      setBroadcasts((prev) => ({ ...prev, [broadcastSermonId]: result }));
    } catch {
      setActionError("방송 시작에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setScheduling(false);
    }
  }

  async function handleEnd() {
    setActionError(null);
    setScheduling(true);
    try {
      const bc = broadcasts[broadcastSermonId];
      const result = await endBroadcast(church.id, bc.id);
      setBroadcasts((prev) => ({ ...prev, [broadcastSermonId]: result }));
    } catch {
      setActionError("방송 종료에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setScheduling(false);
    }
  }

  return (
    <div>
      {showModal && (
        <SermonModal
          initial={editingSermon}
          onClose={() => {
            setShowModal(false);
            setEditingSermon(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {broadcastSermonId && (
        <BroadcastPanel
          broadcast={broadcasts[broadcastSermonId] ?? null}
          onClose={() => setBroadcastSermonId(null)}
          onSchedule={handleSchedule}
          onStart={handleStart}
          onEnd={handleEnd}
          scheduling={scheduling}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">예배 및 설교 관리</h1>
        <button
          onClick={() => {
            setEditingSermon(null);
            setShowModal(true);
          }}
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

      {actionError && <p className="text-body-4 text-red-500 mb-4">{actionError}</p>}

      <p className="text-body-5 text-grey-5 mb-4">
        백엔드에 설교 목록 조회 API가 없어 새로고침하면 등록한 설교 목록이 초기화됩니다.
      </p>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {FILTER_TYPES.map((t) => (
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
          style={{ gridTemplateColumns: "110px 110px 1fr 140px 100px 220px" }}
        >
          <span>날짜</span>
          <span>예배 구분</span>
          <span>설교 제목</span>
          <span>설교자</span>
          <span>본문 말씀</span>
          <span className="text-center">관리</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-grey-5 text-body-3">등록된 설교가 없습니다.</div>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s.id}
              className={`grid items-center px-6 py-4 hover:bg-grey-1 transition-colors ${i < filtered.length - 1 ? "border-b border-grey-2" : ""}`}
              style={{ gridTemplateColumns: "110px 110px 1fr 140px 100px 220px" }}
            >
              <span className="text-body-5 text-grey-6">{s.sermonDate}</span>
              <span className="text-body-5 font-medium text-primary bg-blue-1 px-2 py-0.5 rounded w-fit">
                {s.worshipType}
              </span>
              <span className="text-body-4 font-medium text-grey-10 truncate pr-4">{s.title}</span>
              <span className="text-body-5 text-grey-7">{s.preacher}</span>
              <span className="text-body-5 text-grey-6">{s.scripture}</span>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => {
                    setEditingSermon(s);
                    setShowModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setBroadcastSermonId(s.id)}
                  className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                >
                  방송
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
