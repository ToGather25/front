import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboInfo, createJuboIssue, publishJubo } from "@/services/juboService";
import WorshipSectionEditor from "@/components/admin/jubo/WorshipSectionEditor";
import VolunteerSectionEditor from "@/components/admin/jubo/VolunteerSectionEditor";
import OfferingSectionEditor from "@/components/admin/jubo/OfferingSectionEditor";
import SupportSectionEditor from "@/components/admin/jubo/SupportSectionEditor";
import DistrictSectionEditor from "@/components/admin/jubo/DistrictSectionEditor";
import MinistersSectionEditor from "@/components/admin/jubo/MinistersSectionEditor";

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function JuboManage() {
  const { church } = useChurch();
  const {
    data: currentInfo,
    loading: infoLoading,
    refetch: refetchInfo,
  } = useFetch(() => getJuboInfo(church.id), [church.id], null);

  const [juboId, setJuboId] = useState(null);
  const [issueNo, setIssueNo] = useState("");
  const [juboDate, setJuboDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(false);
  const [published, setPublished] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!issueNo.trim() || !juboDate) return;
    setCreating(true);
    setCreateError(false);
    try {
      const created = await createJuboIssue(church.id, { issueNo: issueNo.trim(), juboDate });
      setJuboId(created.id);
      setPublished(false);
    } catch (err) {
      console.error("[JuboManage] 주보 생성 실패:", err);
      setCreateError(true);
    } finally {
      setCreating(false);
    }
  }

  function handleCancelDraft() {
    if (!window.confirm("작성 중인 주보를 닫으시겠습니까? 저장하지 않은 섹션 내용은 사라집니다."))
      return;
    setJuboId(null);
    setIssueNo("");
    setJuboDate("");
    setPublished(false);
  }

  async function handlePublish() {
    if (!window.confirm("주보를 발행하시겠습니까? 발행 즉시 공개 화면에 반영됩니다.")) return;
    setPublishing(true);
    setPublishError(false);
    try {
      await publishJubo(church.id, juboId);
      setPublished(true);
      refetchInfo();
    } catch (err) {
      console.error("[JuboManage] 주보 발행 실패:", err);
      setPublishError(true);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">스마트 주보 관리</h1>
      </div>

      <div className="bg-white rounded-2xl border border-grey-2 p-5 mb-5">
        <span className="text-body-4 font-semibold text-grey-8">현재 발행된 주보</span>
        <p className="mt-1 text-body-4 text-grey-9">
          {infoLoading
            ? "불러오는 중..."
            : currentInfo
              ? `${currentInfo.issueNo} · ${currentInfo.date}`
              : "발행된 주보가 없습니다."}
        </p>
      </div>

      {!juboId ? (
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-4">새 주보 작성</h2>
          <form onSubmit={handleCreate} className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-caption text-grey-6 mb-1" htmlFor="jubo-issue-no">
                호수
              </label>
              <input
                id="jubo-issue-no"
                className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4"
                placeholder="예: 제10-8"
                value={issueNo}
                onChange={(e) => setIssueNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-caption text-grey-6 mb-1" htmlFor="jubo-date">
                날짜
              </label>
              <input
                id="jubo-date"
                type="date"
                className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4"
                value={juboDate}
                onChange={(e) => setJuboDate(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
            >
              {creating ? "생성 중..." : "작성 시작"}
            </button>
          </form>
          {createError && (
            <p className="mt-3 text-caption text-red-500">
              주보 생성에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-blue-1 border border-blue-3 text-caption text-blue-9">
            <span>
              작성 중 새로고침하면 저장하지 않은 내용은 유실됩니다. 섹션별로 저장 버튼을 눌러
              진행 상황을 지켜주세요.
            </span>
            <button
              onClick={handleCancelDraft}
              className="shrink-0 text-caption font-semibold text-blue-9 underline"
              type="button"
            >
              작성 취소
            </button>
          </div>

          <div className="grid gap-5">
            <SectionCard title="예배">
              <WorshipSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="봉사">
              <VolunteerSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="예물">
              <OfferingSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="후원">
              <SupportSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="구역">
              <DistrictSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
            <SectionCard title="섬기는 분들">
              <MinistersSectionEditor churchId={church.id} juboId={juboId} />
            </SectionCard>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
            >
              {published ? "발행 완료" : publishing ? "발행 중..." : "발행하기"}
            </button>
            {publishError && (
              <span className="text-caption text-red-500">
                발행에 실패했습니다. 다시 시도해 주세요.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
