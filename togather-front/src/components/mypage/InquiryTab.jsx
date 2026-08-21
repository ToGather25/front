import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { addMyInquiry } from "@/services/myPageService";
import { formatDotDate } from "@/utils/date";
import MailIcon from "@/assets/icon-svg/mypage-mail.svg";
import { MOCK_USER } from "./mockData";
import { StatusBadge, Pagination, InputField, ReadonlyField, IconBack } from "./shared";

const PAGE_SIZE = 5;

function IconMail() {
  return <img src={MailIcon} className="w-[13px] h-[13px]" alt="" />;
}

export default function InquiryTab({ inquiries, setInquiries, loadError, onRetry }) {
  const { church } = useChurch();
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryWriteMode, setInquiryWriteMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  async function handleAddInquiry() {
    if (!inquiryForm.title) return;
    setSubmitting(true);
    setAddError("");
    try {
      const created = await addMyInquiry(church.id, inquiryForm);
      setInquiries((prev) => [created, ...prev]);
      setInquiryForm({ title: "", content: "" });
      setInquiryWriteMode(false);
      setInquiryPage(1);
    } catch {
      setAddError("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  const pagedInquiries = inquiries.slice((inquiryPage - 1) * PAGE_SIZE, inquiryPage * PAGE_SIZE);

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col">
      {!inquiryWriteMode ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sub-tit-4 font-bold text-grey-11">문의</h2>
            <button
              onClick={() => {
                setInquiryWriteMode(true);
                setInquiryForm({ title: "", content: "" });
                setAddError("");
              }}
              className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
            >
              문의하기
            </button>
          </div>

          {loadError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <p className="text-body-4 text-grey-7">문의 내역을 불러오지 못했습니다. 다시 시도해 주세요.</p>
              <button
                onClick={onRetry}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {pagedInquiries.map((item) => (
                  <div key={item.id} className="border border-grey-3 rounded-xl p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-body-5 text-grey-6">
                          {formatDotDate(item.createdAt?.slice(0, 10))}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                    {item.answer && (
                      <div className="mt-3 pl-4 border-l-2 border-grey-3 flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">
                          <IconMail />
                        </span>
                        <p className="text-body-5 text-grey-6">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Pagination
                total={inquiries.length}
                perPage={PAGE_SIZE}
                current={inquiryPage}
                onChange={setInquiryPage}
              />
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setInquiryWriteMode(false)}
              className="text-grey-6 hover:text-grey-9 transition-colors"
            >
              <IconBack />
            </button>
            <h2 className="text-sub-tit-4 font-bold text-grey-11">문의하기</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadonlyField label="이름" value={MOCK_USER.name} />
              <ReadonlyField label="연락처" value={MOCK_USER.phone} />
            </div>
            <InputField
              label="제목"
              value={inquiryForm.title}
              onChange={(e) => setInquiryForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="문의 제목을 입력해 주세요."
            />
            <div>
              <label className="block text-body-5 text-grey-7 mb-1">문의 내용</label>
              <textarea
                value={inquiryForm.content}
                onChange={(e) => setInquiryForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="자세히 내용을 작성하여 주시면 더 도움이 됩니다."
                rows={5}
                className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          {addError && <p className="text-body-5 text-red-500 mt-3">{addError}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setInquiryWriteMode(false)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddInquiry}
              disabled={submitting}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "접수 중..." : "접수"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
