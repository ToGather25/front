import { useParams, Link } from "react-router";
import { SAMPLE_EVENTS, DEFAULT_EVENT } from "@/config/events.config";

export default function EventDetail() {
  const { id } = useParams();
  const event = SAMPLE_EVENTS[id] ?? { id, ...DEFAULT_EVENT };

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
      <p className="text-body-2 text-grey-8 whitespace-pre-line mb-10 leading-relaxed">
        {event.description}
      </p>

      {/* CTA */}
      {event.canApply && (
        <div className="flex justify-center">
          <button className="px-16 py-3 bg-blue-8 text-white rounded-full text-btn-normal font-semibold hover:bg-blue-9 transition-colors">
            신청하기
          </button>
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
