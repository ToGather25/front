import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMySchedule, updateMySchedule, deleteMySchedule } from "@/services/myPageService";
import { formatMonthDay, getWeekdayLabel, parseLocalDate } from "@/utils/date";
import { Pagination, InputField, ModalOverlay, StatusBadge } from "./shared";

const PAGE_SIZE = 5;

export default function ScheduleTab({ schedules, setSchedules, loadError, onRetry }) {
  const { church } = useChurch();
  const [scheduleForm, setScheduleForm] = useState({ date: "", title: "", memo: "" });
  const [schedulePage, setSchedulePage] = useState(1);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", title: "", memo: "", status: "참석 예정" });
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function handleAddSchedule() {
    if (!scheduleForm.title || !scheduleForm.date) return;
    setSubmitting(true);
    setAddError("");
    try {
      const created = await addMySchedule(church.id, scheduleForm);
      setSchedules((prev) => [...prev, created]);
      setScheduleForm({ date: "", title: "", memo: "" });
      setSchedulePage(1);
      setModal(null);
    } catch {
      setAddError("일정 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(item) {
    setEditingItem(item);
    setEditForm({
      date: item.date,
      title: item.title,
      memo: item.memo ?? "",
      status: item.status ?? "참석 예정",
    });
    setEditError("");
  }

  function closeEdit() {
    setEditingItem(null);
    setEditError("");
  }

  async function handleUpdateSchedule() {
    if (!editForm.title || !editForm.date) return;
    setSubmitting(true);
    setEditError("");
    try {
      const updated = await updateMySchedule(church.id, editingItem.id, editForm);
      setSchedules((prev) =>
        prev.map((s) => (s.id === editingItem.id ? { ...s, ...editForm, ...updated } : s)),
      );
      closeEdit();
    } catch {
      setEditError("일정 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSchedule() {
    if (!confirm("삭제하시겠습니까?")) return;
    setEditError("");
    setDeletingId(editingItem.id);
    try {
      await deleteMySchedule(church.id, editingItem.id);
      setSchedules((prev) => prev.filter((s) => s.id !== editingItem.id));
      closeEdit();
    } catch {
      setEditError("일정 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  const pagedSchedules = schedules.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col min-h-[750px]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">내 일정</h2>
        <button
          onClick={() => setModal("add-schedule")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          일정 추가
        </button>
      </div>

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-body-4 text-grey-7">일정을 불러오지 못했습니다.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3">
            {pagedSchedules.map((item) => {
              const d = parseLocalDate(item.date);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => openEdit(item)}
                  className="w-full flex items-center gap-4 border border-bluegrey-3 hover:bg-grey-1 rounded-xl pl-3 pr-5 py-3 text-left transition-colors"
                >
                  <div className="shrink-0 w-[72px] rounded-xl border border-bluegrey-3 bg-white py-2.5 text-center">
                    <p className="text-body-4 font-bold text-primary">
                      {formatMonthDay(item.date).replace("/", ".")}
                    </p>
                    <p className="text-body-5 text-primary">{d ? getWeekdayLabel(d.getDay()) : ""}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                    {item.memo && <p className="text-body-5 text-grey-6 mt-0.5">{item.memo}</p>}
                  </div>
                  <StatusBadge status={item.status ?? "참석 예정"} />
                </button>
              );
            })}
          </div>
          <div className="shrink-0">
            <Pagination
              total={schedules.length}
              perPage={PAGE_SIZE}
              current={schedulePage}
              onChange={setSchedulePage}
            />
          </div>
        </>
      )}

      {modal === "add-schedule" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">일정 추가</h3>
          <div className="space-y-4">
            <InputField
              label="날짜"
              type="date"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm((f) => ({ ...f, date: e.target.value }))}
              placeholder="03.15"
            />
            <InputField
              label="제목"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예) 새가족 모임"
            />
            <InputField
              label="시간 · 장소"
              value={scheduleForm.memo}
              onChange={(e) => setScheduleForm((f) => ({ ...f, memo: e.target.value }))}
              placeholder="예) 본당 · 14:00"
            />
          </div>
          {addError && <p className="text-body-5 text-red-500 mt-3">{addError}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddSchedule}
              disabled={submitting}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "추가 중..." : "추가"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {editingItem && (
        <ModalOverlay onClose={closeEdit}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">일정 수정</h3>
          <div className="space-y-4">
            <InputField
              label="날짜"
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
            />
            <InputField
              label="제목"
              value={editForm.title}
              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
            />
            <InputField
              label="시간 · 장소"
              value={editForm.memo}
              onChange={(e) => setEditForm((f) => ({ ...f, memo: e.target.value }))}
            />
            <div className="flex items-center justify-between pt-2">
              <label className="text-body-5 text-grey-7">참석 여부</label>
              <input
                type="checkbox"
                checked={editForm.status === "참석 예정"}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    status: e.target.checked ? "참석 예정" : "미정",
                  }))
                }
                className="w-4 h-4 rounded border-grey-4 text-primary focus:ring-primary"
              />
            </div>
          </div>
          {editError && <p className="text-body-5 text-red-500 mt-3">{editError}</p>}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={handleUpdateSchedule}
              disabled={submitting}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={handleDeleteSchedule}
              disabled={deletingId === editingItem.id}
              className="border border-red-300 text-red-500 rounded-full px-6 py-2.5 text-body-4 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === editingItem.id ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
