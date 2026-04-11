import { useParams, Link } from "react-router";

const SAMPLE_EVENTS = {
  1: {
    id: 1,
    title: "전교인 체육대회",
    location: "장소명",
    department: "전교인",
    date: "2025/01/21",
    description:
      "전교인이 하나되는 행사입니다. 남녀노소 함께 보여 하나님안에서 하나되는 기쁨을 누리시길 바랍니다.\n참석을 희망하시는 분은...",
    canApply: true,
  },
};

export default function EventDetail() {
  const { id } = useParams();
  const event = SAMPLE_EVENTS[id] ?? {
    id,
    title: "행사 이름",
    location: "장소명",
    department: "부서 이름",
    date: "2025/01/01",
    description: "행사 내용을 입력하세요.",
    canApply: true,
  };

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
