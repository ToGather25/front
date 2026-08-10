import { useState } from "react";
import ChurchIcon from "@/assets/icon-svg/mypage-church.svg";
import { INITIAL_PRAYERS } from "./mockData";
import { StatusBadge, Pagination, InputField, ModalOverlay } from "./shared";

const PRAYER_PAGE_SIZE = 4;

function IconChurch() {
  return <img src={ChurchIcon} className="w-4 h-4" alt="" />;
}

export default function PrayerTab() {
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [prayerForm, setPrayerForm] = useState({ date: "", day: "", title: "", content: "" });
  const [prayerFilter, setPrayerFilter] = useState("전체");
  const [prayerPage, setPrayerPage] = useState(1);
  const [modal, setModal] = useState(null);

  function handleAddPrayer() {
    if (!prayerForm.title) return;
    setPrayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "기도",
        title: prayerForm.title,
        content: prayerForm.content,
        date: `2026.${prayerForm.date || "03.15"}`,
        status: "답변 대기",
        reply: null,
      },
    ]);
    setPrayerForm({ date: "", day: "", title: "", content: "" });
    setModal(null);
  }

  function handlePrayerFilter(f) {
    setPrayerFilter(f);
    setPrayerPage(1);
  }

  const filteredPrayers =
    prayerFilter === "전체" ? prayers : prayers.filter((p) => p.type === prayerFilter);
  const pagedPrayers = filteredPrayers.slice(
    (prayerPage - 1) * PRAYER_PAGE_SIZE,
    prayerPage * PRAYER_PAGE_SIZE,
  );

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">기도 / 상담 내역</h2>
        <button
          onClick={() => setModal("add-prayer")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          신청하기
        </button>
      </div>
      <div className="flex gap-2 mb-5">
        {["전체", "기도", "상담"].map((f) => (
          <button
            key={f}
            onClick={() => handlePrayerFilter(f)}
            className={`text-body-5 rounded-full px-4 py-1.5 transition-colors ${
              prayerFilter === f ? "bg-primary text-white" : "bg-grey-2 text-grey-7 hover:bg-grey-3"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {pagedPrayers.map((item) => (
          <div key={item.id} className="border border-grey-3 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-body-5 rounded px-2 py-0.5 ${
                    item.type === "기도" ? "bg-grey-2 text-grey-7" : "bg-blue-1 text-primary"
                  }`}
                >
                  {item.type}
                </span>
                <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-body-5 text-grey-6">{item.date}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <p className="text-body-5 text-grey-7 mt-2">{item.content}</p>
            {item.reply && (
              <div className="mt-3 pl-4 border-l-2 border-grey-3 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">
                  <IconChurch />
                </span>
                <p className="text-body-5 text-grey-6">{item.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <Pagination
        total={filteredPrayers.length}
        perPage={PRAYER_PAGE_SIZE}
        current={prayerPage}
        onChange={setPrayerPage}
      />

      {modal === "add-prayer" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">기도 / 상담 신청하기</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="날짜 (MM.DD)"
                value={prayerForm.date}
                onChange={(e) => setPrayerForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="03.15"
              />
              <InputField
                label="요일"
                value={prayerForm.day}
                onChange={(e) => setPrayerForm((f) => ({ ...f, day: e.target.value }))}
                placeholder="주"
              />
            </div>
            <InputField
              label="제목"
              value={prayerForm.title}
              onChange={(e) => setPrayerForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예) 건강"
            />
            <div>
              <label className="block text-body-5 text-grey-7 mb-1">내용</label>
              <textarea
                value={prayerForm.content}
                onChange={(e) => setPrayerForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="기도 제목을 간략히 작성해 주세요."
                rows={4}
                className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddPrayer}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              신청
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
