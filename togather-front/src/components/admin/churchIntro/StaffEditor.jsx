import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Staff from "@/components/church/Staff";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";
import ImageUploadField from "@/components/admin/ImageUploadField";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function Card({ title, children, description }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-1">{title}</h2>
      {description && <p className="text-body-5 text-grey-5 mb-4">{description}</p>}
      <div className={description ? "" : "mt-5"}>{children}</div>
    </div>
  );
}

const STAFF_FIELDS = [
  { key: "name", placeholder: "성함 (직함 포함)" },
  { key: "role", placeholder: "역할/소개" },
  { key: "tel", placeholder: "연락처" },
  { key: "email", placeholder: "이메일" },
  { key: "image", placeholder: "사진", type: "image" },
];

const MISSIONARY_FIELDS = [
  { key: "name", placeholder: "성함" },
  { key: "location", placeholder: "파송 지역/소속" },
  { key: "tel", placeholder: "연락처" },
  { key: "email", placeholder: "이메일" },
  { key: "image", placeholder: "사진", type: "image" },
];

const GROUPS = [
  { key: "clergy", label: "교역자 (부목사·전도사·간사)" },
  { key: "elders", label: "시무장로" },
  { key: "associateElders", label: "협동·사역장로" },
  { key: "retiredElders", label: "은퇴장로" },
];

export default function StaffEditor() {
  const { church } = useChurch();
  const [headPastor, setHeadPastor] = useState({
    name: "",
    tel: "",
    email: "",
    role: "",
    image: "",
    education: "",
    career: "",
  });
  const [groups, setGroups] = useState({ clergy: [], elders: [], associateElders: [], retiredElders: [] });
  const [missionaries, setMissionaries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const s = church.staff;
    if (!s) return;
    const hp = s.headPastor ?? {};
    setHeadPastor({
      name: hp.name ?? "",
      tel: hp.tel ?? "",
      email: hp.email ?? "",
      role: hp.role ?? "",
      image: hp.image ?? "",
      education: (hp.education ?? []).join("\n"),
      career: (hp.career ?? []).join("\n"),
    });
    setGroups({
      clergy: s.clergy ?? [],
      elders: s.elders ?? [],
      associateElders: s.associateElders ?? [],
      retiredElders: s.retiredElders ?? [],
    });
    setMissionaries(s.missionaries ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.staff]);

  const cleanGroups = Object.fromEntries(
    GROUPS.map(({ key }) => [key, filterBlankRows(groups[key], STAFF_FIELDS)]),
  );
  const cleanMissionaries = filterBlankRows(missionaries, MISSIONARY_FIELDS);
  const cleanHeadPastor = {
    ...headPastor,
    image: headPastor.image || null,
    education: headPastor.education.split("\n").map((s) => s.trim()).filter(Boolean),
    career: headPastor.career.split("\n").map((s) => s.trim()).filter(Boolean),
  };

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("STAFF", {
        filterTags: church.staff?.filterTags, // 현재 화면에 쓰이지 않는 값 — 그대로 보존
        headPastor: cleanHeadPastor,
        ...cleanGroups,
        missionaries: cleanMissionaries,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[StaffEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="섬기는 사람들"
      description="교회소개 > 섬기는 사람들 탭에 노출됩니다."
      overrides={{
        staff: { filterTags: church.staff?.filterTags, headPastor: cleanHeadPastor, ...cleanGroups, missionaries: cleanMissionaries },
      }}
      preview={<Staff />}
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
      <Card title="담임목사님">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>성함 (직함 포함)</label>
            <input
              className={inputCls}
              value={headPastor.name}
              onChange={(e) => setHeadPastor((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>교회 내 역할/소개 한 줄</label>
            <input
              className={inputCls}
              value={headPastor.role}
              onChange={(e) => setHeadPastor((p) => ({ ...p, role: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>연락처</label>
            <input
              className={inputCls}
              value={headPastor.tel}
              onChange={(e) => setHeadPastor((p) => ({ ...p, tel: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>이메일</label>
            <input
              className={inputCls}
              value={headPastor.email}
              onChange={(e) => setHeadPastor((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <ImageUploadField
              id="head-pastor-image"
              label="사진"
              value={headPastor.image}
              onChange={(url) => setHeadPastor((p) => ({ ...p, image: url }))}
            />
          </div>
          <div>
            <label className={labelCls}>학력 (줄바꿈으로 여러 줄)</label>
            <textarea
              rows={3}
              className={inputCls}
              value={headPastor.education}
              onChange={(e) => setHeadPastor((p) => ({ ...p, education: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>경력 (줄바꿈으로 여러 줄)</label>
            <textarea
              rows={3}
              className={inputCls}
              value={headPastor.career}
              onChange={(e) => setHeadPastor((p) => ({ ...p, career: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {GROUPS.map(({ key, label }) => (
        <Card key={key} title={label}>
          <RepeatableFieldRows
            rows={groups[key]}
            onChange={(rows) => setGroups((g) => ({ ...g, [key]: rows }))}
            fields={STAFF_FIELDS}
            addLabel={label}
            emptyRow={{ name: "", role: "", tel: "", email: "", image: "" }}
          />
        </Card>
      ))}

      <Card title="파송 선교사">
        <RepeatableFieldRows
          rows={missionaries}
          onChange={setMissionaries}
          fields={MISSIONARY_FIELDS}
          addLabel="파송 선교사"
          emptyRow={{ name: "", location: "", tel: "", email: "", image: "" }}
        />
      </Card>
    </SectionEditorLayout>
  );
}
