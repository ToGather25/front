import { Navigate } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthOnlyLayout from "@/layouts/AuthOnlyLayout";
import Home from "@/pages/Home/Home";
import Jubo from "@/pages/Jubo/Jubo";
import Church from "@/pages/Church/Church";
import Events from "@/pages/Events/Events";
import EventDetail from "@/pages/Events/EventDetail";
import EventSearch from "@/pages/Events/EventSearch";
import Gallery from "@/pages/Gallery/Gallery";
import BibleRead from "@/pages/BibleRead/BibleRead";
import BibleWrite from "@/pages/BibleWrite/BibleWrite";
import Login from "@/pages/Login/Login";
import FindPassword from "@/pages/FindPassword/FindPassword";
import FindId from "@/pages/FindId/FindId";
import Register from "@/pages/Register/Register";
import SignupNext from "@/pages/Register/SignupNext";
import MyPage from "@/pages/MyPage/MyPage";
import Mission from "@/pages/Mission/Mission";
import Nurture from "@/pages/Nurture/Nurture";
import SundaySchool from "@/pages/SundaySchool/SundaySchool";
import Gyojeokbu from "@/pages/Gyojeokbu/Gyojeokbu";
import WordBroadcast from "@/pages/WordBroadcast/WordBroadcast";
import WordSermon from "@/pages/WordSermon/WordSermon";
import WordSermonDetail from "@/pages/WordSermon/WordSermonDetail";
import WordInfo from "@/pages/WordInfo/WordInfo";
import Contact from "@/pages/Contact/Contact";
import Notice from "@/pages/Notice/Notice";
import Privacy from "@/pages/Privacy/Privacy";
import Terms from "@/pages/Terms/Terms";
import PageNotFound from "@/pages/PageNotFound/PageNotFound";
import Dashboard from "@/pages/admin/Dashboard";
import MainManage from "@/pages/admin/MainManage";
import WorshipManage from "@/pages/admin/WorshipManage";
import NoticesManage from "@/pages/admin/NoticesManage";
import EventsManage from "@/pages/admin/EventsManage";
import MembersManage from "@/pages/admin/MembersManage";
import JuboManage from "@/pages/admin/JuboManage";
import GalleryManage from "@/pages/admin/GalleryManage";
import AdminSettings from "@/pages/admin/Settings";

// 라우트 트리를 App.jsx에서 분리 — App.jsx는 컴포넌트만 export해야 Fast Refresh가 동작하므로
// (react/only-export-components), 데이터인 routes는 별도 파일에서 관리한다.
// createMemoryRouter로 라우팅 회귀 테스트를 작성할 때도 이 배열을 그대로 재사용할 수 있다.
export const routes = [
  {
    element: <AuthOnlyLayout />,
    children: [
      { path: "말씀/읽기", element: <BibleRead /> },
      { path: "말씀/필사", element: <BibleWrite /> },
    ],
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "주보", element: <Jubo /> },
      { path: "교회소개", element: <Church /> },
      { path: "교회행사", element: <Events /> },
      { path: "교회행사/검색", element: <EventSearch /> },
      { path: "교회행사/:id", element: <EventDetail /> },
      { path: "갤러리", element: <Gallery /> },
      // 예배·방송
      { path: "말씀", element: <Navigate to="/말씀/방송" replace /> },
      { path: "말씀/방송", element: <WordBroadcast /> },
      { path: "말씀/설교", element: <WordSermon /> },
      { path: "말씀/설교/:id", element: <WordSermonDetail /> },
      { path: "말씀/안내", element: <WordInfo /> },
      // 주일학교
      { path: "주일학교", element: <SundaySchool /> },
      { path: "주일학교/:dept", element: <SundaySchool /> },
      // 전도·선교
      { path: "전도선교", element: <Mission /> },
      { path: "전도선교/:section", element: <Mission /> },
      // 양육·훈련
      { path: "양육훈련", element: <Nurture /> },
      { path: "양육훈련/:section", element: <Nurture /> },
      // 기타
      { path: "login", element: <Login /> },
      { path: "find-password", element: <FindPassword /> },
      { path: "find-id", element: <FindId /> },
      { path: "register", element: <Register /> },
      { path: "register/next", element: <SignupNext /> },
      { path: "mypage", element: <MyPage /> },
      { path: "교적부", element: <Gyojeokbu /> },
      { path: "공지사항", element: <Notice /> },
      { path: "문의하기", element: <Contact /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "*", element: <PageNotFound /> },
    ],
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "main", element: <MainManage /> },
      { path: "worship", element: <WorshipManage /> },
      { path: "notices", element: <NoticesManage /> },
      { path: "events", element: <EventsManage /> },
      { path: "members", element: <MembersManage /> },
      { path: "jubo", element: <JuboManage /> },
      { path: "gallery", element: <GalleryManage /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
];
