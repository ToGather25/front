import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Nurture from "@/pages/Nurture/Nurture";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

const COURSE_FIELDS = [
  { key: "name", placeholder: "과정명 (예: 제자훈련 1단계)" },
  { key: "schedule", placeholder: "일정" },
  { key: "location", placeholder: "장소" },
  { key: "desc", placeholder: "설명" },
];

const INFO_FIELDS = [
  { key: "label", placeholder: "항목 (예: 교재)" },
  { key: "value", placeholder: "내용" },
];

export default function DiscipleTrainingEditor() {
  const { church } = useChurch();
  const [courses, setCourses] = useState([]);
  const [info, setInfo] = useState([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const dt = church.discipleTraining;
    if (!dt) return;
    setCourses(dt.courses ?? []);
    setInfo(dt.info ?? []);
    setNote(dt.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.discipleTraining]);

  const content = {
    courses: filterBlankRows(courses, COURSE_FIELDS),
    info: filterBlankRows(info, INFO_FIELDS),
    note,
  };

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("DISCIPLE_TRAINING", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[DiscipleTrainingEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="제자훈련"
      description="양육·훈련 > 제자훈련 탭에 노출됩니다."
      overrides={{ discipleTraining: content }}
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
      <Card title="안내 항목 (교재 · 대상 · 시간 등)">
        <RepeatableFieldRows
          rows={info}
          onChange={setInfo}
          fields={INFO_FIELDS}
          addLabel="안내 항목"
          emptyRow={{ label: "", value: "" }}
        />
      </Card>

      <Card title="안내 문구">
        <textarea
          rows={3}
          className={inputCls}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Card>

      <Card title="단계별 과정">
        <RepeatableFieldRows
          rows={courses}
          onChange={setCourses}
          fields={COURSE_FIELDS}
          addLabel="과정"
          emptyRow={{ name: "", schedule: "", location: "", desc: "" }}
        />
      </Card>
    </SectionEditorLayout>
  );
}
