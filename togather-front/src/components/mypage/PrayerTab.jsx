import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMyPrayer } from "@/services/myPageService";
import { StatusBadge, Pagination, ModalOverlay } from "./shared";

const PRAYER_PAGE_SIZE = 4;
const PRAYER_TYPES = ["기도", "상담"];

export default function PrayerTab({ prayers, setPrayers }) {
  const { church } = useChurch();
  const [prayerForm, setPrayerForm] = useState({ type: "기도", content: "" });
  const [prayerFilter, setPrayerFilter] = useState("전체");
  const [prayerPage, setPrayerPage] = useState(1);
  const [modal, setModal] = useState(null);

  async function handleAddPrayer() {
    if (!prayerForm.content) return;
    const created = await addMyPrayer(church.id, prayerForm);
    setPrayers((prev) => [created, ...prev]);
    setPrayerForm({ type: "기도", content: "" });
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
        {["전체", ...PRAYER_TYPES].map((f) => (
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
              <span
                className={`text-body-5 rounded px-2 py-0.5 ${
                  item.type === "기도" ? "bg-grey-2 text-grey-7" : "bg-blue-1 text-primary"
                }`}
              >
                {item.type}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-body-5 text-grey-6">{item.createdAt?.slice(0, 10)}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <p className="text-body-5 text-grey-7 mt-2">{item.content}</p>
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
            <div>
              <label className="block text-body-5 text-grey-7 mb-1">유형</label>
              <div className="flex gap-2">
                {PRAYER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPrayerForm((f) => ({ ...f, type: t }))}
                    className={`text-body-4 rounded-full px-5 py-2 transition-colors ${
                      prayerForm.type === t
                        ? "bg-primary text-white"
                        : "bg-grey-2 text-grey-7 hover:bg-grey-3"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
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
