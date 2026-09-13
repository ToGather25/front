import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getSermonNote, updateJuboSection } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

const EMPTY = { title: "", scripture: "", outline: [] };

export default function SermonNoteSectionEditor({ churchId, juboId }) {
  const {
    data: initial,
    loading: prefillLoading,
    error: prefillError,
    refetch: refetchPrefill,
  } = useFetch(() => getSermonNote(churchId), [churchId], null);
  const [note, setNote] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setNote(initial);
  }, [initial]);

  function updateField(field, value) {
    setNote((prev) => ({ ...prev, [field]: value }));
  }

  function addOutlineItem() {
    setNote((prev) => ({ ...prev, outline: [...prev.outline, ""] }));
  }

  function updateOutlineItem(i, value) {
    setNote((prev) => {
      const outline = [...prev.outline];
      outline[i] = value;
      return { ...prev, outline };
    });
  }

  function removeOutlineItem(i) {
    setNote((prev) => ({ ...prev, outline: prev.outline.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateJuboSection(churchId, juboId, "SERMON_NOTE", note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[SermonNoteSectionEditor] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h3 className="text-body-3 font-bold text-grey-10 mb-4">말씀</h3>
      {prefillLoading && <p className="text-caption text-grey-5 mb-3">불러오는 중...</p>}
      {prefillError && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-caption text-grey-5">직전 발행본을 불러오지 못했습니다.</p>
          <button
            onClick={refetchPrefill}
            className="text-caption text-primary underline"
            type="button"
          >
            다시 시도
          </button>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-4">
        <input
          className={inputCls}
          placeholder="설교 제목"
          aria-label="설교 제목"
          value={note.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="본문 말씀 (예: 로마서 2장 27절)"
          aria-label="본문 말씀"
          value={note.scripture}
          onChange={(e) => updateField("scripture", e.target.value)}
        />
        <div className="border border-grey-2 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption font-semibold text-grey-8">설교 개요</span>
            <button
              onClick={addOutlineItem}
              className="text-caption text-primary font-semibold"
              type="button"
            >
              + 항목 추가
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {note.outline.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  placeholder="개요 항목"
                  aria-label="개요 항목"
                  value={item}
                  onChange={(e) => updateOutlineItem(i, e.target.value)}
                />
                <button
                  onClick={() => removeOutlineItem(i)}
                  className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                  type="button"
                >
                  삭제
                </button>
              </div>
            ))}
            {note.outline.length === 0 && (
              <p className="text-caption text-grey-5">등록된 개요가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          type="button"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-caption text-blue-7">저장됨</span>}
        {saveError && (
          <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>
        )}
      </div>
    </div>
  );
}
