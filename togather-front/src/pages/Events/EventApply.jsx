import { useState } from "react";
import { useParams, Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { useFetch } from "@/hooks/useFetch";
import { getEventById, registerForEvent } from "@/services/eventsService";
import { getDepartmentStyle } from "@/config/events.config";
import { formatKoreanDate, formatTimeRange } from "@/utils/date";
import { getRegistrationState, getRegistrationMessage, REG_STATUS } from "@/utils/eventStatus";

const inputCls =
  "w-full px-4 py-3 border border-bluegrey-2 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

function InfoCard({ children }) {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-grey-1 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-bluegrey-2 p-10 text-center">
        {children}
      </div>
    </div>
  );
}

export default function EventApply() {
  const { id } = useParams();
  const { church } = useChurch();
  const { currentUser } = useAuth();
  const { data: event, loading } = useFetch(
    () => getEventById(church.id, id),
    [church.id, id],
    null,
  );

  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: "",
    attendeeCount: 1,
    note: "",
    agreePrivacy: false,
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await registerForEvent(church.id, event.id, form);
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-body-3 text-grey-5">
        불러오는 중...
      </div>
    );
  }

  if (!event) {
    return (
      <InfoCard>
        <p className="text-body-2 text-grey-8 font-semibold mb-6">행사를 찾을 수 없습니다.</p>
        <Link
          to="/교회행사"
          className="inline-block w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
        >
          행사 캘린더로 돌아가기
        </Link>
      </InfoCard>
    );
  }

  if (!currentUser) {
    return (
      <InfoCard>
        <div className="w-14 h-14 rounded-full bg-blue-1 flex items-center justify-center mx-auto mb-5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B5280"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-sub-tit-4 font-bold text-grey-12 mb-2">로그인이 필요한 서비스입니다</p>
        <p className="text-body-4 text-grey-6 mb-6">행사 신청은 로그인 후 이용하실 수 있습니다.</p>
        <div className="flex gap-2">
          <Link
            to={`/교회행사/${id}`}
            className="flex-1 py-2.5 rounded-full border border-bluegrey-2 text-body-4 font-semibold text-grey-9 hover:border-blue-5 hover:text-primary transition-colors"
          >
            돌아가기
          </Link>
          <Link
            to="/login"
            className="flex-1 py-2.5 rounded-full bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </InfoCard>
    );
  }

  const regState = getRegistrationState(event);

  if (status === "done") {
    return (
      <InfoCard>
        <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B5280"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-3">신청이 완료되었습니다</h2>
        <p className="text-body-3 text-grey-7 leading-relaxed mb-8">
          {event.title} 신청이 접수되었습니다.
          <br />
          확정 여부는 담당 부서에서 개별 안내드립니다.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to={`/교회행사/${event.id}`}
            className="w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
          >
            행사 상세 보기
          </Link>
          <Link
            to="/교회행사"
            className="w-full py-3 text-grey-7 text-btn-normal font-semibold hover:text-grey-9 transition-colors"
          >
            행사 캘린더로
          </Link>
        </div>
      </InfoCard>
    );
  }

  if (regState.status !== REG_STATUS.OPEN) {
    return (
      <InfoCard>
        <p className="text-body-2 text-grey-8 font-semibold mb-2">{event.title}</p>
        <p className="text-body-3 text-grey-6 mb-6">{getRegistrationMessage(regState)}</p>
        <Link
          to={`/교회행사/${event.id}`}
          className="inline-block w-full py-3 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 transition-colors"
        >
          행사 상세로 돌아가기
        </Link>
      </InfoCard>
    );
  }

  const ds = getDepartmentStyle(event.department);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <h1 className="text-sub-tit-1 font-bold text-grey-11 mb-6">행사 신청</h1>

      {/* 행사 요약 */}
      <div className="border border-bluegrey-2 rounded-2xl p-6 mb-8">
        <span
          className={`inline-flex w-fit px-2 py-0.5 rounded-full text-body-5 font-semibold mb-2 ${ds.chip}`}
        >
          {event.department}
        </span>
        <p className="text-sub-tit-4 font-bold text-grey-11 mb-2">{event.title}</p>
        <p className="text-body-4 text-grey-7">
          {formatKoreanDate(event.date)} {formatTimeRange(event.startTime, event.endTime)}
        </p>
        <p className="text-body-4 text-grey-7">{event.location}</p>
        {regState.closesAt && (
          <p className="text-body-5 text-grey-5 mt-3">신청 마감 {regState.closesAt}</p>
        )}
        {regState.remaining != null && (
          <p className="text-body-5 text-grey-5">잔여 {regState.remaining}명</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
            이름 <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="홍길동"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
            연락처 <span className="text-red-400">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
            참석 인원 <span className="text-red-400">*</span>
          </label>
          <input
            name="attendeeCount"
            type="number"
            min={1}
            max={regState.remaining ?? undefined}
            required
            value={form.attendeeCount}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">비고</label>
          <textarea
            name="note"
            rows={4}
            value={form.note}
            onChange={handleChange}
            placeholder="전달할 내용이 있다면 입력해 주세요."
            className={inputCls}
          />
        </div>

        <div className="flex items-start gap-3 py-1">
          <input
            id="agreePrivacy"
            name="agreePrivacy"
            type="checkbox"
            required
            checked={form.agreePrivacy}
            onChange={handleChange}
            className="w-4 h-4 mt-0.5 accent-blue-7 shrink-0"
          />
          <label
            htmlFor="agreePrivacy"
            className="text-body-4 text-grey-7 cursor-pointer select-none leading-relaxed"
          >
            <span className="text-red-400">*</span> 개인정보 수집·이용에 동의합니다. 수집된 정보는
            행사 신청 및 안내 목적으로만 사용됩니다.
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "submitting" || !form.agreePrivacy}
          className="w-full py-3.5 mt-1 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
        >
          {status === "submitting" ? "신청 중..." : "신청하기"}
        </button>
      </form>
    </div>
  );
}
