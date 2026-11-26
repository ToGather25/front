import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Mission from "@/pages/Mission/Mission";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

const ITEM_FIELDS = [
  { key: "name", placeholder: "사역명" },
  { key: "schedule", placeholder: "일정" },
  { key: "location", placeholder: "지역" },
];

const GROUPS = [
  { key: "국내", label: "국내 선교" },
  { key: "해외", label: "해외 선교" },
];

function emptyGroup() {
  return { title: "", description: "", items: [] };
}

export default function MissionsEditor() {
  const { church } = useChurch();
  const [groups, setGroups] = useState({ 국내: emptyGroup(), 해외: emptyGroup() });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const m = church.missions;
    if (!m) return;
    setGroups({
      국내: { title: m.국내?.title ?? "", description: m.국내?.description ?? "", items: m.국내?.items ?? [] },
      해외: { title: m.해외?.title ?? "", description: m.해외?.description ?? "", items: m.해외?.items ?? [] },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.missions]);

  function updateGroup(key, field, value) {
    setGroups((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  const content = Object.fromEntries(
    GROUPS.map(({ key }) => [
      key,
      { ...groups[key], items: filterBlankRows(groups[key].items, ITEM_FIELDS) },
    ]),
  );

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("MISSIONS", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[MissionsEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="국내외 선교"
      description="전도·선교 > 국내외 선교 탭에 노출됩니다."
      overrides={{ missions: content }}
      preview={<Mission />}
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
      {GROUPS.map(({ key, label }) => (
        <Card key={key} title={label}>
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label className={labelCls}>제목</label>
              <input
                className={inputCls}
                value={groups[key].title}
                onChange={(e) => updateGroup(key, "title", e.target.value)}
                aria-label={`${label} 제목`}
              />
            </div>
            <div>
              <label className={labelCls}>소개</label>
              <textarea
                rows={2}
                className={inputCls}
                value={groups[key].description}
                onChange={(e) => updateGroup(key, "description", e.target.value)}
                aria-label={`${label} 소개`}
              />
            </div>
          </div>
          <RepeatableFieldRows
            rows={groups[key].items}
            onChange={(rows) => updateGroup(key, "items", rows)}
            fields={ITEM_FIELDS}
            addLabel={`${label} 사역`}
            emptyRow={{ name: "", schedule: "", location: "" }}
          />
        </Card>
      ))}
    </SectionEditorLayout>
  );
}
