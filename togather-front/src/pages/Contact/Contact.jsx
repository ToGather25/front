import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { submitContact } from "@/services/contactService";
import { getErrorMessage } from "@/utils/apiErrors";
import IcoPhone from "@/assets/icon-svg/main-phone.svg";

export default function Contact() {
  const { church } = useChurch();
  const [form, setForm] = useState({ name: "", phone: "", email: "", category: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = ["예배 및 행사", "교회 등록", "차량 운행", "시설 대여", "기타 문의"];

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await submitContact(church.id, form);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">문의하기</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-14">
        <div className="grid gap-12 grid-cols-1 md:grid-cols-[1fr_400px]">
          {/* 문의 양식 */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-6 py-24 col-span-2">
              <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sub-tit-3 font-bold text-grey-11">문의가 접수되었습니다.</p>
              <p className="text-body-3 text-grey-7 text-center">
                빠른 시일 내에 답변 드리겠습니다.
                <br />
                연락처 이메일 또는 전화로 회신드릴 예정입니다.
              </p>
              <button
                onClick={() => {
                  setForm({ name: "", phone: "", email: "", category: "", message: "" });
                  setSubmitted(false);
                }}
                className="mt-2 px-8 py-3 rounded-full bg-primary text-white font-semibold text-body-3 hover:bg-blue-8 transition-colors"
              >
                추가 문의하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-name" className="text-body-4 font-semibold text-grey-9">
                    이름 <span className="text-blue-7">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="홍길동"
                    className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 placeholder:text-grey-5 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-phone" className="text-body-4 font-semibold text-grey-9">
                    연락처 <span className="text-blue-7">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="010-0000-0000"
                    className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 placeholder:text-grey-5 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-body-4 font-semibold text-grey-9">
                  이메일
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 placeholder:text-grey-5 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-category" className="text-body-4 font-semibold text-grey-9">
                  문의 유형 <span className="text-blue-7">*</span>
                </label>
                <select
                  id="contact-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors bg-white"
                >
                  <option value="">선택해 주세요</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="text-body-4 font-semibold text-grey-9">
                  문의 내용 <span className="text-blue-7">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={8}
                  placeholder="문의하실 내용을 입력해 주세요."
                  className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 placeholder:text-grey-5 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors resize-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-body-4 text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 py-4 rounded-xl bg-primary text-white font-bold text-body-2 hover:bg-blue-8 active:scale-[0.99] transition-all disabled:bg-blue-3 disabled:cursor-not-allowed"
              >
                {submitting ? "전송 중..." : "문의 보내기"}
              </button>
            </form>
          )}

          {/* 연락처 정보 */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-blue-1 p-8 flex flex-col gap-6">
              <h3 className="text-sub-tit-3 font-bold text-grey-11">직접 연락하기</h3>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center shrink-0">
                    <img src={IcoPhone} className="w-5 h-5" alt="" />
                  </div>
                  <div className="pt-1">
                    <p className="text-caption font-bold text-grey-7 uppercase tracking-[0.06em]">
                      전화
                    </p>
                    <p className="text-body-3 text-grey-9 mt-0.5">{church.tel}</p>
                    {church.fax && (
                      <p className="text-body-4 text-grey-6 mt-0.5">FAX {church.fax}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <rect x="4" y="4" width="16" height="14" rx="2" />
                      <path d="M4 8l8 5 8-5" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-caption font-bold text-grey-7 uppercase tracking-[0.06em]">
                      이메일
                    </p>
                    <p className="text-body-3 text-grey-9 mt-0.5">{church.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-caption font-bold text-grey-7 uppercase tracking-[0.06em]">
                      운영 시간
                    </p>
                    <p className="text-body-3 text-grey-9 mt-0.5">평일 오전 9시 ~ 오후 6시</p>
                    <p className="text-body-4 text-grey-6 mt-0.5">월요일·공휴일 휴무</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2c4 4 6 7 6 11a6 6 0 0 1-12 0c0-4 2-7 6-11z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-caption font-bold text-grey-7 uppercase tracking-[0.06em]">
                      주소
                    </p>
                    <p className="text-body-3 text-grey-9 mt-0.5">{church.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
