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

const PROGRAM_FIELDS = [
  { key: "title", placeholder: "프로그램명 (예: 새가족반)" },
  { key: "level", placeholder: "난이도 (예: 기초)" },
  { key: "duration", placeholder: "기간 (예: 4주)" },
  { key: "schedule", placeholder: "일정" },
  { key: "desc", placeholder: "설명" },
];

export default function NurtureProgramsEditor() {
  const { church } = useChurch();
  const [programs, setPrograms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (church.nurturePrograms) setPrograms(church.nurturePrograms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.nurturePrograms]);

  const content = filterBlankRows(programs, PROGRAM_FIELDS);

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("NURTURE_PROGRAMS", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[NurtureProgramsEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="양육프로그램"
      description="양육·훈련 > 양육프로그램 탭에 노출됩니다."
      overrides={{ nurturePrograms: content }}
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
      <Card title="프로그램 목록">
        <RepeatableFieldRows
          rows={programs}
          onChange={setPrograms}
          fields={PROGRAM_FIELDS}
          addLabel="프로그램"
          emptyRow={{ title: "", level: "", duration: "", schedule: "", desc: "" }}
        />
      </Card>
    </SectionEditorLayout>
  );
}
