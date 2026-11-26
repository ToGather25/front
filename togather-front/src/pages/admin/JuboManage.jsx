import { useState, useEffect, useRef } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import {
  getJuboInfo,
  createJuboIssue,
  publishJubo,
  getJuboDraft,
  getJuboSettings,
  saveJuboDraft,
} from "@/services/juboService";
import { saveJuboDraftLocal, clearJuboDraftLocal } from "@/utils/juboDraftStorage";
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
import ToastStack from "@/components/common/ToastStack";
import { useToasts } from "@/hooks/useToasts";

const AUTO_SAVE_INTERVAL_SEC = 5 * 60;

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <h2 className="text-sub-tit-3 font-bold text-grey-10 mb-5">{title}</h2>
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
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(false);
  const [published, setPublished] = useState(false);

  const [draftSaving, setDraftSaving] = useState(false);
  const [secondsUntilAutoSave, setSecondsUntilAutoSave] = useState(AUTO_SAVE_INTERVAL_SEC);

  const sectionRefs = useRef({});
  const { toasts, pushToast } = useToasts();

  useEffect(() => {
    if (draft && juboId === null) {
      setJuboId(draft.id);
      setIssueNo(draft.issueNo);
      setJuboDate(draft.juboDate);
      setVersion(draft.juboTemplateVersion ?? "");
      setCoverImageUrl(draft.coverImageUrl ?? null);
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
      setCoverImageUrl(created.coverImageUrl ?? null);
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
    clearJuboDraftLocal(juboId);
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
      clearJuboDraftLocal(juboId);
      setPublished(true);
      refetchInfo();
    } catch (err) {
      console.error("[JuboManage] 주보 발행 실패:", err);
      setPublishError(true);
    } finally {
      setPublishing(false);
    }
  }

  // 섹션별 "저장"과는 별개로, 전체 호를 한 번에 임시저장한다(자소서 사이트의 우측 하단
  // 고정 임시저장 버튼과 같은 패턴) — 각 섹션 에디터의 getDraft()로 지금 화면에 입력된
  // 값을 모아 트랜잭션 하나로 보내고, 네트워크 성공 여부와 무관하게 로컬에도 백업한다.
  async function handleSaveDraft() {
    setDraftSaving(true);
    const sections = Object.values(sectionRefs.current).reduce(
      (acc, sectionRef) => (sectionRef?.getDraft ? { ...acc, ...sectionRef.getDraft() } : acc),
      {},
    );
    const payload = {
      issueNo,
      juboDate,
      coverImageUrl,
      juboTemplateVersion: version || undefined,
      sections,
    };
    saveJuboDraftLocal(juboId, payload);
    try {
      await saveJuboDraft(church.id, juboId, payload);
      pushToast("임시저장 완료");
    } catch (err) {
      console.error("[JuboManage] 임시저장 실패:", err);
      pushToast("임시저장 실패 — 이 기기에는 백업해 두었습니다", "error");
    } finally {
      setDraftSaving(false);
      setSecondsUntilAutoSave(AUTO_SAVE_INTERVAL_SEC);
    }
  }

  // 5분마다 임시저장 버튼을 자동으로 누른 것처럼 동작한다 — ref에 최신 handleSaveDraft를
  // 담아두고 그걸 호출해서, setInterval을 매 렌더 다시 걸지 않아도 항상 최신 입력값으로 저장된다.
  // 1초 틱으로 카운트다운하다가 0에 도달하면 저장하고 다시 5분으로 리셋한다(= 다음 자동저장까지 표시).
  const handleSaveDraftRef = useRef(handleSaveDraft);
  useEffect(() => {
    handleSaveDraftRef.current = handleSaveDraft;
  });

  useEffect(() => {
    if (!juboId) return;
    const tick = setInterval(() => {
      setSecondsUntilAutoSave((prev) => {
        if (prev <= 1) {
          handleSaveDraftRef.current();
          return AUTO_SAVE_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [juboId]);

  const autoSaveLabel = `${String(Math.floor(secondsUntilAutoSave / 60)).padStart(2, "0")}:${String(
    secondsUntilAutoSave % 60,
  ).padStart(2, "0")}`;

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
          <div className="grid gap-5 pb-5">
            <SectionCard title="표지">
              <CoverSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.cover = el;
                }}
              />
            </SectionCard>
            <SectionCard title="예배">
              <WorshipSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.worship = el;
                }}
              />
            </SectionCard>
            <SectionCard title="소식">
              <NewsSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.news = el;
                }}
              />
            </SectionCard>
            <SectionCard title="봉사">
              <VolunteerSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.volunteer = el;
                }}
              />
            </SectionCard>
            <SectionCard title="예물">
              <OfferingSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.offering = el;
                }}
              />
            </SectionCard>
            <SectionCard title="후원">
              <SupportSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.support = el;
                }}
              />
            </SectionCard>
            <SectionCard title="구역">
              <DistrictSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.district = el;
                }}
              />
            </SectionCard>
            <SectionCard title="섬기는 분들">
              <MinistersSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.ministers = el;
                }}
              />
            </SectionCard>
            <SectionCard title="말씀">
              <SermonNoteSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.sermonNote = el;
                }}
              />
            </SectionCard>
            <SectionCard title="기도제목">
              <PrayerTopicsSectionEditor
                churchId={church.id}
                juboId={juboId}
                ref={(el) => {
                  sectionRefs.current.prayerTopics = el;
                }}
              />
            </SectionCard>
          </div>

          <div className="sticky bottom-0 z-10 -mx-8 -mb-8 border-t border-grey-2 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-end gap-3 px-8 py-3">
              {publishError && (
                <span className="mr-auto text-caption text-red-500">
                  발행에 실패했습니다. 다시 시도해 주세요.
                </span>
              )}
              <button
                onClick={handleCancelDraft}
                className="px-5 py-2.5 rounded-xl border border-grey-3 text-grey-7 text-body-4 font-semibold hover:border-grey-5 transition-colors"
                type="button"
              >
                취소
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-grey-3 px-4 py-2.5">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={draftSaving}
                  className="text-body-4 font-semibold text-grey-9 disabled:opacity-60 transition-colors"
                >
                  {draftSaving ? "저장 중..." : "임시저장"}
                </button>
                <span className="text-grey-3">|</span>
                <span className="text-body-4 text-grey-5 tabular-nums">{autoSaveLabel}</span>
              </div>
              <button
                onClick={handlePublish}
                disabled={publishing || published}
                className="px-8 py-2.5 rounded-xl bg-primary text-white text-body-4 font-bold disabled:opacity-50 transition-colors"
              >
                {published ? "완료됨" : publishing ? "처리 중..." : "완료"}
              </button>
            </div>
          </div>
        </>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
