import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import { getMySchedules, getMyPrayers, getMyInquiries } from "@/services/myPageService";
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
  const { church } = useChurch();
  const [activeTab, setActiveTab] = useState("info");

  // 탭을 벗어났다가 돌아와도 사용자가 입력·추가한 내용이 유지되도록(원본
  // MyPage.jsx와 동일한 지속성), 여러 탭에 걸쳐 보존해야 하는 "데이터"만
  // 부모가 소유한다. 필터/페이지 위치/모달 열림 여부처럼 뷰 상태 성격의
  // 값은 각 탭이 자체 소유해 탭 전환 시 초기화되며, 이는 사용자가 입력한
  // 값이 아니므로 문제없다.
  const [userForm, setUserForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    email: MOCK_USER.email,
    address: MOCK_USER.address,
    currentPw: "",
    newPw: "",
  });
  const [schedules, setSchedules] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getMySchedules(church.id).then((list) => {
      if (!cancelled) setSchedules(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getMyPrayers(church.id).then((list) => {
      if (!cancelled) setPrayers(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getMyInquiries(church.id).then((list) => {
      if (!cancelled) setInquiries(list);
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, currentUser]);

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
            {activeTab === "info" && (
              <InfoTab
                userForm={userForm}
                setUserForm={setUserForm}
                onNavigateDept={() => setActiveTab("dept")}
              />
            )}
            {activeTab === "dept" && <DeptTab />}
            {activeTab === "schedule" && (
              <ScheduleTab schedules={schedules} setSchedules={setSchedules} />
            )}
            {activeTab === "prayer" && <PrayerTab prayers={prayers} setPrayers={setPrayers} />}
            {activeTab === "inquiry" && (
              <InquiryTab inquiries={inquiries} setInquiries={setInquiries} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
