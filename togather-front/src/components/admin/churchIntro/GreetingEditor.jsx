import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { updateChurchIntroSection } from "@/services/churchIntroService";
import Greeting from "@/components/church/Greeting";
import SectionEditorLayout from "@/components/admin/SectionEditorLayout";
import CharCountTextarea from "@/components/admin/CharCountTextarea";

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

export default function GreetingEditor() {
  const { church } = useChurch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(""); // 문단은 빈 줄로 구분해 하나의 텍스트로 편집한다
  const [signature, setSignature] = useState({ church: "", title: "", name: "", signatureImage: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const g = church.greeting;
    if (!g) return;
    setTitle(g.title ?? "");
    setBody((g.paragraphs ?? []).join("\n\n"));
    setSignature({
      church: g.signature?.church ?? "",
      title: g.signature?.title ?? "",
      name: g.signature?.name ?? "",
      signatureImage: g.signature?.signatureImage ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church.greeting]);

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  async function handleSave() {
    setSaving(true);
    setError(false);
    try {
      await updateChurchIntroSection("GREETING", {
        title,
        paragraphs,
        signature: { ...signature, signatureImage: signature.signatureImage || null },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[GreetingEditor] 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionEditorLayout
      title="인사말"
      description="교회소개 > 인사말 탭에 노출됩니다."
      overrides={{ greeting: { title, paragraphs, signature } }}
      preview={<Greeting />}
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
      <Card title="제목">
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예) 할렐루야!"
        />
      </Card>

      <Card title="본문">
        <CharCountTextarea
          id="greeting-body"
          value={body}
          onChange={setBody}
          min={300}
          max={600}
          rows={14}
          placeholder="문단을 나눌 땐 빈 줄을 하나 띄워 주세요."
        />
      </Card>

      <Card title="서명">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>교회명</label>
            <input
              className={inputCls}
              value={signature.church}
              onChange={(e) => setSignature((s) => ({ ...s, church: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>직함</label>
            <input
              className={inputCls}
              value={signature.title}
              onChange={(e) => setSignature((s) => ({ ...s, title: e.target.value }))}
              placeholder="예) 담임목사"
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>성함</label>
            <input
              className={inputCls}
              value={signature.name}
              onChange={(e) => setSignature((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
        </div>
        <p className="text-body-5 text-grey-5 mt-3">
          * 서명란 옆 사진은 "섬기는 사람들" 탭의 담임목사 사진이 그대로 쓰입니다.
        </p>
      </Card>
    </SectionEditorLayout>
  );
}
