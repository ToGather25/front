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

const ACTIVITY_FIELDS = [
  { key: "name", placeholder: "사역명 (예: 노방전도)" },
  { key: "schedule", placeholder: "일정 (예: 매주 토요일 오전 10:00)" },
  { key: "location", placeholder: "장소" },
];

export default function EvangelismEditor() {
  const { church } = useChurch();
  const [description, setDescription] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderTel, setLeaderTel] = useState("");
  const [schedule, setSchedule] = useState("");
  const [activities, setActivities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const e = church.evangelism;
    if (!e) return;
    setDescription(e.description ?? "");
    setLeaderName(e.leader?.name ?? "");
    setLeaderTel(e.leader?.tel ?? "");
    setSchedule(e.schedule ?? "");
    setActivities(e.activities ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.evangelism]);

  const cleanActivities = filterBlankRows(activities, ACTIVITY_FIELDS);
  const content = {
    description,
    leader: { name: leaderName, tel: leaderTel },
    schedule,
    activities: cleanActivities,
  };

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("EVANGELISM", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[EvangelismEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="전도회 소개"
      description="전도·선교 > 전도회 소개 탭에 노출됩니다."
      overrides={{ evangelism: content }}
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
      <Card title="소개 · 회장 · 정기 일정">
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>전도회 소개 (여러 줄 가능)</label>
            <textarea
              rows={4}
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>회장</label>
              <input
                className={inputCls}
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>회장 연락처</label>
              <input
                className={inputCls}
                value={leaderTel}
                onChange={(e) => setLeaderTel(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>정기 일정</label>
              <input
                className={inputCls}
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="예) 매주 토요일 오전 9:30 교회 로비 집결"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="주요 사역">
        <RepeatableFieldRows
          rows={activities}
          onChange={setActivities}
          fields={ACTIVITY_FIELDS}
          addLabel="사역"
          emptyRow={{ name: "", schedule: "", location: "" }}
        />
      </Card>
    </SectionEditorLayout>
  );
}
