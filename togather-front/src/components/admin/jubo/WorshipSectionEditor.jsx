import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function WorshipSectionEditor({ churchId, juboId }) {
  const { data: initialServices } = useFetch(() => getWorshipServices(churchId), [churchId], null);
  const { data: initialOrderMap } = useFetch(() => getWorshipOrder(churchId), [churchId], null);

  const [services, setServices] = useState([]);
  const [orderMap, setOrderMap] = useState({});
  const [activeLabel, setActiveLabel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initialServices) {
      setServices(initialServices);
      setActiveLabel(initialServices[0]?.label ?? null);
    }
  }, [initialServices]);

  useEffect(() => {
    if (initialOrderMap) setOrderMap(initialOrderMap);
  }, [initialOrderMap]);

  function addService() {
    setServices((prev) => [...prev, { label: "", time: "" }]);
  }

  function updateService(index, field, value) {
    const prevLabel = services[index].label;
    setServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    if (field === "label" && prevLabel !== value) {
      setOrderMap((prevMap) => {
        if (!(prevLabel in prevMap)) return prevMap;
        const { [prevLabel]: rows, ...rest } = prevMap;
        return { ...rest, [value]: rows };
      });
      if (activeLabel === prevLabel) setActiveLabel(value);
    }
  }

  function removeService(index) {
    const label = services[index].label;
    setServices((prev) => prev.filter((_, i) => i !== index));
    setOrderMap((prev) => {
      const { [label]: _removed, ...rest } = prev;
      return rest;
    });
    if (activeLabel === label) setActiveLabel(null);
  }

  const activeRows = activeLabel ? (orderMap[activeLabel] ?? []) : [];

  function updateActiveRows(rows) {
    if (!activeLabel) return;
    setOrderMap((prev) => ({ ...prev, [activeLabel]: rows }));
  }

  function addRow() {
    updateActiveRows([...activeRows, { role: "", name: "" }]);
  }

  function updateRow(index, field, value) {
    const next = [...activeRows];
    next[index] = { ...next[index], [field]: value };
    updateActiveRows(next);
  }

  function removeRow(index) {
    updateActiveRows(activeRows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "WORSHIP_SERVICES", services);
      await updateJuboSection(churchId, juboId, "WORSHIP_ORDER", orderMap);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[WorshipSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">예배 목록</h3>
        <button onClick={addService} className="text-caption text-primary font-semibold" type="button">
          + 예배 추가
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        {services.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="예배명 (예: 주일 오전예배)"
              aria-label="예배명"
              value={s.label}
              onChange={(e) => updateService(i, "label", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="시간 (예: 오전 9:00)"
              aria-label="시간"
              value={s.time}
              onChange={(e) => updateService(i, "time", e.target.value)}
            />
            <button
              onClick={() => removeService(i)}
              className="shrink-0 text-caption text-grey-5 hover:text-red-500"
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-caption text-grey-5">등록된 예배가 없습니다.</p>
        )}
      </div>

      {services.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {services.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setActiveLabel(s.label)}
                className={`px-3 py-1.5 rounded-full text-caption border transition-colors ${
                  activeLabel === s.label
                    ? "bg-primary border-primary text-white font-semibold"
                    : "bg-white border-grey-3 text-grey-7"
                }`}
              >
                {s.label || "(이름 없음)"}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-body-4 font-semibold text-grey-9">
              {activeLabel || "예배"} 순서표
            </h4>
            <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
              + 순서 추가
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {activeRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  placeholder="역할 (예: 설교)"
                  aria-label="역할"
                  value={row.role}
                  onChange={(e) => updateRow(i, "role", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="담당자"
                  aria-label="담당자"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
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
            {activeRows.length === 0 && (
              <p className="text-caption text-grey-5">등록된 순서가 없습니다.</p>
            )}
          </div>
        </>
      )}

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
