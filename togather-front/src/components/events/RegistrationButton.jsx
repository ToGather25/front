import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { registerForEvent } from "@/services/eventsService";
import {
  getRegistrationState,
  getRegistrationMessage,
  isLocallyRegistered,
  markLocallyRegistered,
  REG_BTN_TONE,
  REG_STATUS,
} from "@/utils/eventStatus";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

/**
 * 행사 신청 버튼. canRegister:false인 행사는 아무것도 렌더링하지 않는다.
 * 클릭 시 신청 API를 직접 호출하고, 성공하면 이 브라우저에 로컬로 "신청완료"를 기록한다
 * (백엔드에 신청 여부 조회 API가 없어 다른 기기/브라우저에서는 초기화됨).
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
  const [registered, setRegistered] = useState(
    () => !!event && isLocallyRegistered(church.id, event.id, currentUser?.email),
  );
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(null);

  if (!event || state.status === REG_STATUS.NONE) return null;

  const handleClick = async () => {
    if (state.disabled || registered || submitting) return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!window.confirm(`${event.title} 행사에 신청하시겠습니까?`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await registerForEvent(church.id, event.id);
      markLocallyRegistered(church.id, event.id, currentUser.email);
      setRegistered(true);
    } catch {
      setError("신청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = registered ? "신청완료" : submitting ? "신청 중..." : state.label;
  const disabled = state.disabled || registered || submitting;
  const tone = registered ? REG_BTN_TONE[REG_STATUS.CLOSED] : REG_BTN_TONE[state.status];
  const message = registered ? "" : getRegistrationMessage(state);

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

  if (size === "sm") {
    return (
      <div className="flex-1 flex flex-col gap-1">
        {button}
        {error && <span className="text-body-5 text-red-500 text-center">{error}</span>}
        {loginModal}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {button}
      {error && <span className="text-body-5 text-red-500">{error}</span>}
      {!error && message && <span className="text-body-5 text-grey-6">{message}</span>}
      {loginModal}
    </div>
  );
}
