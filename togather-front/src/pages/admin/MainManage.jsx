import { useState, useEffect, useRef } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipSchedule, updateWorshipSchedule } from "@/services/worshipScheduleService";
import { getChurchProfile, updateChurchProfile } from "@/services/churchProfileService";
import BubbleLoader from "@/components/common/BubbleLoader";
import ImageUploadField from "@/components/admin/ImageUploadField";

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

// ── 요일·시간 선택 → 백엔드로 보내는 기존 time 문자열로 조립 ─────────────
// 백엔드 스키마(name/time/location)는 그대로 둔다 — time 안에 들어갈 문자열을
// 자유 입력 대신 요일 체크박스 + 시간 선택 패널(TimePicker)로 조립해서 만들 뿐이다.
const DAY_SHORT = ["주일", "월", "화", "수", "목", "금", "토"];
const DAY_FULL = ["주일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function formatTimeKorean(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m > 0 ? `${period} ${hour12}시 ${m}분` : `${period} ${hour12}시`;
}

function formatDaysKorean(days) {
  if (days.length === 0) return "";
  if (days.length === 7) return "매일";
  if (days.length === 1) return DAY_FULL[days[0]];
  return "매주 " + [...days].sort((a, b) => a - b).map((d) => DAY_SHORT[d]).join("·");
}

