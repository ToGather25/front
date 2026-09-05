const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    content: `교회는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집합니다.

• 필수 항목: 이름, 이메일 주소, 비밀번호
• 선택 항목: 연락처, 생년월일, 주소, 세례 여부, 소속 구역
• 서비스 이용 과정에서 자동 생성: 접속 로그, 쿠키, 서비스 이용 기록`,
  },
  {
    title: "2. 개인정보 수집 및 이용 목적",
    content: `수집한 개인정보는 다음 목적에 한하여 이용됩니다.

• 회원 식별 및 서비스 제공
• 교적 관리 및 구역 배정
• 공지사항·행사 안내 등 정보 제공
• 서비스 개선 및 신규 기능 개발`,
  },
  {
    title: "3. 개인정보 보유 및 이용 기간",
    content: `회원 탈퇴 시 또는 수집·이용 목적 달성 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.

• 전자상거래법: 거래 기록 5년
• 통신비밀보호법: 로그인 기록 3개월`,
  },
  {
    title: "4. 개인정보 제3자 제공",
    content: `교회는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령에 따른 요구가 있는 경우에 한하여 제공할 수 있습니다.`,
  },
  {
    title: "5. 개인정보 파기 절차 및 방법",
    content: `개인정보는 목적 달성 후 즉시 파기합니다.

• 전자 파일: 복구 불가한 방법으로 영구 삭제
• 서면 자료: 분쇄 또는 소각 처리`,
  },
  {
    title: "6. 이용자의 권리",
    content: `이용자는 언제든지 다음 권리를 행사할 수 있습니다.

• 개인정보 열람 요청
• 오류 정정 요청
• 삭제 요청
• 처리 정지 요청

요청은 교회 이메일 또는 문의하기 페이지를 통해 접수하시면 지체 없이 처리합니다.`,
  },
  {
    title: "7. 개인정보 보호 책임자",
    content: `개인정보 처리에 관한 문의 및 불만은 아래 담당자에게 연락해 주세요.

• 담당자: 담당 사역자
• 이메일: 교회 공식 이메일`,
  },
  {
    title: "8. 방침 변경 안내",
    content: `이 개인정보취급방침은 법령·정책 변경에 따라 수정될 수 있으며, 변경 시 웹사이트 공지사항을 통해 사전 고지합니다.

시행일: 2026년 1월 1일`,
  },
];

export default function Privacy() {
  return (
    <div>
      <div className="relative h-[160px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">개인정보취급방침</h1>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-8 py-16">
        <p className="text-body-2 text-grey-7 mb-12 leading-relaxed">
          본 교회는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」을 준수합니다. 본 방침을
          통해 수집하는 개인정보의 항목, 이용 목적, 보유 기간 등을 안내합니다.
        </p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-3">{title}</h2>
              <div className="border-t border-bluegrey-2 pt-4">
                <p className="text-body-3 text-grey-8 leading-[1.9] whitespace-pre-line">
                  {content}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
