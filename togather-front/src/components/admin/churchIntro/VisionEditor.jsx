import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Vision from "@/components/church/Vision";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import CharCountTextarea from "@/components/admin/CharCountTextarea";
import RepeatableFieldRows from "@/components/admin/RepeatableFieldRows";
import { filterBlankRows } from "@/components/admin/repeatableRows";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";
const DETAIL_FIELDS = [
  { key: "title", placeholder: "세부 항목 제목" },
  { key: "text", placeholder: "세부 내용" },
];

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

const emptyItem = () => ({ title: "", desc: "", detailedDescription: [] });

export default function VisionEditor() {
  const { church } = useChurch();
  const [mainTitle, setMainTitle] = useState("");
  const [mainVerse, setMainVerse] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const v = church.vision;
    if (!v) return;
    setMainTitle(v.mainTitle ?? "");
    setMainVerse(v.mainVerse ?? "");
    setItems(
      (v.items ?? []).map((it) => ({
        title: it.title ?? it.label ?? "",
        desc: it.desc ?? it.description ?? "",
        detailedDescription: it.detailedDescription ?? [],
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.vision]);

  const cleanItems = items
    .filter((it) => it.title.trim() || it.desc.trim())
    .map((it) => ({ ...it, detailedDescription: filterBlankRows(it.detailedDescription, DETAIL_FIELDS) }));

  function updateItem(i, patch) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("VISION", { mainTitle, mainVerse, items: cleanItems });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[VisionEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="교회 비전"
      description="교회소개 > 교회 비전 탭에 노출됩니다. 핵심 가치는 앞에서부터 최대 4개까지 화면에 표시됩니다."
      overrides={{ vision: { mainTitle, mainVerse, items: cleanItems } }}
      preview={<Vision />}
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
      <Card title="상단 환영 문구">
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>환영 문구 (한두 줄)</label>
            <textarea
              rows={2}
              className={inputCls}
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              placeholder="예) 안녕하세요! ○○교회에 찾아와 주신 여러분을 주님의 이름으로 환영합니다."
            />
          </div>
          <CharCountTextarea
            id="vision-main-verse"
            label="핵심 비전/목표 설명 (한 문단)"
            value={mainVerse}
            onChange={setMainVerse}
            min={300}
            max={600}
            rows={8}
          />
        </div>
      </Card>

      {items.map((item, i) => (
        <Card
          key={i}
          title={`비전(핵심 가치) ${i + 1}`}
          right={
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-body-5 text-grey-5 hover:text-red-500"
            >
              삭제
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className={labelCls}>명칭</label>
              <input
                className={inputCls}
                value={item.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                placeholder="예) 말씀 공동체"
              />
            </div>
            <div>
              <label className={labelCls}>한 줄 설명</label>
              <input
                className={inputCls}
                value={item.desc}
                onChange={(e) => updateItem(i, { desc: e.target.value })}
              />
            </div>
          </div>
          <label className={labelCls}>세부 항목</label>
          <RepeatableFieldRows
            rows={item.detailedDescription}
            onChange={(rows) => updateItem(i, { detailedDescription: rows })}
            fields={DETAIL_FIELDS}
            addLabel="세부 항목"
            emptyRow={{ title: "", text: "" }}
          />
        </Card>
      ))}

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, emptyItem()])}
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-grey-3 text-body-4 text-grey-6 hover:border-primary hover:text-primary transition-colors"
      >
        + 비전(핵심 가치) 추가
      </button>
    </SectionEditorLayout>
  );
}
