import { Avatar, RoleChip } from "./shared";

function Card({ title, children }) {
  return (
    <div className="bg-white border border-bluegrey-3 rounded-2xl p-6 md:p-7">
      <h4 className="text-body-2 font-bold text-grey-10 mb-5">{title}</h4>
      {children}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-caption text-grey-5 mb-1">{label}</div>
      <div className="text-body-3 text-grey-11">{value || "-"}</div>
    </div>
  );
}

/**
 * 교인 한 명의 상세 화면 — 라우트 페이지(GyojeokbuDetail)가 재사용한다.
 *
 * 교적부 명부 API(/church/members)는 개인정보 보호를 위해 이름/직분/구역/부서/소그룹만
 * 내려준다 — 연락처·주소·가족·심방 이력 등은 백엔드에 해당 데이터/엔드포인트가 아직 없어
 * 여기서 보여줄 수 없다(기획서 4-1 교인 프로필, 2-3 ERD 참고 — 확인 필요 항목).
 */
export default function GyojeokbuMemberDetail({ member: m, index, total, onBack, onPrev, onNext }) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-8 md:py-12">
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-4 font-semibold text-grey-8 hover:bg-bluegrey-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            aria-label="이전 교인"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 disabled:opacity-30 transition-colors"
          >
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            aria-label="다음 교인"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 disabled:opacity-30 transition-colors"
          >
            <svg className="w-4 h-4 -rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <span className="text-body-4 text-grey-5 font-mono mr-2">
          <b className="text-grey-10">{index + 1}</b> / {total}
        </span>

        <button
          onClick={() => window.print()}
          aria-label="인쇄"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-bluegrey-3 text-body-4 font-semibold text-grey-8 hover:border-blue-5 hover:text-blue-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          인쇄
        </button>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-8">
        {/* 왼쪽: 프로필 카드 */}
        <div className="bg-white border border-bluegrey-3 rounded-2xl p-8 flex flex-col items-center text-center h-fit">
          <Avatar name={m.name} size="xl" />
          <div className="mt-4 text-[22px] font-bold text-grey-12 tracking-[-0.5px]">{m.name}</div>
          <div className="mt-3">
            <RoleChip role={m.role} />
          </div>
        </div>

        {/* 오른쪽: 상세 정보 */}
        <div className="flex flex-col gap-6" key={m.id}>
          <Card title="소속 정보">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem label="직분" value={m.role} />
              <InfoItem label="구역" value={m.region} />
              <InfoItem label="부서" value={m.department} />
              <InfoItem label="소그룹" value={m.smallGroup} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
