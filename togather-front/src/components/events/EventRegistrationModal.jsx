import { useAuth } from "@/contexts/auth";

export default function EventRegistrationModal({ event, submitting, onConfirm, onCancel }) {
  const { currentUser } = useAuth();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={submitting ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[380px] px-8 py-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <p className="text-sub-tit-4 font-bold text-grey-12 mb-2">행사 신청</p>
          <p className="text-body-4 text-grey-6">{event.title}</p>
        </div>

        <dl className="flex flex-col gap-3 bg-grey-1 rounded-xl p-5 text-body-4">
          <div className="flex gap-3">
            <dt className="text-grey-5 font-medium w-14 shrink-0">이름</dt>
            <dd className="text-grey-9 font-medium">{currentUser?.name ?? "-"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-grey-5 font-medium w-14 shrink-0">이메일</dt>
            <dd className="text-grey-9 font-medium">{currentUser?.email ?? "-"}</dd>
          </div>
        </dl>

        <p className="text-body-3 text-grey-9 text-center">위 정보로 신청하시겠습니까?</p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-3 rounded-full border border-bluegrey-3 text-body-4 font-semibold text-grey-9 hover:border-blue-5 hover:text-primary transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors disabled:opacity-60"
          >
            {submitting ? "신청 중..." : "신청하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
