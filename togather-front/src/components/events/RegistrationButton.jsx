import { useNavigate } from "react-router";
import {
  getRegistrationState,
  getRegistrationMessage,
  REG_BTN_TONE,
  REG_STATUS,
} from "@/utils/eventStatus";

/**
 * 행사 신청 3-state 버튼. canRegister:false인 행사는 아무것도 렌더링하지 않는다.
 * @param {{
 *   event: import('@/services/eventsService').Event,
 *   size?: "sm"|"lg",       // sm: 캘린더 사이드바(flex-1 pill) / lg: 상세페이지·sticky bar
 *   className?: string,
 *   showRemaining?: boolean, // lg 전용 — 버튼 아래 잔여인원/안내 캡션 노출
 *   onApply?: () => void,    // 미지정 시 /교회행사/:id/신청 으로 이동
 * }} props
 */
export default function RegistrationButton({
  event,
  size = "lg",
  className = "",
  showRemaining = false,
  onApply,
}) {
  const navigate = useNavigate();
  const state = getRegistrationState(event);

  if (!event || state.status === REG_STATUS.NONE) return null;

  const handleClick = () => {
    if (state.disabled) return;
    if (onApply) onApply();
    else void navigate(`/교회행사/${event.id}/신청`);
  };

  if (size === "sm") {
    return (
      <button
        type="button"
        disabled={state.disabled}
        onClick={handleClick}
        className={`flex-1 py-2.5 rounded-full text-body-5 font-semibold border transition-colors ${REG_BTN_TONE[state.status]} ${className}`}
      >
        {state.label}
      </button>
    );
  }

  const message = getRegistrationMessage(state);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={state.disabled}
        onClick={handleClick}
        className={`px-16 py-3 rounded-full text-btn-normal font-semibold transition-colors ${REG_BTN_TONE[state.status]} ${className}`}
      >
        {state.label}
      </button>
      {showRemaining && message && <span className="text-body-5 text-grey-6">{message}</span>}
    </div>
  );
}
