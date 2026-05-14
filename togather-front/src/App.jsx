import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import Home from "@/pages/Home/Home";
import Jubo from "@/pages/Jubo/Jubo";
import Church from "@/pages/Church/Church";
import Events from "@/pages/Events/Events";
import EventDetail from "@/pages/Events/EventDetail";
import Gallery from "@/pages/Gallery/Gallery";
import Bible from "@/pages/Bible/Bible";
import BibleRead from "@/pages/BibleRead/BibleRead";
import BibleWrite from "@/pages/BibleWrite/BibleWrite";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import MyPage from "@/pages/MyPage/MyPage";
import Mission from "@/pages/Mission/Mission";
import Nurture from "@/pages/Nurture/Nurture";
import SundaySchool from "@/pages/SundaySchool/SundaySchool";
import Gyojeokbu from "@/pages/Gyojeokbu/Gyojeokbu";
import WordBroadcast from "@/pages/WordBroadcast/WordBroadcast";
import WordSermon from "@/pages/WordSermon/WordSermon";
import WordPraise from "@/pages/WordPraise/WordPraise";
import Contact from "@/pages/Contact/Contact";
import PageNotFound from "@/pages/PageNotFound/PageNotFound";

const router = createBrowserRouter([
  { path: "말씀/필사", element: <BibleWrite /> },
  { path: "말씀/읽기", element: <BibleRead /> },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "주보", element: <Jubo /> },
      { path: "교회소개", element: <Church /> },
      { path: "교회행사", element: <Events /> },
      { path: "교회행사/:id", element: <EventDetail /> },
      { path: "갤러리", element: <Gallery /> },
      // 말씀·찬양
      { path: "말씀", element: <Bible /> },
      { path: "말씀/방송", element: <WordBroadcast /> },
      { path: "말씀/설교", element: <WordSermon /> },
      { path: "말씀/찬양", element: <WordPraise /> },
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
      { path: "register", element: <Register /> },
      { path: "mypage", element: <MyPage /> },
      { path: "교적부", element: <Gyojeokbu /> },
      { path: "문의하기", element: <Contact /> },
      { path: "*", element: <PageNotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
