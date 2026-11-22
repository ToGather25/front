import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { registerForEvent } from "@/services/eventsService";
import { getRegistrationState, getRegistrationMessage, REG_BTN_TONE, REG_STATUS } from "@/utils/eventStatus";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import EventRegistrationModal from "@/components/events/EventRegistrationModal";

const REGISTER_ERROR_MESSAGES = {
  EV002: "신청을 받지 않는 행사입니다.",
  EV004: "신청 기간이 아닙니다.",
  EV005: "신청 정원이 모두 찼습니다.",
};

/**
 * 행사 신청 버튼. canRegister:false인 행사는 아무것도 렌더링하지 않는다.
 * 신청 여부는 event.isRegistered(서버가 로그인한 사용자 기준으로 내려줌)로 판단하고,
 * 신청 성공 직후에는 낙관적으로 로컬 state만 갱신한다.
 * @param {{
 *   event: import('@/services/eventsService').Event,
 *   size?: "sm"|"lg",       // sm: 캘린더 사이드바(flex-1 pill) / lg: 상세페이지·sticky bar
 *   className?: string,
 *   onRegistered?: () => void, // 신청 성공·마감 후 호출 — 호출부가 행사 상세를 재조회해 최신 정원을 반영
 * }} props
 */
export default function RegistrationButton({ event, size = "lg", className = "", onRegistered }) {
  const { church } = useChurch();
  const { currentUser } = useAuth();
  const state = getRegistrationState(event);
  const [registered, setRegistered] = useState(() => !!event?.isRegistered);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!event || state.status === REG_STATUS.NONE) return null;

  const handleClick = () => {
    if (registered || submitting) return;
    if (state.disabled) {
      const message = getRegistrationMessage(state);
      if (message) setErrorMessage(message);
      return;
    }
    setErrorMessage("");
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
      onRegistered?.();
    } catch (err) {
      const code = err?.response?.data?.code;
      setErrorMessage(REGISTER_ERROR_MESSAGES[code] ?? "신청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setShowRegisterModal(false);
      // 정원 마감(EV005)·신청 기간 아님(EV004)·신청 불가(EV002)는 내가 들고 있는 event가
      // 이미 낡은 정보라는 뜻 — 최신 정원·상태를 다시 받아온다.
      if (code in REGISTER_ERROR_MESSAGES) onRegistered?.();
    } finally {
      setSubmitting(false);
    }
  };

  const label = registered ? "신청완료" : submitting ? "신청 중..." : state.label;
  const disabled = registered || submitting || state.disabled;
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

  const errorText = errorMessage && (
    <p className="text-caption text-red-500 text-center">{errorMessage}</p>
  );

  if (size === "sm") {
    return (
      <div className="flex-1 flex flex-col gap-1">
        {button}
        {errorText}
        {loginModal}
        {registerModal}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {button}
      {errorText}
      {loginModal}
      {registerModal}
    </div>
  );
}
