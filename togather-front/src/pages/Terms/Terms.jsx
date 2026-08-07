const SECTIONS = [
  {
    title: "제1조 (목적)",
    content: `본 약관은 교회 웹사이트(이하 "사이트")가 제공하는 모든 서비스의 이용 조건 및 절차, 이용자와 교회 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: "제2조 (약관의 효력 및 변경)",
    content: `① 본 약관은 사이트에 게시함으로써 효력이 발생합니다.
② 교회는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 사전 고지 후 적용됩니다.
③ 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.`,
  },
  {
    title: "제3조 (회원 가입)",
    content: `① 이용자는 교회가 정한 가입 양식에 따라 정보를 기입하고 약관에 동의함으로써 회원 가입을 신청합니다.
② 교회는 다음 각 호에 해당하는 경우 가입 신청을 거부하거나 추후 이용 계약을 해지할 수 있습니다.

• 허위 정보를 기재한 경우
• 타인의 정보를 도용한 경우
• 기타 교회가 정한 이용 기준에 위반되는 경우`,
  },
  {
    title: "제4조 (서비스 이용)",
    content: `① 서비스는 연중무휴, 24시간 제공함을 원칙으로 합니다.
② 시스템 점검, 장비 교체, 천재지변 등 불가피한 사유로 서비스가 일시 중단될 수 있습니다.
③ 이용자는 서비스 이용 시 관련 법령 및 본 약관을 준수해야 합니다.`,
  },
  {
    title: "제5조 (이용자 의무)",
    content: `이용자는 다음 행위를 해서는 안 됩니다.

• 타인의 정보를 무단으로 수집·이용하는 행위
• 교회 또는 타인의 명예를 훼손하거나 불이익을 주는 행위
• 서비스 운영을 방해하는 행위
• 불법 정보를 게시하거나 유포하는 행위
• 기타 관련 법령에 위반되는 행위`,
  },
  {
    title: "제6조 (저작권)",
    content: `① 사이트에 게시된 콘텐츠(설교, 이미지, 문서 등)의 저작권은 교회에 귀속됩니다.
② 이용자는 교회의 사전 동의 없이 콘텐츠를 복제·배포·방송하거나 상업적으로 이용할 수 없습니다.`,
  },
  {
    title: "제7조 (책임 제한)",
    content: `교회는 천재지변, 불가항력 또는 이용자의 귀책 사유로 인한 서비스 중단 및 손해에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제8조 (분쟁 해결)",
    content: `서비스 이용과 관련하여 발생한 분쟁은 상호 협의를 통해 해결하며, 협의가 이루어지지 않을 경우 관련 법령에 따릅니다.

시행일: 2026년 1월 1일`,
  },
];

export default function Terms() {
  return (
    <div>
      <div className="relative h-[160px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">이용 약관</h1>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-8 py-16">
        <p className="text-body-2 text-grey-7 mb-12 leading-relaxed">
          본 약관은 교회 웹사이트에서 제공하는 서비스 이용과 관련하여 교회와 이용자 간의 권리·의무
          및 책임 사항, 기타 필요한 사항을 규정합니다.
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
