import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { YEAR_OPTIONS, MONTH_OPTIONS, daysInMonth } from "@/pages/Register/registerFields";

const inputCls =
  "w-full px-4 py-3 border border-bluegrey-3 rounded-xl text-body-3 text-grey-10 placeholder:text-grey-5 focus:ring-2 focus:ring-blue-3/50 focus:border-blue-7 outline-none transition-all";

const STEP_COUNT = 4;
const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE_COUNT = 5;
const WHEEL_PADDING = (WHEEL_ITEM_HEIGHT * (WHEEL_VISIBLE_COUNT - 1)) / 2;

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

// 네이티브 <input type="date">는 브라우저/OS마다 렌더링이 달라서(안드로이드는 달력,
// 너비도 기기마다 들쭉날쭉) 참고 디자인과 다르게 보인다 — scroll-snap만으로 직접 만든
// 휠 피커라 모든 기기에서 똑같이 보이고 폭도 항상 부모 너비에 맞는다.
function WheelColumn({ name, options, value, onSettle }) {
  const scrollRef = useRef(null);
  const settleTimer = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.max(0, options.indexOf(value));
    el.scrollTop = idx * WHEEL_ITEM_HEIGHT;
    // 시트가 열릴 때(= 컴포넌트가 새로 마운트될 때) 현재 값으로 한 번만 스크롤한다 —
    // value가 바뀔 때마다 다시 실행하면 사용자가 스크롤하는 도중에도 되돌아간다.
  }, []);

  function handleScroll(e) {
    const el = e.currentTarget;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const idx = Math.max(
        0,
        Math.min(options.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT)),
      );
      el.scrollTo?.({ top: idx * WHEEL_ITEM_HEIGHT, behavior: "smooth" });
      onSettle(options[idx]);
    }, 100);
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      data-testid={`wheel-${name}`}
      className="flex-1 h-[220px] overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ paddingTop: WHEEL_PADDING, paddingBottom: WHEEL_PADDING }}
    >
      {options.map((opt) => (
        <div
          key={opt}
          className={`snap-center flex items-center justify-center text-body-3 transition-colors ${
            opt === value ? "font-bold text-grey-11" : "text-grey-4"
          }`}
          style={{ height: WHEEL_ITEM_HEIGHT }}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}

function BirthdateWheelPicker({ form, onChange, onClose }) {
  const dayOptions = Array.from(
    { length: daysInMonth(form.birthYear, form.birthMonth) },
    (_, i) => i + 1,
  );

  function set(name, value) {
    onChange({ target: { name, value: String(value) } });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex px-4 pt-2">
          <WheelColumn
            name="birthYear"
            options={YEAR_OPTIONS}
            value={Number(form.birthYear) || YEAR_OPTIONS[20]}
            onSettle={(v) => set("birthYear", v)}
          />
          <WheelColumn
            name="birthMonth"
            options={MONTH_OPTIONS}
            value={Number(form.birthMonth) || 1}
            onSettle={(v) => set("birthMonth", v)}
          />
          <WheelColumn
            name="birthDay"
            options={dayOptions}
            value={Number(form.birthDay) || 1}
            onSettle={(v) => set("birthDay", v)}
          />
          {/* 가운데 선택 영역 표시용 가로줄 */}
          <div
            className="absolute left-0 right-0 border-y border-bluegrey-3 pointer-events-none"
            style={{ top: WHEEL_PADDING, height: WHEEL_ITEM_HEIGHT }}
          />
        </div>
        <div className="px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-blue-7 text-white rounded-xl text-btn-normal font-semibold transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
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
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  // onChange(부모의 handleChange)는 매 렌더 새 함수로 내려온다 — 의존성에 넣으면
  // 호출→부모 리렌더→새 onChange→effect 재실행이 반복되는 무한 루프가 생긴다.
  // ref에 최신 함수만 담아두고 effect는 allRequiredAgreed가 바뀔 때만 실행한다.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    onChangeRef.current({
      target: { name: "agreePrivacy", type: "checkbox", checked: allRequiredAgreed },
    });
  }, [allRequiredAgreed]);

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

  const birthDateDisplay =
    form.birthYear && form.birthMonth && form.birthDay
      ? `${form.birthYear}년 ${form.birthMonth}월 ${form.birthDay}일`
      : "";

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
      <form onSubmit={onSubmit} className="h-[calc(100dvh-72px)] flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 pb-28 flex flex-col">
          <BackButton onClick={() => setRevealedCount(STEP_COUNT - 1)} />

          <div className="flex-1 min-h-0 flex flex-col justify-center gap-5">
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
    <div className="h-[calc(100dvh-72px)] flex flex-col" onKeyDown={handleFormKeyDown}>
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 pb-28 flex flex-col">
        <BackButton onClick={() => navigate(-1)} />

        <div className="flex-1 min-h-0 flex flex-col justify-center gap-8">
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
              <button
                type="button"
                aria-label="생년월일 선택"
                onClick={() => setShowDatePicker(true)}
                className={`${inputCls} text-left ${birthDateDisplay ? "" : "text-grey-5"}`}
              >
                {birthDateDisplay || "생년월일을 선택해 주세요"}
              </button>
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

      {showDatePicker && (
        <BirthdateWheelPicker
          form={form}
          onChange={onChange}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}
