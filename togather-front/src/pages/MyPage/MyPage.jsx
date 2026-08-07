import { useState, useRef } from "react";
import UserBlue from "@/assets/icon-svg/mypage-user-blue.svg";
import UserWhite from "@/assets/icon-svg/mypage-user-white.svg";
import UserBlack from "@/assets/icon-svg/mypage-user-black.svg";
import ChurchIcon from "@/assets/icon-svg/mypage-church.svg";
import CalBlue from "@/assets/icon-svg/mypage-calendar-blue.svg";
import CalWhite from "@/assets/icon-svg/mypage-calendar-white.svg";
import HeartHandBlue from "@/assets/icon-svg/mypage-heart-hand-blue.svg";
import HeartHandWhite from "@/assets/icon-svg/mypage-heart-hand-white.svg";
import ChatBlue from "@/assets/icon-svg/mypage-chat-blue.svg";
import ChatWhite from "@/assets/icon-svg/mypage-chat-white.svg";
import ArrowBack from "@/assets/icon-svg/mypage-arrow-back.svg";
import ImgUpload from "@/assets/icon-svg/mypage-img-upload.svg";
import MailIcon from "@/assets/icon-svg/mypage-mail.svg";
import PopupClose from "@/assets/icon-svg/popup-close.svg";

const MOCK_USER = {
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

const MOCK_DEPT = {
  position: "장로",
  department: "남선교회 1지회",
  duty: "안내위원장",
  district: "1구역",
  group: "1조",
  ordainedDate: "2021.03.07",
};

const MOCK_GROUPS = [
  { id: 1, name: "1구역 모임", info: "매주 화요일 19:30 · 옥길동 · 구역원 · 총 8명" },
  { id: 2, name: "1조", info: "매주 토요일 20:00 · 본당 4층 · 리더 · 총 6명" },
  { id: 3, name: "남선교회 1지회", info: "월 1회 셋째 주 · 안내위원장 · 총 24명" },
  { id: 4, name: "성가대 (테너)", info: "매주 금요일 20:00 · 본당 4층 · 단원 · 총 18명" },
];

const INITIAL_SCHEDULES = [
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

const INITIAL_PRAYERS = [
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

const INITIAL_INQUIRIES = [
  {
    id: 1,
    title: "교적 정보 수정 요청 (주소 변경)",
    date: "2026.02.12",
    status: "답변 완료",
    reply: "사무국 — 주소 변경 완료되었습니다. 다음 주보부터 반영됩니다.",
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
    reply: "사무국 — 악보 준비되었습니다. 연습 전 수령해 주세요.",
  },
  {
    id: 6,
    title: "헌금 영수증 발급 요청",
    date: "2025.12.15",
    status: "답변 완료",
    reply: "사무국 — 이메일로 발송드렸습니다.",
  },
  { id: 7, title: "구역 변경 신청", date: "2025.11.30", status: "진행 중", reply: null },
  {
    id: 8,
    title: "봉사 일정 문의",
    date: "2025.11.20",
    status: "답변 완료",
    reply: "사무국 — 다음 달 봉사 일정표를 공유드렸습니다.",
  },
];

// ── Icons ─────────────────────────────────────────────────────────────
function IconClose() {
  return <img src={PopupClose} className="w-5 h-5" alt="" />;
}
function IconBack() {
  return <img src={ArrowBack} className="w-[18px] h-[18px]" alt="" />;
}
function IconUpload() {
  return <img src={ImgUpload} className="w-4 h-4" alt="" />;
}
function IconChurch() {
  return <img src={ChurchIcon} className="w-4 h-4" alt="" />;
}
function IconMail() {
  return <img src={MailIcon} className="w-[13px] h-[13px]" alt="" />;
}

// ── Shared UI ─────────────────────────────────────────────────────────
function ReadonlyField({ label, value, note }) {
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

function InputField({ label, value, onChange, placeholder, type = "text", note }) {
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

function ModalOverlay({ children, onClose }) {
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

function StatusBadge({ status }) {
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

function Pagination({ total, perPage, current, onChange }) {
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

const TABS = [
  { key: "info", label: "내 정보", iconActive: UserWhite, iconInactive: UserBlue },
  { key: "dept", label: "부서 / 직책", iconActive: ChurchIcon, iconInactive: ChurchIcon },
  { key: "schedule", label: "일정", iconActive: CalWhite, iconInactive: CalBlue },
  { key: "prayer", label: "기도 / 상담", iconActive: HeartHandWhite, iconInactive: HeartHandBlue },
  { key: "inquiry", label: "문의하기", iconActive: ChatWhite, iconInactive: ChatBlue },
];

// ── Main ──────────────────────────────────────────────────────────────
export default function MyPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [modal, setModal] = useState(null);
  const [deptChangeMode, setDeptChangeMode] = useState(false);
  const [inquiryWriteMode, setInquiryWriteMode] = useState(false);
  const [prayerFilter, setPrayerFilter] = useState("전체");

  const [userForm, setUserForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    email: MOCK_USER.email,
    address: MOCK_USER.address,
    currentPw: "",
    newPw: "",
  });

  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [scheduleForm, setScheduleForm] = useState({ date: "", day: "", title: "", info: "" });

  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [prayerForm, setPrayerForm] = useState({ date: "", day: "", title: "", content: "" });

  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });

  const PAGE_SIZE = 5;
  const PRAYER_PAGE_SIZE = 4;
  const [schedulePage, setSchedulePage] = useState(1);
  const [prayerPage, setPrayerPage] = useState(1);
  const [inquiryPage, setInquiryPage] = useState(1);

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

  const filteredPrayers =
    prayerFilter === "전체" ? prayers : prayers.filter((p) => p.type === prayerFilter);

  function handlePrayerFilter(f) {
    setPrayerFilter(f);
    setPrayerPage(1);
  }

  const pagedSchedules = schedules.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);
  const pagedPrayers = filteredPrayers.slice(
    (prayerPage - 1) * PRAYER_PAGE_SIZE,
    prayerPage * PRAYER_PAGE_SIZE,
  );
  const pagedInquiries = inquiries.slice((inquiryPage - 1) * PAGE_SIZE, inquiryPage * PAGE_SIZE);

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
                  onClick={() => {
                    setActiveTab(tab.key);
                    setDeptChangeMode(false);
                    setInquiryWriteMode(false);
                  }}
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
            {/* 내 정보 */}
            {activeTab === "info" && (
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
                      <button
                        onClick={() => setActiveTab("dept")}
                        className="font-semibold text-grey-9 underline"
                      >
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
              </div>
            )}

            {/* 부서/직책 */}
            {activeTab === "dept" && (
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
                            note="사무국 문의로 변경 가능합니다."
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
                        <h2 className="text-sub-tit-4 font-bold text-grey-11">
                          부서 / 직책 변경 신청
                        </h2>
                      </div>
                      <div className="space-y-4">
                        <ReadonlyField
                          label="직분"
                          value={MOCK_DEPT.position}
                          note="사무국 문의로 변경 가능합니다."
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
                    <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-5">
                      참여 중인 부서 / 모임
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MOCK_GROUPS.map((g) => (
                        <div
                          key={g.id}
                          className="border border-grey-3 rounded-xl p-4 flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-grey-2 flex items-center justify-center shrink-0">
                            <img src={UserBlack} className="w-4 h-4" alt="" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-body-4 font-semibold text-grey-10">{g.name}</p>
                            <p className="text-body-5 text-grey-6 mt-0.5 leading-relaxed">
                              {g.info}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* 일정 */}
            {activeTab === "schedule" && (
              <div className="bg-white border border-grey-3 rounded-2xl p-8 flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sub-tit-4 font-bold text-grey-11">
                    내 일정 ({schedules.length})
                  </h2>
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
              </div>
            )}

            {/* 기도/상담 */}
            {activeTab === "prayer" && (
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
                        prayerFilter === f
                          ? "bg-primary text-white"
                          : "bg-grey-2 text-grey-7 hover:bg-grey-3"
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
                              item.type === "기도"
                                ? "bg-grey-2 text-grey-7"
                                : "bg-blue-1 text-primary"
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
              </div>
            )}

            {/* 문의하기 */}
            {activeTab === "inquiry" && (
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
                          onChange={(e) =>
                            setInquiryForm((f) => ({ ...f, content: e.target.value }))
                          }
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
            )}
          </main>
        </div>
      </div>

      {/* ── Modals ── */}

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
