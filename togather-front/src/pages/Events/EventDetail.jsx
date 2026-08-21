import { useParams, Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getEventById } from "@/services/eventsService";
import { getDepartmentStyle } from "@/config/events.config";
import { formatKoreanDate, formatTimeRange } from "@/utils/date";
import { getRegistrationState } from "@/utils/eventStatus";
import RegistrationButton from "@/components/events/RegistrationButton";
import DefaultBanner from "@/assets/default_banner.png";

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
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-10 text-body-3 text-grey-5">
        불러오는 중...
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
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-sub-tit-1 font-bold text-grey-11">행사 안내</h1>
        <Link
          to="/교회행사"
          className="pb-3 inline-block text-body-4 text-grey-6 hover:text-blue-7 transition-colors"
        >
          ← 목록으로
        </Link>
      </div>
      <hr className="border-bluegrey-2 mb-6" />

      <div className="mb-2">
        <p className="text-sub-tit-4 font-bold text-grey-11">{event.title}</p>
        <p className="text-body-3 text-grey-7 mt-1">{event.location}</p>
      </div>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-body-4 text-grey-7 mb-6">
        <span
          className={`inline-flex w-fit px-2 py-0.5 rounded-full text-body-5 font-semibold ${ds.chip}`}
        >
          {event.department}
        </span>
        <span>
          행사 날짜 : {formatKoreanDate(event.date)}
          {event.startTime ? ` · ${formatTimeRange(event.startTime, event.endTime)}` : ""}
        </span>
      </div>
      <hr className="border-bluegrey-2 mb-6" />

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
          className="md:hidden fixed left-0 right-0 z-40 bg-white border-t border-bluegrey-2 px-4 py-3"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          <RegistrationButton event={event} size="lg" className="w-full !px-0" />
        </div>
      )}
    </div>
  );
}
