import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getChurchProfile, updateChurchProfile } from "@/services/churchProfileService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <dt className={labelCls}>{label}</dt>
      <dd className="text-body-3 text-grey-10">{value || "-"}</dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-7">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-6 pb-4 border-b border-grey-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const { church } = useChurch();
  const {
    data: initialProfile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useFetch(() => getChurchProfile(church.id), [church.id], null);
  // 프로필 upsert는 통째 교체다 — 편집하지 않는 필드(헌금 계좌 등)도 실어 보내야 지워지지 않는다.
  const [profile, setProfile] = useState({
    representativeImageUrl: "",
    slogan: "",
    instagramUrl: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        representativeImageUrl: initialProfile.representativeImageUrl ?? "",
        slogan: initialProfile.slogan ?? "",
        instagramUrl: initialProfile.instagramUrl ?? "",
      });
    }
  }, [initialProfile]);

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileSaveError(false);
    try {
      await updateChurchProfile(church.id, {
        ...initialProfile,
        representativeImageUrl: profile.representativeImageUrl || null,
        slogan: profile.slogan || null,
        instagramUrl: profile.instagramUrl || null,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      console.error("[Settings] 교회 프로필 저장 실패:", err);
      setProfileSaveError(true);
    } finally {
      setProfileSaving(false);
    }
  }

  // 교회 기본 정보·연락처·테마는 아직 저장 API가 없다(플랫폼 관리자 전용
  // PATCH /api/admin/churches/{id}/settings만 존재) — 현재 설정값을 읽기 전용으로 보여준다.
  const info = {
    name: church.name,
    denomination: church.denomination,
    pastor: church.pastor,
    address: church.address,
    tel: church.tel,
    fax: church.fax,
    email: church.email,
    youtube: church.social?.youtube,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">사이트 기본 설정</h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* 실API 연동 — 홈 배너 대표이미지/슬로건 + 푸터 인스타그램 링크 */}
        <Section title="홈 화면 메인 배너 · SNS">
          {profileLoading ? (
            <p className="text-body-4 text-grey-5">불러오는 중...</p>
          ) : profileError ? (
            <div className="flex items-center gap-2">
              <p className="text-body-4 text-grey-5">불러오지 못했습니다.</p>
              <button
                onClick={refetchProfile}
                className="text-body-5 text-primary underline"
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className={labelCls} htmlFor="profile-image-url">
                    대표 이미지 URL
                  </label>
                  <input
                    id="profile-image-url"
                    className={inputCls}
                    value={profile.representativeImageUrl}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, representativeImageUrl: e.target.value }))
                    }
                    placeholder="비워두면 기본 배너 이미지가 표시됩니다"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls} htmlFor="profile-slogan">
                    슬로건
                  </label>
                  <input
                    id="profile-slogan"
                    className={inputCls}
                    value={profile.slogan}
                    onChange={(e) => setProfile((p) => ({ ...p, slogan: e.target.value }))}
                    placeholder="아직 화면에는 표시되지 않습니다"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls} htmlFor="profile-instagram">
                    인스타그램 URL
                  </label>
                  <input
                    id="profile-instagram"
                    className={inputCls}
                    value={profile.instagramUrl}
                    onChange={(e) => setProfile((p) => ({ ...p, instagramUrl: e.target.value }))}
                    placeholder="https://www.instagram.com/... (비워두면 푸터에서 숨김)"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
                >
                  {profileSaving ? "저장 중..." : "저장"}
                </button>
                {profileSaved && <span className="text-body-5 text-blue-7">저장됨</span>}
                {profileSaveError && (
                  <span className="text-body-5 text-red-500">저장 실패, 다시 시도해 주세요.</span>
                )}
              </div>
            </>
          )}
        </Section>

        {/* 아래 항목은 조회 전용 — 저장 API(PATCH /api/admin/churches/{id}/settings)가
            플랫폼 관리자(SUPER_ADMIN) 전용이라 교회 관리자는 수정할 수 없다. */}
        <Section title="교회 기본 정보 (조회 전용)">
          <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
            <ReadOnlyField label="교회명" value={info.name} />
            <ReadOnlyField label="교단" value={info.denomination} />
            <ReadOnlyField label="담임 목사" value={info.pastor} />
            <ReadOnlyField label="주소" value={info.address} />
            <ReadOnlyField label="전화번호" value={info.tel} />
            <ReadOnlyField label="팩스" value={info.fax} />
            <ReadOnlyField label="이메일" value={info.email} />
            <ReadOnlyField label="유튜브 채널" value={info.youtube} />
          </dl>
          <p className="text-body-5 text-grey-5 mt-5">
            이 정보의 수정이 필요하면 ToGather 운영팀에 요청해 주세요.
          </p>
        </Section>
      </div>
    </div>
  );
}
