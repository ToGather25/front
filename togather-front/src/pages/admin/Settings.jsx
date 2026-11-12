import { useChurch } from "@/contexts/ChurchContext";

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
        <p className="text-body-5 text-grey-5">
          홈 배너 이미지·인스타그램·헌금 계좌는{" "}
          <a href="/admin/main" className="text-primary underline">
            메인 페이지 관리
          </a>
          에서 수정합니다. 교회소개 내용(인사말·비전·섬기는 사람들 등)은{" "}
          <a href="/admin/church-intro" className="text-primary underline">
            교회소개 관리
          </a>
          에서 수정합니다.
        </p>

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
