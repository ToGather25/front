# 마이페이지 인증 가드 + 탭별 컴포넌트 분리 + 회귀 테스트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `MyPage.jsx`(1179줄, 인증 가드 없음)를 5개 탭별 컴포넌트로 분리하고, 로그인 가드를 추가하고(TDD), 전체에 회귀 테스트를 추가한다.

**Architecture:** 각 탭(내 정보/부서·직책/일정/기도·상담/문의하기)의 상태가 서로 완전히 독립적이므로 `src/components/mypage/`의 5개 파일로 쪼갠다. 공용 UI 5종(`ReadonlyField`/`InputField`/`ModalOverlay`/`StatusBadge`/`Pagination`)과 목 데이터는 각각 `shared.jsx`/`mockData.js`로 분리해 5개 탭이 공유한다. `MyPage.jsx`는 로그인 가드 + 사이드바(유저 요약+탭 네비) + 활성 탭 마운트만 남는 얇은 부모가 된다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event`, `react-router` v7, `src/test/renderWithChurch.jsx`(`withAuth` 옵션).

## Global Constraints

- `describe`/`it`/`expect`/`beforeEach`는 `"vite-plus/test"`에서 import한다.
- 이 사이클은 **순수 구조 재배치 + 로그인 가드 추가**다 — 옮기는 과정에서 로직·마크업·클래스명·문구·목 데이터 값을 절대 바꾸지 않는다(오직 새 로그인 가드 코드와 `InfoTab`의 `onNavigateDept` prop 연결만 신규 로직).
- `MOCK_USER`를 실제 로그인 사용자(`currentUser`)로 교체하지 않는다 — 사용자 확인으로 이번 사이클 제외.
- 탭 컴포넌트가 조건부 렌더(`{activeTab === "dept" && <DeptTab/>}`)로 마운트/언마운트되므로, 원본 코드의 `setDeptChangeMode(false)`/`setInquiryWriteMode(false)`(탭 전환 시 수동 리셋) 호출은 **의도적으로 제거**한다 — React가 탭을 벗어나면 해당 컴포넌트를 언마운트했다가 돌아올 때 새로 마운트하므로 `useState`가 자동으로 초기값(`false`)으로 리셋되어 동일한 효과를 낸다. 이건 버그가 아니라 정확히 동등한 동작이다.
- 렌더 헬퍼는 `renderWithChurch`(`@/test/renderWithChurch`)를 쓴다. 탭 컴포넌트 자체(`InfoTab`/`DeptTab`/`ScheduleTab`/`PrayerTab`/`InquiryTab`)는 `useAuth`/`useNavigate`/`useChurch`를 쓰지 않으므로 일반 `@testing-library/react`의 `render`만으로 충분하다. `MyPage.jsx`(로그인 가드 포함)와 `routes.test.jsx`(라우트 트리)만 `renderWithChurch(ui, { withAuth: true })` 또는 `ChurchProvider`+`SearchProvider` 래핑이 필요하다.

---

## Task 1: 공용 UI(`shared.jsx`) + 목 데이터(`mockData.js`) 추출

**Files:**
- Create: `src/components/mypage/shared.jsx`
- Create: `src/components/mypage/mockData.js`

**Interfaces:**
- Produces: `shared.jsx`가 export하는 `IconClose`, `IconBack`, `ReadonlyField`, `InputField`, `ModalOverlay`, `StatusBadge`, `Pagination`. `mockData.js`가 export하는 `MOCK_USER`, `MOCK_DEPT`, `MOCK_GROUPS`, `INITIAL_SCHEDULES`, `INITIAL_PRAYERS`, `INITIAL_INQUIRIES`.이후 모든 태스크(2~7)가 이 두 파일을 소비한다.

이 태스크는 기존 `src/pages/MyPage/MyPage.jsx`에서 로직·값을 전혀 바꾸지 않고 그대로 옮기는 순수 추출이라 별도 테스트가 필요 없다(Task 2~6의 테스트가 이 파일들을 간접적으로 검증한다). `src/pages/MyPage/MyPage.jsx` 자체는 이번 태스크에서 아직 건드리지 않는다(다음 태스크들과의 충돌 방지, Task 7에서 한 번에 교체).

- [ ] **Step 1: `shared.jsx` 작성**

`src/components/mypage/shared.jsx`를 새로 만든다:

```jsx
import PopupClose from "@/assets/icon-svg/popup-close.svg";
import ArrowBack from "@/assets/icon-svg/mypage-arrow-back.svg";

export function IconClose() {
  return <img src={PopupClose} className="w-5 h-5" alt="" />;
}

export function IconBack() {
  return <img src={ArrowBack} className="w-[18px] h-[18px]" alt="" />;
}

export function ReadonlyField({ label, value, note }) {
  return (
    <div>
      <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
      <div className="border border-grey-3 rounded-lg px-4 py-3 text-body-4 text-grey-8 bg-grey-2 cursor-not-allowed select-none">
        {value}
      </div>
      {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
    </div>
  );
}

export function InputField({ label, value, onChange, placeholder, type = "text", note }) {
  return (
    <div>
      <label className="block text-body-5 text-grey-7 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors"
      />
      {note && <p className="text-body-5 text-grey-6 mt-1">{note}</p>}
    </div>
  );
}

export function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-6 hover:text-grey-9 transition-colors"
        >
          <IconClose />
        </button>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    "답변 완료": "text-green-700 bg-green-50 border border-green-200",
    "답변 대기": "text-amber-600 bg-amber-50 border border-amber-200",
    "진행 중": "text-blue-600 bg-blue-50 border border-blue-200",
    "참석 예정": "text-teal-700 bg-teal-50 border border-teal-200",
    미정: "text-grey-6 bg-grey-2 border border-grey-4",
  };
  return (
    <span
      className={`text-body-5 rounded-full px-3 py-1 whitespace-nowrap ${styles[status] ?? "text-grey-7 bg-grey-2"}`}
    >
      {status}
    </span>
  );
}

