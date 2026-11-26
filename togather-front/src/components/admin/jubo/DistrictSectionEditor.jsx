import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import BubbleLoader from "@/components/common/BubbleLoader";import { useFetch } from "@/hooks/useFetch";
import { getDistricts } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

const DistrictSectionEditor = forwardRef(function DistrictSectionEditor({ churchId }, ref) {
  const {
    data: initial,
    loading: prefillLoading,
    error: prefillError,
    refetch: refetchPrefill,
  } = useFetch(() => getDistricts(churchId), [churchId], null);
  const [rows, setRows] = useState([]);

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

  useImperativeHandle(ref, () => ({ getDraft: () => ({ DISTRICTS: rows }) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">구역 모임</h3>
        <button onClick={addRow} className="text-caption text-primary font-semibold" type="button">
          + 행 추가
        </button>
      </div>
      {prefillLoading && <div className="flex justify-center py-2"><BubbleLoader size="sm" /></div>}
      {prefillError && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-caption text-grey-5">직전 발행본을 불러오지 못했습니다.</p>
        </div>
      )}
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
    </div>
  );
});

export default DistrictSectionEditor;
