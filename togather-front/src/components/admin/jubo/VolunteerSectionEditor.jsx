import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getVolunteer, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function VolunteerSectionEditor({ churchId, juboId }) {
  const {
    data: initial,
    loading: prefillLoading,
    error: prefillError,
    refetch: refetchPrefill,
  } = useFetch(() => getVolunteer(churchId), [churchId], null);
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
    setRows((prev) => [...prev, { role: "", part1: "", part2: "" }]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "VOLUNTEER", rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[VolunteerSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">봉사 안내</h3>
        <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
          + 행 추가
        </button>
      </div>
      {prefillLoading && <p className="text-caption text-grey-5 mb-3">불러오는 중...</p>}
      {prefillError && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-caption text-grey-5">직전 발행본을 불러오지 못했습니다.</p>
          <button
            onClick={refetchPrefill}
            className="text-caption text-primary underline"
            type="button"
          >
            다시 시도
          </button>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="구분 (예: 대표기도)"
              aria-label="구분"
              value={row.role}
              onChange={(e) => updateRow(i, "role", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="1부 담당"
              aria-label="1부 담당"
              value={row.part1}
              onChange={(e) => updateRow(i, "part1", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="2부 담당"
              aria-label="2부 담당"
              value={row.part2}
              onChange={(e) => updateRow(i, "part2", e.target.value)}
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
