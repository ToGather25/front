import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import {
  getAdminPrayers,
  replyToPrayer,
  getAdminMemberInquiries,
  answerMemberInquiry,
} from "@/services/adminInquiryService";
import BubbleLoader from "@/components/common/BubbleLoader";

const TABS = [
  { key: "prayer", label: "기도 / 상담 답변" },
  { key: "inquiry", label: "교인 문의 답변" },
];

function AnswerForm({ id, initialValue, placeholder, onSave }) {
  const [editing, setEditing] = useState(!initialValue);
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    setError(false);
    try {
      await onSave(id, value.trim());
      setEditing(false);
    } catch (err) {
      console.error("[InquiriesManage] 답변 저장 실패:", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-3 pt-3 border-t border-grey-2 flex items-start justify-between gap-3">
        <p className="text-body-5 text-grey-7 flex-1">{initialValue}</p>
        <button
          onClick={() => setEditing(true)}
          className="shrink-0 text-caption text-primary font-semibold"
        >
          수정
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-grey-2">
      <textarea
        className="w-full border border-grey-3 rounded-lg px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary"
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-caption font-semibold disabled:opacity-50"
        >
          {saving ? "저장 중..." : "답변 저장"}
        </button>
        {error && <span className="text-caption text-red-500">저장 실패, 다시 시도해 주세요.</span>}
      </div>
    </div>
  );
}

function PrayerList() {
  const { data: prayers, loading, error, refetch } = useFetch(() => getAdminPrayers(), [], []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <BubbleLoader size="sm" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-body-4 text-grey-5">기도/상담 목록을 불러오지 못했습니다.</p>
        <button onClick={refetch} className="text-body-5 text-primary underline">
          다시 시도
        </button>
      </div>
    );
  }
  if (prayers.length === 0) {
    return <p className="text-body-5 text-grey-5 py-4">등록된 기도/상담이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {prayers.map((item) => (
        <div key={item.id} className="border border-grey-2 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-caption font-bold text-primary bg-primary/10 rounded-lg px-2 py-0.5">
              {item.type}
            </span>
            <span className="text-caption text-grey-5">{item.status}</span>
          </div>
          <p className="text-body-4 text-grey-9 mt-2">{item.title ?? item.content}</p>
          {item.title && <p className="text-body-5 text-grey-6 mt-1">{item.content}</p>}
          <AnswerForm
            id={item.id}
            initialValue={item.reply?.text ?? null}
            placeholder="답변을 입력하세요."
            onSave={async (id, text) => {
              await replyToPrayer(id, text);
              refetch();
            }}
          />
        </div>
      ))}
    </div>
  );
}

function MemberInquiryList() {
  const {
    data: inquiries,
    loading,
    error,
    refetch,
  } = useFetch(() => getAdminMemberInquiries(), [], []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <BubbleLoader size="sm" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-body-4 text-grey-5">교인 문의 목록을 불러오지 못했습니다.</p>
        <button onClick={refetch} className="text-body-5 text-primary underline">
          다시 시도
        </button>
      </div>
    );
  }
  if (inquiries.length === 0) {
    return <p className="text-body-5 text-grey-5 py-4">등록된 문의가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {inquiries.map((item) => (
        <div key={item.id} className="border border-grey-2 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
            <span className="text-caption text-grey-5">{item.status}</span>
          </div>
          <p className="text-body-5 text-grey-6 mt-1">{item.content}</p>
          <AnswerForm
            id={item.id}
            initialValue={item.answer}
            placeholder="답변을 입력하세요."
            onSave={async (id, answer) => {
              await answerMemberInquiry(id, answer);
              refetch();
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function InquiriesManage() {
  const [tab, setTab] = useState("prayer");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">문의 / 기도 답변 관리</h1>
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-body-5 font-semibold transition-colors ${
              tab === t.key ? "bg-primary text-white" : "border border-grey-3 text-grey-7 bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-grey-2 p-6">
        {tab === "prayer" ? <PrayerList /> : <MemberInquiryList />}
      </div>
    </div>
  );
}
