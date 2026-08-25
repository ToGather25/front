import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getDistricts, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function DistrictSectionEditor({ churchId, juboId }) {
  const { data: initial } = useFetch(() => getDistricts(churchId), [churchId], null);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setRows(initial);
  }, [initial]);

  function updateRow(index, field, value) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", location: "", time: "", leader: "" }]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "DISTRICTS", rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[DistrictSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">구역 모임</h3>
        <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
          + 행 추가
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="구역명 (예: 1구역)"
              aria-label="구역명"
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="모임 장소"
              aria-label="모임 장소"
              value={row.location}
              onChange={(e) => updateRow(i, "location", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="모임 시간"
              aria-label="모임 시간"
              value={row.time}
              onChange={(e) => updateRow(i, "time", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="구역장"
              aria-label="구역장"
              value={row.leader}
              onChange={(e) => updateRow(i, "leader", e.target.value)}
            />
            <button
              onClick={() => removeRow(i)}
              className="shrink-0 text-caption text-grey-5 hover:text-red-500"
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
