import { useState, useEffect, useRef } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import {
  getJuboInfo,
  createJuboIssue,
  publishJubo,
  getJuboDraft,
  getJuboSettings,
} from "@/services/juboService";
import WorshipSectionEditor from "@/components/admin/jubo/WorshipSectionEditor";
import VolunteerSectionEditor from "@/components/admin/jubo/VolunteerSectionEditor";
import OfferingSectionEditor from "@/components/admin/jubo/OfferingSectionEditor";
import SupportSectionEditor from "@/components/admin/jubo/SupportSectionEditor";
import DistrictSectionEditor from "@/components/admin/jubo/DistrictSectionEditor";
import MinistersSectionEditor from "@/components/admin/jubo/MinistersSectionEditor";
import CoverSectionEditor from "@/components/admin/jubo/CoverSectionEditor";
import NewsSectionEditor from "@/components/admin/jubo/NewsSectionEditor";
import PrayerTopicsSectionEditor from "@/components/admin/jubo/PrayerTopicsSectionEditor";
import SermonNoteSectionEditor from "@/components/admin/jubo/SermonNoteSectionEditor";
import BubbleLoader from "@/components/common/BubbleLoader";

function SectionCard({ title, status, onSave, children }) {
  const { saving, saved, error } = status ?? {};
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sub-tit-3 font-bold text-grey-10">{title}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary text-white text-body-5 font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          {saved && <span className="text-caption text-blue-7">저장됨</span>}
          {error && (
            <span className="text-caption text-red-500">
              {typeof error === "string" ? error : "저장 실패, 다시 시도해 주세요."}
            </span>
          )}
        </div>
      </div>
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

  // 미발행 초안이 있으면 새로고침 후에도 같은 juboId로 편집을 이어간다 — 작성 폼을
  // 처음부터 다시 보여주지 않는다.
  const { data: draft, loading: draftLoading } = useFetch(
    () => getJuboDraft(),
    [church.id],
    undefined,
  );
  const { data: defaultVersion } = useFetch(() => getJuboSettings(), [church.id], null);

  const [juboId, setJuboId] = useState(null);
  const [issueNo, setIssueNo] = useState("");
  const [juboDate, setJuboDate] = useState("");
  const [version, setVersion] = useState("v1");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(false);
  const [published, setPublished] = useState(false);

  const sectionRefs = useRef({});
  const statusCallbacks = useRef({});
  const [statusMap, setStatusMap] = useState({});

  // onStatusChange는 자식의 effect 의존성 배열에 들어가므로, 렌더마다 새 함수를 주면
  // (상태가 실제로는 안 바뀌어도) 매 렌더 effect가 재실행 → setStatusMap → 재렌더로
  // 이어지는 무한 루프가 생긴다. 키별로 한 번만 만들어 재사용한다.
  function getStatusCallback(key) {
    if (!statusCallbacks.current[key]) {
      statusCallbacks.current[key] = (status) =>
        setStatusMap((prev) => ({ ...prev, [key]: status }));
    }
    return statusCallbacks.current[key];
  }

  useEffect(() => {
    if (draft && juboId === null) {
      setJuboId(draft.id);
      setIssueNo(draft.issueNo);
      setJuboDate(draft.juboDate);
      setVersion(draft.juboTemplateVersion ?? "");
    }
  }, [draft, juboId]);

  useEffect(() => {
    if (defaultVersion) setVersion(defaultVersion);
  }, [defaultVersion]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!issueNo.trim() || !juboDate) return;
    setCreating(true);
    setCreateError(false);
    try {
      const created = await createJuboIssue(church.id, {
        issueNo: issueNo.trim(),
        juboDate,
        juboTemplateVersion: version || undefined,
      });
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
        {infoLoading ? (
          <div className="mt-2">
            <BubbleLoader size="sm" />
          </div>
        ) : (
          <p className="mt-1 text-body-4 text-grey-9">
            {currentInfo ? `${currentInfo.issueNo} · ${currentInfo.date}` : "발행된 주보가 없습니다."}
          </p>
        )}
      </div>

      {draftLoading ? (
        <div className="flex justify-center py-10">
          <BubbleLoader size="sm" />
        </div>
      ) : !juboId ? (
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
            <div>
              <label className="block text-caption text-grey-6 mb-1" htmlFor="jubo-version">
                템플릿 버전
              </label>
              <select
                id="jubo-version"
                className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              >
                <option value="v1">4페이지 (v1)</option>
                <option value="v2">8페이지 (v2)</option>
              </select>
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
            <SectionCard
              title="표지"
              status={statusMap.cover}
              onSave={() => sectionRefs.current.cover?.save()}
            >
              <CoverSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.cover = el;
                }}
                onStatusChange={getStatusCallback("cover")}
              />
            </SectionCard>
            <SectionCard
              title="예배"
              status={statusMap.worship}
              onSave={() => sectionRefs.current.worship?.save()}
            >
              <WorshipSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.worship = el;
                }}
                onStatusChange={getStatusCallback("worship")}
              />
            </SectionCard>
            <SectionCard
              title="소식"
              status={statusMap.news}
              onSave={() => sectionRefs.current.news?.save()}
            >
              <NewsSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.news = el;
                }}
                onStatusChange={getStatusCallback("news")}
              />
            </SectionCard>
            <SectionCard
              title="봉사"
              status={statusMap.volunteer}
              onSave={() => sectionRefs.current.volunteer?.save()}
            >
              <VolunteerSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.volunteer = el;
                }}
                onStatusChange={getStatusCallback("volunteer")}
              />
            </SectionCard>
            <SectionCard
              title="예물"
              status={statusMap.offering}
              onSave={() => sectionRefs.current.offering?.save()}
            >
              <OfferingSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.offering = el;
                }}
                onStatusChange={getStatusCallback("offering")}
              />
            </SectionCard>
            <SectionCard
              title="후원"
              status={statusMap.support}
              onSave={() => sectionRefs.current.support?.save()}
            >
              <SupportSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.support = el;
                }}
                onStatusChange={getStatusCallback("support")}
              />
            </SectionCard>
            <SectionCard
              title="구역"
              status={statusMap.district}
              onSave={() => sectionRefs.current.district?.save()}
            >
              <DistrictSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.district = el;
                }}
                onStatusChange={getStatusCallback("district")}
              />
            </SectionCard>
            <SectionCard
              title="섬기는 분들"
              status={statusMap.ministers}
              onSave={() => sectionRefs.current.ministers?.save()}
            >
              <MinistersSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.ministers = el;
                }}
                onStatusChange={getStatusCallback("ministers")}
              />
            </SectionCard>
            <SectionCard
              title="말씀"
              status={statusMap.sermonNote}
              onSave={() => sectionRefs.current.sermonNote?.save()}
            >
              <SermonNoteSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.sermonNote = el;
                }}
                onStatusChange={getStatusCallback("sermonNote")}
              />
            </SectionCard>
            <SectionCard
              title="기도제목"
              status={statusMap.prayerTopics}
              onSave={() => sectionRefs.current.prayerTopics?.save()}
            >
              <PrayerTopicsSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.prayerTopics = el;
                }}
                onStatusChange={getStatusCallback("prayerTopics")}
              />
            </SectionCard>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              className="px-16 py-4 rounded-xl bg-primary text-white text-body-2 font-bold disabled:opacity-50 transition-colors"
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
