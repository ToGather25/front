import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import ChurchLogo from "@/components/common/ChurchLogo";
import Gyojeokbu from "@/pages/Gyojeokbu/Gyojeokbu";
import GyojeokbuMemberDetail from "@/pages/Gyojeokbu/GyojeokbuMemberDetail";
import MEMBERS from "@/config/members.config";

const SECTION_SELECTOR = "[data-home-section]";

/** 홈 화면 오른쪽 가장자리에 붙는 "교적부" 탭 — 클릭하면 교적부를 화면 왼쪽에서
 * 밀고 들어오는 슬라이드 패널로 띄운다(페이지 이동 없음). 탭 배경/테두리/그림자는
 * 데스크톱 홈 섹션(`[data-home-section][data-dot="dark"]`) 중 지금 탭 높이에
 * 걸쳐 있는 섹션이 어두운 배경인지에 따라 바뀐다 — SectionDots와 같은 판정 방식. */
export default function GyojeokbuTab() {
  const { currentUser } = useAuth();
  const { church } = useChurch();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkBehind, setIsDarkBehind] = useState(true);
  const [memberId, setMemberId] = useState(null);
  const tabRef = useRef(null);
  const memberIdx = MEMBERS.findIndex((m) => m.id === memberId);
  const member = MEMBERS[memberIdx];

  useEffect(() => {
    function update() {
      const tab = tabRef.current;
      if (!tab || window.innerWidth < 768) {
        setIsDarkBehind(false);
        return;
      }
      const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
      if (sections.length === 0) return;

      const tabCenterY = tab.getBoundingClientRect().top + tab.offsetHeight / 2 + window.scrollY;
      let current = sections[0];
      for (const section of sections) {
        if (section.offsetTop <= tabCenterY) current = section;
      }
      setIsDarkBehind(current.dataset.dot === "dark");
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 패널을 닫을 때는 상세 화면에 머물러 있던 상태도 같이 초기화해 다음에
  // 열었을 때 항상 목록부터 다시 보여준다.
  const close = () => {
    setIsOpen(false);
    setMemberId(null);
  };

  return (
    <>
      <button
        ref={tabRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="교적부 열기"
        className={`fixed bottom-90 right-0 z-40 w-10 h-25 rounded-l-lg flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 hover:opacity-90 ${
          isDarkBehind
            ? "bg-white text-primary border border-bluegrey-2 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
            : "bg-primary text-white border border-primary-darker shadow-[0_4px_16px_rgba(59,82,128,0.35)]"
        }`}
      >
        {"교적부".split("").map((ch, i) => (
          <span key={i} className="text-body-3 font-bold leading-none">
            {ch}
          </span>
        ))}
      </button>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-black/40" onClick={close} />
        <div
          className={`absolute inset-0 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="sticky top-0 bg-white border-b border-bluegrey-2 px-5 py-4 flex items-center justify-between z-10">
            <ChurchLogo className="h-8 w-auto object-contain" alt={`${church.name} 로고`} />
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="w-8 h-8 flex items-center justify-center rounded-full text-grey-7 hover:bg-bluegrey-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {member ? (
            <GyojeokbuMemberDetail
              member={member}
              allMembers={MEMBERS}
              index={memberIdx}
              total={MEMBERS.length}
              isAdmin={currentUser?.isAdmin}
              onBack={() => setMemberId(null)}
              onPrev={memberIdx > 0 ? () => setMemberId(MEMBERS[memberIdx - 1].id) : null}
              onNext={memberIdx < MEMBERS.length - 1 ? () => setMemberId(MEMBERS[memberIdx + 1].id) : null}
              onSelectMember={setMemberId}
            />
          ) : (
            <Gyojeokbu onOpenMember={setMemberId} />
          )}
        </div>
      </div>
    </>
  );
}
