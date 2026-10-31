import { useParams, Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getEventById } from "@/services/eventsService";
import { getDepartmentStyle } from "@/config/events.config";
import { formatKoreanDate, formatTimeRange } from "@/utils/date";
import { getRegistrationState } from "@/utils/eventStatus";
import RegistrationButton from "@/components/events/RegistrationButton";
import DefaultBanner from "@/assets/default_banner.png";
import ArrowLeft from "@/assets/icon-svg/arrow-narrow-left.svg";
import BubbleLoader from "@/components/common/BubbleLoader";

export default function EventDetail() {
  const { id } = useParams();
  const { church } = useChurch();
  const { data: event, loading } = useFetch(
    () => getEventById(church.id, id),
    [church.id, id],
    null,
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 md:px-8 flex justify-center">
        <BubbleLoader size="sm" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 md:px-8 text-center">
        <p className="text-body-2 text-grey-7 mb-4">행사를 찾을 수 없습니다.</p>
        <Link
          to="/교회행사"
          className="text-body-4 text-blue-7 hover:text-blue-8 transition-colors"
        >
          ← 행사 캘린더로 돌아가기
        </Link>
      </div>
    );
  }

  const ds = getDepartmentStyle(event.department);
  const regState = getRegistrationState(event);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-10">
      <Link
        to="/교회행사"
        className="flex items-center gap-3 w-fit text-bluegrey-8 hover:text-primary transition-colors text-body-4 mb-4 group"
      >
        <img src={ArrowLeft} alt="" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
        목록으로
      </Link>
      <hr className="border-bluegrey-3 mb-6" />

      <div className="flex items-start justify-between">
        <div>
          <span
            className={`inline-flex w-fit px-2 py-0.5 rounded-full text-body-5 font-semibold ${ds.chip}`}
          >
            {event.department}
          </span>
          <p className="text-sub-tit-4 font-bold text-grey-11 mt-2">{event.title}</p>
          <p className="text-body-3 text-grey-7 mt-1">{event.location}</p>
        </div>
        <div className="flex flex-col items-end text-right gap-1.5 text-body-4 text-grey-7 shrink-0">
          {event.canRegister && typeof event.capacity === "number" && (
            <span className="text-body-3 font-bold text-primary">
              신청 인원 : {event.registeredCount ?? 0} / {event.capacity}명
            </span>
          )}
          <span>날짜 : {formatKoreanDate(event.date)}</span>
          {event.startTime && (
            <span>시간 : {formatTimeRange(event.startTime, event.endTime)}</span>
          )}
        </div>
      </div>
      <hr className="border-bluegrey-3 mt-6 mb-6" />

      {/* Event Image */}
      <img
        src={event.imageUrl ?? DefaultBanner}
        onError={(e) => {
          e.currentTarget.src = DefaultBanner;
        }}
        alt={event.title}
        className="w-full h-56 md:h-80 object-cover rounded-2xl bg-grey-3 mb-8"
      />

      {/* Description */}
      <p className="text-body-2 text-grey-8 whitespace-pre-line mb-10">{event.description}</p>

      {/* 신청 버튼 — 데스크탑 인라인 */}
      <div className="hidden md:flex flex-col items-center gap-2">
        <RegistrationButton event={event} size="lg" />
      </div>

      {/* 신청 버튼 — 모바일 sticky bar (BottomNav 위, canRegister:false면 미노출) */}
      {regState.status !== "none" && (
        <div
          className="md:hidden fixed left-0 right-0 z-40 bg-white border-t border-bluegrey-3 px-4 py-3"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          <RegistrationButton event={event} size="lg" className="w-full !px-0" />
        </div>
      )}
    </div>
  );
}
