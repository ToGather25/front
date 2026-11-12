import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import History from "@/components/church/History";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import CharCountTextarea from "@/components/admin/CharCountTextarea";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";
const EVENT_FIELDS = [
  { key: "date", placeholder: "날짜 (YYYY.MM.DD)" },
  { key: "content", placeholder: "내용" },
];

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

/** 입력한 날짜를 10년 단위 era로 묶는다 — 요청서가 약속한 "10년 단위 자동 구성"을 그대로 구현. */
function groupByDecade(events) {
  const buckets = new Map();
  for (const ev of events) {
    const year = parseInt(ev.date, 10);
    const decade = Number.isFinite(year) ? `${Math.floor(year / 10) * 10}~` : "기타";
    if (!buckets.has(decade)) buckets.set(decade, []);
    buckets.get(decade).push(ev);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a === "기타" ? 1 : b === "기타" ? -1 : b.localeCompare(a)))
    .map(([era, events]) => ({
      era,
      events: [...events].sort((a, b) => b.date.localeCompare(a.date)),
    }));
}

export default function HistoryEditor() {
  const { church } = useChurch();
  const [description, setDescription] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [events, setEvents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const h = church.history;
    if (!h) return;
    setDescription(h.description ?? "");
    setFoundedYear(h.foundedYear ?? "");
    setEvents((h.items ?? []).flatMap((group) => group.events ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.history]);

  const cleanEvents = filterBlankRows(events, EVENT_FIELDS);
  const groupedItems = groupByDecade(cleanEvents);

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("HISTORY", {
        description,
        foundedYear: foundedYear ? Number(foundedYear) : null,
        items: groupedItems,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[HistoryEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="교회 연혁"
      description="교회소개 > 교회 연혁 탭에 노출됩니다. 연도는 저장 시 자동으로 10년 단위로 묶입니다."
      overrides={{ history: { description, foundedYear: Number(foundedYear) || null, items: groupedItems } }}
      preview={<History />}
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
      <Card title="설립년도 · 소개 문구">
        <div className="flex flex-col gap-4">
          <div className="max-w-[200px]">
            <label className={labelCls}>설립년도</label>
            <input
              className={inputCls}
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder="예) 1985"
              inputMode="numeric"
            />
          </div>
          <CharCountTextarea
            id="history-description"
            label="연혁 소개 문구 (한두 문단)"
            value={description}
            onChange={setDescription}
            min={300}
            max={600}
            rows={6}
          />
        </div>
      </Card>

      <Card title="연혁 목록">
        <p className="text-body-5 text-grey-5 mb-3">
          오래된 순서든 최신 순서든 상관없이 입력해도 저장 시 자동으로 정리됩니다.
        </p>
        <RepeatableFieldRows
          rows={events}
          onChange={setEvents}
          fields={EVENT_FIELDS}
          addLabel="연혁"
          emptyRow={{ date: "", content: "" }}
        />
      </Card>
    </SectionEditorLayout>
  );
}
