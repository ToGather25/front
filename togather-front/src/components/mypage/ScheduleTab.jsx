import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMySchedule, deleteMySchedule } from "@/services/myPageService";
import { formatMonthDay, getWeekdayLabel, parseLocalDate } from "@/utils/date";
import { Pagination, InputField, ModalOverlay } from "./shared";

const PAGE_SIZE = 5;

export default function ScheduleTab({ schedules, setSchedules }) {
  const { church } = useChurch();
  const [scheduleForm, setScheduleForm] = useState({ date: "", title: "", memo: "" });
  const [schedulePage, setSchedulePage] = useState(1);
  const [modal, setModal] = useState(null);

  async function handleAddSchedule() {
    if (!scheduleForm.title || !scheduleForm.date) return;
    const created = await addMySchedule(church.id, scheduleForm);
    setSchedules((prev) => [...prev, created]);
    setScheduleForm({ date: "", title: "", memo: "" });
    setModal(null);
  }

  async function handleDeleteSchedule(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteMySchedule(church.id, id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  const pagedSchedules = schedules.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col min-h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">내 일정 ({schedules.length})</h2>
        <button
          onClick={() => setModal("add-schedule")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          + 일정 추가
        </button>
      </div>
      <div className="space-y-3">
        {pagedSchedules.map((item) => {
          const d = parseLocalDate(item.date);
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-grey-3 rounded-xl px-5 py-4"
            >
              <div className="shrink-0 w-12 text-center">
                <p className="text-body-4 font-bold text-primary">{formatMonthDay(item.date)}</p>
                <p className="text-body-5 text-grey-6">{d ? getWeekdayLabel(d.getDay()) : ""}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                {item.memo && <p className="text-body-5 text-grey-6 mt-0.5">{item.memo}</p>}
              </div>
              <button
                onClick={() => handleDeleteSchedule(item.id)}
                className="text-body-5 text-grey-5 hover:text-red-500 transition-colors shrink-0"
              >
                삭제
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex-1" />
      <Pagination
        total={schedules.length}
        perPage={PAGE_SIZE}
        current={schedulePage}
        onChange={setSchedulePage}
      />

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
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddSchedule}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              추가
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
