import { useParams, Link } from "react-router";
import { SAMPLE_EVENTS, DEFAULT_EVENT } from "@/config/events.config";

// "YYYY/MM/DD" 또는 "YYYY.MM.DD" 형식의 날짜가 오늘보다 이전인지 확인
function isEventEnded(dateStr) {
  if (!dateStr) return false;
  const normalized = dateStr.replace(/\./g, "/");
  const eventDate = new Date(normalized);
  return eventDate < new Date(new Date().toDateString()); // 자정 기준
}

export default function EventDetail() {
  const { id } = useParams();
  const event = SAMPLE_EVENTS[id] ?? { id, ...DEFAULT_EVENT };
  const ended = isEventEnded(event.date);

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-sub-tit-1 font-bold text-grey-11 mb-4">행사 안내</h1>
      <hr className="border-bluegrey-2 mb-6" />

      <div className="mb-2">
        <p className="text-sub-tit-4 font-bold text-grey-11">{event.title}</p>
        <p className="text-body-3 text-grey-7 mt-1">{event.location}</p>
      </div>
      <div className="flex justify-between items-center text-body-4 text-grey-7 mb-6">
        <span>{event.department}</span>
        <span>행사 날짜 : {event.date}</span>
      </div>
      <hr className="border-bluegrey-2 mb-6" />

      {/* Event Image */}
      <div className="w-full bg-grey-3 rounded-2xl h-80 flex items-center justify-center text-grey-5 mb-8">
        행사 이미지
      </div>

      {/* Description */}
      <p className="text-body-2 text-grey-8 whitespace-pre-line mb-10">
        {event.description}
      </p>

      {/* 신청 버튼 — canApply일 때 항상 표시, 종료 시 disabled */}
      {event.canApply && (
        <div className="flex flex-col items-center gap-2">
          <button
            disabled={ended}
            className={`px-16 py-3 rounded-full text-btn-normal font-semibold transition-colors ${
              ended
                ? "bg-grey-3 text-grey-5 cursor-not-allowed"
                : "bg-blue-8 text-white hover:bg-blue-9"
            }`}
          >
            {ended ? "신청 마감" : "신청하기"}
          </button>
          {ended && (
            <p className="text-body-5 text-grey-5">행사가 종료되어 신청이 마감되었습니다.</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <Link to="/교회행사" className="text-body-4 text-grey-6 hover:text-blue-7 transition-colors">
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
