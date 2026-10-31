import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { registerForEvent } from "@/services/eventsService";
import { getRegistrationState, getRegistrationMessage, REG_BTN_TONE, REG_STATUS } from "@/utils/eventStatus";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import EventRegistrationModal from "@/components/events/EventRegistrationModal";

/**
 * 행사 신청 버튼. canRegister:false인 행사는 아무것도 렌더링하지 않는다.
 * 신청 여부는 event.isRegistered(서버가 로그인한 사용자 기준으로 내려줌)로 판단하고,
 * 신청 성공 직후에는 낙관적으로 로컬 state만 갱신한다.
 * @param {{
 *   event: import('@/services/eventsService').Event,
 *   size?: "sm"|"lg",       // sm: 캘린더 사이드바(flex-1 pill) / lg: 상세페이지·sticky bar
 *   className?: string,
 * }} props
 */
export default function RegistrationButton({ event, size = "lg", className = "" }) {
  const { church } = useChurch();
  const { currentUser } = useAuth();
  const state = getRegistrationState(event);
  const [registered, setRegistered] = useState(() => !!event?.isRegistered);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  if (!event || state.status === REG_STATUS.NONE) return null;

  const handleClick = () => {
    if (registered || submitting) return;
    if (state.disabled) {
      const message = getRegistrationMessage(state);
      if (message) alert(message);
      return;
    }
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setShowRegisterModal(true);
  };

  const handleConfirmRegister = async () => {
    setSubmitting(true);
    try {
      await registerForEvent(church.id, event.id);
      setRegistered(true);
      setShowRegisterModal(false);
    } catch {
      alert("신청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = registered ? "신청완료" : submitting ? "신청 중..." : state.label;
  const disabled = registered || submitting;
  const tone = registered ? REG_BTN_TONE[REG_STATUS.CLOSED] : REG_BTN_TONE[state.status];

  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={
        size === "sm"
          ? `flex-1 py-2.5 rounded-full text-body-5 font-semibold border transition-colors ${tone} ${className}`
          : `px-16 py-3 rounded-full text-btn-normal font-semibold transition-colors ${tone} ${className}`
      }
    >
      {label}
    </button>
  );

  const loginModal = showLoginModal && (
    <LoginRequiredModal
      message="행사 신청은 로그인 후 이용하실 수 있습니다."
      onCancel={() => setShowLoginModal(false)}
    />
  );

  const registerModal = showRegisterModal && (
    <EventRegistrationModal
      event={event}
      submitting={submitting}
      onConfirm={handleConfirmRegister}
      onCancel={() => setShowRegisterModal(false)}
    />
  );

  if (size === "sm") {
    return (
      <div className="flex-1 flex flex-col gap-1">
        {button}
        {loginModal}
        {registerModal}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {button}
      {loginModal}
      {registerModal}
    </div>
  );
}