function composeSchedule(days, hhmm) {
  return [formatDaysKorean(days), formatTimeKorean(hhmm)].filter(Boolean).join(" ");
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** 시/분을 직접 고르는 패널 — <input type="time">은 브라우저 기본 UI라 accent-color를
 * 줘도 실제로 색이 반영되는 부분이 거의 없어서, 선택 패널을 직접 그려 primary 색을 쓴다. */
function TimePicker({ value, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [h, m] = value ? value.split(":").map(Number) : [null, null];

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function pick(nextH, nextM) {
    const hh = String(nextH ?? h ?? 0).padStart(2, "0");
    const mm = String(nextM ?? m ?? 0).padStart(2, "0");
    onChange(`${hh}:${mm}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-expanded={open}
        className={`${rowInputCls} w-48 flex items-center justify-between gap-2 ${open ? "border-primary" : ""}`}
      >
        <span className={value ? "text-grey-10" : "text-grey-5"}>
          {value ? formatTimeKorean(value) : "시간 선택"}
        </span>
        <svg className="w-4 h-4 text-grey-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 7v5l3 3" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 flex bg-white border border-grey-3 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1">
            {HOURS.map((hh) => (
              <button
                key={hh}
                type="button"
                onClick={() => pick(hh, null)}
                className={`block w-16 px-3 py-1.5 text-body-5 text-center transition-colors ${
                  h === hh ? "bg-primary text-white font-semibold" : "text-grey-8 hover:bg-grey-1"
                }`}
              >
                {String(hh).padStart(2, "0")}시
              </button>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto py-1 border-l border-grey-2">
            {MINUTES.map((mm) => (
              <button
                key={mm}
                type="button"
                onClick={() => pick(null, mm)}
                className={`block w-16 px-3 py-1.5 text-body-5 text-center transition-colors ${
                  m === mm ? "bg-primary text-white font-semibold" : "text-grey-8 hover:bg-grey-1"
                }`}
              >
                {String(mm).padStart(2, "0")}분
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 예배 시간표 한 줄 — 백엔드 필드는 name/time/location이다(화면 라벨은 "장소").
 * 요일+시간 선택을 기본으로 보여주고, "직접 입력"을 누르면 자유 텍스트로 전환한다.
 * 기존 데이터는 time이 자유 텍스트라 요일/시간 체크박스로 되돌려 파싱할 수 없으므로,
 * 선택 모드에서는 건드리지 않는 한 기존 값이 그대로 유지된다. */
function ScheduleRow({ row, index, addLabel, onUpdate, onRemove }) {
  const [mode, setMode] = useState("picker");
  const [days, setDays] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState("");

  function toggleDay(d) {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d];
    setDays(next);
    onUpdate("time", composeSchedule(next, timeOfDay));
  }

  function toggleEveryDay() {
    const next = days.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6];
    setDays(next);
    onUpdate("time", composeSchedule(next, timeOfDay));
  }

  function handleTimeOfDayChange(v) {
    setTimeOfDay(v);
    onUpdate("time", composeSchedule(days, v));
  }

  function switchToPicker() {
    setDays([]);
    setTimeOfDay("");
    onUpdate("time", "");
    setMode("picker");
  }

  return (
    <div className="border border-grey-2 rounded-xl p-3">
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
        <div>
          <label className={labelCls}>예배명</label>
          <input
            className={`${rowInputCls} w-full`}
            value={row.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            placeholder="예배명"
            aria-label={`${addLabel} ${index + 1} 예배명`}
          />
        </div>
        <div>
          <label className={labelCls}>장소</label>
          <input
            className={`${rowInputCls} w-full`}
            value={row.location}
            onChange={(e) => onUpdate("location", e.target.value)}
            placeholder="장소"
            aria-label={`${addLabel} ${index + 1} 장소`}
          />
        </div>
        <button
          onClick={onRemove}
          aria-label={`${addLabel} ${index + 1} 삭제`}
          style={{ gridRow: mode === "picker" ? "span 2" : "auto" }}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-5 hover:bg-grey-2 hover:text-red-500 transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {mode === "picker" ? (
          <>
            <div>
              <label className={labelCls}>요일</label>
              <div className="flex flex-wrap gap-2">
                {DAY_SHORT.map((label, d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    aria-pressed={days.includes(d)}
                    className={`px-3 py-1.5 rounded-full text-body-5 font-semibold border transition-colors ${
                      days.includes(d)
                        ? "bg-primary text-white border-primary"
                        : "border-grey-3 text-grey-7 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleEveryDay}
                  aria-pressed={days.length === 7}
                  className={`px-3 py-1.5 rounded-full text-body-5 font-semibold border transition-colors ${
                    days.length === 7
                      ? "bg-primary text-white border-primary"
                      : "border-grey-3 text-grey-7 hover:border-primary hover:text-primary"
                  }`}
                >
                  매일
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>시간</label>
              <div className="flex items-center gap-2">
                <TimePicker
                  value={timeOfDay}
                  onChange={handleTimeOfDayChange}
                  ariaLabel={`${addLabel} ${index + 1} 시간`}
                />
                <button
                  type="button"
                  onClick={() => setMode("free")}
                  className="ml-auto text-body-5 text-grey-5 underline shrink-0"
                >
                  텍스트 입력
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ gridColumn: "span 2" }}>
            <label className={labelCls}>요일 및 시간</label>
            <div className="flex items-center gap-2">
              <input
                className={`${rowInputCls} flex-1`}
                value={row.time}
                onChange={(e) => onUpdate("time", e.target.value)}
                placeholder="예: * 부서 별 상이"
                aria-label={`${addLabel} ${index + 1} 시간`}
              />
              <button
                type="button"
                onClick={switchToPicker}
                className="text-body-5 text-grey-5 underline shrink-0"
              >
                버튼 입력
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleRows({ rows, onChange, addLabel }) {
  const update = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((w, i) => (
        <ScheduleRow
          key={w._id}
          row={w}
          index={i}
          addLabel={addLabel}
          onUpdate={(field, val) => update(i, field, val)}
          onRemove={() => onChange(rows.filter((_, idx) => idx !== i))}
        />
      ))}
      <button
        onClick={() => onChange([...rows, { _id: crypto.randomUUID(), name: "", time: "", location: "" }])}
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
  const [banner, setBanner] = useState({ representativeImageUrl: "", instagramUrl: "" });
  const [offering, setOffering] = useState({ bankName: "", accountNumber: "", accountHolder: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (initialSchedule) {
      // 각 줄에 화면 전용 _id를 붙인다 — 리스트에서 줄을 지워도 다른 줄의 요일/시간
      // 선택 UI 상태가 엉뚱한 줄로 섞이지 않게 React key로 쓴다. 저장 시 제거한다.
      const withId = (r) => ({ ...r, _id: crypto.randomUUID() });
      setRegular((initialSchedule.regular ?? []).map(withId));
      setDepartments((initialSchedule.departments ?? []).map(withId));
    }
  }, [initialSchedule]);

  useEffect(() => {
    if (initialProfile) {
      setBanner({
        representativeImageUrl: initialProfile.representativeImageUrl ?? "",
        instagramUrl: initialProfile.instagramUrl ?? "",
      });
      setOffering({
        bankName: initialProfile.offeringBankName ?? "",
        accountNumber: initialProfile.offeringAccountNumber ?? "",
        accountHolder: initialProfile.offeringAccountHolder ?? "",
      });
    }
  }, [initialProfile]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      // 예배 시간표는 통째 교체 — 빈 행은 보내지 않는다. _id는 화면 전용이라 제외한다.
      const notBlank = (r) => r.name.trim() || r.time.trim() || r.location.trim();
      const stripId = (r) => {
        const rest = { ...r };
        delete rest._id;
        return rest;
      };
      await updateWorshipSchedule({
        regular: regular.filter(notBlank).map(stripId),
        departments: departments.filter(notBlank).map(stripId),
      });
      // 프로필도 통째 교체 — 교회 프로필 편집 화면이 이 한 곳뿐이므로 모든 필드를 여기서 싣는다.
      await updateChurchProfile(church.id, {
        representativeImageUrl: banner.representativeImageUrl || null,
        instagramUrl: banner.instagramUrl || null,
        offeringBankName: offering.bankName || null,
        offeringAccountNumber: offering.accountNumber || null,
        offeringAccountHolder: offering.accountHolder || null,
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
            <ImageUploadField
              id="banner-image"
              label="배너 이미지"
              value={banner.representativeImageUrl}
              onChange={(url) => setBanner((p) => ({ ...p, representativeImageUrl: url }))}
              hint="비워두면 기본 배너 이미지가 표시됩니다"
            />
            <div>
              <label className={labelCls} htmlFor="banner-instagram">
                인스타그램 URL
              </label>
              <input
                id="banner-instagram"
                className={inputCls}
                value={banner.instagramUrl}
                onChange={(e) => setBanner((p) => ({ ...p, instagramUrl: e.target.value }))}
                placeholder="https://www.instagram.com/... (비워두면 푸터에서 숨김)"
              />
            </div>
          </div>
        </Card>

        <Card title="헌금 안내" description="주보의 헌금 안내 영역에 표시됩니다. 비워두면 해당 영역이 숨겨집니다.">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls} htmlFor="offering-bank">
                은행명
              </label>
              <input
                id="offering-bank"
                className={inputCls}
                value={offering.bankName}
                onChange={(e) => setOffering((p) => ({ ...p, bankName: e.target.value }))}
                placeholder="예) OO은행"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="offering-account">
                계좌번호
              </label>
              <input
                id="offering-account"
                className={inputCls}
                value={offering.accountNumber}
                onChange={(e) => setOffering((p) => ({ ...p, accountNumber: e.target.value }))}
                placeholder="예) 000-000000-00-000"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="offering-holder">
                예금주
              </label>
              <input
                id="offering-holder"
                className={inputCls}
                value={offering.accountHolder}
                onChange={(e) => setOffering((p) => ({ ...p, accountHolder: e.target.value }))}
                placeholder="예) OO교회"
              />
            </div>
          </div>
        </Card>

        <Card
          title="예배 시간표"
          description="여기서 저장한 내용이 홈 화면과 예배 안내 페이지에 그대로 표시됩니다."
        >
          {scheduleLoading ? (
            <div className="flex justify-center py-8">
          <BubbleLoader size="sm" />
        </div>
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
