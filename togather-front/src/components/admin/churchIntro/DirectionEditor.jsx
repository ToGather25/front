import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Direction from "@/components/church/Direction";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

const TRANSIT_FIELDS = [
  { key: "subway", placeholder: "지하철역 / 출구" },
  { key: "bus", placeholder: "버스 번호" },
  { key: "dropoff", placeholder: "하차 지점" },
];
const DETAIL_FIELDS = [
  { key: "label", placeholder: "항목 (예: 주차 요금)" },
  { key: "value", placeholder: "내용" },
];
const defaultLot = () => ({
  name: "",
  details: [
    { label: "주차 요금", value: "" },
    { label: "이용 가능 시간", value: "" },
    { label: "안내", value: "" },
  ],
});

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function DirectionEditor() {
  const { church } = useChurch();
  const [transit, setTransit] = useState([]);
  const [lots, setLots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (church.publicTransit) setTransit(church.publicTransit);
    if (church.parking?.lots) setLots(church.parking.lots);
  }, [church.publicTransit, church.parking]);

  const cleanTransit = filterBlankRows(transit, TRANSIT_FIELDS);
  const cleanLots = lots
    .filter((lot) => lot.name.trim())
    .map((lot) => ({ ...lot, details: filterBlankRows(lot.details, DETAIL_FIELDS) }));

  function updateLot(i, patch) {
    setLots((prev) => prev.map((lot, idx) => (idx === i ? { ...lot, ...patch } : lot)));
  }

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await Promise.all([
        updateChurchIntroSection("DIRECTIONS", cleanTransit),
        updateChurchIntroSection("PARKING", { lots: cleanLots }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[DirectionEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="오시는 길"
      description="교회소개 > 오시는 길 탭에 노출됩니다. 주소·지도는 사이트 기본 설정 값을 그대로 씁니다."
      overrides={{ publicTransit: cleanTransit, parking: { lots: cleanLots } }}
      preview={<Direction />}
      actions={
        <>
          {error && <span className="text-body-5 text-red-500">저장 실패, 다시 시도해 주세요.</span>}
          {saved && <span className="text-body-5 text-blue-7">저장됨</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </>
      }
    >
      <Card title="대중교통 안내">
        <RepeatableFieldRows
          rows={transit}
          onChange={setTransit}
          fields={TRANSIT_FIELDS}
          addLabel="대중교통"
          emptyRow={{ subway: "", bus: "", dropoff: "" }}
        />
      </Card>

      {lots.map((lot, i) => (
        <Card key={i} title={`주차장 ${i + 1}`}>
          <div className="mb-4">
            <label className={labelCls}>주차장 이름</label>
            <input
              className={inputCls}
              value={lot.name}
              onChange={(e) => updateLot(i, { name: e.target.value })}
              placeholder="예) 교회 주차장"
            />
          </div>
          <RepeatableFieldRows
            rows={lot.details}
            onChange={(details) => updateLot(i, { details })}
            fields={DETAIL_FIELDS}
            addLabel="안내 항목"
            emptyRow={{ label: "", value: "" }}
          />
          <button
            type="button"
            onClick={() => setLots((prev) => prev.filter((_, idx) => idx !== i))}
            className="mt-3 text-body-5 text-grey-5 hover:text-red-500"
          >
            이 주차장 삭제
          </button>
        </Card>
      ))}

      <button
        type="button"
        onClick={() => setLots((prev) => [...prev, defaultLot()])}
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-grey-3 text-body-4 text-grey-6 hover:border-primary hover:text-primary transition-colors"
      >
        + 주차장 추가
      </button>
    </SectionEditorLayout>
  );
}
