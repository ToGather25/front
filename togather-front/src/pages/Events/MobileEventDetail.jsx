import { useNavigate } from "react-router";
import { getDepartmentStyle } from "@/config/events.config";
import { formatKoreanDate, formatTimeRange } from "@/utils/date";
import { getRegistrationState } from "@/utils/eventStatus";
import RegistrationButton from "@/components/events/RegistrationButton";
import DefaultBanner from "@/assets/default_banner.png";

function Icon({ d, size = 18, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="grid grid-cols-[22px_56px_1fr] gap-2.5 py-3 border-t border-bluegrey-1 first:border-t-0 text-body-5">
      <Icon d={icon} className="text-primary mt-0.5" />
      <dt className="text-grey-6">{label}</dt>
      <dd className="font-medium text-grey-11">{children}</dd>
    </div>
  );
}

export default function MobileEventDetail({ event, onRegistered }) {
  const navigate = useNavigate();

  if (!event) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-body-4 text-grey-6 mb-4">행사를 찾을 수 없습니다.</p>
        <button type="button" onClick={() => navigate("/교회행사")} className="text-body-5 text-primary font-semibold">
          캘린더로 돌아가기
        </button>
      </div>
    );
  }

  const ds = getDepartmentStyle(event.department);
  const regState = getRegistrationState(event);
  const showCta = regState.status !== "none";

  return (
    <div className="pb-24">
      <header className="h-14 grid grid-cols-[36px_1fr_36px] items-center px-2 border-b border-bluegrey-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center text-grey-9">
          <Icon d="M15 18l-6-6 6-6" size={22} strokeWidth={2} />
        </button>
        <h2 className="text-center text-body-3 font-bold text-grey-11">행사 상세</h2>
        <span />
      </header>

      <div className="px-5 pt-4 flex flex-col gap-2">
        <span className={`self-start px-2.5 py-1 rounded-md text-caption font-semibold ${ds.chip}`}>
          {event.department}
        </span>
        <h1 className="text-sub-tit-3 font-bold text-grey-11 leading-snug">{event.title}</h1>
      </div>

      <img
        src={event.imageUrl ?? DefaultBanner}
        onError={(e) => {
          e.currentTarget.src = DefaultBanner;
        }}
        alt=""
        className="w-full h-44 object-cover bg-grey-3 mt-3"
      />

      <dl className="mx-5 mt-4 border border-bluegrey-2 rounded-xl px-4">
        <InfoRow icon="M4 10h16M8.5 3.5v4M15.5 3.5v4M4 5.5h16v14a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5z" label="일시">
          {formatKoreanDate(event.date)}
          {event.startTime && <span className="block text-grey-7 font-normal">{formatTimeRange(event.startTime, event.endTime)}</span>}
        </InfoRow>
        {event.location && (
          <InfoRow icon="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" label="장소">
            {event.location}
          </InfoRow>
        )}
        {event.canRegister && typeof event.capacity === "number" && (
          <InfoRow icon="M17 20h5v-1.5a4 4 0 0 0-3-3.87M9 20H4v-1.5a4 4 0 0 1 3-3.87m5-1.13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" label="신청 현황">
            {event.registeredCount ?? 0} / {event.capacity}명
          </InfoRow>
        )}
      </dl>

      {event.description && (
        <div className="mx-5 mt-5">
          <h3 className="text-body-3 font-bold text-grey-11 mb-2">소개</h3>
          <p className="text-body-5 text-grey-7 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      )}

      {showCta && (
        <div
          className="fixed left-0 right-0 z-40 bg-white border-t border-bluegrey-3 px-5 py-3"
          style={{ bottom: "var(--bottom-nav-h)" }}
        >
          <RegistrationButton event={event} size="lg" className="w-full !px-0" onRegistered={onRegistered} />
        </div>
      )}
    </div>
  );
}
