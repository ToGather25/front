import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import TransportGuide from "@/components/church/TransportGuide";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";
const WAYPOINT_FIELDS = [
  { key: "label", placeholder: "경유지(위치명)" },
  { key: "time", placeholder: "출발/도착 시각" },
];
const defaultRoute = () => ({ name: "", color: "#3B5280", waypoints: [] });

function Card({ title, children, right }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sub-tit-5 font-bold text-grey-10">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function ShuttleEditor() {
  const { church } = useChurch();
  const [routes, setRoutes] = useState([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = church.transportGuide;
    if (!t) return;
    setRoutes(
      (t.routes ?? []).map((r) => ({
        name: r.name ?? "",
        color: r.color ?? "#3B5280",
        waypoints: (r.waypoints ?? []).map(({ label, time }) => ({ label, time })),
      })),
    );
    setNotes((t.notes ?? []).join("\n"));
  }, [church.transportGuide]);

  const cleanRoutes = routes
    .filter((r) => r.name.trim())
    .map((r) => ({ ...r, waypoints: filterBlankRows(r.waypoints, WAYPOINT_FIELDS) }));
  const cleanNotes = notes.split("\n").map((s) => s.trim()).filter(Boolean);

  function updateRoute(i, patch) {
    setRoutes((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("SHUTTLE", { routes: cleanRoutes, notes: cleanNotes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[ShuttleEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="차량 운행 안내"
      description="교회소개 > 차량운행 안내 탭에 노출됩니다. 노선이 없으면 교회소개 탭에서 비워두셔도 됩니다."
      overrides={{ transportGuide: { routes: cleanRoutes, notes: cleanNotes } }}
      preview={<TransportGuide />}
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
      {routes.map((route, i) => (
        <Card
          key={i}
          title={`노선 ${i + 1}`}
          right={
            <button
              type="button"
              onClick={() => setRoutes((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-body-5 text-grey-5 hover:text-red-500"
            >
              삭제
            </button>
          }
        >
          <div className="grid grid-cols-[1fr_auto] gap-4 mb-5">
            <div>
              <label className={labelCls}>노선 이름</label>
              <input
                className={inputCls}
                value={route.name}
                onChange={(e) => updateRoute(i, { name: e.target.value })}
                placeholder="예) 철산역 라인"
              />
            </div>
            <div>
              <label className={labelCls}>표시 색상</label>
              <input
                type="color"
                value={route.color}
                onChange={(e) => updateRoute(i, { color: e.target.value })}
                className="w-14 h-11 rounded-xl border border-grey-3 cursor-pointer"
              />
            </div>
          </div>
          <label className={labelCls}>경유지</label>
          <RepeatableFieldRows
            rows={route.waypoints}
            onChange={(waypoints) => updateRoute(i, { waypoints })}
            fields={WAYPOINT_FIELDS}
            addLabel="경유지"
            emptyRow={{ label: "", time: "" }}
          />
        </Card>
      ))}

      <button
        type="button"
        onClick={() => setRoutes((prev) => [...prev, defaultRoute()])}
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-grey-3 text-body-4 text-grey-6 hover:border-primary hover:text-primary transition-colors"
      >
        + 노선 추가
      </button>

      <Card title="차량 운행 관련 공지사항 (선택)">
        <textarea
          rows={3}
          className={inputCls}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="한 줄에 하나씩 입력해 주세요."
        />
      </Card>
    </SectionEditorLayout>
  );
}
