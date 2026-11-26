import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";

const inputCls =
  "w-full px-4 py-3 border border-bluegrey-3 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

const STEP_COUNT = 4;
const TODAY_ISO = new Date().toISOString().slice(0, 10);

const AGREEMENT_ITEMS = [
  { key: "age", required: true, label: "만14세 이상" },
  { key: "tos", required: true, label: "서비스 이용약관" },
  { key: "location", required: true, label: "위치기반 서비스 이용약관" },
  { key: "privacy", required: true, label: "개인정보 수집 및 이용" },
  { key: "marketing", required: false, label: "마케팅 및 광고 활용" },
];
const REQUIRED_AGREEMENT_KEYS = AGREEMENT_ITEMS.filter((i) => i.required).map((i) => i.key);

// iOS Safari는 키보드가 올라와도 fixed 요소를 layout viewport(키보드 포함 전체 높이)
// 기준으로 그대로 둬서, 하단 고정 버튼이 키보드에 가려지거나 떠버린다. visualViewport로
// 실제 보이는 영역을 추적해 키보드 높이만큼 버튼을 밀어올린다(Android는 보통 0).
function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      const offset = window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(Math.max(0, Math.round(offset)));
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}

function CheckIcon({ checked, className = "" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${checked ? "text-blue-7" : "text-grey-4"} ${className}`}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="이전"
      className="w-9 h-9 -ml-2 flex items-center justify-center text-grey-9"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export default function MobileRegister({ form, status, submitError, onChange, onSubmit }) {
  const navigate = useNavigate();
  // 하나 답하면 다음 화면으로 넘어가는 대신, 토스 회원가입처럼 질문이 아래로 쌓인다 —
  // revealedCount는 지금까지 화면에 쌓인 질문 개수다. 확인 버튼은 화면 하단에 고정되고,
  // 마지막 질문에서는 실제 제출 버튼으로 바뀐다.
  const [revealedCount, setRevealedCount] = useState(1);
  const latestBlockRef = useRef(null);
  const keyboardInset = useKeyboardInset();

  // 약관 5개 항목은 이 화면에서만 쓰는 상태다 — 백엔드는 지금 agreePrivacy 하나만 받으므로,
  // 필수 항목이 전부 체크됐을 때만 실제 제출에 쓰이는 agreePrivacy를 true로 동기화한다.
  // (선택) 마케팅 동의는 화면에만 남고 아직 서버로 전송되지는 않는다.
  const [agreements, setAgreements] = useState({
    age: false,
    tos: false,
    location: false,
    privacy: false,
    marketing: false,
  });
  const allRequiredAgreed = REQUIRED_AGREEMENT_KEYS.every((k) => agreements[k]);
  const allAgreed = allRequiredAgreed && agreements.marketing;

  useEffect(() => {
    onChange({ target: { name: "agreePrivacy", type: "checkbox", checked: allRequiredAgreed } });
  }, [allRequiredAgreed, onChange]);

  function toggleAgreement(key) {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleAllAgreements() {
    const next = !allAgreed;
    setAgreements({ age: next, tos: next, location: next, privacy: next, marketing: next });
  }

  useEffect(() => {
    latestBlockRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [revealedCount]);

  const canProceed = [
    form.name.trim() !== "",
    Boolean(form.birthYear && form.birthMonth && form.birthDay),
    form.phone.trim() !== "",
    form.agreePrivacy,
  ];

  const isLastStep = revealedCount === STEP_COUNT;

  const birthDateValue =
    form.birthYear && form.birthMonth && form.birthDay
      ? `${form.birthYear}-${String(form.birthMonth).padStart(2, "0")}-${String(form.birthDay).padStart(2, "0")}`
      : "";

  // 네이티브 <input type="date">를 쓰면 iOS/Android 모두 OS 기본 날짜 휠 피커가 뜬다 —
  // 커스텀 피커를 직접 만들지 않아도 되고, 소프트 키보드도 뜨지 않는다.
  function handleBirthDateChange(e) {
    const [y, m, d] = e.target.value.split("-");
    onChange({ target: { name: "birthYear", value: y } });
    onChange({ target: { name: "birthMonth", value: String(Number(m)) } });
    onChange({ target: { name: "birthDay", value: String(Number(d)) } });
  }

  function handleNext() {
    if (!canProceed[revealedCount - 1]) return;
    setRevealedCount((c) => Math.min(c + 1, STEP_COUNT));
  }

  // 아직 마지막 질문이 아닌데 엔터를 치면(단일 입력 폼은 브라우저가 암묵적으로 제출을
  // 시도한다) 제출 대신 다음 질문으로 넘어가게 한다.
  function handleFormKeyDown(e) {
    if (e.key === "Enter" && !isLastStep) {
      e.preventDefault();
      handleNext();
    }
  }

  const bottomBarStyle = {
    bottom: keyboardInset,
    paddingBottom: keyboardInset > 0 ? "16px" : "calc(16px + env(safe-area-inset-bottom))",
  };

  // 약관 동의는 토스처럼 아래에 쌓이지 않고, 참고 디자인처럼 완전히 새로운 화면으로 전환된다.
  if (isLastStep) {
    return (
      <form onSubmit={onSubmit} className="min-h-[calc(100vh-72px)] flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-5 pb-28">
          <BackButton onClick={() => setRevealedCount(STEP_COUNT - 1)} />

          <div className="flex flex-col gap-5 pt-6">
            <button
              type="button"
              onClick={toggleAllAgreements}
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                allAgreed ? "border-blue-7 bg-blue-1" : "border-bluegrey-3"
              }`}
            >
              <CheckIcon checked={allAgreed} />
              <span className="text-body-3 font-bold text-grey-10">약관 전체동의</span>
            </button>

            <div className="flex flex-col gap-4 px-1">
              {AGREEMENT_ITEMS.map((item) => (
                <label
                  key={item.key}
                  htmlFor={`mobile-agree-${item.key}`}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    id={`mobile-agree-${item.key}`}
                    type="checkbox"
                    checked={agreements[item.key]}
                    onChange={() => toggleAgreement(item.key)}
                    className="sr-only"
                  />
                  <CheckIcon checked={agreements[item.key]} />
                  <span className="text-body-4 text-grey-8 select-none">
                    {item.required ? "(필수) " : "[선택] "}
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <p className="text-body-5 text-grey-6 leading-relaxed px-1">
              수집된 정보는 교회 구성원 관리 목적으로만 사용됩니다.{" "}
              <Link to="/privacy" className="text-blue-6 underline">
                개인정보처리방침 보기
              </Link>
            </p>
            {submitError && (
              <p className="text-body-4 text-red-500 bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
            )}
          </div>
        </div>

        <div className="fixed left-0 right-0 bg-white border-t border-grey-2 px-6 py-4" style={bottomBarStyle}>
          <button
            type="submit"
            disabled={status === "submitting" || !form.agreePrivacy}
            className="w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold disabled:bg-blue-3 transition-colors"
          >
            {status === "submitting" ? "신청 중..." : "가입 신청하기"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col" onKeyDown={handleFormKeyDown}>
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-28">
        <BackButton onClick={() => navigate(-1)} />

        <div className="flex flex-col gap-8 pt-6">
          <div ref={revealedCount === 1 ? latestBlockRef : undefined}>
            <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
              이름 <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              placeholder="이름을 입력하세요"
              className={inputCls}
            />
          </div>

          {revealedCount > 1 && (
            <div ref={revealedCount === 2 ? latestBlockRef : undefined}>
              <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                생년월일 <span className="text-red-400">*</span>
              </label>
              <input
                name="birthdate"
                type="date"
                value={birthDateValue}
                onChange={handleBirthDateChange}
                max={TODAY_ISO}
                className={inputCls}
              />
            </div>
          )}

          {revealedCount > 2 && (
            <div ref={latestBlockRef} className="flex flex-col gap-5">
              <div>
                <label className="block text-body-4 font-semibold text-grey-8 mb-1.5">
                  휴대폰 번호 <span className="text-red-400">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="010-0000-0000"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-3 py-3 px-4 bg-blue-1 rounded-xl border border-blue-2">
                <input
                  id="mobile-isNewcomer"
                  name="isNewcomer"
                  type="checkbox"
                  checked={form.isNewcomer}
                  onChange={onChange}
                  className="w-4 h-4 accent-blue-7 shrink-0"
                />
                <label
                  htmlFor="mobile-isNewcomer"
                  className="text-body-3 text-blue-8 cursor-pointer select-none"
                >
                  새신자입니다
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 확인 버튼 — 화면 하단에 고정(키보드가 올라오면 그 위로 따라 올라간다) */}
      <div className="fixed left-0 right-0 bg-white border-t border-grey-2 px-6 py-4" style={bottomBarStyle}>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed[revealedCount - 1]}
          className="w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold disabled:bg-blue-3 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
