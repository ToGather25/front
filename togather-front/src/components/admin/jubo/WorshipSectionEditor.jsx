import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function WorshipSectionEditor({ churchId, juboId }) {
  const {
    data: initialServices,
    loading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useFetch(() => getWorshipServices(churchId), [churchId], null);
  const {
    data: initialOrderMap,
    loading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useFetch(() => getWorshipOrder(churchId), [churchId], null);
  const prefillLoading = servicesLoading || orderLoading;
  const prefillError = servicesError || orderError;
  function refetchPrefill() {
    refetchServices();
    refetchOrder();
  }

  // services는 {id, label, time} — id는 프론트 로컬 전용 키로, 라벨이 비어있거나
  // 중복되는 동안(편집 중)에도 순서표(orderMap)가 서로 덮어쓰지 않도록 라벨 대신 id로 관리한다.
  // 백엔드로 저장할 때만 라벨 기반 모양으로 변환한다(WORSHIP_ORDER는 백엔드 계약상 라벨 키 맵이라).
  const [services, setServices] = useState([]);
  const [orderMap, setOrderMap] = useState({}); // { [id]: [{role,name}] }
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  useEffect(() => {
    if (!initialServices || !initialOrderMap) return;
    const withIds = initialServices.map((s) => ({ id: crypto.randomUUID(), ...s }));
    const map = {};
    withIds.forEach((s) => {
      map[s.id] = initialOrderMap[s.label] ?? [];
    });
    setServices(withIds);
    setOrderMap(map);
    setSelectedId(withIds[0]?.id ?? null);
  }, [initialServices, initialOrderMap]);

  const activeId = selectedId ?? services[0]?.id ?? null;

  function addService() {
    const id = crypto.randomUUID();
    setServices((prev) => [...prev, { id, label: "", time: "" }]);
    setOrderMap((prev) => ({ ...prev, [id]: [] }));
    setSelectedId(id);
  }

  function updateService(id, field, value) {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function removeService(id) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setOrderMap((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    if (selectedId === id) setSelectedId(null);
  }

  const activeRows = activeId ? (orderMap[activeId] ?? []) : [];

  function updateActiveRows(rows) {
    if (!activeId) return;
    setOrderMap((prev) => ({ ...prev, [activeId]: rows }));
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

  function validateBeforeSave() {
    const labels = services.map((s) => s.label.trim());
    if (labels.some((l) => !l)) return "모든 예배에 이름을 입력해주세요.";
    const seen = new Set();
    for (const label of labels) {
      if (seen.has(label)) return `예배명이 중복되었습니다: "${label}"`;
      seen.add(label);
    }
    return null;
  }

  async function handleSave() {
    const validationError = validateBeforeSave();
    if (validationError) {
      setSaveError(true);
      setSaveErrorMessage(validationError);
      return;
    }
    setSaving(true);
    setSaveError(false);
    let servicesSaved = false;
    try {
      const servicesPayload = services.map(({ label, time }) => ({ label, time }));
      const orderPayload = {};
      services.forEach((s) => {
        orderPayload[s.label] = orderMap[s.id] ?? [];
      });
      await updateJuboSection(churchId, juboId, "WORSHIP_SERVICES", servicesPayload);
      servicesSaved = true;
      await updateJuboSection(churchId, juboId, "WORSHIP_ORDER", orderPayload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[WorshipSectionEditor] 저장 실패:", err);
      setSaveError(true);
      setSaveErrorMessage(
        servicesSaved
          ? "예배 목록은 저장됐지만 순서표 저장에 실패했습니다. 다시 시도해 주세요."
          : "저장 실패, 다시 시도해 주세요.",
      );
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
      <div className="flex flex-col gap-2 mb-6">
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder="예배명 (예: 주일 오전예배)"
              aria-label="예배명"
              value={s.label}
              onChange={(e) => updateService(s.id, "label", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="시간 (예: 오전 9:00)"
              aria-label="시간"
              value={s.time}
              onChange={(e) => updateService(s.id, "time", e.target.value)}
            />
            <button
              onClick={() => removeService(s.id)}
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
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`px-3 py-1.5 rounded-full text-caption border transition-colors ${
                  activeId === s.id
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
              {services.find((s) => s.id === activeId)?.label || "예배"} 순서표
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
        {saveError && <span className="text-caption text-red-500">{saveErrorMessage}</span>}
      </div>
    </div>
  );
}
