import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function Contact() {
  const { church } = useChurch();
  const [form, setForm] = useState({ name: "", phone: "", email: "", category: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const categories = ["예배 및 행사", "교회 등록", "차량 운행", "시설 대여", "기타 문의"];

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: API 연동
    setSubmitted(true);
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">문의하기</h1>
        </div>
      </div>

      <div className="max-w-[1576px] mx-auto px-8 py-14">
        <div className="grid gap-12" style={{ gridTemplateColumns: "1fr 400px" }}>

          {/* 문의 양식 */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-6 py-24 col-span-2">
              <div className="w-16 h-16 rounded-full bg-blue-1 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sub-tit-3 font-bold text-grey-11">문의가 접수되었습니다.</p>
              <p className="text-body-3 text-grey-7 text-center">
                빠른 시일 내에 답변 드리겠습니다.<br />
                연락처 이메일 또는 전화로 회신드릴 예정입니다.
              </p>
              <button
                onClick={() => { setForm({ name: "", phone: "", email: "", category: "", message: "" }); setSubmitted(false); }}
                className="mt-2 px-8 py-3 rounded-full bg-primary text-white font-semibold text-body-3 hover:bg-blue-8 transition-colors"
              >
                추가 문의하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-body-4 font-semibold text-grey-9">이름 <span className="text-blue-7">*</span></label>
                  <input
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
                  <label className="text-body-4 font-semibold text-grey-9">연락처 <span className="text-blue-7">*</span></label>
                  <input
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
                <label className="text-body-4 font-semibold text-grey-9">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 placeholder:text-grey-5 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-body-4 font-semibold text-grey-9">문의 유형 <span className="text-blue-7">*</span></label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors bg-white"
                >
                  <option value="">선택해 주세요</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-body-4 font-semibold text-grey-9">문의 내용 <span className="text-blue-7">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={8}
                  placeholder="문의하실 내용을 입력해 주세요."
                  className="px-4 py-3 rounded-xl border border-bluegrey-2 text-body-3 text-grey-10 placeholder:text-grey-5 focus:outline-none focus:border-blue-6 focus:ring-1 focus:ring-blue-6 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-4 rounded-xl bg-primary text-white font-bold text-body-2 hover:bg-blue-8 active:scale-[0.99] transition-all"
              >
                문의 보내기
              </button>
            </form>
          )}

          {/* 연락처 정보 */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-blue-1 p-8 flex flex-col gap-6">
              <h3 className="text-sub-tit-3 font-bold text-grey-11">직접 연락하기</h3>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4 6c0-1 1-2 2-2h2l2 5-2 2a12 12 0 0 0 5 5l2-2 5 2v2c0 1-1 2-2 2A18 18 0 0 1 4 6z" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-[13px] font-bold text-grey-7 uppercase tracking-[0.06em]">전화</p>
                    <p className="text-body-3 text-grey-9 mt-0.5">{church.tel}</p>
                    {church.fax && <p className="text-body-4 text-grey-6 mt-0.5">FAX {church.fax}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="4" y="4" width="16" height="14" rx="2" />
                      <path d="M4 8l8 5 8-5" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-[13px] font-bold text-grey-7 uppercase tracking-[0.06em]">이메일</p>
                    <p className="text-body-3 text-grey-9 mt-0.5">{church.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-[13px] font-bold text-grey-7 uppercase tracking-[0.06em]">운영 시간</p>
                    <p className="text-body-3 text-grey-9 mt-0.5">평일 오전 9시 ~ 오후 6시</p>
                    <p className="text-body-4 text-grey-6 mt-0.5">월요일·공휴일 휴무</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-bluegrey-2 flex items-center justify-center text-blue-6 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M12 2c4 4 6 7 6 11a6 6 0 0 1-12 0c0-4 2-7 6-11z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-[13px] font-bold text-grey-7 uppercase tracking-[0.06em]">주소</p>
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