export function Pagination({ total, perPage, current, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-5">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-body-5 transition-colors ${
            p === current ? "bg-primary text-white font-semibold" : "text-grey-7 hover:bg-grey-2"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-6 hover:bg-grey-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: `mockData.js` 작성**

`src/components/mypage/mockData.js`를 새로 만든다:

```js
export const MOCK_USER = {
  name: "김민수",
  role: "장로",
  district: "1구역",
  group: "1조",
  birthdate: "1972.04.18",
  phone: "010-2341-7782",
  email: "minsoo.kim@example.com",
  address: "서울특별시 영등포구",
  registeredDate: "2014.03.09",
  baptismDate: "2002.05.19",
};

export const MOCK_DEPT = {
  position: "장로",
  department: "남선교회 1지회",
  duty: "안내위원장",
  district: "1구역",
  group: "1조",
  ordainedDate: "2021.03.07",
};

export const MOCK_GROUPS = [
  { id: 1, name: "1구역 모임", info: "매주 화요일 19:30 · 옥길동 · 구역원 · 총 8명" },
  { id: 2, name: "1조", info: "매주 토요일 20:00 · 본당 4층 · 리더 · 총 6명" },
  { id: 3, name: "남선교회 1지회", info: "월 1회 셋째 주 · 안내위원장 · 총 24명" },
  { id: 4, name: "성가대 (테너)", info: "매주 금요일 20:00 · 본당 4층 · 단원 · 총 18명" },
];

export const INITIAL_SCHEDULES = [
  {
    id: 1,
    date: "02.18",
    day: "화",
    title: "1구역 모임",
    info: "옥길동 박OO 권사 댁 · 19:30",
    status: "참석 예정",
  },
  {
    id: 2,
    date: "02.22",
    day: "토",
    title: "성가대 부활절 연습",
    info: "본당 4층 · 20:00",
    status: "미정",
  },
  {
    id: 3,
    date: "02.23",
    day: "주",
    title: "주일 1·2부 예배",
    info: "본당 · 09:00 / 11:00",
    status: "참석 예정",
  },
  {
    id: 4,
    date: "02.25",
    day: "화",
    title: "개인 — 직장 송별회",
    info: "강남 · 19:00",
    status: "참석 예정",
  },
  {
    id: 5,
    date: "04.05",
    day: "주",
    title: "부활주일 연합 예배",
    info: "본당 · 11:00",
    status: "참석 예정",
  },
  {
    id: 6,
    date: "04.12",
    day: "주",
    title: "주일 1부 예배",
    info: "본당 · 09:00",
    status: "참석 예정",
  },
  {
    id: 7,
    date: "04.15",
    day: "화",
    title: "1구역 모임",
    info: "옥길동 박OO 권사 댁 · 19:30",
    status: "미정",
  },
  {
    id: 8,
    date: "04.19",
    day: "토",
    title: "성가대 정기연습",
    info: "본당 4층 · 20:00",
    status: "참석 예정",
  },
  {
    id: 9,
    date: "04.27",
    day: "주",
    title: "어린이주일 연합예배",
    info: "본당 · 10:30",
    status: "참석 예정",
  },
  {
    id: 10,
    date: "05.04",
    day: "주",
    title: "주일 2부 예배",
    info: "본당 · 11:00",
    status: "참석 예정",
  },
  { id: 11, date: "05.06", day: "화", title: "1구역 심방", info: "옥길동 · 19:00", status: "미정" },
  {
    id: 12,
    date: "05.18",
    day: "주",
    title: "오순절 기념 예배",
    info: "본당 · 11:00",
    status: "참석 예정",
  },
];

export const INITIAL_PRAYERS = [
  {
    id: 1,
    type: "기도",
    title: "가정 회복을 위한 기도",
    content: "가족 간의 깊은 대화가 필요합니다. 함께 기도해 주세요.",
    date: "2026.02.10",
    status: "답변 완료",
    reply:
      "김OO 목사 — 가정을 향한 하나님의 회복을 함께 기도합니다. 화요일 심방 일정 잡아드리겠습니다.",
  },
  {
    id: 2,
    type: "상담",
    title: "진로 상담 요청",
    content: "이직 결정을 앞두고 지혜가 필요합니다.",
    date: "2026.02.04",
    status: "답변 대기",
    reply: null,
  },
  {
    id: 3,
    type: "기도",
    title: "건강 회복 감사",
    content: "수술 잘 끝났습니다. 함께 기도해 주신 모든 분께 감사드립니다.",
    date: "2026.01.27",
    status: "답변 완료",
    reply: "이OO 부목사 — 회복의 은혜를 함께 기뻐합니다. 다음 주 새벽기도 함께 나누면 좋겠습니다.",
  },
  {
    id: 4,
    type: "기도",
    title: "자녀 입시를 위한 기도",
    content: "큰 아이가 수능을 앞두고 있습니다. 지혜와 평안을 위해 기도 부탁드립니다.",
    date: "2026.01.15",
    status: "답변 완료",
    reply: "김OO 목사 — 시험 기간 내내 함께 기도하겠습니다.",
  },
  {
    id: 5,
    type: "상담",
    title: "부부 갈등 상담 요청",
    content: "가정 내 갈등으로 힘든 시간을 보내고 있습니다. 상담을 부탁드립니다.",
    date: "2026.01.08",
    status: "답변 완료",
    reply: "이OO 부목사 — 이번 주 금요일 저녁에 시간을 내겠습니다.",
  },
  {
    id: 6,
    type: "기도",
    title: "직장 문제를 위한 기도",
    content: "새 직장을 구하고 있습니다. 좋은 길이 열리도록 기도해 주세요.",
    date: "2025.12.20",
    status: "답변 대기",
    reply: null,
  },
  {
    id: 7,
    type: "상담",
    title: "신앙 고민 상담",
    content: "믿음이 흔들리는 시기입니다. 말씀으로 도움받고 싶습니다.",
    date: "2025.12.05",
    status: "답변 완료",
    reply: "김OO 목사 — 언제든지 연락 주세요. 함께 말씀 나누겠습니다.",
  },
];

export const INITIAL_INQUIRIES = [
  {
    id: 1,
    title: "교적 정보 수정 요청 (주소 변경)",
    date: "2026.02.12",
    status: "답변 완료",
    reply: "사무실 — 주소 변경 완료되었습니다. 다음 주보부터 반영됩니다.",
  },
  { id: 2, title: "새가족부 신청", date: "2026.02.05", status: "진행 중", reply: null },
  {
    id: 3,
    title: "심방 일정 요청",
    date: "2026.01.20",
    status: "답변 완료",
    reply: "부목사 — 2/3 화요일 19:00에 방문드리겠습니다.",
  },
  {
    id: 4,
    title: "교육 프로그램 등록",
    date: "2026.01.10",
    status: "답변 완료",
    reply: "교육부 — 제자훈련 1기 등록 완료되었습니다.",
  },
  {
    id: 5,
    title: "성가대 악보 신청",
    date: "2025.12.28",
    status: "답변 완료",
    reply: "사무실 — 악보 준비되었습니다. 연습 전 수령해 주세요.",
  },
  {
    id: 6,
    title: "헌금 영수증 발급 요청",
    date: "2025.12.15",
    status: "답변 완료",
    reply: "사무실 — 이메일로 발송드렸습니다.",
  },
  { id: 7, title: "구역 변경 신청", date: "2025.11.30", status: "진행 중", reply: null },
  {
    id: 8,
    title: "봉사 일정 문의",
    date: "2025.11.20",
    status: "답변 완료",
    reply: "사무실 — 다음 달 봉사 일정표를 공유드렸습니다.",
  },
];
```

- [ ] **Step 3: 빌드 확인**

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료(아직 아무도 이 파일들을 import하지 않으므로 실질적으로는 신규 파일 문법 오류만 체크됨)

- [ ] **Step 4: Commit**

```bash
git add src/components/mypage/shared.jsx src/components/mypage/mockData.js
git commit -m "refactor: 마이페이지 공용 UI(shared.jsx)와 목 데이터(mockData.js) 추출

MyPage.jsx(1179줄, 5개 탭 단일 파일)를 탭별 컴포넌트로 분리하는 작업의
첫 단계. 5개 탭이 공통으로 쓰는 UI 프리미티브(ReadonlyField/InputField/
ModalOverlay/StatusBadge/Pagination)와 목 데이터를 로직·값 변경 없이
그대로 추출했다. MyPage.jsx 자체는 아직 건드리지 않음(Task 7에서 교체)."
```

---

## Task 2: `InfoTab.jsx` — 내 정보

**Files:**
- Create: `src/components/mypage/InfoTab.jsx`
- Create: `src/components/mypage/InfoTab.test.jsx`

**Interfaces:**
- Consumes: `mockData.js`의 `MOCK_USER`, `shared.jsx`의 `ReadonlyField`/`InputField`/`ModalOverlay`(Task 1에서 완료)
- Produces: `InfoTab` 컴포넌트(default export), props `{ onNavigateDept }` — Task 7이 `<InfoTab onNavigateDept={() => setActiveTab("dept")} />`로 마운트한다.

- [ ] **Step 1: `InfoTab.jsx` 작성**

`src/components/mypage/InfoTab.jsx`를 새로 만든다:

```jsx
import { useState, useRef } from "react";
import ImgUpload from "@/assets/icon-svg/mypage-img-upload.svg";
import { MOCK_USER } from "./mockData";
import { ReadonlyField, InputField, ModalOverlay } from "./shared";

function IconUpload() {
  return <img src={ImgUpload} className="w-4 h-4" alt="" />;
}

export default function InfoTab({ onNavigateDept }) {
  const [modal, setModal] = useState(null);
  const [userForm, setUserForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    email: MOCK_USER.email,
    address: MOCK_USER.address,
    currentPw: "",
    newPw: "",
  });
  const fileInputRef = useRef(null);

  function resetInfo() {
    setUserForm({
      name: MOCK_USER.name,
      phone: MOCK_USER.phone,
      email: MOCK_USER.email,
      address: MOCK_USER.address,
      currentPw: "",
      newPw: "",
    });
  }

  return (
    <div className="space-y-5">
      {/* 내 프로필 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sub-tit-4 font-bold text-grey-11">내 프로필</h2>
          <button
            onClick={() => setModal("withdraw-confirm")}
            className="text-body-5 text-grey-6 border border-grey-4 rounded-full px-4 py-1.5 hover:bg-grey-2 transition-colors"
          >
            회원 탈퇴
          </button>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-grey-5 flex items-center justify-center text-headline-5 font-bold text-white shrink-0">
            {MOCK_USER.name[0]}
          </div>
          <div>
            <p className="text-body-3 font-bold text-grey-10 mb-1">{MOCK_USER.name}</p>
            <p className="text-body-5 text-grey-6 mb-3">
              JPG · PNG · 5MB 이하의 정사각형 이미지를 권장합니다.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-primary text-white text-body-5 rounded-lg px-4 py-2 hover:bg-blue-8 transition-colors"
            >
              <IconUpload />
              이미지 업로드
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          </div>
        </div>
      </section>

      {/* 기본 정보 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">기본 정보</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="이름"
              value={userForm.name}
              onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
            />
            <ReadonlyField
              label="생년월일"
              value={MOCK_USER.birthdate}
              note="생년월일은 문의로 변경 가능합니다."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="휴대폰"
              value={userForm.phone}
              onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <InputField
              label="이메일"
              value={userForm.email}
              onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <InputField
            label="주소"
            value={userForm.address}
            onChange={(e) => setUserForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
      </section>

      {/* 교적 정보 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">교적 정보</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadonlyField label="등록일" value={MOCK_USER.registeredDate} />
            <ReadonlyField label="세례일" value={MOCK_USER.baptismDate} />
          </div>
          <p className="text-body-5 text-grey-7">
            ※ 부서 · 직책 정보는 좌측{" "}
            <button onClick={onNavigateDept} className="font-semibold text-grey-9 underline">
              부서 / 직책
            </button>{" "}
            메뉴에서 확인하실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 보안 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">보안</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="현재 비밀번호"
            type="password"
            value={userForm.currentPw}
            onChange={(e) => setUserForm((f) => ({ ...f, currentPw: e.target.value }))}
            placeholder="••••••••"
          />
          <InputField
            label="새 비밀번호"
            type="password"
            value={userForm.newPw}
            onChange={(e) => setUserForm((f) => ({ ...f, newPw: e.target.value }))}
            placeholder="8자 이상"
          />
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          onClick={resetInfo}
          className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
        >
          취소
        </button>
        <button className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors">
          저장하기
        </button>
      </div>

      {modal === "withdraw-confirm" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              회원 탈퇴를 진행하시겠습니까?
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              탈퇴를 진행하면 계정 정보가 삭제되며, 일부 데이터는 복구할 수 없습니다.
              <br />
              탈퇴 신청 후 관리자의 검토를 거쳐 최종 처리됩니다.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModal(null)}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setModal("withdraw-done")}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
              >
                탈퇴 신청
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {modal === "withdraw-done" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              탈퇴 신청이 접수되었습니다.
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              검토 완료 후 탈퇴가 최종 처리되며, 처리까지는 약 30일 정도 소요됩니다.
              <br />
              처리 전까지 서비스 이용이 제한될 수 있습니다.
            </p>
            <button
              onClick={() => setModal(null)}
              className="bg-primary text-white rounded-full px-8 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/mypage/InfoTab.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MOCK_USER } from "./mockData";
import InfoTab from "./InfoTab";

describe("InfoTab — 내 정보", () => {
  it("MOCK_USER 초기값으로 기본 정보 폼이 채워진다", () => {
    render(<InfoTab onNavigateDept={() => {}} />);
    expect(screen.getByDisplayValue(MOCK_USER.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_USER.phone)).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_USER.email)).toBeInTheDocument();
  });

  it("이름 입력을 바꾸면 값이 반영되고, 취소를 누르면 원래대로 되돌아간다", () => {
    render(<InfoTab onNavigateDept={() => {}} />);
    const nameInput = screen.getByDisplayValue(MOCK_USER.name);

    fireEvent.change(nameInput, { target: { value: "변경된이름" } });
    expect(screen.getByDisplayValue("변경된이름")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.getByDisplayValue(MOCK_USER.name)).toBeInTheDocument();
  });

  it("회원 탈퇴 확인 → 신청 → 완료 모달 흐름이 동작한다", () => {
    render(<InfoTab onNavigateDept={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "회원 탈퇴" }));
    expect(screen.getByText("회원 탈퇴를 진행하시겠습니까?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "탈퇴 신청" }));
    expect(screen.getByText("탈퇴 신청이 접수되었습니다.")).toBeInTheDocument();
  });

  it("'부서 / 직책' 링크를 클릭하면 onNavigateDept가 호출된다", () => {
    let called = false;
    render(<InfoTab onNavigateDept={() => (called = true)} />);

    fireEvent.click(screen.getByRole("button", { name: "부서 / 직책" }));
    expect(called).toBe(true);
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/mypage/InfoTab.test.jsx`
Expected: PASS (4/4) — 이 태스크는 기존 동작을 그대로 옮긴 것이라 실패 없이 바로 통과해야 정상이다.

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/mypage/InfoTab.jsx src/components/mypage/InfoTab.test.jsx
git commit -m "refactor: MyPage 내 정보 탭을 InfoTab.jsx로 분리 + 회귀 테스트 추가

MyPage.jsx에서 내 정보 탭(프로필/기본정보/교적정보/보안, 회원탈퇴
모달) 로직을 그대로 옮겼다. 다른 탭으로 이동하는 링크는 onNavigateDept
콜백 prop으로 부모에 위임한다."
```

---

## Task 3: `DeptTab.jsx` — 부서 / 직책

**Files:**
- Create: `src/components/mypage/DeptTab.jsx`
- Create: `src/components/mypage/DeptTab.test.jsx`

**Interfaces:**
- Consumes: `mockData.js`의 `MOCK_DEPT`/`MOCK_GROUPS`, `shared.jsx`의 `ReadonlyField`/`ModalOverlay`/`IconBack`(Task 1)
- Produces: `DeptTab` 컴포넌트(default export, props 없음) — Task 7이 `<DeptTab />`으로 마운트한다.

- [ ] **Step 1: `DeptTab.jsx` 작성**

`src/components/mypage/DeptTab.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import UserBlack from "@/assets/icon-svg/mypage-user-black.svg";
import { MOCK_DEPT, MOCK_GROUPS } from "./mockData";
import { ReadonlyField, ModalOverlay, IconBack } from "./shared";

export default function DeptTab() {
  const [deptChangeMode, setDeptChangeMode] = useState(false);
  const [modal, setModal] = useState(null);

  return (
    <div className="space-y-5">
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        {!deptChangeMode ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sub-tit-4 font-bold text-grey-11">부서 / 직책 정보</h2>
              <button
                onClick={() => setDeptChangeMode(true)}
                className="text-body-5 text-primary hover:underline"
              >
                변경 신청하기
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField
                  label="직분"
                  value={MOCK_DEPT.position}
                  note="사무실 문의로 변경 가능합니다."
                />
                <ReadonlyField label="소속 부서" value={MOCK_DEPT.department} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="직책" value={MOCK_DEPT.duty} />
                <ReadonlyField label="구역" value={MOCK_DEPT.district} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="소그룹 / 셀" value={MOCK_DEPT.group} />
                <ReadonlyField label="임직일" value={MOCK_DEPT.ordainedDate} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setDeptChangeMode(false)}
                className="text-grey-6 hover:text-grey-9 transition-colors"
              >
                <IconBack />
              </button>
              <h2 className="text-sub-tit-4 font-bold text-grey-11">부서 / 직책 변경 신청</h2>
            </div>
            <div className="space-y-4">
              <ReadonlyField
                label="직분"
                value={MOCK_DEPT.position}
                note="사무실 문의로 변경 가능합니다."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="직책" value={MOCK_DEPT.duty} />
                <ReadonlyField label="구역" value={MOCK_DEPT.district} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="소그룹 / 셀" value={MOCK_DEPT.group} />
                <ReadonlyField label="임직일" value={MOCK_DEPT.ordainedDate} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeptChangeMode(false)}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setDeptChangeMode(false);
                  setModal("dept-change-done");
                }}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
              >
                신청하기
              </button>
            </div>
          </>
        )}
      </section>

      {!deptChangeMode && (
        <section className="bg-white border border-grey-3 rounded-2xl p-8">
          <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-5">참여 중인 부서 / 모임</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_GROUPS.map((g) => (
              <div key={g.id} className="border border-grey-3 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-grey-2 flex items-center justify-center shrink-0">
                  <img src={UserBlack} className="w-4 h-4" alt="" />
                </div>
                <div className="min-w-0">
                  <p className="text-body-4 font-semibold text-grey-10">{g.name}</p>
                  <p className="text-body-5 text-grey-6 mt-0.5 leading-relaxed">{g.info}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {modal === "dept-change-done" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">신청이 접수되었습니다.</h3>
            <p className="text-body-5 text-grey-6 mb-8">
              검토 후 최종 처리 되며, 처리까지는 약 30일 정도 소요됩니다.
            </p>
            <button
              onClick={() => setModal(null)}
              className="bg-primary text-white rounded-full px-8 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/mypage/DeptTab.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MOCK_DEPT, MOCK_GROUPS } from "./mockData";
import DeptTab from "./DeptTab";

describe("DeptTab — 부서 / 직책", () => {
  it("조회 화면에 MOCK_DEPT 값과 참여 중인 모임 목록이 렌더된다", () => {
    render(<DeptTab />);
    // 주의: MOCK_DEPT.department("남선교회 1지회")는 MOCK_GROUPS[2].name과
    // 값이 같아서 동시에 렌더되면 getByText가 "multiple elements"로 실패한다.
    // MOCK_DEPT.duty("안내위원장")는 다른 곳과 겹치지 않아 안전하게 쓸 수 있다.
    expect(screen.getByText(MOCK_DEPT.duty)).toBeInTheDocument();
    expect(screen.getByText(MOCK_GROUPS[0].name)).toBeInTheDocument();
  });

  it("'변경 신청하기'를 클릭하면 변경 모드로 전환되고, 신청하면 완료 모달이 뜬다", () => {
    render(<DeptTab />);

    fireEvent.click(screen.getByRole("button", { name: "변경 신청하기" }));
    expect(screen.getByText("부서 / 직책 변경 신청")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    expect(screen.getByText("신청이 접수되었습니다.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/mypage/DeptTab.test.jsx`
Expected: PASS (2/2)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/mypage/DeptTab.jsx src/components/mypage/DeptTab.test.jsx
git commit -m "refactor: MyPage 부서/직책 탭을 DeptTab.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 4: `ScheduleTab.jsx` — 일정

**Files:**
- Create: `src/components/mypage/ScheduleTab.jsx`
- Create: `src/components/mypage/ScheduleTab.test.jsx`

**Interfaces:**
- Consumes: `mockData.js`의 `INITIAL_SCHEDULES`, `shared.jsx`의 `StatusBadge`/`Pagination`/`InputField`/`ModalOverlay`(Task 1)
- Produces: `ScheduleTab` 컴포넌트(default export, props 없음) — Task 7이 `<ScheduleTab />`으로 마운트한다.

- [ ] **Step 1: `ScheduleTab.jsx` 작성**

`src/components/mypage/ScheduleTab.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import { INITIAL_SCHEDULES } from "./mockData";
import { StatusBadge, Pagination, InputField, ModalOverlay } from "./shared";

const PAGE_SIZE = 5;

export default function ScheduleTab() {
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [scheduleForm, setScheduleForm] = useState({ date: "", day: "", title: "", info: "" });
  const [schedulePage, setSchedulePage] = useState(1);
  const [modal, setModal] = useState(null);

  function handleAddSchedule() {
    if (!scheduleForm.title) return;
    setSchedules((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: scheduleForm.date || "MM.DD",
        day: scheduleForm.day,
        title: scheduleForm.title,
        info: scheduleForm.info,
        status: "참석 예정",
      },
    ]);
    setScheduleForm({ date: "", day: "", title: "", info: "" });
    setModal(null);
  }

  const pagedSchedules = schedules.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col min-h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">내 일정 ({schedules.length})</h2>
        <button
          onClick={() => setModal("add-schedule")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          + 일정 추가
        </button>
      </div>
      <div className="space-y-3">
        {pagedSchedules.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border border-grey-3 rounded-xl px-5 py-4"
          >
            <div className="shrink-0 w-12 text-center">
              <p className="text-body-4 font-bold text-primary">{item.date}</p>
              <p className="text-body-5 text-grey-6">{item.day}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
              {item.info && <p className="text-body-5 text-grey-6 mt-0.5">{item.info}</p>}
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <Pagination
        total={schedules.length}
        perPage={PAGE_SIZE}
        current={schedulePage}
        onChange={setSchedulePage}
      />

      {modal === "add-schedule" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">일정 추가</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="날짜 (MM.DD)"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="03.15"
              />
              <InputField
                label="요일"
                value={scheduleForm.day}
                onChange={(e) => setScheduleForm((f) => ({ ...f, day: e.target.value }))}
                placeholder="주"
              />
            </div>
            <InputField
              label="제목"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예) 새가족 모임"
            />
            <InputField
              label="시간 · 장소"
              value={scheduleForm.info}
              onChange={(e) => setScheduleForm((f) => ({ ...f, info: e.target.value }))}
              placeholder="예) 본당 · 14:00"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddSchedule}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              추가
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/mypage/ScheduleTab.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { INITIAL_SCHEDULES } from "./mockData";
import ScheduleTab from "./ScheduleTab";

const PAGE_SIZE = 5;

describe("ScheduleTab — 일정", () => {
  it("첫 페이지에 최대 5개 일정이 표시되고 총 개수가 헤더에 보인다", () => {
    render(<ScheduleTab />);
    expect(screen.getByText(`내 일정 (${INITIAL_SCHEDULES.length})`)).toBeInTheDocument();
    expect(screen.getByText(INITIAL_SCHEDULES[0].title)).toBeInTheDocument();
    expect(screen.queryByText(INITIAL_SCHEDULES[PAGE_SIZE].title)).not.toBeInTheDocument();
  });

  it("페이지네이션 2페이지를 클릭하면 다음 일정이 보인다", () => {
    render(<ScheduleTab />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText(INITIAL_SCHEDULES[PAGE_SIZE].title)).toBeInTheDocument();
  });

  it("일정을 추가하면 목록에 반영된다", () => {
    render(<ScheduleTab />);

    fireEvent.click(screen.getByRole("button", { name: "+ 일정 추가" }));
    fireEvent.change(screen.getByPlaceholderText("예) 새가족 모임"), {
      target: { value: "테스트 일정" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getByText(`내 일정 (${INITIAL_SCHEDULES.length + 1})`)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/mypage/ScheduleTab.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/mypage/ScheduleTab.jsx src/components/mypage/ScheduleTab.test.jsx
git commit -m "refactor: MyPage 일정 탭을 ScheduleTab.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 5: `PrayerTab.jsx` — 기도 / 상담

**Files:**
- Create: `src/components/mypage/PrayerTab.jsx`
- Create: `src/components/mypage/PrayerTab.test.jsx`

**Interfaces:**
- Consumes: `mockData.js`의 `INITIAL_PRAYERS`, `shared.jsx`의 `StatusBadge`/`Pagination`/`InputField`/`ModalOverlay`(Task 1)
- Produces: `PrayerTab` 컴포넌트(default export, props 없음) — Task 7이 `<PrayerTab />`으로 마운트한다.

- [ ] **Step 1: `PrayerTab.jsx` 작성**

`src/components/mypage/PrayerTab.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import ChurchIcon from "@/assets/icon-svg/mypage-church.svg";
import { INITIAL_PRAYERS } from "./mockData";
import { StatusBadge, Pagination, InputField, ModalOverlay } from "./shared";

const PRAYER_PAGE_SIZE = 4;

function IconChurch() {
  return <img src={ChurchIcon} className="w-4 h-4" alt="" />;
}

export default function PrayerTab() {
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [prayerForm, setPrayerForm] = useState({ date: "", day: "", title: "", content: "" });
  const [prayerFilter, setPrayerFilter] = useState("전체");
  const [prayerPage, setPrayerPage] = useState(1);
  const [modal, setModal] = useState(null);

  function handleAddPrayer() {
    if (!prayerForm.title) return;
    setPrayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "기도",
        title: prayerForm.title,
        content: prayerForm.content,
        date: `2026.${prayerForm.date || "03.15"}`,
        status: "답변 대기",
        reply: null,
      },
    ]);
    setPrayerForm({ date: "", day: "", title: "", content: "" });
    setModal(null);
  }

  function handlePrayerFilter(f) {
    setPrayerFilter(f);
    setPrayerPage(1);
  }

  const filteredPrayers =
    prayerFilter === "전체" ? prayers : prayers.filter((p) => p.type === prayerFilter);
  const pagedPrayers = filteredPrayers.slice(
    (prayerPage - 1) * PRAYER_PAGE_SIZE,
    prayerPage * PRAYER_PAGE_SIZE,
  );

  return (
    <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sub-tit-4 font-bold text-grey-11">기도 / 상담 내역</h2>
        <button
          onClick={() => setModal("add-prayer")}
          className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
        >
          신청하기
        </button>
      </div>
      <div className="flex gap-2 mb-5">
        {["전체", "기도", "상담"].map((f) => (
          <button
            key={f}
            onClick={() => handlePrayerFilter(f)}
            className={`text-body-5 rounded-full px-4 py-1.5 transition-colors ${
              prayerFilter === f ? "bg-primary text-white" : "bg-grey-2 text-grey-7 hover:bg-grey-3"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {pagedPrayers.map((item) => (
          <div key={item.id} className="border border-grey-3 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-body-5 rounded px-2 py-0.5 ${
                    item.type === "기도" ? "bg-grey-2 text-grey-7" : "bg-blue-1 text-primary"
                  }`}
                >
                  {item.type}
                </span>
                <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-body-5 text-grey-6">{item.date}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <p className="text-body-5 text-grey-7 mt-2">{item.content}</p>
            {item.reply && (
              <div className="mt-3 pl-4 border-l-2 border-grey-3 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">
                  <IconChurch />
                </span>
                <p className="text-body-5 text-grey-6">{item.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <Pagination
        total={filteredPrayers.length}
        perPage={PRAYER_PAGE_SIZE}
        current={prayerPage}
        onChange={setPrayerPage}
      />

      {modal === "add-prayer" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">기도 / 상담 신청하기</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="날짜 (MM.DD)"
                value={prayerForm.date}
                onChange={(e) => setPrayerForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="03.15"
              />
              <InputField
                label="요일"
                value={prayerForm.day}
                onChange={(e) => setPrayerForm((f) => ({ ...f, day: e.target.value }))}
                placeholder="주"
              />
            </div>
            <InputField
              label="제목"
              value={prayerForm.title}
              onChange={(e) => setPrayerForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예) 건강"
            />
            <div>
              <label className="block text-body-5 text-grey-7 mb-1">내용</label>
              <textarea
                value={prayerForm.content}
                onChange={(e) => setPrayerForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="기도 제목을 간략히 작성해 주세요."
                rows={4}
                className="w-full border border-grey-4 rounded-lg px-4 py-3 text-body-4 text-grey-10 bg-white outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setModal(null)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddPrayer}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              신청
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/mypage/PrayerTab.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { INITIAL_PRAYERS } from "./mockData";
import PrayerTab from "./PrayerTab";

describe("PrayerTab — 기도 / 상담", () => {
  it("기도/상담 내역이 렌더된다", () => {
    render(<PrayerTab />);
    expect(screen.getByText(INITIAL_PRAYERS[0].title)).toBeInTheDocument();
  });

  it("'상담' 필터를 클릭하면 상담 타입만 표시된다", () => {
    render(<PrayerTab />);
    const target = INITIAL_PRAYERS.find((p) => p.type === "상담");
    const other = INITIAL_PRAYERS.find((p) => p.type === "기도");

    fireEvent.click(screen.getByRole("button", { name: "상담" }));

    expect(screen.getByText(target.title)).toBeInTheDocument();
    expect(screen.queryByText(other.title)).not.toBeInTheDocument();
  });

  it("기도/상담을 신청하면 목록 끝에 '답변 대기' 상태로 추가된다", () => {
    render(<PrayerTab />);

    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    fireEvent.change(screen.getByPlaceholderText("예) 건강"), {
      target: { value: "테스트 기도제목" },
    });
    fireEvent.click(screen.getByRole("button", { name: "신청" }));

    // handleAddPrayer는 배열 끝에 추가하고 페이지는 그대로 두므로(리셋 없음),
    // PRAYER_PAGE_SIZE=4에 7개 초기 데이터 + 1개 추가 = 8개가 되어 새 항목은
    // 2페이지에 있다 — 1페이지에서 바로 찾으면 실패한다.
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("테스트 기도제목")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/mypage/PrayerTab.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/mypage/PrayerTab.jsx src/components/mypage/PrayerTab.test.jsx
git commit -m "refactor: MyPage 기도/상담 탭을 PrayerTab.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 6: `InquiryTab.jsx` — 문의하기

**Files:**
- Create: `src/components/mypage/InquiryTab.jsx`
- Create: `src/components/mypage/InquiryTab.test.jsx`

**Interfaces:**
- Consumes: `mockData.js`의 `INITIAL_INQUIRIES`/`MOCK_USER`, `shared.jsx`의 `StatusBadge`/`Pagination`/`InputField`/`ReadonlyField`/`IconBack`(Task 1)
- Produces: `InquiryTab` 컴포넌트(default export, props 없음) — Task 7이 `<InquiryTab />`으로 마운트한다.

- [ ] **Step 1: `InquiryTab.jsx` 작성**

`src/components/mypage/InquiryTab.jsx`를 새로 만든다:

```jsx
import { useState } from "react";
import MailIcon from "@/assets/icon-svg/mypage-mail.svg";
import { INITIAL_INQUIRIES, MOCK_USER } from "./mockData";
import { StatusBadge, Pagination, InputField, ReadonlyField, IconBack } from "./shared";

const PAGE_SIZE = 5;

function IconMail() {
  return <img src={MailIcon} className="w-[13px] h-[13px]" alt="" />;
}

export default function InquiryTab() {
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryWriteMode, setInquiryWriteMode] = useState(false);

  function handleAddInquiry() {
    if (!inquiryForm.title) return;
    setInquiries((prev) => [
      {
        id: Date.now(),
        title: inquiryForm.title,
        date: "2026.03.15",
        status: "진행 중",
        reply: null,
      },
      ...prev,
    ]);
    setInquiryForm({ title: "", content: "" });
    setInquiryWriteMode(false);
    setInquiryPage(1);
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
              }}
              className="bg-primary text-white text-body-5 rounded-full px-5 py-2 hover:bg-blue-8 transition-colors"
            >
              문의하기
            </button>
          </div>
          <div className="space-y-3">
            {pagedInquiries.map((item) => (
              <div key={item.id} className="border border-grey-3 rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-body-5 text-grey-6">{item.date}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                {item.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-grey-3 flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">
                      <IconMail />
                    </span>
                    <p className="text-body-5 text-grey-6">{item.reply}</p>
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
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setInquiryWriteMode(false)}
              className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddInquiry}
              className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              접수
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 테스트 작성**

`src/components/mypage/InquiryTab.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { INITIAL_INQUIRIES, MOCK_USER } from "./mockData";
import InquiryTab from "./InquiryTab";

describe("InquiryTab — 문의하기", () => {
  it("문의 목록이 렌더된다", () => {
    render(<InquiryTab />);
    expect(screen.getByText(INITIAL_INQUIRIES[0].title)).toBeInTheDocument();
  });

  it("'문의하기'를 클릭하면 작성 모드로 전환되고 내 이름/연락처가 readonly로 보인다", () => {
    render(<InquiryTab />);
    fireEvent.click(screen.getByRole("button", { name: "문의하기" }));

    expect(screen.getByText(MOCK_USER.name)).toBeInTheDocument();
    expect(screen.getByText(MOCK_USER.phone)).toBeInTheDocument();
  });

  it("문의를 접수하면 목록 최상단에 '진행 중' 상태로 추가된다", () => {
    render(<InquiryTab />);

    fireEvent.click(screen.getByRole("button", { name: "문의하기" }));
    fireEvent.change(screen.getByPlaceholderText("문의 제목을 입력해 주세요."), {
      target: { value: "테스트 문의" },
    });
    fireEvent.click(screen.getByRole("button", { name: "접수" }));

    expect(screen.getByText("테스트 문의")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/mypage/InquiryTab.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 4: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add src/components/mypage/InquiryTab.jsx src/components/mypage/InquiryTab.test.jsx
git commit -m "refactor: MyPage 문의하기 탭을 InquiryTab.jsx로 분리 + 회귀 테스트 추가"
```

---

## Task 7: `MyPage.jsx` 재작성 — 로그인 가드 + 탭 마운트 (TDD)

**Files:**
- Modify: `src/pages/MyPage/MyPage.jsx` (전체 교체)
- Create: `src/pages/MyPage/MyPage.test.jsx`

**Interfaces:**
- Consumes: Task 1~6에서 만든 `InfoTab`/`DeptTab`/`ScheduleTab`/`PrayerTab`/`InquiryTab`(전부 default export), `mockData.js`의 `MOCK_USER` — **Task 1~6 전부 완료 후 시작**
- Produces: 없음

- [ ] **Step 1: 실패 테스트 작성**

`src/pages/MyPage/MyPage.test.jsx`를 새로 만든다:

```jsx
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import MyPage from "./MyPage";

describe("MyPage — 로그인 가드 + 탭 전환", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("비로그인 상태면 로그인 필요 모달을 보여주고 탭 콘텐츠는 렌더되지 않는다", () => {
    renderWithChurch(<MyPage />, { withAuth: true });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
  });

  it("로그인하면 5개 탭 버튼과 기본 탭(내 정보) 콘텐츠가 보인다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<MyPage />, { withAuth: true });

    // 주의: "부서 / 직책"은 사이드바 탭 버튼과 InfoTab 내부의 "메뉴에서 확인" 링크가
    // 같은 라벨을 쓰므로 getByRole은 "multiple elements"로 실패한다.
    // getAllByRole로 존재 여부만 확인한다(다른 4개는 원래도 1개뿐이라 안전).
    ["내 정보", "부서 / 직책", "일정", "기도 / 상담", "문의하기"].forEach((label) => {
      expect(screen.getAllByRole("button", { name: label }).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("내 프로필")).toBeInTheDocument();
  });

  it("'일정' 탭을 클릭하면 ScheduleTab 콘텐츠로 전환된다", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    renderWithChurch(<MyPage />, { withAuth: true });

    fireEvent.click(screen.getByRole("button", { name: "일정" }));

    expect(screen.getByRole("button", { name: "+ 일정 추가" })).toBeInTheDocument();
    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/pages/MyPage/MyPage.test.jsx`
Expected: 첫 번째 테스트(비로그인) FAIL — 현재 `MyPage.jsx`는 로그인 여부와 무관하게 항상 전체 콘텐츠를 렌더한다. 나머지 2개는 현재 파일의 마크업이 이미 동일한 탭 라벨·"내 프로필" 문구를 갖고 있어 이미 PASS할 수 있다(그래도 실행은 해서 확인한다).

- [ ] **Step 3: `MyPage.jsx` 전체 교체**

`src/pages/MyPage/MyPage.jsx`의 전체 내용을 다음으로 교체한다(기존 1179줄 전체를 이 내용으로 덮어쓴다):

```jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import UserBlue from "@/assets/icon-svg/mypage-user-blue.svg";
import UserWhite from "@/assets/icon-svg/mypage-user-white.svg";
import ChurchIcon from "@/assets/icon-svg/mypage-church.svg";
import CalBlue from "@/assets/icon-svg/mypage-calendar-blue.svg";
import CalWhite from "@/assets/icon-svg/mypage-calendar-white.svg";
import HeartHandBlue from "@/assets/icon-svg/mypage-heart-hand-blue.svg";
import HeartHandWhite from "@/assets/icon-svg/mypage-heart-hand-white.svg";
import ChatBlue from "@/assets/icon-svg/mypage-chat-blue.svg";
import ChatWhite from "@/assets/icon-svg/mypage-chat-white.svg";
import { MOCK_USER } from "@/components/mypage/mockData";
import InfoTab from "@/components/mypage/InfoTab";
import DeptTab from "@/components/mypage/DeptTab";
import ScheduleTab from "@/components/mypage/ScheduleTab";
import PrayerTab from "@/components/mypage/PrayerTab";
import InquiryTab from "@/components/mypage/InquiryTab";

const TABS = [
  { key: "info", label: "내 정보", iconActive: UserWhite, iconInactive: UserBlue },
  { key: "dept", label: "부서 / 직책", iconActive: ChurchIcon, iconInactive: ChurchIcon },
  { key: "schedule", label: "일정", iconActive: CalWhite, iconInactive: CalBlue },
  { key: "prayer", label: "기도 / 상담", iconActive: HeartHandWhite, iconInactive: HeartHandBlue },
  { key: "inquiry", label: "문의하기", iconActive: ChatWhite, iconInactive: ChatBlue },
];

export default function MyPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("info");

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="마이페이지를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">
        <h1 className="text-headline-4 font-bold text-grey-11 mb-8">마이페이지</h1>

        <div className="flex flex-col md:flex-row md:gap-6 md:items-start">
          {/* ── Sidebar ── */}
          <aside className="md:w-60 md:shrink-0 space-y-3">
            <div className="bg-grey-1 border border-grey-3 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-grey-5 flex items-center justify-center text-body-3 font-bold text-white shrink-0">
                  {MOCK_USER.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-body-3 font-bold text-grey-11 truncate">
                    {MOCK_USER.name}
                    <span className="font-normal text-body-4 text-grey-7 ml-0.5">님</span>
                  </p>
                  <p className="text-body-5 text-grey-6 mt-0.5 truncate">
                    {MOCK_USER.role} · {MOCK_USER.district} · {MOCK_USER.group}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-grey-1 border border-grey-3 rounded-2xl p-2 flex md:flex-col gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-body-4 transition-colors shrink-0 md:w-full whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-primary text-white font-semibold"
                      : "text-grey-8 hover:bg-grey-2"
                  }`}
                >
                  <img
                    src={activeTab === tab.key ? tab.iconActive : tab.iconInactive}
                    className="w-4 h-4 shrink-0"
                    alt=""
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0">
            {activeTab === "info" && <InfoTab onNavigateDept={() => setActiveTab("dept")} />}
            {activeTab === "dept" && <DeptTab />}
            {activeTab === "schedule" && <ScheduleTab />}
            {activeTab === "prayer" && <PrayerTab />}
            {activeTab === "inquiry" && <InquiryTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
```

이 파일은 더 이상 `IconClose`/`IconBack`/`IconUpload`/`IconChurch`/`IconMail`/`ReadonlyField`/`InputField`/`ModalOverlay`/`StatusBadge`/`Pagination`/`MOCK_DEPT`/`MOCK_GROUPS`/`INITIAL_SCHEDULES`/`INITIAL_PRAYERS`/`INITIAL_INQUIRIES`를 갖지 않는다(전부 각 탭 컴포넌트 안으로 이동 완료) — 그 심볼들에 대한 import도 전부 제거됐다.

탭 전환 시 `setDeptChangeMode(false)`/`setInquiryWriteMode(false)`를 더 이상 호출하지 않는다 — Global Constraints에 설명된 대로, 조건부 마운트/언마운트가 동일한 효과를 자동으로 낸다.

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/pages/MyPage/MyPage.test.jsx`
Expected: PASS (3/3)

- [ ] **Step 5: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료 — 특히 옛 `MyPage.jsx`가 갖고 있던 아이콘 import들이 새 탭 파일들로 정확히 옮겨져서 미사용 import나 누락된 import가 없는지 이 빌드가 검증한다.

- [ ] **Step 6: Commit**

```bash
git add src/pages/MyPage/MyPage.jsx src/pages/MyPage/MyPage.test.jsx
git commit -m "fix: 마이페이지에 로그인 가드 추가 + 5개 탭 컴포넌트로 재구성 (TDD)

MyPage.jsx(1179줄)가 인증 가드 없이 항상 렌더되던 문제를
BibleRead.jsx/Gyojeokbu.jsx와 동일한 패턴(useAuth+LoginRequiredModal)
으로 수정했다. RootLayout 하위라 AuthProvider는 이미 상속받으므로
AuthOnlyLayout은 불필요했다. 동시에 5개 탭(내정보/부서·직책/일정/
기도·상담/문의하기)을 컴포넌트로 분리 완료 — 부모는 사이드바와 활성
탭 마운트만 담당하는 얇은 컴포넌트가 됐다."
```

---

## Task 8: `routes.jsx`에 `/mypage` 인증 가드 회귀 테스트 추가

**Files:**
- Modify: `src/routes.test.jsx` (기존 파일에 새 `describe` 블록 추가 — 기존 블록들은 절대 건드리지 않는다)

**Interfaces:**
- Consumes: Task 7에서 완료된 `MyPage.jsx`의 로그인 가드(정확한 모달 문구 `"로그인이 필요한 서비스입니다"`) — **Task 7 완료 후 시작**
- Produces: 없음

**배경**: 이전 사이클들(성경 읽기, 교적부)의 최종 리뷰에서, 컴포넌트 테스트는 통과했지만 실제 라우트 트리엔 필요한 Provider가 없어 프로덕션에서 크래시하는 사고가 반복됐다. `/mypage`는 `RootLayout` 하위 라우트라 `AuthProvider`는 이미 보장되지만(Task 7에서 확인됨), 실제 라우트 트리로 한 번 더 검증해 이 유형의 회귀를 원천 차단한다. `/mypage`도 `RootLayout` 하위이므로(`/교적부`, `/말씀/방송`, `/말씀/안내`와 동일하게) `ChurchProvider`+`SearchProvider` 래핑이 필요하다.

- [ ] **Step 1: 실패 테스트 작성**

`src/routes.test.jsx` 파일 맨 아래에 새 블록을 추가한다(파일 상단에 이미 `createMemoryRouter`, `RouterProvider`, `routes`, `render`, `screen`, `ChurchProvider`, `SearchProvider`, `describe`/`it`/`expect`/`beforeEach` import가 있으므로 추가 import 불필요):

```jsx
describe("routes — /mypage 인증 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("/mypage 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/mypage"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 /mypage 진입 시 크래시 없이 탭 콘텐츠가 렌더된다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    const router = createMemoryRouter(routes, { initialEntries: ["/mypage"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(await screen.findByText("내 프로필")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/routes.test.jsx`
Expected: PASS — Task 7이 이미 완료됐으므로 이 두 테스트는 처음부터 통과할 가능성이 높다(실제 라우트 트리에서 가드가 이미 작동함을 재확인하는 목적). 기존 테스트(말씀 읽기/필사 3개 + 말씀 리다이렉트/안내 2개 + 교적부 2개 = 7개)는 계속 PASS해야 한다.

- [ ] **Step 3: 전체 스위트 + 빌드 확인**

Run: `pnpm test:run`
Expected: 전부 통과

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료

- [ ] **Step 4: Commit**

```bash
git add src/routes.test.jsx
git commit -m "test: /mypage 실제 라우트 트리에서 인증 가드가 작동하는지 회귀 테스트 추가"
```

---

## 태스크 의존 관계

```
Task 1 (shared.jsx + mockData.js 추출, 공용 기반)
  ├─→ Task 2 (InfoTab.jsx)
  ├─→ Task 3 (DeptTab.jsx)
  ├─→ Task 4 (ScheduleTab.jsx)
  ├─→ Task 5 (PrayerTab.jsx)
  └─→ Task 6 (InquiryTab.jsx)
        └─→ Task 7 (MyPage.jsx 재작성 — 로그인가드 + 5개 탭 전부 마운트, Task 2~6 전부 필요)
              └─→ Task 8 (routes.test.jsx — Task 7의 정확한 문구 전제)
```

Task 2~6은 서로 다른 파일만 건드리며 서로 의존하지 않는다(전부 Task 1만 의존) — 병렬 세션이라면 Task 1 완료 후 동시 진행 가능하다. Subagent-Driven Development는 구현자를 순차 디스패치하므로 순서상 1→2→3→4→5→6→7→8로 진행한다.

## Self-Review 메모

- **스펙 커버리지**: 설계 문서의 로그인 가드(Task 7), 탭별 컴포넌트 분리(Task 1~7), 회귀 테스트(모든 태스크), 라우트 트리 회귀 방지(Task 8) 전부 태스크로 매핑됨. 비목표(MOCK_USER 실제 사용자 반영, 회원탈퇴 플로우 변경, UI 변경, 백엔드 연동)는 어떤 태스크에도 포함되지 않음 — 의도된 누락.
- **플레이스홀더 스캔**: 코드 블록에 TODO/TBD 없음(원본 파일에 있던 `// TODO: 백엔드 연동` 같은 주석은 이번 사이클 대상 파일에 없음을 확인함 — 있었다면 그대로 보존했을 것). 모든 코드가 원본에서 검증된 그대로 옮겨졌으며 신규 로직은 로그인 가드와 `onNavigateDept` 연결뿐이다.
- **타입/시그니처 일관성**: `InfoTab`의 `onNavigateDept` prop이 Task 2의 정의와 Task 7의 호출부(`<InfoTab onNavigateDept={() => setActiveTab("dept")} />`)에서 정확히 일치. `shared.jsx`/`mockData.js`의 export 이름이 Task 2~6 전체에서 import하는 이름과 정확히 일치(`ReadonlyField`/`InputField`/`ModalOverlay`/`StatusBadge`/`Pagination`/`IconBack`/`IconClose`, `MOCK_USER`/`MOCK_DEPT`/`MOCK_GROUPS`/`INITIAL_SCHEDULES`/`INITIAL_PRAYERS`/`INITIAL_INQUIRIES`). Task 8의 모달 문구가 Task 7에서 정의한 문구와 정확히 일치.
