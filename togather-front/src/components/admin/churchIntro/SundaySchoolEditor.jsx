import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import SundaySchool from "@/pages/SundaySchool/SundaySchool";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import ImageUploadField from "@/components/admin/ImageUploadField";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function emptyDept() {
  return {
    key: "",
    ageRange: "",
    vision: "",
    description: "",
    worshipTime: "",
    worshipLocation: "",
    pastorName: "",
    pastorRole: "",
    pastorTel: "",
    pastorImage: "",
    activitiesText: "",
    bgImage: "",
  };
}

function toForm(dept) {
  return {
    key: dept.key ?? "",
    ageRange: dept.ageRange ?? "",
    vision: dept.vision ?? "",
    description: dept.description ?? "",
    worshipTime: dept.worship?.time ?? "",
    worshipLocation: dept.worship?.location ?? "",
    pastorName: dept.pastor?.name ?? "",
    pastorRole: dept.pastor?.role ?? "",
    pastorTel: dept.pastor?.tel ?? "",
    pastorImage: dept.pastor?.image ?? "",
    activitiesText: (dept.activities ?? []).join("\n"),
    bgImage: dept.bgImage ?? "",
  };
}

function toContent(form) {
  return {
    key: form.key,
    ageRange: form.ageRange,
    vision: form.vision,
    description: form.description,
    worship: { time: form.worshipTime, location: form.worshipLocation },
    pastor: {
      name: form.pastorName,
      role: form.pastorRole,
      tel: form.pastorTel,
      image: form.pastorImage || null,
    },
    activities: form.activitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    bgImage: form.bgImage || null,
  };
}

export default function SundaySchoolEditor() {
  const { church } = useChurch();
  const [depts, setDepts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (church.sundaySchool) setDepts(church.sundaySchool.map(toForm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.sundaySchool]);

  function update(i, field, value) {
    setDepts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  }
  function remove(i) {
    setDepts((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add() {
    setDepts((prev) => [...prev, emptyDept()]);
  }

  const cleanDepts = depts.filter((d) => d.key.trim()).map(toContent);

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("SUNDAY_SCHOOL", cleanDepts);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[SundaySchoolEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="주일학교"
      description="주일학교 탭에 부서별로 노출됩니다."
      overrides={{ sundaySchool: cleanDepts }}
      preview={<SundaySchool />}
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
      {depts.map((d, i) => (
        <div key={i} className="bg-white rounded-2xl border border-grey-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sub-tit-5 font-bold text-grey-10">
              {d.key || `부서 ${i + 1}`}
            </h2>
            <button
              onClick={() => remove(i)}
              className="text-caption text-grey-5 hover:text-red-500"
            >
              부서 삭제
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>부서명</label>
                <input
                  className={inputCls}
                  value={d.key}
                  onChange={(e) => update(i, "key", e.target.value)}
                  placeholder="예) 유치부"
                  aria-label={`부서 ${i + 1} 부서명`}
                />
              </div>
              <div>
                <label className={labelCls}>연령대</label>
                <input
                  className={inputCls}
                  value={d.ageRange}
                  onChange={(e) => update(i, "ageRange", e.target.value)}
                  placeholder="예) 만 4–7세"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>한 줄 비전</label>
              <input
                className={inputCls}
                value={d.vision}
                onChange={(e) => update(i, "vision", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>소개 (여러 줄 가능)</label>
              <textarea
                rows={3}
                className={inputCls}
                value={d.description}
                onChange={(e) => update(i, "description", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>예배 시간</label>
                <input
                  className={inputCls}
                  value={d.worshipTime}
                  onChange={(e) => update(i, "worshipTime", e.target.value)}
                  placeholder="예) 주일 오전 11:00"
                />
              </div>
              <div>
                <label className={labelCls}>예배 장소</label>
                <input
                  className={inputCls}
                  value={d.worshipLocation}
                  onChange={(e) => update(i, "worshipLocation", e.target.value)}
                  placeholder="예) 유치부실 (2층)"
                />
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-40 shrink-0">
                <ImageUploadField
                  id={`sunday-school-pastor-image-${i}`}
                  label="담당 교역자 사진"
                  value={d.pastorImage}
                  onChange={(url) => update(i, "pastorImage", url)}
                  aspect={3 / 4}
                />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>담당 교역자 성함</label>
                  <input
                    className={inputCls}
                    value={d.pastorName}
                    onChange={(e) => update(i, "pastorName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>직함</label>
                  <input
                    className={inputCls}
                    value={d.pastorRole}
                    onChange={(e) => update(i, "pastorRole", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>연락처</label>
                  <input
                    className={inputCls}
                    value={d.pastorTel}
                    onChange={(e) => update(i, "pastorTel", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>주요 활동 (줄바꿈으로 여러 개)</label>
              <textarea
                rows={4}
                className={inputCls}
                value={d.activitiesText}
                onChange={(e) => update(i, "activitiesText", e.target.value)}
                placeholder={"주일 예배\nVBS (여름성경학교)"}
                aria-label={`부서 ${i + 1} 주요 활동`}
              />
            </div>
            <div className="w-60">
              <ImageUploadField
                id={`sunday-school-bg-${i}`}
                label="상단 배경 이미지"
                value={d.bgImage}
                onChange={(url) => update(i, "bgImage", url)}
                aspect={21 / 9}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-2 text-body-4 text-primary font-medium hover:underline w-fit"
      >
        + 부서 추가
      </button>
    </SectionEditorLayout>
  );
}
