import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipSchedule, updateWorshipSchedule } from "@/services/worshipScheduleService";
import { getChurchProfile, updateChurchProfile } from "@/services/churchProfileService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const rowInputCls =
  "border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-10 focus:outline-none focus:border-primary";
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

/** 예배 시간표 한 줄 — 백엔드 필드는 name/time/location이다(화면 라벨은 "장소"). */
function ScheduleRows({ rows, onChange, addLabel }) {
  const update = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((w, i) => (
        <div key={i} className="grid gap-3 items-center" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
          <input
            className={rowInputCls}
            value={w.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="예배명"
            aria-label={`${addLabel} ${i + 1} 예배명`}
          />
          <input
            className={rowInputCls}
            value={w.time}
            onChange={(e) => update(i, "time", e.target.value)}
            placeholder="시간"
            aria-label={`${addLabel} ${i + 1} 시간`}
          />
          <input
            className={rowInputCls}
            value={w.location}
            onChange={(e) => update(i, "location", e.target.value)}
            placeholder="장소"
            aria-label={`${addLabel} ${i + 1} 장소`}
          />
          <button
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            aria-label={`${addLabel} ${i + 1} 삭제`}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-5 hover:bg-grey-2 hover:text-red-500 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...rows, { name: "", time: "", location: "" }])}
        className="mt-1 flex items-center gap-2 text-body-4 text-primary font-medium hover:underline w-fit"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {addLabel} 추가
      </button>
    </div>
  );
}

export default function MainManage() {
  const { church } = useChurch();

  const {
    data: initialSchedule,
    loading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useFetch(getWorshipSchedule, [church.id], null);
  const { data: initialProfile } = useFetch(() => getChurchProfile(church.id), [church.id], null);

  const [regular, setRegular] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [banner, setBanner] = useState({ representativeImageUrl: "", slogan: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (initialSchedule) {
      setRegular(initialSchedule.regular ?? []);
      setDepartments(initialSchedule.departments ?? []);
    }
  }, [initialSchedule]);

  useEffect(() => {
    if (initialProfile) {
      setBanner({
        representativeImageUrl: initialProfile.representativeImageUrl ?? "",
        slogan: initialProfile.slogan ?? "",
      });
    }
  }, [initialProfile]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      // 예배 시간표는 통째 교체 — 빈 행은 보내지 않는다.
      const notBlank = (r) => r.name.trim() || r.time.trim() || r.location.trim();
      await updateWorshipSchedule({
        regular: regular.filter(notBlank),
        departments: departments.filter(notBlank),
      });
      // 프로필도 통째 교체 — 여기서 안 건드리는 필드(인스타그램·헌금 계좌)를 함께 실어 보낸다.
      await updateChurchProfile(church.id, {
        ...initialProfile,
        representativeImageUrl: banner.representativeImageUrl || null,
        slogan: banner.slogan || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[MainManage] 저장 실패:", err);
      setSaveError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">메인 페이지 관리</h1>
        <div className="flex items-center gap-3">
          {saveError && <span className="text-body-5 text-red-500">{saveError}</span>}
          <button
            onClick={handleSave}
            disabled={saving || scheduleLoading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : saved ? "저장 완료 ✓" : "변경사항 저장"}
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        <Card title="홈 배너" description="홈 화면 히어로 영역의 대표 이미지와 슬로건입니다.">
          <div className="grid gap-4">
            <div>
              <label className={labelCls} htmlFor="banner-image">
                배너 이미지 URL
              </label>
              <input
                id="banner-image"
                className={inputCls}
                value={banner.representativeImageUrl}
                onChange={(e) =>
                  setBanner((p) => ({ ...p, representativeImageUrl: e.target.value }))
                }
                placeholder="비워두면 기본 배너 이미지가 표시됩니다"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="banner-slogan">
                슬로건
              </label>
              <input
                id="banner-slogan"
                className={inputCls}
                value={banner.slogan}
                onChange={(e) => setBanner((p) => ({ ...p, slogan: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        <Card
          title="예배 시간표"
          description="여기서 저장한 내용이 홈 화면과 예배 안내 페이지에 그대로 표시됩니다."
        >
          {scheduleLoading ? (
            <p className="text-body-4 text-grey-5">불러오는 중...</p>
          ) : scheduleError ? (
            <div className="flex items-center gap-2">
              <p className="text-body-4 text-grey-5">예배 시간표를 불러오지 못했습니다.</p>
              <button onClick={refetchSchedule} className="text-body-5 text-primary underline">
                다시 시도
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              <div>
                <h3 className="text-body-4 font-semibold text-grey-9 mb-3">정기 예배</h3>
                <ScheduleRows rows={regular} onChange={setRegular} addLabel="정기 예배" />
              </div>
              <div>
                <h3 className="text-body-4 font-semibold text-grey-9 mb-3">부서별 예배</h3>
                <ScheduleRows rows={departments} onChange={setDepartments} addLabel="부서별 예배" />
              </div>
            </div>
          )}
        </Card>

        <Card title="유튜브 채널" description="교회 기본 설정 값입니다(변경은 ToGather 운영팀에 요청).">
          <p className="text-body-3 text-grey-10">{church.social?.youtube || "-"}</p>
        </Card>
      </div>
    </div>
  );
}
