import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import FloorGuide from "@/components/church/FloorGuide";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const FLOOR_FIELDS = [
  { key: "floor", placeholder: "층 (예: 2층)" },
  { key: "rooms", placeholder: "해당 층 시설 (쉼표로 구분)" },
  { key: "image", placeholder: "도면 이미지 URL (선택)" },
];

export default function FloorGuideEditor() {
  const { church } = useChurch();
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (church.floorGuide) setRows(church.floorGuide);
  }, [church.floorGuide]);

  const cleanRows = filterBlankRows(rows, FLOOR_FIELDS).map((r) => ({ ...r, image: r.image || null }));

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("FLOOR_GUIDE", cleanRows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[FloorGuideEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="층별 안내"
      description="교회소개 > 층별 안내 탭에 노출됩니다. 위에서부터 입력한 순서대로 표시됩니다."
      overrides={{ floorGuide: cleanRows }}
      preview={<FloorGuide />}
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
      <div className="bg-white rounded-2xl border border-grey-2 p-6">
        <RepeatableFieldRows
          rows={rows}
          onChange={setRows}
          fields={FLOOR_FIELDS}
          addLabel="층"
          emptyRow={{ floor: "", rooms: "", image: "" }}
        />
      </div>
    </SectionEditorLayout>
  );
}
