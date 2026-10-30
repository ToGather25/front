import IcoPhone from "@/assets/icon-svg/footer-phone.svg";
import IcoEmail from "@/assets/icon-svg/footer-email.svg";
import { Avatar } from "./shared";

function Card({ title, children }) {
  return (
    <div className="bg-white border border-bluegrey-2 rounded-2xl p-6 md:p-7">
      <h4 className="text-body-2 font-bold text-grey-10 mb-5">{title}</h4>
      {children}
    </div>
  );
}

function InfoItem({ label, value, mono, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-caption text-grey-5 mb-1">{label}</div>
      <div className={`text-body-3 text-grey-11 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

/**
 * 교인 한 명의 상세 화면 — 라우트 페이지(GyojeokbuDetail)와 홈 화면 슬라이드 패널
 * (GyojeokbuTab) 양쪽에서 같은 화면을 그대로 재사용한다. 뒤로가기/이전·다음/가족
 * 링크 클릭은 전부 콜백으로 위임해, 호출부가 "URL 이동"이든 "같은 패널 안에서
 * 화면만 전환"이든 원하는 방식으로 연결할 수 있다.
 */
export default function GyojeokbuMemberDetail({
  member: m,
  allMembers,
  index,
  total,
  isAdmin,
  onBack,
  onPrev,
  onNext,
  onSelectMember,
}) {
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-bluegrey-2 text-body-4 font-semibold text-grey-8 hover:border-blue-5 hover:text-blue-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          인쇄
        </button>
        {isAdmin && (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M4 20h4l11-11-4-4L4 16zM14 6l4 4" />
            </svg>
            수정
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-8">
        {/* 왼쪽: 프로필 카드 */}
        <div className="bg-white border border-bluegrey-2 rounded-2xl p-8 flex flex-col items-center text-center h-fit">
          <Avatar name={m.name} tone={m.avatarTone} size="xl" />
          <div className="mt-4 text-[22px] font-bold text-grey-12 tracking-[-0.5px]">{m.name}</div>
          {m.nameRoman && <div className="text-body-4 text-grey-5 mt-0.5">{m.nameRoman}</div>}

          <div className="w-full flex flex-col gap-2 mt-6 pt-6 border-t border-bluegrey-2">
            <a
              href={`tel:${m.phone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-bluegrey-1 text-body-4 font-semibold text-grey-9 hover:bg-blue-1 hover:text-blue-8 transition-colors"
            >
              <img src={IcoPhone} alt="" className="w-4 h-4" />
              {m.phone}
            </a>
            {m.email && (
              <a
                href={`mailto:${m.email}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-bluegrey-1 text-body-4 font-semibold text-grey-9 hover:bg-blue-1 hover:text-blue-8 transition-colors"
              >
                <img src={IcoEmail} alt="" className="w-4 h-4" />
                {m.email}
              </a>
            )}
          </div>
        </div>

        {/* 오른쪽: 상세 정보 */}
        <div className="flex flex-col gap-6" key={m.id}>
          <Card title="기본 정보">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem label="성별" value={m.gender} />
              <InfoItem label="생년월일" value={`${m.birth} (만 ${m.age}세)`} mono />
              <InfoItem label="휴대폰" value={m.phone} mono />
              {m.email && <InfoItem label="이메일" value={m.email} mono />}
              <InfoItem label="주소" value={m.address} full />
            </div>
          </Card>

          <Card title="교회 정보">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem label="직분" value={m.role} />
              <InfoItem
                label="구역"
                value={`${m.region}${m.regionLeader && m.regionLeader !== "-" ? ` · ${m.regionLeader}` : ""}`}
              />
              <InfoItem label="소그룹" value={m.smallGroup} />
              <InfoItem label="부서" value={m.department} />
              <InfoItem label="세례일" value={m.baptism} mono />
              <InfoItem label="등록일" value={m.registered} mono />
            </div>
          </Card>

          <Card title="출석 현황">
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "최근 출석일",
                  val: m.lastAttend.split(" ")[0],
                  sub: m.lastAttend.split(" ")[1] || "",
                },
                { label: "2026년 누적", val: m.attendanceYTD, sub: "주일 출석" },
                { label: "소그룹 참여", val: "정상", sub: "최근 4주" },
              ].map((cell) => (
                <div key={cell.label} className="bg-bluegrey-1 rounded-xl p-4 text-center">
                  <div className="text-caption text-grey-6 mb-1">{cell.label}</div>
                  <div className="text-body-1 font-bold text-grey-12">{cell.val}</div>
                  <div className="text-caption text-grey-5 mt-0.5">{cell.sub}</div>
                </div>
              ))}
            </div>
          </Card>

          {m.family.length > 0 && (
            <Card title={`가족 (${m.family.length})`}>
              <div className="grid grid-cols-2 gap-3">
                {m.family.map((f, i) => {
                  const target = f.id ? allMembers.find((x) => x.id === f.id) : null;
                  return (
                    <button
                      key={i}
                      disabled={!target}
                      onClick={() => target && onSelectMember(target.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all text-left disabled:opacity-60 disabled:cursor-default"
                    >
                      <Avatar name={f.name} tone={target?.avatarTone ?? 8} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-grey-5 bg-bluegrey-1 px-1.5 py-0.5 rounded">
                            {f.rel}
                          </span>
                          <span className="text-body-3 font-semibold text-grey-11">{f.name}</span>
                        </div>
                        {(f.phone || target?.phone) && (
                          <div className="text-body-5 text-grey-6 mt-0.5 font-mono">
                            {f.phone || target?.phone}
                          </div>
                        )}
                      </div>
                      {target && (
                        <svg className="w-4 h-4 text-grey-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {m.history.length > 0 && (
            <Card title="이력">
              <div className="flex flex-col gap-3">
                {m.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-body-4 font-bold text-blue-6 font-mono min-w-[40px] pt-0.5">
                      {h.y}
                    </span>
                    <div className="flex-1 h-px bg-bluegrey-2 self-center mx-2" />
                    <span className="text-body-3 text-grey-9">{h.t}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {isAdmin && (
            <Card title="목회 메모">
              {m.notes ? (
                <p className="text-body-3 text-grey-9 leading-[1.6] bg-bluegrey-1 rounded-xl p-4 m-0">
                  {m.notes}
                </p>
              ) : (
                <p className="text-caption text-grey-5 m-0">저장된 메모가 없습니다.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
