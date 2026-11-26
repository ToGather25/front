import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Nurture from "@/pages/Nurture/Nurture";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

const ZONE_FIELDS = [
  { key: "name", placeholder: "구역명 (예: 1구역)" },
  { key: "leader", placeholder: "구역장" },
  { key: "members", placeholder: "인원 (숫자)" },
  { key: "time", placeholder: "모임 시간" },
  { key: "location", placeholder: "모임 장소" },
];

export default function DistrictMeetingsEditor() {
  const { church } = useChurch();
  const [zones, setZones] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (church.districtMeetings) {
      setZones(church.districtMeetings.map((z) => ({ ...z, members: String(z.members ?? "") })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.districtMeetings]);

  const content = filterBlankRows(zones, ZONE_FIELDS).map((z) => ({
    ...z,
    members: Number(z.members) || 0,
  }));

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("DISTRICT_MEETINGS", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[DistrictMeetingsEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="구역모임"
      description="양육·훈련 > 구역모임 탭에 노출됩니다."
      overrides={{ districtMeetings: content }}
      preview={<Nurture />}
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
      <Card title="구역 목록">
        <RepeatableFieldRows
          rows={zones}
          onChange={setZones}
          fields={ZONE_FIELDS}
          addLabel="구역"
          emptyRow={{ name: "", leader: "", members: "", time: "", location: "" }}
        />
      </Card>
    </SectionEditorLayout>
  );
}
